# caibao-pipeline-skill

A standalone, runnable extraction of the caibao finance-video generation
pipeline. Three stages, one folder:

```
parse video  →  ASR / OCR  →  text generation (cue authoring)
   ffmpeg        Volcengine       OpenAI-compatible LLM (or mock)
```

The pipeline produces a fully-shaped `DraftExperience` and a deterministic
`CoverageReport` — the same JSON shape the caibao web app exposes over HTTP.
You can plug this folder into any agent harness (Claude Code, an in-house
orchestrator, a CI job) without dragging the rest of the web app along.

---

## What's inside

```
pipeline-skill/
├── src/
│   ├── domain/             # Zod contracts (verbatim from caibao web)
│   ├── media/ffmpeg.ts     # Parse: video → audio.wav + frames + duration
│   ├── providers/
│   │   ├── volcengine-asr.ts          # Volcengine flash ASR (real provider)
│   │   ├── openai-compatible.ts       # Chat-completions tool-calling client
│   │   ├── semantic-graph-analyzer.ts # extract / critique / repair LLM calls
│   │   └── mock-payload-author.ts     # Deterministic offline cue author
│   ├── pipeline/
│   │   ├── analyze-video.ts       # Orchestrator: 7 stages + timings
│   │   ├── semantic-timeline.ts   # Deterministic window scaffold
│   │   ├── cue-scorer.ts          # SemanticEvent → TriggerCandidate
│   │   ├── cue-planner.ts         # Weighted-interval scheduling
│   │   ├── direction-rules.ts     # Versioned direction rule engine
│   │   ├── payload-author.ts      # LLM cue payload author + repair loop
│   │   └── coverage-report.ts     # Deterministic review hand-off report
│   ├── config/env.ts        # Slimmed-down runtime config + readiness check
│   └── agent/
│       ├── run-pipeline.ts  # Single-job CLI entry ("agent")
│       └── loop.ts          # Folder-sweep batch driver ("loop")
├── bin/                     # Convenience shell wrappers
├── examples/                # Pre-built transcript fixture for offline runs
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 1. Install

```bash
cd pipeline-skill
npm install          # or pnpm install
```

> The folder depends on `tsx`, `zod`, `dotenv` and `@types/node`. Nothing
> else. FFmpeg / FFprobe are the only system binaries required.

## 2. Choose a provider mode

Two modes — pick one in `.env` (or via `--provider` on the CLI):

| `--provider` | LLM | ASR | OCR | Use it when |
|---|---|---|---|---|
| `mock` (default) | in-memory | skipped (or override JSON) | skipped | offline smoke tests, CI, demos |
| `openai` | any OpenAI-compatible endpoint | Volcengine flash | optional Volcengine OCR | real videos with provider access |

Copy and fill in the env file:

```bash
cp .env.example .env
```

Minimum required for `mock` mode: nothing. The mock analyzer + mock payload
author produce a valid output without any network calls.

For `openai` mode set at least `OPENAI_API_KEY` and `OPENAI_MODEL`. For real
ASR add `VOLC_ASR_API_KEY` (or the legacy `VOLC_ASR_APP_ID` + `ACCESS_TOKEN`).

## 3. Run

### Agent (single job)

```bash
# Offline: demo transcript + mock LLM
npx tsx src/agent/run-pipeline.ts \
  --input examples/demo-transcript.json \
  --title "降息如何影响资产价格" \
  --provider mock \
  --out examples/demo-output.json

# Real video + real providers
npx tsx src/agent/run-pipeline.ts \
  --video path/to/video.mp4 \
  --title "美联储降息对资产价格的影响" \
  --provider openai \
  --out examples/real-output.json
```

### Loop (folder sweep)

```bash
npx tsx src/agent/loop.ts \
  --inputs-dir ./my-transcripts \
  --outputs-dir ./.pipeline-work/out \
  --provider mock
