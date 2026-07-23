/**
 * Skill entry point: build the pipeline from environment variables and run
 * one end-to-end job.
 *
 * Usage (after `npm install`):
 *
 *   # offline (default)
 *   cp .env.example .env
 *   npx tsx src/agent/run-pipeline.ts \
 *       --input examples/demo-transcript.json \
 *       --provider mock --out examples/demo-output.json
 *
 *   # real video + real providers
 *   npx tsx src/agent/run-pipeline.ts \
 *       --video path/to/video.mp4 \
 *       --title "美联储降息对资产价格的影响" \
 *       --provider openai
 *
 * The output JSON contains `draft`, `coverageReport`, and `timings` — the same
 * shape the caibao web app exposes over HTTP.
 */
import { config as loadDotEnv } from 'dotenv'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { loadRuntimeConfig, providerReadiness } from '../config/env.js'
import type { RuntimeConfig } from '../config/env.js'
import { AnalysisPipeline } from '../pipeline/analyze-video.js'
import { FfmpegMediaPreprocessor } from '../media/ffmpeg.js'
import { VolcengineFlashAsrClient } from '../providers/volcengine-asr.js'
import {
  MockSemanticGraphAnalyzer,
  SemanticGraphAnalyzer
} from '../providers/semantic-graph-analyzer.js'
import { OpenAICompatibleStructuredClient } from '../providers/openai-compatible.js'
import { MockPayloadAuthor } from '../providers/mock-payload-author.js'
import { PayloadAuthor } from '../pipeline/payload-author.js'
import {
  transcriptSchema,
  ocrEvidenceSchema,
  type MediaAsset,
  type OcrEvidence,
  type Transcript
} from '../domain/contracts.js'
import { AppError } from '../domain/errors.js'

// ── CLI arg parsing ─────────────────────────────────────────────────────────

interface CliArgs {
  input?: string
  video?: string
  title: string
  out?: string
  provider: 'openai' | 'mock'
  printStages: boolean
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    title: 'demo finance clip',
    provider: 'mock',
    printStages: true
  }
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i]
    const value = argv[i + 1]
    switch (flag) {
      case '--input':
      case '-i':
        args.input = value
        i += 1
        break
      case '--video':
      case '-v':
        args.video = value
        i += 1
        break
      case '--title':
      case '-t':
        args.title = value
        i += 1
        break
      case '--out':
      case '-o':
        args.out = value
        i += 1
        break
      case '--provider':
        if (value !== 'openai' && value !== 'mock') {
          throw new AppError('CLI_PROVIDER_INVALID', `unknown provider "${value}"`)
        }
        args.provider = value
        i += 1
        break
      case '--quiet':
        args.printStages = false
        break
      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
    }
  }
  return args
}

function printHelp(): void {
  console.log(`caibao-pipeline-skill

Usage:
  tsx src/agent/run-pipeline.ts [options]

Options:
  -i, --input <path>     Run from a pre-existing transcript + OCR JSON file
                         (skips ffmpeg/ASR stages). Schema documented below.
  -v, --video <path>     Run against a real video file. Requires ffmpeg/ffprobe.
  -t, --title <string>   Human title for the generated draft (default: "demo").
  -o, --out <path>       Write the full pipeline output to this JSON path.
      --provider <name>  openai | mock (default: mock).
      --quiet            Suppress per-stage log lines.
  -h, --help             Show this help.

Input JSON schema (when using --input):
  {
    "title": "string",
    "durationMs": number,
    "transcript": Transcript,
    "ocr": OcrEvidence[]            // optional
  }

Environment:
  See .env.example for the full list. The agent only requires OPENAI_API_KEY
  when --provider=openai.`)
}

// ── Stub OCR client (offline default) ───────────────────────────────────────

class StubOcrClient {
  async recognizeFrames(): Promise<OcrEvidence[]> {
    return []
  }
}

// ── Transcript / OCR override loaders ───────────────────────────────────────

async function loadTranscriptOverride(
  config: RuntimeConfig
): Promise<Transcript | null> {
  if (!config.transcriptOverride) return null
  const raw = await readFile(config.transcriptOverride, 'utf8')
  return transcriptSchema.parse(JSON.parse(raw))
}

