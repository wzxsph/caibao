/**
 * Deterministic timeline scaffold builder. Takes ASR segments + OCR evidence
 * and produces the non-overlapping windows every downstream stage references.
 *
 * Extracted verbatim from `apps/web/server/src/pipeline/semantic-timeline.ts`.
 */
import type {
  EvidenceIndexEntry,
  OcrEvidence,
  SemanticTimeline,
  TimelineWindow,
  Transcript,
  TranscriptSegment
} from '../domain/contracts.js'

export interface BuildSemanticTimelineInput {
  transcript: Transcript
  ocr: OcrEvidence[]
  durationMs: number
}

interface Interval {
  startMs: number
  endMs: number
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

function utteranceIntervals(segments: TranscriptSegment[], durationMs: number): Interval[] {
  const clamped = segments
    .map((segment) => ({
      startMs: clamp(segment.startMs, 0, durationMs),
      endMs: clamp(segment.endMs, 0, durationMs)
    }))
    .filter((interval) => interval.endMs > interval.startMs)
    .sort((left, right) => left.startMs - right.startMs || left.endMs - right.endMs)

  const merged: Interval[] = []
  for (const interval of clamped) {
    const last = merged[merged.length - 1]
    if (last && interval.startMs <= last.endMs) {
      if (interval.endMs > last.endMs) {
        merged[merged.length - 1] = { startMs: last.startMs, endMs: interval.endMs }
      }
      continue
    }
    merged.push(interval)
  }
  return merged
}

function buildWindows(segments: TranscriptSegment[], durationMs: number): TimelineWindow[] {
  if (durationMs <= 0) return []

  const intervals = utteranceIntervals(segments, durationMs)
  if (intervals.length === 0) {
    return [{ windowId: 'win-0', startMs: 0, endMs: durationMs, source: 'fixed' }]
  }

  const spans: Interval[] = []
  let cursor = 0
  for (const interval of intervals) {
    if (interval.startMs > cursor) {
      spans.push({ startMs: cursor, endMs: interval.startMs })
    }
    spans.push(interval)
    cursor = interval.endMs
  }
  if (cursor < durationMs) {
    spans.push({ startMs: cursor, endMs: durationMs })
  }

  return spans.map((span, index) => ({
    windowId: `win-${index}`,
    startMs: span.startMs,
    endMs: span.endMs,
    source: 'utterance_gap'
  }))
}

function buildEvidenceIndex(
  segments: TranscriptSegment[],
  ocr: OcrEvidence[]
): Map<string, EvidenceIndexEntry> {
  const index = new Map<string, EvidenceIndexEntry>()

  for (const segment of segments) {
    index.set(segment.evidenceId, {
      startMs: segment.startMs,
      endMs: segment.endMs,
      source: 'asr',
      confidence: segment.confidence
    })
  }

  for (const item of ocr) {
    index.set(item.evidenceId, {
      startMs: item.timeMs,
      endMs: item.timeMs,
      source: 'ocr',
      confidence: item.confidence
    })
  }

  return index
}

export function buildSemanticTimeline(input: BuildSemanticTimelineInput): SemanticTimeline {
  const durationMs = Math.max(0, Math.trunc(input.durationMs))
  return {
    durationMs,
    windows: buildWindows(input.transcript.segments, durationMs),
    evidenceIndex: buildEvidenceIndex(input.transcript.segments, input.ocr)
  }
}

export function windowIdAt(timeline: SemanticTimeline, timeMs: number): string | null {
  const { windows, durationMs } = timeline
  for (const window of windows) {
    const isLast = window.endMs === durationMs
    const withinEnd = isLast ? timeMs <= window.endMs : timeMs < window.endMs
    if (timeMs >= window.startMs && withinEnd) {
      return window.windowId
    }
  }
  return null
}