/**
 * Offline smoke test for the extracted pipeline skill.
 *
 * Run with: npx tsx examples/smoke.spec.ts
 *
 * Covers:
 *  - domain contracts (transcript / OCR validation)
 *  - timeline scaffold (window ordering)
 *  - cue scorer (deterministic priority)
 *  - cue planner (gap enforcement)
 *  - direction rules (rule table lookups)
 *  - mock analyzer + mock payload author
 *  - end-to-end pipeline through a transcript JSON
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { AnalysisPipeline } from '../src/pipeline/analyze-video.js'
import { transcriptSchema, ocrEvidenceSchema } from '../src/domain/contracts.js'
import { buildSemanticTimeline } from '../src/pipeline/semantic-timeline.js'
import { scoreEvents } from '../src/pipeline/cue-scorer.js'
import { planCueCandidates } from '../src/pipeline/cue-planner.js'
import { resolveDirection } from '../src/pipeline/direction-rules.js'
import { MockSemanticGraphAnalyzer } from '../src/providers/semantic-graph-analyzer.js'
import { MockPayloadAuthor } from '../src/providers/mock-payload-author.js'
import { collectPayloadText, type AuthoredPayload } from '../src/domain/payload-contracts.js'
import type { OcrEvidence, Transcript } from '../src/domain/contracts.js'

let passed = 0
let failed = 0

function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      passed += 1
      console.log(`  ✓ ${name}`)
    })
    .catch((error: unknown) => {
      failed += 1
      console.error(`  ✗ ${name}\n    ${String(error)}`)
    })
}

async function main(): Promise<void> {
  console.log('caibao-pipeline-skill — offline smoke')

  // Load the demo transcript.
  const demoRaw = await readFile(path.resolve('examples/demo-transcript.json'), 'utf8')
  const demo = JSON.parse(demoRaw) as {
    title: string
    durationMs: number
    transcript: Transcript
    ocr: OcrEvidence[]
  }
  const transcript = transcriptSchema.parse(demo.transcript)
  const ocr = demo.ocr.map((item) => ocrEvidenceSchema.parse(item))

  await test('transcript schema accepts the demo fixture', () => {
    const result = transcriptSchema.safeParse(transcript)
    if (!result.success) throw new Error(result.error.issues.map((i) => i.message).join('; '))
  })

  await test('semantic timeline covers whole duration', () => {
    const timeline = buildSemanticTimeline({
      transcript,
      ocr,
      durationMs: demo.durationMs
    })
    if (timeline.windows.length === 0) throw new Error('no windows produced')
    if (timeline.windows[0].startMs !== 0) throw new Error('first window does not start at 0')
    const last = timeline.windows[timeline.windows.length - 1]
    if (last.endMs !== demo.durationMs) {
      throw new Error(`last window endMs=${last.endMs} != durationMs=${demo.durationMs}`)
    }
  })

  await test('mock semantic analyzer produces evidence-linked graph', async () => {
    const analyzer = new MockSemanticGraphAnalyzer()
    const timeline = buildSemanticTimeline({ transcript, ocr, durationMs: demo.durationMs })
    const graph = await analyzer.extract({
      transcript,
      ocr,
      frames: [],
      durationMs: demo.durationMs,
      windows: timeline.windows.map(({ windowId, startMs, endMs }) => ({
        windowId,
        startMs,
        endMs
      }))
    })
    if (graph.semanticEvents.length === 0) throw new Error('no semantic events produced')
    for (const event of graph.semanticEvents) {
      if (!event.evidenceIds.length) throw new Error(`event ${event.eventId} has no evidenceIds`)
    }
  })

  await test('cue scorer maps every event to a candidate', () => {
    const timeline = buildSemanticTimeline({ transcript, ocr, durationMs: demo.durationMs })
    const { candidates } = scoreEvents(
      [
        {
          eventId: 'evt-1',
          type: 'concept_first_mention',
          timeMs: 0,
          windowId: 'win-0',
          refs: { conceptIds: [], edgeIds: [], conditionIds: [], claimIds: [] },
          evidenceIds: [transcript.segments[0].evidenceId],
          subSignals: { learningValue: 0.7, timeSensitivity: 0.5, interactionFit: 0.6 }
        }
      ],
      timeline
    )
    if (candidates.length !== 1) throw new Error(`got ${candidates.length} candidates, expected 1`)
    if (candidates[0].kind !== 'context_card') {
      throw new Error(`expected context_card, got ${candidates[0].kind}`)
    }
  })

  await test('cue planner enforces min gap', () => {
    const timeline = buildSemanticTimeline({ transcript, ocr, durationMs: demo.durationMs })
    const { candidates } = scoreEvents(
      [
        {
          eventId: 'evt-a',
          type: 'concept_first_mention',
          timeMs: 0,
          windowId: 'win-0',
          refs: { conceptIds: [], edgeIds: [], conditionIds: [], claimIds: [] },
          evidenceIds: [transcript.segments[0].evidenceId],
          subSignals: { learningValue: 0.7, timeSensitivity: 0.5, interactionFit: 0.6 }
        },
        {
          eventId: 'evt-b',
          type: 'concept_first_mention',
          timeMs: 5_000,
          windowId: 'win-0',
          refs: { conceptIds: [], edgeIds: [], conditionIds: [], claimIds: [] },
          evidenceIds: [transcript.segments[1].evidenceId],
          subSignals: { learningValue: 0.7, timeSensitivity: 0.5, interactionFit: 0.6 }
        }
      ],
      timeline
    )
    const plan = planCueCandidates(candidates, { durationMs: demo.durationMs })
    if (plan.accepted.length !== 1) {
      throw new Error(`expected 1 accepted, got ${plan.accepted.length}`)
    }
    const reasons = plan.rejected.map((r) => r.reason)
    if (!reasons.includes('MIN_GAP_VIOLATION')) {
      throw new Error(`expected MIN_GAP_VIOLATION, got ${reasons.join(', ')}`)
    }
  })

  await test('direction rule engine resolves a 温和降息 candidate', async () => {
    const analyzer = new MockSemanticGraphAnalyzer()
    const timeline = buildSemanticTimeline({ transcript, ocr, durationMs: demo.durationMs })
    const graph = await analyzer.extract({
      transcript,
      ocr,
      frames: [],
      durationMs: demo.durationMs,
      windows: timeline.windows.map(({ windowId, startMs, endMs }) => ({
        windowId,
        startMs,
        endMs
      }))
    })
    // Force the rule by synthesising a quick_judgment candidate referencing
    // the same evidence as the policy_rate condition.
    const condition = graph.conditions.find((c) => c.variable === 'policy_rate')
    if (!condition) throw new Error('mock graph missing policy_rate condition')
    const candidate = {
      candidateId: 'cue-test',
      sourceEventId: 'evt-test',
      kind: 'quick_judgment' as const,
      proposedStartMs: 0,
      proposedEndMs: 5000,
      windowId: 'win-0',
      priority: 50,
      expectedInteractionMs: 9000,
      prompt: 'p',
      learningObjective: 'o',
      rationale: 'r',
      evidenceIds: [...condition.evidenceIds],
      visualLoad: 'low' as const,
      subSignals: { learningValue: 0.5, timeSensitivity: 0.5, interactionFit: 0.5 }
    }
    const resolution = resolveDirection(candidate, graph)
    if (resolution.direction !== 'insufficient') {
      throw new Error(`expected insufficient, got ${resolution.direction}`)
    }
  })

  await test('mock payload author returns well-shaped payloads', async () => {
    const author = new MockPayloadAuthor()
    const timeline = buildSemanticTimeline({ transcript, ocr, durationMs: demo.durationMs })
    const graph = await new MockSemanticGraphAnalyzer().extract({
      transcript,
      ocr,
      frames: [],
      durationMs: demo.durationMs,
      windows: timeline.windows.map(({ windowId, startMs, endMs }) => ({
        windowId,
        startMs,
        endMs
      }))
    })
    const { candidates } = scoreEvents(graph.semanticEvents, timeline)
    const accepted = planCueCandidates(candidates, { durationMs: demo.durationMs }).accepted
    for (const candidate of accepted) {
      const result = await author.author({
        candidate,
        evidenceContext: 'mock evidence'
      })
      if ('rejected' in result) {
        throw new Error(`author rejected candidate ${candidate.candidateId}: ${result.detail}`)
      }
      const authored = { kind: candidate.kind, payload: result.payload } as AuthoredPayload
      const text = collectPayloadText(authored)
      if (/(买入|卖出|加仓|减仓|仓位|目标价|稳赚|必涨|必跌|推荐.{0,6}股票|买什么)/.test(text)) {
        throw new Error(`authored text matched forbidden language: ${text}`)
      }
    }
  })

  await test('end-to-end pipeline emits draft + coverage', async () => {
    const timeline = buildSemanticTimeline({ transcript, ocr, durationMs: demo.durationMs })
    const pipeline = new AnalysisPipeline({
      media: {
        prepare: async () => ({
          durationMs: demo.durationMs,
          fingerprint: 'sha256:smoke',
          audio: { path: '<mock>', format: 'wav' },
          frames: []
        })
      },
      asr: {
        transcribePreparedAudio: async () => transcript
      },
      ocr: { recognizeFrames: async () => ocr },
      semantics: new MockSemanticGraphAnalyzer(),
      payloadAuthor: new MockPayloadAuthor()
    })
    const result = await pipeline.run({
      jobId: 'smoke-job',
      asset: {
        assetId: 'smoke-asset',
        source: 'user_upload',
        localPath: '<smoke>',
        mimeType: 'video/mp4',
        rightsAttested: true,
        rightsAttestationId: 'smoke'
      },
      title: 'smoke run'
    })
    if (!result.draft) throw new Error('missing draft')
    if (!result.coverageReport) throw new Error('missing coverage report')
    if (!result.timings.stages.length) throw new Error('no timings recorded')
  })

  console.log(`\n${passed} passed, ${failed} failed`)
  if (failed > 0) process.exitCode = 1
}

main().catch((error: unknown) => {
  console.error(String(error))
  process.exitCode = 1
})