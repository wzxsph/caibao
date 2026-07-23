import { describe, expect, it } from 'vitest'
import type { CueSession, LearningTraceEvent } from '../contracts'
import { buildEvidenceReport } from '../report'
import { financeFed6KindsExperience } from '../fixtures/finance-fed-6kinds'

function event(
  triggerId: string,
  action: LearningTraceEvent['action'],
  overrides: Partial<LearningTraceEvent> = {}
): LearningTraceEvent {
  return {
    eventId: `event-${triggerId}-${action}`,
    sessionId: 'session-report',
    videoId: financeFed6KindsExperience.videoId,
    contentVersion: financeFed6KindsExperience.contentVersion,
    triggerId,
    action,
    playbackPositionMs: 1_000,
    occurredAt: 1,
    evidenceIds: [],
    ...overrides
  }
}

describe('evidence report', () => {
  it('uses real answer events and never exposes a total score', () => {
    const objective = financeFed6KindsExperience.triggers.find(
      (trigger) => trigger.evaluation?.mode === 'objective'
    )!
    const session: CueSession = {
      sessionId: 'session-report',
      videoId: financeFed6KindsExperience.videoId,
      contentVersion: financeFed6KindsExperience.contentVersion,
      events: [
        event(objective.triggerId, 'attempted', { isCorrect: false, answerId: 'wrong' }),
        event(objective.triggerId, 'completed', {
          isCorrect: true,
          answerId: objective.evaluation!.correctOptionIds[0],
          coinsAwarded: 1
        })
      ]
    }

    const report = buildEvidenceReport(financeFed6KindsExperience, session, 1)
    expect(report.correctAnswers).toBe(1)
    expect(report.coinsCollected).toBe(1)
    expect(report.perspectives.map((item) => item.audience)).toEqual([
      '国家与公共部门',
      '企业',
      '居民'
    ])
    expect(report).not.toHaveProperty('score')
    expect(JSON.stringify(report)).not.toMatch(/68%|投资能力|风险偏好/)
  })

  it('marks untouched cues as not observed instead of wrong', () => {
    const session: CueSession = {
      sessionId: 'session-empty',
      videoId: financeFed6KindsExperience.videoId,
      contentVersion: financeFed6KindsExperience.contentVersion,
      events: []
    }
    const report = buildEvidenceReport(financeFed6KindsExperience, session, 0)
    expect(report.notObserved).toHaveLength(financeFed6KindsExperience.triggers.length)
    expect(JSON.stringify(report.notObserved)).not.toMatch(/答错|错误|失败/)
  })
})