async function loadOcrOverride(config: RuntimeConfig): Promise<OcrEvidence[] | null> {
  if (!config.ocrOverride) return null
  const raw = await readFile(config.ocrOverride, 'utf8')
  const arr = JSON.parse(raw) as unknown[]
  return arr.map((item) => ocrEvidenceSchema.parse(item))
}

// ── Provider assembly ───────────────────────────────────────────────────────

interface ProviderStack {
  media: FfmpegMediaPreprocessor
  asr: { transcribePreparedAudio: ReturnType<VolcengineFlashAsrClient['transcribePreparedAudio']> } | {
      transcribePreparedAudio(input: {
        audio: { path: string; format: 'wav' | 'mp3' | 'ogg'; publicUrl?: string }
        jobId: string
      }): Promise<Transcript>
    }
  ocr: { recognizeFrames(frames: { path: string; timeMs: number; frameId: string }[]): Promise<OcrEvidence[]> }
  semantics: SemanticGraphAnalyzer | MockSemanticGraphAnalyzer
  payloadAuthor: PayloadAuthor | MockPayloadAuthor
}

function buildAsr(config: RuntimeConfig, transcriptOverride: Transcript | null) {
  if (transcriptOverride) {
    return {
      transcribePreparedAudio: async () => transcriptOverride
    }
  }
  if (!config.asr.enabled) {
    throw new AppError(
      'ASR_DISABLED',
      'ASR is disabled (set VOLC_ASR_ENABLED=true or provide TRANSCRIPT_OVERRIDE).',
      { status: 422 }
    )
  }
  const hasNew = Boolean(config.asr.apiKey)
  const hasLegacy = Boolean(config.asr.appId && config.asr.accessToken)
  if (!hasNew && !hasLegacy) {
    throw new AppError(
      'ASR_CREDENTIALS_MISSING',
      'No ASR credentials are set (need VOLC_ASR_API_KEY or APP_ID+ACCESS_TOKEN).',
      { status: 422 }
    )
  }
  const client = new VolcengineFlashAsrClient({
    endpoint: config.asr.endpoint,
    resourceId: config.asr.resourceId,
    apiKey: config.asr.apiKey || undefined,
    appId: config.asr.appId || undefined,
    accessToken: config.asr.accessToken || undefined,
    timeoutMs: config.asr.timeoutMs,
    maxAudioMb: config.asr.maxAudioMb,
    maxBase64AudioMb: config.asr.maxBase64AudioMb
  })
  return client
}

function buildSemantics(config: RuntimeConfig) {
  if (config.llmProvider === 'mock') return new MockSemanticGraphAnalyzer()
  const client = new OpenAICompatibleStructuredClient({
    apiKey: config.openai.apiKey,
    baseUrl: config.openai.baseUrl,
    model: config.openai.model,
    timeoutMs: config.openai.timeoutMs,
    maxRetries: config.openai.maxRetries
  })
  return new SemanticGraphAnalyzer(client)
}

function buildPayloadAuthor(config: RuntimeConfig) {
  if (config.llmProvider === 'mock') return new MockPayloadAuthor()
  const client = new OpenAICompatibleStructuredClient({
    apiKey: config.openai.apiKey,
    baseUrl: config.openai.baseUrl,
    model: config.openai.model,
    timeoutMs: config.openai.timeoutMs,
    maxRetries: config.openai.maxRetries
  })
  return new PayloadAuthor(client)
}

// ── Main ────────────────────────────────────────────────────────────────────

export interface PipelineJobInput {
  title: string
  videoPath?: string
  inputJsonPath?: string
  outPath?: string
  provider: 'openai' | 'mock'
  printStages?: boolean
}

