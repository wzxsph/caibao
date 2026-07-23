---
name: caibao-pipeline-skill
description: Run the caibao finance-video generation pipeline as a standalone skill. Parses a video file with ffmpeg/ffprobe, transcribes audio with Volcengine flash ASR (or a JSON override), then authors learning-cue payloads via an OpenAI-compatible LLM (or a deterministic mock). Triggers when the user wants to "analyze a finance video", "run the caibao pipeline", "extract cue payloads from a clip", "generate learning interactions from media", "parse + ASR + 出题/讲解 文本生成", or "extract cues from a transcript". Produces a DraftExperience + CoverageReport + timings JSON identical in shape to the caibao web app's HTTP response. NOT for rendering or playback — use the caibao web app for that.
license: MIT
metadata:
  version: 0.1.0
  author: caibao team
  category: media-pipeline
  updated: 2026-07-23
  source: caibao
  extraction-source: apps/web/server/src/{pipeline,providers,media}
alwaysApply: false
keywords:
  - caibao
  - finance video pipeline
  - 财经视频生成管线
  - 解析视频
  - 语音模型识别
  - 出题
  - 讲解文本生成
  - DraftExperience
  - CoverageReport
  - Volcengine ASR
  - Volcengine flash
  - ffmpeg
  - ffprobe
  - transcript extraction
  - cue authoring
  - semantic graph
  - trigger candidate
  - direction rule engine
  - MiniMax
  - Ark
  - OpenAI-compatible
  - mock LLM
  - offline pipeline
  - standalone skill
  - caibao extraction
---

# caibao-pipeline-skill

You are an expert in extracting learning-cue payloads from finance videos. Your goal is to take a raw video (or a transcript JSON) and produce the same `DraftExperience` JSON the caibao web app exposes over HTTP — without dragging the rest of the web app along.

This skill is a faithful extraction of `apps/web/server/src/{pipeline,providers,media}` into a folder that runs with `npm install` + one env file.

## Before Starting

**Check for context first:**
If `references/context.md` exists in the host project, read it first — it may already document which provider keys are available, which model the team uses, and the demo transcripts on hand. Only ask for what isn't covered.

Gather this context (ask if not provided):

### 1. Input
- Do you have a real video file, or just a transcript JSON (or a pre-existing cue bundle)?
- What's the title for the generated draft?
- Is this a one-shot job or a batch over a folder?

### 2. Providers
- Which mode — `--provider mock` (offline, zero network) or `--provider openai` (real LLM)?
- If openai: is `OPENAI_API_KEY` set? Which `OPENAI_BASE_URL` (MiniMax / Ark / OpenAI / vLLM)?
- If you want real ASR: `VOLC_ASR_API_KEY` or legacy `VOLC_ASR_APP_ID` + `VOLC_ASR_ACCESS_TOKEN`?
- OCR optional — leave `VOLC_OCR_ENABLED=false` unless you actually need it.

### 3. Output
- Where should the JSON land? Default: `examples/demo-output.json`.
- Is the consumer the caibao web renderer? (It accepts this exact shape — no translation needed.)

## How This Skill Works

The skill exposes two entry points. Pick by intent.

### Mode 1 — Single Job (the "agent")
Use when you have one video (or one transcript) and want a full `DraftExperience`.

```bash
./bin/run-pipeline.sh \
  --input examples/demo-transcript.json \
  --title "降息如何影响资产价格" \
  --provider mock \
  --out examples/demo-output.json
```

For a real video:

```bash
./bin/run-pipeline.sh \
  --video path/to/clip.mp4 \
  --title "美联储降息对资产价格的影响" \
  --provider openai \
  --out ./out/clip.json
```

### Mode 2 — Folder Sweep (the "loop")
Use when you have a directory of input JSONs (or videos) and want a batch run with a summary.

```bash
./bin/run-loop.sh \
  --inputs-dir ./my-transcripts \
  --outputs-dir ./out \
  --provider mock
```

Per-file outputs are written to `--outputs-dir`; a `_summary.json` reports per-file status.

