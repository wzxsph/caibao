import { z } from 'zod'

const triggerBase = {
  triggerId: z.string().min(1),
  startMs: z.number().int().nonnegative(),
  endMs: z.number().int().positive(),
  priority: z.number().int().min(0).max(100).default(50),
  cueDurationMs: z.number().int().min(4000).max(6000),
  expectedInteractionMs: z.number().int().positive().max(30000),
  halfSheetMaxRatio: z.number().positive().max(0.48),
  cueLabel: z.string().min(1).max(8),
  prompt: z.string().min(1).max(40),
  learningObjective: z.string().min(1),
  evidenceIds: z.array(z.string().min(1)).min(1),
  reviewStatus: z.enum(['approved', 'mock']),
  fallbackBehavior: z.literal('collapse_to_timeline'),
  delivery: z.enum(['automatic', 'timeline_only']),
  backgroundContext: z
    .object({
      setting: z.string().min(1),
      keyFacts: z.array(z.string()).optional(),
      relevance: z.string().optional()
    })
    .optional(),
  evaluation: z
    .object({
      mode: z.enum(['objective', 'exploratory', 'acknowledgement']),
      correctOptionIds: z.array(z.string().min(1)).default([]),
      rewardCoins: z.number().int().min(0).max(10).default(0),
      explanation: z.string().min(1).max(160)
    })
    .optional()
}

const contextCardTriggerSchema = z.object({
  ...triggerBase,
  kind: z.literal('context_card'),
  payload: z.object({
    title: z.string().min(1),
    body: z.string().min(1),
    keyPoint: z.string().min(1),
    feedback: z.string().min(1).max(80)
  })
})

const conditionSliderTriggerSchema = z.object({
  ...triggerBase,
  kind: z.literal('condition_slider'),
  payload: z.object({
    title: z.string().min(1),
    variable: z.string().min(1),
    options: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().min(1),
          result: z.string().min(1).max(80)
        })
      )
      .min(2)
      .max(3)
  })
})

const causalStitchTriggerSchema = z.object({
  ...triggerBase,
  kind: z.literal('causal_stitch'),
  payload: z.object({
    title: z.string().min(1),
    before: z.string().min(1),
    after: z.string().min(1),
    options: z.array(z.string().min(1)).min(2).max(3),
    correctOption: z.string().min(1),
    feedback: z.string().min(1).max(80)
  })
})

const quickJudgmentTriggerSchema = z.object({
  ...triggerBase,
  kind: z.literal('quick_judgment'),
  payload: z.object({
    title: z.string().min(1),
    options: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().min(1),
          result: z.string().min(1).max(80)
        })
      )
      .min(2)
      .max(4),
    feedback: z.string().min(1).max(80)
  })
})

const counterexampleFlipTriggerSchema = z.object({
  ...triggerBase,
  kind: z.literal('counterexample_flip'),
  payload: z.object({
    title: z.string().min(1),
    baseClaim: z.string().min(1),
    options: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().min(1),
          result: z.string().min(1).max(80)
        })
      )
      .min(2)
      .max(3),
    feedback: z.string().min(1).max(80)
  })
})

const retellTriggerSchema = z.object({
  ...triggerBase,
  kind: z.literal('retell'),
  payload: z.object({
    title: z.string().min(1),
    prompt: z.string().min(1),
    placeholder: z.string().min(1),
    minLength: z.number().int().min(10).default(24),
    maxLength: z.number().int().max(500).default(220),
    example: z.string().min(1),
    rubrics: z
      .array(
        z.object({
          label: z.string().min(1),
          keywords: z.array(z.string().min(1)).min(1)
        })
      )
      .min(1)
      .max(5),
    feedback: z.string().min(1).max(80).optional()
  })
})

const conceptCompareTriggerSchema = z.object({
  ...triggerBase,
  kind: z.literal('concept_compare'),
  payload: z.object({
    title: z.string().min(1),
    left: z.object({
      term: z.string().min(1),
      description: z.string().min(1).max(60)
    }),
    right: z.object({
      term: z.string().min(1),
      description: z.string().min(1).max(60)
    }),
    keyDistinction: z.string().min(1).max(80)
  })
})

export const timelineTriggerSchema = z.discriminatedUnion('kind', [
  contextCardTriggerSchema,
  conditionSliderTriggerSchema,
  causalStitchTriggerSchema,
  quickJudgmentTriggerSchema,
  counterexampleFlipTriggerSchema,
  conceptCompareTriggerSchema,
  retellTriggerSchema
])

