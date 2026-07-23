/**
 * Cue taxonomy + authored payload shapes. Mirrors
 * `apps/web/server/src/domain/payload-contracts.ts` so the cue payloads
 * produced by the pipeline match what the caibao frontend renders.
 */
import { z } from 'zod'

export const CUE_KINDS = [
  'context_card',
  'quick_judgment',
  'condition_slider',
  'causal_stitch',
  'counterexample_flip',
  'concept_compare'
] as const

export const cueKindSchema = z.enum(CUE_KINDS)
export type CueKind = z.infer<typeof cueKindSchema>

export const cueEvaluationSchema = z.object({
  mode: z.enum(['objective', 'exploratory', 'acknowledgement']),
  correctOptionIds: z.array(z.string().min(1)).default([]),
  rewardCoins: z.number().int().min(0).max(10).default(0),
  explanation: z.string().min(1).max(160)
})
export type CueEvaluation = z.infer<typeof cueEvaluationSchema>

export const RENDERABLE_KINDS: ReadonlySet<CueKind> = new Set<CueKind>(CUE_KINDS)

export function isRenderableKind(kind: CueKind): boolean {
  return RENDERABLE_KINDS.has(kind)
}

const feedback = z.string().min(1).max(80)
const optionResult = z.string().min(1).max(80)
const choiceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  result: optionResult
})

export const contextCardPayloadSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  keyPoint: z.string().min(1),
  feedback
})

export const conditionSliderPayloadSchema = z.object({
  title: z.string().min(1),
  variable: z.string().min(1),
  options: z.array(choiceSchema).min(2).max(3)
})

export const causalStitchPayloadSchema = z.object({
  title: z.string().min(1),
  before: z.string().min(1),
  after: z.string().min(1),
  options: z.array(z.string().min(1)).min(2).max(3),
  correctOption: z.string().min(1),
  feedback
})

export const quickJudgmentPayloadSchema = z.object({
  title: z.string().min(1),
  options: z.array(choiceSchema).min(2).max(4),
  feedback
})

export const counterexampleFlipPayloadSchema = z.object({
  title: z.string().min(1),
  baseClaim: z.string().min(1),
  options: z.array(choiceSchema).min(2).max(3),
  feedback
})

export const conceptComparePayloadSchema = z.object({
  title: z.string().min(1),
  left: z.object({ term: z.string().min(1), description: z.string().min(1).max(60) }),
  right: z.object({ term: z.string().min(1), description: z.string().min(1).max(60) }),
  keyDistinction: z.string().min(1).max(80)
})

export const payloadSchemaByKind = {
  context_card: contextCardPayloadSchema,
  quick_judgment: quickJudgmentPayloadSchema,
  condition_slider: conditionSliderPayloadSchema,
  causal_stitch: causalStitchPayloadSchema,
  counterexample_flip: counterexampleFlipPayloadSchema,
  concept_compare: conceptComparePayloadSchema
} as const satisfies Record<CueKind, z.ZodTypeAny>

export const authoredPayloadByKindSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('context_card'), payload: contextCardPayloadSchema }),
  z.object({ kind: z.literal('quick_judgment'), payload: quickJudgmentPayloadSchema }),
  z.object({ kind: z.literal('condition_slider'), payload: conditionSliderPayloadSchema }),
  z.object({ kind: z.literal('causal_stitch'), payload: causalStitchPayloadSchema }),
  z.object({
    kind: z.literal('counterexample_flip'),
    payload: counterexampleFlipPayloadSchema
  }),
  z.object({ kind: z.literal('concept_compare'), payload: conceptComparePayloadSchema })
])

export type ContextCardPayload = z.infer<typeof contextCardPayloadSchema>
export type QuickJudgmentPayload = z.infer<typeof quickJudgmentPayloadSchema>
export type ConditionSliderPayload = z.infer<typeof conditionSliderPayloadSchema>
export type CausalStitchPayload = z.infer<typeof causalStitchPayloadSchema>
export type CounterexampleFlipPayload = z.infer<typeof counterexampleFlipPayloadSchema>
export type ConceptComparePayload = z.infer<typeof conceptComparePayloadSchema>
export type AuthoredPayload = z.infer<typeof authoredPayloadByKindSchema>

export function collectPayloadText(entry: AuthoredPayload): string {
  switch (entry.kind) {
    case 'context_card':
      return [
        entry.payload.title,
        entry.payload.body,
        entry.payload.keyPoint,
        entry.payload.feedback
      ].join(' ')
    case 'quick_judgment':
      return [
        entry.payload.title,
        entry.payload.feedback,
        ...entry.payload.options.flatMap((o) => [o.label, o.result])
      ].join(' ')
    case 'condition_slider':
      return [
        entry.payload.title,
        entry.payload.variable,
        ...entry.payload.options.flatMap((o) => [o.label, o.result])
      ].join(' ')
    case 'causal_stitch':
      return [
        entry.payload.title,
        entry.payload.before,
        entry.payload.after,
        entry.payload.correctOption,
        entry.payload.feedback,
        ...entry.payload.options
      ].join(' ')
    case 'counterexample_flip':
      return [
        entry.payload.title,
        entry.payload.baseClaim,
        entry.payload.feedback,
        ...entry.payload.options.flatMap((o) => [o.label, o.result])
      ].join(' ')
    case 'concept_compare':
      return [
        entry.payload.title,
        entry.payload.left.term,
        entry.payload.left.description,
        entry.payload.right.term,
        entry.payload.right.description,
        entry.payload.keyDistinction
      ].join(' ')
  }
}