---
name: run-pipeline
description: Run the caibao pipeline on one video (or one transcript) and write a DraftExperience JSON. Wraps ./bin/run-pipeline.sh.
---

# /run-pipeline

Run the caibao finance-video pipeline on a single input and write the result to disk.

## Usage

```
/run-pipeline --input <transcript.json>   # offline, mock mode
/run-pipeline --video <clip.mp4>          # real video
/run-pipeline --video <clip.mp4> --provider openai  # real LLM
```

## Arguments

| Flag | Required | Description |
|---|---|---|
| `-i, --input <path>` | one of `--input`/`--video` | Pre-existing transcript JSON; skips ASR. |
| `-v, --video <path>` | one of `--input`/`--video` | Real video file; runs ffmpeg → ASR → LLM. |
| `-t, --title <string>` | optional | Title for the generated draft. |
| `-o, --out <path>` | optional | Output JSON path. |
| `--provider <name>` | optional | `mock` (default) or `openai`. |
| `--quiet` | optional | Suppress per-stage log lines. |

## Examples

```
/run-pipeline --input examples/demo-transcript.json --provider mock --out examples/demo-output.json
/run-pipeline --video ./media/clip.mp4 --title "美联储降息对资产价格的影响" --provider openai --out ./out.json
```

## What it returns

A JSON file with `{ draft, coverageReport, timings }`. Same shape as the caibao web app's `/api/finance/v1/analysis/jobs/:jobId/draft` endpoint.

See [`SKILL.md`](../SKILL.md) for the full stage table and provider matrix.