export const approvedExperienceSchema = z
  .object({
    experienceId: z.string().min(1),
    videoId: z.string().min(1),
    contentVersion: z.string().min(1),
    mediaFingerprint: z.string().min(1),
    publishStatus: z.enum(['approved', 'internal_poc']),
    approvalScope: z.literal('internal_poc'),
    approvalDecisionRef: z.string().min(1),
    timecodeQuality: z.enum(['estimated_accepted', 'estimated_mock']),
    title: z.string().min(1),
    notice: z.string().min(1),
    generation: z
      .object({
        mode: z.literal('mock'),
        provider: z.literal('deterministic_llm_mock'),
        model: z.string().min(1),
        promptVersion: z.string().min(1),
        generatedAt: z.string().datetime(),
        evidenceBasis: z.literal('title_and_manifest_metadata_only')
      })
      .optional(),
    constraints: z.object({
      minGapMs: z.number().int().min(45000),
      maxConcurrent: z.literal(1),
      playbackPolicy: z.object({
        invitation: z.literal('continue'),
        interaction: z.literal('pause'),
        exit: z.literal('restore_previous')
      })
    }),
    triggers: z.array(timelineTriggerSchema).min(1).max(6),
    concepts: z.array(
      z.object({
        conceptId: z.string().min(1),
        name: z.string().min(1),
        evidenceIds: z.array(z.string().min(1)).min(1)
      })
    ),
    report: z
      .object({
        eyebrow: z.string().min(1),
        title: z.string().min(1),
        coreVariable: z.string().min(1),
        paths: z
          .array(
            z.object({
              tone: z.enum(['teal', 'gold', 'blue']),
              top: z.string().min(1),
              bottom: z.string().min(1),
              icon: z.string().min(1)
            })
          )
          .min(1)
          .max(5),
        counterPath: z.array(z.string().min(1)).min(1),
        skillStamps: z
          .array(
            z.object({
              icon: z.string().min(1),
              label: z.string().min(1)
            })
          )
          .min(1),
        transferQuestion: z.string().min(1),
        replayAt: z.number().int().nonnegative()
      })
      .optional(),
    chapters: z
      .array(
        z.object({
          id: z.string().min(1),
          startMs: z.number().int().nonnegative(),
          endMs: z.number().int().positive(),
          title: z.string().min(1)
        })
      )
      .optional(),
    transcriptCues: z
      .array(
        z.object({
          atMs: z.number().int().nonnegative(),
          text: z.string().min(1)
        })
      )
      .optional(),
    openingBrief: z
      .object({
        contentType: z.string().min(1),
        summary: z.string().min(1),
        viewpointNotice: z.string().min(1),
        verificationBoundary: z.string().min(1)
      })
      .optional(),
    perspectives: z
      .array(
        z.object({
          audience: z.enum(['国家与公共部门', '企业', '居民']),
          impact: z.string().min(1),
          reason: z.string().min(1),
          response: z.string().min(1)
        }).strict()
      )
      .optional()
  })
  .superRefine((experience, context) => {
    const triggers = [...experience.triggers].sort((a, b) => a.startMs - b.startMs)
    for (const trigger of triggers) {
      if (trigger.endMs <= trigger.startMs) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: '触点结束时间必须晚于开始时间',
          path: ['triggers', trigger.triggerId]
        })
      }
    }
    const automaticTriggers = triggers.filter((trigger) => trigger.delivery === 'automatic')
    for (let index = 1; index < automaticTriggers.length; index += 1) {
      if (
        automaticTriggers[index].startMs - automaticTriggers[index - 1].startMs <
        experience.constraints.minGapMs
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: '自动触点间隔不得小于内容包约束',
          path: ['triggers', automaticTriggers[index].triggerId, 'startMs']
        })
      }
    }
  })

export type ApprovedExperience = z.infer<typeof approvedExperienceSchema>
export type TimelineTrigger = z.infer<typeof timelineTriggerSchema>
export type TriggerKind = TimelineTrigger['kind']

export type TraceAction =
  | 'surfaced'
  | 'expanded'
  | 'attempted'
  | 'completed'
  | 'dismissed'
  | 'missed'
  | 'revisited'

export interface LearningTraceEvent {
  eventId: string
  sessionId: string
  videoId: string
  contentVersion: string
  triggerId: string
  action: TraceAction
  playbackPositionMs: number
  occurredAt: number
  response?: string
  answerId?: string
  isCorrect?: boolean
  coinsAwarded?: number
  evidenceIds: string[]
}

export interface CueSession {
  sessionId: string
  videoId: string
  contentVersion: string
  events: LearningTraceEvent[]
}

export interface LearningSummary {
  observed: Array<{
    triggerId: string
    title: string
    evidenceIds: string[]
  }>
  corrections: Array<{
    triggerId: string
    detail: string
  }>
  notObserved: Array<{
    triggerId: string
    title: string
  }>
  revisitableCueIds: string[]
}

export interface OpeningBrief {
  contentType: string
  summary: string
  viewpointNotice: string
  verificationBoundary: string
}

export interface ReportPerspective {
  audience: '国家与公共部门' | '企业' | '居民'
  impact: string
  reason: string
  response: string
}

export interface EvidenceReport {
  videoId: string
  title: string
  contentVersion: string
  completedNodes: number
  correctAnswers: number
  skippedNodes: number
  coinsCollected: number
  observed: Array<{ triggerId: string; title: string; evidenceIds: string[] }>
  notObserved: Array<{ triggerId: string; title: string }>
  perspectives: ReportPerspective[]
  openingBrief: OpeningBrief
  notice: string
  reasoning?: {
    handWrittenNote: string
    coreVariable: string
    paths: Array<{ tone: 'teal' | 'gold' | 'blue'; top: string; bottom: string; icon: string }>
    counterPath: string[]
    replayAtMs?: number
  }
  suggestedWatch?: {
    label: string
    startMs: number
    durationMs?: number
    note?: string
  }
}
