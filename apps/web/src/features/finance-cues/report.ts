import type {
  ApprovedExperience,
  CueSession,
  EvidenceReport,
  OpeningBrief,
  ReportPerspective
} from './contracts'
import { buildLearningSummary, latestActions } from './summary'

const fallbackOpeningBrief: OpeningBrief = {
  contentType: '财经知识学习内容',
  summary: '本报告根据你在视频中的实际互动生成，未触达的内容不会被推断为已掌握。',
  viewpointNotice: '请把可核查事实、机制推演与作者观点分开理解。',
  verificationBoundary: '当前内容仅用于工程演示，不代表财经审核或事实核验已经完成。'
}

const fallbackPerspectives: ReportPerspective[] = [
  {
    audience: '国家与公共部门',
    impact: '尚缺少足够证据形成具体影响判断。',
    reason: '公共影响需要宏观数据、规则和时间范围共同支持。',
    response: '继续核对来源与条件，不从单一片段外推。'
  },
  {
    audience: '企业',
    impact: '尚缺少足够证据形成具体经营判断。',
    reason: '企业影响取决于行业、现金流、治理和竞争条件。',
    response: '回到视频证据并检查传导机制。'
  },
  {
    audience: '居民',
    impact: '尚缺少足够证据形成具体生活影响判断。',
    reason: '宏观变化通常通过价格、收入和就业逐步传导。',
    response: '避免把科普内容直接当作个人交易建议。'
  }
]

export function buildEvidenceReport(
  experience: ApprovedExperience,
  session: CueSession,
  walletCoins: number
): EvidenceReport {
  const summary = buildLearningSummary(experience, session)
  const latest = latestActions(session)
  const completedNodes = Object.values(latest).filter((action) => action === 'completed').length
  const skippedNodes = Object.values(latest).filter(
    (action) => action === 'dismissed' || action === 'missed'
  ).length
  const correctAnswers = new Set(
    session.events
      .filter((event) => event.action === 'completed' && event.isCorrect === true)
      .map((event) => event.triggerId)
  ).size

  return {
    videoId: experience.videoId,
    title: experience.title,
    contentVersion: experience.contentVersion,
    completedNodes,
    correctAnswers,
    skippedNodes,
    coinsCollected: Math.max(0, Math.round(walletCoins)),
    observed: summary.observed,
    notObserved: summary.notObserved,
    perspectives: (experience.perspectives ?? fallbackPerspectives).map((item) => ({
      audience: item.audience,
      impact: item.impact ?? fallbackPerspectives[0].impact,
      reason: item.reason ?? fallbackPerspectives[0].reason,
      response: item.response ?? fallbackPerspectives[0].response
    })),
    openingBrief: {
      contentType: experience.openingBrief?.contentType ?? fallbackOpeningBrief.contentType,
      summary: experience.openingBrief?.summary ?? fallbackOpeningBrief.summary,
      viewpointNotice:
        experience.openingBrief?.viewpointNotice ?? fallbackOpeningBrief.viewpointNotice,
      verificationBoundary:
        experience.openingBrief?.verificationBoundary ?? fallbackOpeningBrief.verificationBoundary
    },
    reasoning: experience.report
      ? {
          handWrittenNote: experience.report.transferQuestion,
          coreVariable: experience.report.coreVariable,
          paths: experience.report.paths,
          counterPath: experience.report.counterPath,
          replayAtMs: experience.report.replayAt
        }
      : undefined,
    suggestedWatch: experience.report
      ? {
          label: '回到推演起点再走一遍',
          startMs: experience.report.replayAt,
          note: '从此处重看核心变量如何在不同条件下走出不同路径。'
        }
      : undefined,
    notice: experience.notice
  }
}

export function reportShareText(report: EvidenceReport): string {
  const perspectives = report.perspectives
    .map((item) => `${item.audience}：${item.impact} 原因：${item.reason}`)
    .join('\n')
  return [
    `财包学习报告｜${report.title}`,
    report.openingBrief.summary,
    `完成关键点 ${report.completedNodes}｜正确答题 ${report.correctAnswers}｜金币 ${report.coinsCollected}`,
    perspectives,
    '财经等级 28 级为社交标识 Demo，不代表投资能力。',
    report.notice
  ].join('\n')
}
