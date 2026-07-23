# Provider Modes

The skill supports two provider modes plus optional real ASR/OCR. The defaults are designed for offline runs with zero credentials.

## Mode A — `--provider mock` (default)

Zero network calls. Every LLM-driven stage is replaced by a deterministic in-memory implementation.

| Stage | Mock implementation | File |
|---|---|---|
| `semantic_extract` | `MockSemanticGraphAnalyzer.extract()` — returns a small graph from the transcript's first / mid / last segments | `src/providers/semantic-graph-analyzer.ts` |
| `critique` / `repair` | No-op, returns the input graph unchanged | same |
| `payload_author` | `MockPayloadAuthor.author()` — returns a fully-shaped payload per kind, deterministic | `src/providers/mock-payload-author.ts` |
| ASR | skipped if `--input` is a JSON file | — |
| OCR | `StubOcrClient` returns `[]` | `src/agent/run-pipeline.ts` |

Required env vars: **none**.

This is what `npm run smoke` and `npm run demo` use.

## Mode B — `--provider openai`

Wire real LLM providers via the OpenAI Chat Completions tool-calling contract. Works for:

| Service | `OPENAI_BASE_URL` | Notes |
|---|---|---|
| MiniMax | `https://api.minimaxi.com/v1` | `MiniMax-M2.7` works out of the box; `reasoning_split=true` if you turn it on in chat |
| Volcano Ark / Doubao | `https://ark.cn-beijing.volces.com/api/v3` | Use `ARK_MODEL`; some Ark endpoints prefer `endpoint_id` instead of `model` |
| OpenAI | `https://api.openai.com/v1` | `gpt-4o-mini` or `gpt-4o` recommended for the structured tool call |
| vLLM | `http://localhost:8000/v1` | Any model that supports tool calling |
| Ollama (OpenAI-compat shim) | `http://localhost:11434/v1` | Tool-call support varies by model |

### Required env vars

```
OPENAI_API_KEY=<your key>
OPENAI_BASE_URL=https://api.minimaxi.com/v1   # or your service
OPENAI_MODEL=<model name>
OPENAI_TIMEOUT_MS=30000
OPENAI_MAX_RETRIES=2
```

### Optional multimodal

If `OPENAI_MULTIMODAL_MODEL` is set, frame images are sent as `image_url` data URLs in the extract stage. Leave empty to fall back to text-only extraction (transcript + OCR only).

## Real ASR — Volcengine flash

Two credential styles are accepted (new style wins if both are set):

```
# New-style (preferred)
VOLC_ASR_ENABLED=true
VOLC_ASR_API_KEY=<key>

# Legacy console-style
VOLC_ASR_ENABLED=true
VOLC_ASR_APP_ID=<app id>
VOLC_ASR_ACCESS_TOKEN=<access token>
```

Required HTTP endpoint, headers, body shape, and response normalization are all in `src/providers/volcengine-asr.ts` — extracted verbatim from the caibao web app.

## Skipping ASR with a JSON override

If you don't have ASR keys but you already have a transcript, skip the stage entirely:

```
TRANSCRIPT_OVERRIDE=examples/demo-transcript.json
```

…or just pass `--input examples/demo-transcript.json` and the runner picks the transcript up automatically.

## OCR — optional

OCR is disabled by default. To enable:

```
VOLC_OCR_ENABLED=true
VOLC_ACCESS_KEY_ID=<ak>
VOLC_SECRET_ACCESS_KEY=<sk>
```

Without OCR the pipeline still works — the timeline scaffold falls back to ASR-only windows.

## Cost / latency budget

| Stage | Mock | OpenAI | Volcengine ASR |
|---|---|---|---|
| `media_prepare` | n/a (skipped on JSON input) | n/a | n/a |
| `evidence_extract` | <1 ms | n/a | ~5–30 s for a 90 s clip |
| `semantic_extract` | <5 ms | ~3–10 s | n/a |
| `payload_author` | <1 ms per cue | ~1–3 s per cue | n/a |

Total for a 90 s clip in mock mode: <50 ms. In openai mode: ~30–90 s end-to-end.

## Switching mid-run

The CLI flag `--provider` always wins over `.env`. This lets you keep `.env` set to `openai` for production but force `--provider mock` for CI:

```bash
CI=true ./bin/run-pipeline.sh --input examples/demo-transcript.json \
                              --provider mock \
                              --out /tmp/out.json
```