### Mode 3 — Programmatic Embed
Use when you're wiring this skill into another agent harness.

```ts
import { runPipelineJob } from './src/agent/run-pipeline.js'
import { runLoop } from './src/agent/loop.js'

const result = await runPipelineJob({
  title: '降息如何影响资产价格',
  videoPath: './media/clip.mp4',
  provider: 'openai'
})
// result = { draft, coverageReport, timings }
```

## Three-Stage Pipeline

```
video.mp4  →  Stage 1 (parse)  →  Stage 2 (ASR/OCR)  →  Stage 3 (text-gen)
ffmpeg          ffprobe              Volcengine flash       MiniMax / Ark / mock
                frames/*.jpg         Transcript             SemanticGraph + PayloadAuthor
                audio.wav            SemanticTimeline       DraftExperience
                                                            CoverageReport
```

| Stage | Source module | Skill file | Default provider |
|---|---|---|---|
| 1. Parse | `apps/web/server/src/media/ffmpeg.ts` | `src/media/ffmpeg.ts` | ffmpeg + ffprobe |
| 2. ASR | `apps/web/server/src/providers/volcengine-asr.ts` | `src/providers/volcengine-asr.ts` | Volcengine flash |
| 2. Timeline | `apps/web/server/src/pipeline/semantic-timeline.ts` | `src/pipeline/semantic-timeline.ts` | deterministic, in-process |
| 3. Extract | `apps/web/server/src/providers/semantic-graph-analyzer.ts` | `src/providers/semantic-graph-analyzer.ts` | OpenAI-compatible |
| 3. Score / Plan / Direction | `cue-scorer.ts`, `cue-planner.ts`, `direction-rules.ts` | `src/pipeline/*` | deterministic |
| 3. Payload | `apps/web/server/src/pipeline/payload-author.ts` | `src/pipeline/payload-author.ts` | OpenAI-compatible |
| 3. Coverage | `apps/web/server/src/pipeline/coverage-report.ts` | `src/pipeline/coverage-report.ts` | deterministic |

The deterministic stages are byte-identical to caibao's; identical inputs → deep-equal outputs.

See [`references/architecture.md`](references/architecture.md) for the full stage table, error model, and timing surface.

## Picking a Provider Mode

| `--provider` | LLM | ASR | OCR | Cost | Use it when |
|---|---|---|---|---|---|
| `mock` | `MockSemanticGraphAnalyzer` + `MockPayloadAuthor` | skipped if `--input` JSON | skipped | free | offline smoke tests, CI, demos, learning the pipeline |
| `openai` | `SemanticGraphAnalyzer` + `PayloadAuthor` against `OPENAI_BASE_URL` | real Volcengine if creds set | optional | billed | reproducing caibao's production output |

**Quick decision rule:** start with `--provider mock` to confirm the wire is sound; flip to `--provider openai` once the env file has keys.

See [`references/provider-modes.md`](references/provider-modes.md) for the full env-var matrix and how to wire MiniMax / Ark / OpenAI / vLLM / Ollama.

## Reproducing caibao's Web App Output

The output JSON is byte-shape-compatible with `GET /api/finance/v1/analysis/jobs/:jobId/draft`:

```json
{
  "draft": {
    "experienceId": "draft-<jobId>",
    "title": "…",
    "contentVersion": "draft.<fingerprint12>",
    "publishStatus": "draft",
    "blockers": ["HUMAN_REVIEW_REQUIRED"],
    "evidence": […ASR/OCR items…],
    "concepts": […],
    "claims": […],
    "causalEdges": […],
    "conditions": […],
    "triggerCandidates": […fully-shaped cue payloads…],
    "rejectedTriggerCandidates": […],
    "approvedTriggers": []
  },
  "coverageReport": {
    "coverage": { "concepts": {…}, "causalEdges": {…}, "conditions": {…} },
    "evidenceGaps": […],
    "kindBalance": {…},
    "directionResolutions": […],
    "rejectedCandidates": […],
    "reviewDecisionsRequired": […],
    "versions": {…ruleEngineVersion, weightTableVersion, promptVersion…}
  },
  "timings": {
    "totalMs": …,
    "stages": [
      { "stage": "media_prepare", "elapsedMs": … },
      …
      { "stage": "assemble", "elapsedMs": … }
    ]
  }
}
```

