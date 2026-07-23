# Architecture

The pipeline is **eight stages** wrapped by one orchestrator (`src/pipeline/analyze-video.ts`). Each stage is a pure function of its inputs except where an LLM provider is injected.

```
┌──────────────────────────────────────────────────────────────────┐
│  Stage 0 — media_prepare                                         │
│  Input:  MediaAsset (rightsAttested)                             │
│  Driver: FfmpegMediaPreprocessor                                 │
│  Output: { durationMs, fingerprint, audio{path,format}, frames[] }│
├──────────────────────────────────────────────────────────────────┤
│  Stage 1 — evidence_extract                                      │
│  ASR:    VolcengineFlashAsrClient.transcribePreparedAudio()       │
│  OCR:    VolcengineOcrClient.recognizeFrames() (optional)        │
│  Scaffold: buildSemanticTimeline()                               │
│  Output: { transcript, ocr[], timeline{windows,evidenceIndex} }   │
├──────────────────────────────────────────────────────────────────┤
│  Stage 2 — semantic_extract                                      │
│  Driver: SemanticGraphAnalyzer.extract() (or MockSemantic…)      │
│  Repair loop: up to MAX_REPAIR_ITERS=2 re-asks on schema errors  │
│  Output: SemanticGraph (concepts/claims/edges/conditions/events) │
├──────────────────────────────────────────────────────────────────┤
│  Stage 3 — validate_repair                                       │
│  Deterministic: every graph item cites a known evidenceId        │
│  Repair loop: up to MAX_REPAIR_ITERS=2 semantic-graph.repair()    │
│  Output: pruned SemanticGraph + repairExhausted list             │
├──────────────────────────────────────────────────────────────────┤
│  Stage 4 — plan                                                  │
│  Driver: scoreEvents() → planCueCandidates() → resolveDirection()│
│  Output: { accepted[], rejected[], directionResolutions[] }      │
├──────────────────────────────────────────────────────────────────┤
│  Stage 5 — payload_author                                        │
│  Driver: PayloadAuthor.author() (or MockPayloadAuthor)           │
│  Repair loop: schema-invalid → re-ask with hint;                  │
│              unsafe text → re-ask with forbidden-language hint   │
│  Output: TriggerCandidate[] with .payload filled                 │
├──────────────────────────────────────────────────────────────────┤
│  Stage 6 — assemble                                              │
│  Deterministic: buildCoverageReport() + draft + timings          │
│  Output: { draft, coverageReport, timings }                      │
└──────────────────────────────────────────────────────────────────┘
```

## Deterministic vs LLM stages

| Deterministic | LLM / External |
|---|---|
| `media_prepare` (ffmpeg/ffprobe) | ASR (Volcengine flash) |
| `semantic-timeline` | OCR (Volcengine) |
| `cue-scorer` | `semantic_extract` |
| `cue-planner` | `critique` (optional) |
| `direction-rules` | `repair` |
| `payload_author` safety regex | `payload_author` model call |
| `coverage-report` | |
| `assemble` | |

Every deterministic stage is pure: identical inputs → deep-equal outputs (aside from `Map` identity in the timeline).

## Error model

All errors thrown by the pipeline are `AppError` (`src/domain/errors.ts`) with:

- `code` — stable machine-readable identifier (e.g. `ASR_CREDENTIALS_MISSING`)
- `status` — suggested HTTP status (always set, even for non-HTTP callers)
- `message` — human-readable detail
- `details` — optional bag of structured context
- `cause` — original error if wrapping

Codes the runner emits most often:

| Code | Stage | Meaning |
|---|---|---|
| `MEDIA_TOOL_UNAVAILABLE` | 0 | ffmpeg/ffprobe missing |
| `MEDIA_FILE_NOT_FOUND` | 0 | `--video` path doesn't resolve |
| `ASR_CREDENTIALS_MISSING` | 1 | no ASR creds and no transcript override |
| `ASR_PROVIDER_ERROR` | 1 | upstream ASR returned non-2xx |
| `ASR_TIMELINE_OUTSIDE_MEDIA` | 1 | segment endMs > durationMs |
| `ASR_RESPONSE_INVALID` | 1 | upstream payload didn't match schema |
| `PROVIDER_INVALID_RESPONSE` | 2/5 | LLM tool-call payload failed Zod |
| `PROVIDER_UNAVAILABLE` | 2/5 | network / timeout after retries |
| `UNSAFE_FINANCIAL_LANGUAGE` | 5 | authored text matched the forbidden regex |

## Timing surface

`timings.stages[]` records one entry per stage, in order. `timings.totalMs` is the wall-clock from `run()` start to `run()` return. None of these timings record prompt text, transcript text, or keys — they only count milliseconds.

## Injecting dependencies

The pipeline takes its providers as a constructor dep bag:

```ts
new AnalysisPipeline({
  media,          // FfmpegMediaPreprocessor (real) or any { prepare() }
  asr,            // VolcengineFlashAsrClient (real) or transcript-override stub
  ocr,            // VolcengineOcrClient or DisabledOcrClient or OCR-override stub
  semantics,      // SemanticGraphAnalyzer OR MockSemanticGraphAnalyzer
  payloadAuthor   // PayloadAuthor OR MockPayloadAuthor
})
```

This is how the offline `--provider mock` path works — every LLM stage is swapped for a deterministic mock. The deterministic stages never change. See `src/agent/run-pipeline.ts` for the wiring.

## Why mock + real share the same orchestrator

The orchestrator is the value: it owns validation, repair loops, the planner, the direction engine, the safety regex, and the coverage report. Replacing the LLM should not change any of those. The mock implementations satisfy the same interfaces as the real ones (`extract` / `critique` / `repair` / `author`), so the orchestrator can't tell them apart.