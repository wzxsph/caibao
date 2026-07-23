/**
 * Deterministic cue scorer: SemanticEvent → TriggerCandidate.
 *
 * Extracted verbatim from `apps/web/server/src/pipeline/cue-scorer.ts`. Pure
 * function of inputs — no LLM, no clocks, no randomness.
 */
import type {
  SemanticEvent,
  SemanticEventType,
  SemanticTimeline,
  SubSignals,
  TriggerCandidate
} from '../domain/contracts.js'
import type { CueKind } from '../domain/payload-contracts.js'

export const EVENT_KIND_MAP: Record<SemanticEventType, CueKind> = {
  concept_first_mention: 'context_card',
  causal_jump: 'causal_stitch',
  condition_boundary: 'condition_slider',
  directional_claim: 'quick_judgment',
  counterexample_window: 'counterexample_flip',
  concept_confusion: 'concept_compare'
}

export function kindForEvent(type: SemanticEventType): CueKind {
  return EVENT_KIND_MAP[type]
}

export const WEIGHT_TABLE_VERSION = 'cue-weights.v1'

export const WEIGHTS = {
  learningValue: 0.28,
  evidenceStrength: 0.22,
  timeSensitivity: 0.18,
  interactionFit: 0.14,
  cognitiveLoad: 0.1,
  spacingNovelty: 0.08
} as const

const CUE_DURATION_MS = 5000
const DEFAULT_EXPECTED_INTERACTION_MS = 9000
const MAX_EXPECTED_INTERACTION_MS = 12000
const MAX_PRIORITY = 100
const MAX_PROMPT_LENGTH = 40
const EVIDENCE_COUNT_SATURATION = 3
const DENSE_OCR_SATURATION = 4
const SPACING_SATURATION_MS = 60_000

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value))

export function evidenceStrength(event: SemanticEvent, timeline: SemanticTimeline): number {
  if (!event.evidenceIds.length) return 0

  const entries = event.evidenceIds
    .map((id) => timeline.evidenceIndex.get(id))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== undefined)

  const breadth = clamp01(event.evidenceIds.length / EVIDENCE_COUNT_SATURATION)

  const confidences = entries
    .map((entry) => entry.confidence)
    .filter((value): value is number => value !== undefined)
  const reliability = confidences.length ? Math.min(...confidences) : 0

  const sources = new Set(entries.map((entry) => entry.source))
  const corroboration = sources.has('asr') && sources.has('ocr') ? 1 : 0

  return clamp01((breadth + reliability + corroboration) / 3)
}

export function cognitiveLoad(event: SemanticEvent, timeline: SemanticTimeline): number {
  const window = timeline.windows.find((candidate) => candidate.windowId === event.windowId)
  if (!window) return 1

  let ocrInWindow = 0
  for (const entry of timeline.evidenceIndex.values()) {
    if (entry.source !== 'ocr') continue
    if (entry.startMs >= window.startMs && entry.startMs <= window.endMs) ocrInWindow += 1
  }

  const density = clamp01(ocrInWindow / DENSE_OCR_SATURATION)
  return clamp01(1 - density)
}

export function spacingNovelty(
  event: SemanticEvent,
  kind: CueKind,
  learningObjective: string,
  scored: ReadonlyArray<{ timeMs: number; kind: CueKind; learningObjective: string }>
): number {
  const previousTimes = scored.map((item) => item.timeMs)
  const nearestGap = previousTimes.length
    ? Math.min(...previousTimes.map((time) => Math.abs(event.timeMs - time)))
    : SPACING_SATURATION_MS
  const spacing = clamp01(nearestGap / SPACING_SATURATION_MS)

  const seen = scored.some(
    (item) => item.kind === kind && item.learningObjective === learningObjective
  )
  const novelty = seen ? 0.5 : 1

  return clamp01((spacing + novelty) / 2)
}

function visualLoadFor(loadScore: number): TriggerCandidate['visualLoad'] {
  if (loadScore < 0.34) return 'high'
  if (loadScore < 0.67) return 'medium'
  return 'low'
}

function objectiveFor(event: SemanticEvent): string {
  return `Review ${event.type} at window ${event.windowId}`
}

function promptFor(event: SemanticEvent): string {
  return `Check point ${event.eventId}`.slice(0, MAX_PROMPT_LENGTH)
}

interface ScoredMemo {
  timeMs: number
  kind: CueKind
  learningObjective: string
}

function deriveCandidate(
  event: SemanticEvent,
  timeline: SemanticTimeline,
  scored: ScoredMemo[],
  expectedInteractionMs: number
): TriggerCandidate {
  const kind = kindForEvent(event.type)
  const learningObjective = objectiveFor(event)

  const dimensions = {
    learningValue: event.subSignals.learningValue,
    evidenceStrength: evidenceStrength(event, timeline),
    timeSensitivity: event.subSignals.timeSensitivity,
    interactionFit: event.subSignals.interactionFit,
    cognitiveLoad: cognitiveLoad(event, timeline),
    spacingNovelty: spacingNovelty(event, kind, learningObjective, scored)
  }

  const rawScore =
    WEIGHTS.learningValue * dimensions.learningValue +
    WEIGHTS.evidenceStrength * dimensions.evidenceStrength +
    WEIGHTS.timeSensitivity * dimensions.timeSensitivity +
    WEIGHTS.interactionFit * dimensions.interactionFit +
    WEIGHTS.cognitiveLoad * dimensions.cognitiveLoad +
    WEIGHTS.spacingNovelty * dimensions.spacingNovelty

  const priority = Math.min(MAX_PRIORITY, Math.max(0, Math.round(MAX_PRIORITY * rawScore)))

  const proposedStartMs = event.timeMs
  const proposedEndMs = Math.min(timeline.durationMs, proposedStartMs + CUE_DURATION_MS)

  return {
    candidateId: `cue-${event.eventId}`,
    sourceEventId: event.eventId,
    kind,
    proposedStartMs,
    proposedEndMs: Math.max(proposedEndMs, proposedStartMs + 1),
    windowId: event.windowId,
    priority,
    expectedInteractionMs,
    prompt: promptFor(event),
    learningObjective,
    rationale: event.rationale ?? `${event.type} at ${event.timeMs}ms`,
    evidenceIds: [...event.evidenceIds],
    visualLoad: visualLoadFor(dimensions.cognitiveLoad),
    subSignals: {
      learningValue: event.subSignals.learningValue,
      timeSensitivity: event.subSignals.timeSensitivity,
      interactionFit: event.subSignals.interactionFit
    }
  }
}

export interface ScoreEventsResult {
  candidates: TriggerCandidate[]
  weightTableVersion: string
}

export function scoreEvents(
  events: SemanticEvent[],
  timeline: SemanticTimeline,
  options: { expectedInteractionMs?: number } = {}
): ScoreEventsResult {
  const expectedInteractionMs = Math.min(
    MAX_EXPECTED_INTERACTION_MS,
    options.expectedInteractionMs ?? DEFAULT_EXPECTED_INTERACTION_MS
  )

  const scored: ScoredMemo[] = []
  const candidates: TriggerCandidate[] = []

  for (const event of events) {
    const candidate = deriveCandidate(event, timeline, scored, expectedInteractionMs)
    candidates.push(candidate)
    scored.push({
      timeMs: event.timeMs,
      kind: candidate.kind,
      learningObjective: candidate.learningObjective
    })
  }

  return { candidates, weightTableVersion: WEIGHT_TABLE_VERSION }
}