```

The loop writes a per-file output plus `_summary.json` with success counts.

## 4. Output shape

`examples/demo-output.json` looks like:

```json
{
  "draft": {
    "experienceId": "draft-job-…",
    "title": "…",
    "contentVersion": "draft.<fingerprint>",
    "mediaFingerprint": "sha256:…",
    "publishStatus": "draft",
    "blockers": ["HUMAN_REVIEW_REQUIRED"],
    "evidence": [ … ASR/OCR items … ],
    "concepts": [ … ],
    "claims": [ … ],
    "causalEdges": [ … ],
    "conditions": [ … ],
    "triggerCandidates": [ … fully-shaped cue payloads … ],
    "rejectedTriggerCandidates": [ … ],
    "approvedTriggers": []
  },
  "coverageReport": {
    "coverage": { "concepts": …, "causalEdges": …, "conditions": … },
    "evidenceGaps": [ … ],
    "kindBalance": { … },
    "directionResolutions": [ … ],
    "rejectedCandidates": [ … ],
    "reviewDecisionsRequired": [ … ],
    "versions": { … }
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

This is the same shape the caibao web server returns from
`GET /api/finance/v1/analysis/jobs/:jobId/draft` — drop it into the web app
to render the cues without any translation layer.

## 5. How the three stages fit together

```
                            ┌────────────────────┐
   video.mp4 ───────────▶   │  Stage 0: parse    │  FfmpegMediaPreprocessor
                            │  - probe duration  │  →  durationMs, fingerprint
                            │  - extract audio   │  →  audio.wav
                            │  - sample frames   │  →  frames/*.jpg
                            └────────┬───────────┘
                                     │
                                     ▼
                            ┌────────────────────┐
                            │ Stage 1: ASR + OCR │  VolcengineFlashAsrClient
                            │  - transcribe      │  →  Transcript
                            │  - OCR (optional)  │  →  OcrEvidence[]
                            │  - build timeline  │  →  SemanticTimeline
                            └────────┬───────────┘
                                     │
                                     ▼
                  ┌────────────────────────────────────┐
                  │ Stages 2-4: semantic graph         │  SemanticGraphAnalyzer
                  │  extract → validate → repair loop  │  →  SemanticGraph
                  └────────┬───────────────────────────┘
                           │
                           ▼
                  ┌────────────────────────────────────┐
                  │ Stages 5-7: cue authoring          │  CueScorer + Planner
                  │  - score events → candidates       │     + DirectionRules
                  │  - resolve direction (rule table)  │     + PayloadAuthor
                  │  - author each accepted payload    │  →  DraftExperience
                  └────────┬───────────────────────────┘
                           │
                           ▼
                  ┌────────────────────────────────────┐
                  │ Stage 8: assemble + coverage       │  CoverageReportBuilder
                  └────────────────────────────────────┘
```

Every deterministic stage (timeline, scorer, planner, direction engine,
coverage) is pure — identical inputs produce deep-equal outputs. Only the
boxed LLM/ASR/OCR providers are replaceable.

## 6. Replacing the mock LLM with a real one

`LLM_PROVIDER=openai` in `.env` (or `--provider openai` on the CLI) wires
`OpenAICompatibleStructuredClient` into both the semantic-graph analyzer and
the payload author. Any service implementing the OpenAI Chat Completions
tool-calling contract works — set `OPENAI_BASE_URL` accordingly:

| Service | `OPENAI_BASE_URL` |
|---|---|
| MiniMax | `https://api.minimaxi.com/v1` |
| Volcano Ark / Doubao | `https://ark.cn-beijing.volces.com/api/v3` |
| OpenAI | `https://api.openai.com/v1` |
| vLLM / Ollama (OpenAI-compatible) | `http://localhost:<port>/v1` |

## 7. Reproducing caibao's outputs

The skill keeps every contract, version tag (`RULE_ENGINE_VERSION`,
`WEIGHT_TABLE_VERSION`, `PROMPT_VERSION`) and safety regex from
`apps/web/server/`. Running `--provider openai` against a real caibao video
should produce a `DraftExperience` byte-equivalent (modulo timestamps) to
the web app's HTTP response — verify by hashing the JSON.

## 8. Hooking it into an agent harness

The skill exposes two stable entry points:

```ts
import { runPipelineJob } from './src/agent/run-pipeline.js'
import { runLoop } from './src/agent/loop.js'

// one job
const result = await runPipelineJob({
  title: '降息如何影响资产价格',
  videoPath: './media/clip.mp4',
  provider: 'openai'
})

// batch
const summary = await runLoop({
  inputsDir: './my-transcripts',
  outputsDir: './out',
  provider: 'mock'
})
```

Both return native JS objects (no extra parsing needed). `runPipelineJob`'s
return value is `{ draft, coverageReport, timings }`.

## Troubleshooting

- `MEDIA_TOOL_UNAVAILABLE` — install `ffmpeg` and `ffprobe` (or point
  `FFMPEG_PATH`/`FFPROBE_PATH` at the binaries).
- `ASR_CREDENTIALS_MISSING` — fill `VOLC_ASR_API_KEY` (or legacy
  `VOLC_ASR_APP_ID` + `VOLC_ASR_ACCESS_TOKEN`), or set
  `TRANSCRIPT_OVERRIDE=examples/demo-transcript.json` to skip the ASR step.
- `PROVIDER_CONFIG_INVALID` — `OPENAI_API_KEY` is empty while
  `--provider openai`. Either fill it or drop back to `--provider mock`.