export async function runPipelineJob(job: PipelineJobInput): Promise<unknown> {
  loadDotEnv({ path: process.env.CAIBAO_ENV_FILE || '.env', quiet: true })
  const config = loadRuntimeConfig()
  const readiness = providerReadiness(config)

  // Honor --provider even when env says openai: a smoke test on a CI box
  // without secrets should still work via the mock path.
  const provider = job.provider
  if (provider === 'mock') {
    // Force mock mode locally even if .env declares openai.
    config.llmProvider = 'mock'
    config.openai.apiKey = ''
  }

  if (job.printStages !== false) {
    console.log('— pipeline readiness —')
    console.log(JSON.stringify(readiness, null, 2))
  }

  // ── Pre-load overrides / input transcript ─────────────────────────────
  let transcriptOverride = await loadTranscriptOverride(config)
  const ocrOverride = await loadOcrOverride(config)

  // When --input points at a JSON file, treat its `transcript` field as the
  // ASR override automatically. This is the most common path for offline runs
  // and means callers never have to set TRANSCRIPT_OVERRIDE manually.
  if (!transcriptOverride && job.inputJsonPath) {
    const payload = JSON.parse(await readFile(job.inputJsonPath, 'utf8')) as {
      transcript?: Transcript
    }
    if (payload.transcript) {
      transcriptOverride = transcriptSchema.parse(payload.transcript)
    }
  }

  const asr = buildAsr(config, transcriptOverride)
  const semantics = buildSemantics(config)
  const payloadAuthor = buildPayloadAuthor(config)
  const ocr = ocrOverride
    ? {
        recognizeFrames: async () => ocrOverride
      }
    : new StubOcrClient()
  const media = new FfmpegMediaPreprocessor({
    workRoot: config.pipelineWorkRoot,
    ffmpegPath: config.ffmpegPath,
    ffprobePath: config.ffprobePath
  })

  const deps = {
    media,
    asr,
    ocr,
    semantics,
    payloadAuthor
  }
  const pipeline = new AnalysisPipeline(deps)

  const jobId = `job-${Date.now().toString(36)}`
  // The pipeline schema requires `mimeType` to start with `video/`. We always
  // pass `video/mp4` even in JSON-input mode because the JSON path bypasses
  // the `media_prepare` stage via a no-op stub injected below.
  const asset: MediaAsset = {
    assetId: jobId,
    source: 'user_upload',
    localPath: job.videoPath ?? job.inputJsonPath ?? '<input-json>',
    mimeType: 'video/mp4',
    rightsAttested: true,
    rightsAttestationId: 'demo-attestation'
  }

  // When running from a JSON input, build a tiny fake PreparedMedia so the
  // pipeline skips media_prepare. We do that by injecting a no-op media stage.
  let effectivePipeline = pipeline
  if (!job.videoPath) {
    const stubDuration = await deriveInputDuration(job.inputJsonPath)
    effectivePipeline = new AnalysisPipeline({
      ...deps,
      media: {
        prepare: async () => ({
          durationMs: stubDuration,
          fingerprint: 'sha256:mock-fingerprint',
          audio: { path: '<mock>', format: 'wav' },
          frames: []
        })
      }
    })
  }

  const result = await effectivePipeline.run({
    jobId,
    asset,
    title: job.title
  })

  if (job.outPath) {
    await mkdir(path.dirname(job.outPath), { recursive: true })
    await writeFile(job.outPath, JSON.stringify(result, null, 2))
    if (job.printStages !== false) console.log(`wrote ${job.outPath}`)
  }
  if (job.printStages !== false) {
    console.log(`stages: ${result.timings.stages.map((s) => `${s.stage}=${s.elapsedMs}ms`).join(', ')}`)
    console.log(`accepted cues: ${result.draft.triggerCandidates.length}`)
    console.log(`rejected cues: ${result.draft.rejectedTriggerCandidates.length}`)
  }
  return result
}

async function deriveInputDuration(inputJsonPath?: string): Promise<number> {
  if (!inputJsonPath) return 60_000
  const raw = JSON.parse(await readFile(inputJsonPath, 'utf8')) as { durationMs?: number }
  return raw.durationMs ?? 60_000
}

// ── Entrypoint ──────────────────────────────────────────────────────────────

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  const args = parseArgs(process.argv.slice(2))
  try {
    await runPipelineJob({
      title: args.title,
      videoPath: args.video,
      inputJsonPath: args.input,
      outPath: args.out,
      provider: args.provider,
      printStages: args.printStages
    })
  } catch (error) {
    const app = error instanceof AppError ? error : new AppError('INTERNAL_ERROR', String(error))
    console.error(`pipeline failed: ${app.code} — ${app.message}`)
    process.exitCode = 1
  }
}