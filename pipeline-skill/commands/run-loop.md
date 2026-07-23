---
name: run-loop
description: Sweep a directory of input JSONs through the caibao pipeline, writing per-file outputs and a _summary.json. Wraps ./bin/run-loop.sh.
---

# /run-loop

Run the caibao pipeline over every JSON in a directory. Use for batch jobs.

## Usage

```
/run-loop --inputs-dir <dir> --outputs-dir <dir> --provider <name>
```

## Arguments

| Flag | Description |
|---|---|
| `--inputs-dir <dir>` | Directory of input JSON files (default: `./examples`). |
| `--outputs-dir <dir>` | Where to write per-file outputs (default: `./.pipeline-work/out`). |
| `--provider <name>` | `mock` (default) or `openai`. |
| `--pattern <regex>` | Override the file pattern (default: `/\.json$/`). |
| `--strict` | Fail the whole loop on the first error (default: continue). |

## Examples

```
/run-loop --inputs-dir ./my-transcripts --outputs-dir ./out --provider mock
/run-loop --inputs-dir ./my-videos --outputs-dir ./out --provider openai --strict
```

## What it returns

- One `<input-name>.out.json` per input file, containing `{ draft, coverageReport, timings }`.
- One `_summary.json` with `{ total, succeeded, failed, perFile[] }`.

See [`SKILL.md`](../SKILL.md) for the full stage table and provider matrix.