# Reproducing caibao's Web App Output

The skill's output JSON is **shape-compatible** with the caibao web server's `GET /api/finance/v1/analysis/jobs/:jobId/draft` endpoint. Same field names, same nested types, same discriminated unions.

This document records the contract so you can verify byte-equivalence (modulo timestamps) when running both side by side.

## Top-level shape

```ts
interface AnalysisPipelineResult {
  draft: DraftExperience
  coverageReport: CoverageReport
  timings: AnalysisPipelineTimings
}
```

`DraftExperience`, `CoverageReport`, `AnalysisPipelineTimings` are extracted verbatim from `apps/web/server/src/domain/contracts.ts`. Their Zod schemas are kept in lock-step — see the contract tests under `apps/web/server/test/`.

## Field-by-field mapping

| Skill output | caibao web endpoint |
|---|---|
| `draft.experienceId` | `draft.experienceId` |
| `draft.title` | `draft.title` |
| `draft.contentVersion` | `draft.contentVersion` |
| `draft.mediaFingerprint` | `draft.mediaFingerprint` |
| `draft.publishStatus` | always `"draft"` |
| `draft.blockers` | always `["HUMAN_REVIEW_REQUIRED"]` |
| `draft.evidence[]` | ASR `TranscriptSegment` + `OcrEvidence` items, same as web |
| `draft.concepts[]` / `claims[]` / `causalEdges[]` / `conditions[]` | identical to web |
| `draft.triggerCandidates[]` | `kind`, `payload`, `direction`, `activatedPaths`, `priority`, `evidenceIds`, `proposedStartMs`/`proposedEndMs` all identical |
| `draft.rejectedTriggerCandidates[]` | identical |
| `draft.approvedTriggers` | always `[]` (human review required before approval) |
| `coverageReport.coverage` | identical (per-kind counts of total / covered / uncovered) |
| `coverageReport.evidenceGaps` | identical |
| `coverageReport.kindBalance` | identical (`Record<CueKind, number>`) |
| `coverageReport.directionResolutions` | identical |
| `coverageReport.rejectedCandidates` | identical |
| `coverageReport.reviewDecisionsRequired` | identical |
| `coverageReport.versions` | identical (ruleEngine / weightTable / prompt / contentVersion / mediaFingerprint) |
| `timings.totalMs` | identical |
| `timings.stages[]` | identical (same stage names: media_prepare, evidence_extract, semantic_extract, validate_repair, plan, payload_author, assemble) |

## What can differ between runs

- `mediaFingerprint` — `sha256` of the source video file
- `contentVersion` — derived from the fingerprint (`draft.<fingerprint12>`)
- `experienceId` — derived from the job id
- `draft.evidence[].confidence` — provider-reported confidence (Volcengine ASR)
- `coverageReport.versions.ruleEngineVersion` / `weightTableVersion` / `promptVersion` — change only when the caibao web app bumps them

Everything else is deterministic given the same input transcript.

## Contract test (recommended)

If you want to lock the shape, drop this into `examples/smoke.spec.ts`:

```ts
import { readFileSync } from 'node:fs'

test('output matches caibao schema', () => {
  const out = JSON.parse(readFileSync('examples/demo-output.json', 'utf8'))
  // Spot-check the discriminated unions
  for (const candidate of out.draft.triggerCandidates) {
    if (candidate.kind === 'quick_judgment') {
      assert(Array.isArray(candidate.payload.options))
      for (const opt of candidate.payload.options) {
        assert(typeof opt.id === 'string')
        assert(typeof opt.label === 'string')
        assert(typeof opt.result === 'string')
      }
    }
    if (candidate.kind === 'causal_stitch') {
      assert(Array.isArray(candidate.payload.options))
      // options is a string array, NOT objects
      for (const opt of candidate.payload.options) assert(typeof opt === 'string')
    }
  }
})
```

The payload schemas in `src/domain/payload-contracts.ts` are the Zod source of truth.

## Verifying against a fresh web app run

1. Pick a video you've authorized rights for.
2. Run the skill: `./bin/run-pipeline.sh --video <path> --provider openai --out ./skill-out.json`
3. POST the same video to the web app's `/api/finance/v1/analysis/jobs`.
4. Poll until status == `succeeded`; fetch `/draft`.
5. Compare JSON shapes (jq `del(.. | .timings?)` to ignore timestamps).
6. Hash both: `sha256sum`. They won't match exactly — `timings.totalMs`, fingerprint, and confidence values will differ — but every structural field should be present with the same type.