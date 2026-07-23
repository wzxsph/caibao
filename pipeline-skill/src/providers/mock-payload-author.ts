/**
 * Mock payload author + payload-author client wrapper.
 *
 * The real implementation lives in `pipeline/payload-author.ts`. This file
 * exposes a `MockPayloadAuthor` that returns fully-shaped cue payloads for
 * each accepted candidate, so the skill can run end to end with no LLM
 * credentials. The mock keeps its outputs deterministic and trivial to diff.
 */
import type {
  TriggerCandidate,
  DirectionResolution
} from '../domain/contracts.js'
import type { AuthoredPayload, CueKind } from '../domain/payload-contracts.js'
import { isRenderableKind } from '../domain/payload-contracts.js'

export interface PayloadAuthorInput {
  candidate: TriggerCandidate
  direction?: DirectionResolution
  evidenceContext: string
}

export type PayloadAuthorResult =
  | { payload: AuthoredPayload['payload'] }
  | { rejected: 'PAYLOAD_UNAUTHORABLE' | 'NON_RENDERABLE_KIND'; detail: string }

const FORBIDDEN_LANGUAGE =
  /(买入|卖出|加仓|减仓|仓位|目标价|稳赚|必涨|必跌|推荐.{0,6}(股票|基金|黄金|资产)|买什么)/i

function clip(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1) + '…'
}

export class MockPayloadAuthor {
  async author(input: PayloadAuthorInput): Promise<PayloadAuthorResult> {
    const kind = input.candidate.kind
    if (!isRenderableKind(kind)) {
      return { rejected: 'NON_RENDERABLE_KIND', detail: `kind "${kind}" is non-renderable` }
    }
    const evidence = input.evidenceContext || 'mock evidence context'
    const payload = this.build(kind, evidence, input.direction?.direction)
    return { payload }
  }

  private build(
    kind: CueKind,
    evidence: string,
    direction: DirectionResolution['direction'] | undefined
  ): AuthoredPayload['payload'] {
    const snippet = clip(evidence, 60)
    const safeDirection = direction ?? 'insufficient'
    switch (kind) {
      case 'context_card':
        return {
          title: clip(`背景卡：${snippet}`, 40),
          body: clip(`本节围绕“${snippet}”展开，强调机制而非结论。`, 200),
          keyPoint: clip(`机制要点：${snippet}`, 80),
          feedback: clip('记住机制，不下方向结论。', 80)
        }
      case 'quick_judgment':
        return {
          title: '下列判断哪项最贴近机制？',
          options: [
            { id: 'a', label: clip(`机制 A：${snippet}`, 80), result: clip('A 强调机制传导。', 80) },
            { id: 'b', label: '机制 B：只看价格走势', result: clip('B 缺少机制支撑。', 80) },
            { id: 'c', label: '机制 C：宏观背景', result: clip('C 是相关背景，非核心机制。', 80) }
          ],
          feedback: clip(`方向未定：当前为${safeDirection}。`, 80)
        }
      case 'condition_slider':
        return {
          title: clip(`条件滑块：${snippet}`, 40),
          variable: 'policy_rate',
          options: [
            { id: 'up', label: '加息', result: clip('加息环境下的传导。', 80) },
            { id: 'down', label: '降息', result: clip('降息环境下的传导。', 80) },
            { id: 'flat', label: '不变', result: clip('政策不变时的状态。', 80) }
          ]
        }
      case 'causal_stitch':
        return {
          title: clip(`因果拼接：${snippet}`, 40),
          before: '观察到一个起点现象',
          after: '结果端观察到另一种状态',
          options: [
            '机制 1：通过折现率传导',
            '机制 2：通过盈利预期传导',
            '机制 3：通过风险偏好传导'
          ],
          correctOption: '机制 1：通过折现率传导',
          feedback: clip('折现率是核心传导路径之一。', 80)
        }
      case 'counterexample_flip':
        return {
          title: clip(`反例翻转：${snippet}`, 40),
          baseClaim: clip(`常见说法：${snippet}`, 200),
          options: [
            { id: 'x', label: '反例 1', result: clip('在特定条件下不成立。', 80) },
            { id: 'y', label: '反例 2', result: clip('在另一条件下不成立。', 80) }
          ],
          feedback: clip('机制成立依赖具体条件。', 80)
        }
      case 'concept_compare':
        return {
          title: clip(`概念对照：${snippet}`, 40),
          left: { term: '概念 A', description: clip(snippet, 60) },
          right: { term: '概念 B', description: clip(`与 A 的差异点：${snippet}`, 60) },
          keyDistinction: clip('A 强调起点，B 强调结果。', 80)
        }
    }
  }
}

/**
 * Defensive sweep over authored text: if the real author ever drifted toward
 * investment-advice phrasing, this regex marks it unsafe. Both the real and
 * mock authors run it before returning.
 */
export function isAuthoredTextSafe(text: string): boolean {
  return !FORBIDDEN_LANGUAGE.test(text)
}