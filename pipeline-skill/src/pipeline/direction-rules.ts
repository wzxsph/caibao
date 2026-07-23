/**
 * Versioned direction rule engine. The rule table — NOT the model — owns the
 * asset direction for each cue candidate.
 *
 * Extracted verbatim from `apps/web/server/src/pipeline/direction-rules.ts`.
 */
import type {
  Claim,
  Condition,
  Direction,
  DirectionResolution,
  SemanticGraph,
  TriggerCandidate
} from '../domain/contracts.js'

export const RULE_ENGINE_VERSION = 'direction-rules.v1'

export const ACTIVATED_PATHS = {
  valuationSupport: 'valuation_support',
  earningsPressure: 'earnings_pressure',
  goldSupport: 'gold_support',
  relativeRateDifferential: 'relative_rate_differential'
} as const

const SIGNAL_VARIABLES = {
  policyRate: 'policy_rate',
  inflation: 'inflation',
  growth: 'growth',
  riskAversion: 'risk_aversion',
  foreignPolicyRate: 'foreign_policy_rate'
} as const

interface RuleEntry {
  readonly signature: string
  readonly direction: Direction
  readonly activatedPaths: readonly string[]
  readonly insufficientReason?: string
}

const RULE_TABLE: readonly RuleEntry[] = [
  {
    signature: 'inflation:decrease|policy_rate:decrease|risk_aversion:below',
    direction: 'support_dominant',
    activatedPaths: [ACTIVATED_PATHS.valuationSupport, ACTIVATED_PATHS.goldSupport]
  },
  {
    signature: 'growth:decrease|policy_rate:decrease|risk_aversion:above',
    direction: 'conflict',
    activatedPaths: [ACTIVATED_PATHS.valuationSupport, ACTIVATED_PATHS.earningsPressure]
  },
  {
    signature: 'foreign_policy_rate:decrease|policy_rate:decrease',
    direction: 'insufficient',
    activatedPaths: [ACTIVATED_PATHS.relativeRateDifferential],
    insufficientReason:
      'Relative rate differential is indeterminate: USD direction is not fixed by policy-rate cuts alone.'
  }
] as const

const RULE_BY_SIGNATURE: ReadonlyMap<string, RuleEntry> = new Map(
  RULE_TABLE.map((entry) => [entry.signature, entry])
)

const DIRECTIONAL_KINDS: ReadonlySet<TriggerCandidate['kind']> = new Set<TriggerCandidate['kind']>([
  'condition_slider',
  'causal_stitch',
  'counterexample_flip',
  'quick_judgment'
])

const REASON_NON_DIRECTIONAL_KIND =
  'Cue kind does not assert an asset direction; no rule lookup performed.'
const REASON_NO_SIGNALS =
  'Candidate references no conditions or claims from the graph; signature is empty.'
const REASON_UNKNOWN_SIGNATURE =
  'Condition signature is not in the versioned rule table; direction is undetermined.'

function normaliseCondition(condition: Condition): string {
  return `${condition.variable}:${condition.operator}`
}

function collectReferences(
  candidate: TriggerCandidate,
  graph: SemanticGraph
): { conditions: Condition[]; claims: Claim[] } {
  const evidence = new Set(candidate.evidenceIds)
  const references = (ids: readonly string[]): boolean => ids.some((id) => evidence.has(id))
  return {
    conditions: graph.conditions.filter((condition) => references(condition.evidenceIds)),
    claims: graph.claims.filter((claim) => references(claim.evidenceIds))
  }
}

function buildSignature(conditions: Condition[], claims: Claim[]): string {
  const known = new Set<string>(Object.values(SIGNAL_VARIABLES))
  const tokens = new Set<string>()
  for (const condition of conditions) {
    if (known.has(condition.variable)) tokens.add(normaliseCondition(condition))
  }
  for (const claim of claims) {
    if (claim.assetClass) tokens.add(`asset:${claim.assetClass}`)
  }
  return [...tokens].sort().join('|')
}

function matchRule(signatureTokens: Set<string>): RuleEntry | undefined {
  for (const entry of RULE_TABLE) {
    const required = entry.signature.split('|')
    if (required.every((token) => signatureTokens.has(token))) return entry
  }
  return RULE_BY_SIGNATURE.get([...signatureTokens].sort().join('|'))
}

function insufficient(
  candidate: TriggerCandidate,
  reason: string,
  activatedPaths: readonly string[] = []
): DirectionResolution {
  return {
    candidateId: candidate.candidateId,
    direction: 'insufficient',
    activatedPaths: [...activatedPaths],
    evidenceIds: [...candidate.evidenceIds],
    insufficientReason: reason,
    ruleVersion: RULE_ENGINE_VERSION
  }
}

export function resolveDirection(
  candidate: TriggerCandidate,
  graph: SemanticGraph
): DirectionResolution {
  if (!DIRECTIONAL_KINDS.has(candidate.kind)) {
    return insufficient(candidate, REASON_NON_DIRECTIONAL_KIND)
  }
  const { conditions, claims } = collectReferences(candidate, graph)
  const signature = buildSignature(conditions, claims)
  if (!signature) return insufficient(candidate, REASON_NO_SIGNALS)

  const entry = matchRule(new Set(signature.split('|')))
  if (!entry) return insufficient(candidate, REASON_UNKNOWN_SIGNATURE)

  if (entry.direction === 'insufficient') {
    return insufficient(
      candidate,
      entry.insufficientReason ?? REASON_UNKNOWN_SIGNATURE,
      entry.activatedPaths
    )
  }

  return {
    candidateId: candidate.candidateId,
    direction: entry.direction,
    activatedPaths: [...entry.activatedPaths],
    evidenceIds: [...candidate.evidenceIds],
    ruleVersion: RULE_ENGINE_VERSION
  }
}

export function resolveMany(
  candidates: TriggerCandidate[],
  graph: SemanticGraph
): DirectionResolution[] {
  return candidates.map((candidate) => resolveDirection(candidate, graph))
}