Drop this straight into the caibao web renderer — no translation layer. See [`references/reproduce-caibao.md`](references/reproduce-caibao.md) for the contract test that locks the shape.

## Verification

```bash
npm install
npm run type-check          # tsc --noEmit, must be clean
npm run smoke               # 8-case offline test, all must pass
./bin/run-pipeline.sh --input examples/demo-transcript.json --provider mock --out /tmp/out.json
```

The smoke spec covers: transcript schema, timeline windows, scorer determinism, planner min-gap, direction rule engine, mock author safety net, and end-to-end pipeline.

## Proactive Triggers

Surface these WITHOUT being asked when you spot them in context:

- **`ASR_CREDENTIALS_MISSING`** → user tried to run a real video with no ASR keys; point at `TRANSCRIPT_OVERRIDE` or fill `VOLC_ASR_API_KEY`.
- **`PROVIDER_CONFIG_INVALID`** + `--provider openai` → empty `OPENAI_API_KEY`; suggest `--provider mock` for the smoke test or fill the key.
- **`MEDIA_TOOL_UNAVAILABLE`** → ffmpeg/ffprobe missing; show install line for the host OS or `FFMPEG_PATH`/`FFPROBE_PATH` override.
- **All cues rejected** with `MIN_GAP_VIOLATION` → video is too dense or too short; warn and suggest splitting the clip.
- **Direction resolves to `insufficient` for every directional cue** → the rule table didn't match; surface the `insufficientReason` from `coverageReport.directionResolutions`.
- **Authored text contains forbidden language** (advice / positions / target price) → payload author emitted investment-advice phrasing; the pipeline drops it as `UNSAFE_FINANCIAL_LANGUAGE` and the cue is rejected.

## Output Artifacts

| When you ask for… | You get… |
|---|---|
| "Analyze this finance video" | `./bin/run-pipeline.sh --video <path> --provider openai --out ./out.json` producing `DraftExperience` + `CoverageReport` + timings |
| "Run the demo" | `./bin/run-pipeline.sh --input examples/demo-transcript.json --provider mock --out examples/demo-output.json` |
| "Batch process these transcripts" | `./bin/run-loop.sh --inputs-dir <dir> --outputs-dir <dir> --provider mock` |
| "What does the pipeline actually do?" | Stage-by-stage walkthrough at [`references/architecture.md`](references/architecture.md) |
| "How do I wire it to MiniMax / Ark / OpenAI?" | [`references/provider-modes.md`](references/provider-modes.md) |
| "Is my output byte-compatible with the web app?" | [`references/reproduce-caibao.md`](references/reproduce-caibao.md) |

## Communication

- **Bottom line first** — what ran, how long, how many cues accepted/rejected.
- **What + Why + How** — every finding has all three; never "the pipeline failed" without the `code` and `message`.
- **Confidence tagging** — 🟢 verified (smoke + tsc clean + known-good env) / 🟡 medium (ran but env was partial) / 🔴 assumed (no run, only code review).
- **No silent truncation** — if a stage is skipped, say so in the banner.

## Related Skills

- **`caibao-web-app`** — for the renderer / playback UI. NOT for pipeline runs.
- **`caibao-mock-content-generator`** — deterministic showcase fixtures, used by the web app's static seed. NOT for live analysis.
- **`caibao-showcase-prep`** — ffmpeg-based browser-derivative generation for the recommendation feed. NOT for cue authoring.
- **`MiniMax`** / **`Ark`** / **`OpenAI`** provider skills — for raw LLM calls. This skill wraps those via the OpenAI-compatible contract.

See [`references/`](references/) for the full deep docs; they load on demand, not at startup.