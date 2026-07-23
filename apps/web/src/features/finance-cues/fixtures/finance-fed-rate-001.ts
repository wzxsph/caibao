import {
  approvedExperienceSchema,
  type ApprovedExperience
} from '@/features/finance-cues/contracts'

const rawExperience = {
  experienceId: 'finance-fed-rate-001',
  videoId: 'fed-rate-global-capital-001',
  contentVersion: '2026.07.23.2',
  mediaFingerprint: 'fed-rate-global-capital-001',
  publishStatus: 'approved' as const,
  approvalScope: 'internal_poc' as const,
  approvalDecisionRef: 'user-chat-2026-07-23',
  timecodeQuality: 'estimated_accepted' as const,
  title: '经济泡沫 or 大牛市？美联储降息后会发生什么？',
  notice: 'Internal PoC：内容来自 moneybaby fed-rate-global-capital-001。用户已接受当前触点。',
  constraints: {
    minGapMs: 45000,
    maxConcurrent: 1 as const,
    playbackPolicy: {
      invitation: 'continue' as const,
      interaction: 'pause' as const,
      exit: 'restore_previous' as const
    }
  },
  concepts: [
    { conceptId: 'rate-cycle', name: '利率周期', evidenceIds: ['e-rate-cycle'] },
    { conceptId: 'capital-flow', name: '资本流动', evidenceIds: ['e-capital-flow'] },
    { conceptId: 'spillover', name: '美元外溢', evidenceIds: ['e-spillover'] },
    { conceptId: 'relative-rate', name: '相对利差', evidenceIds: ['e-relative-rate'] },
    { conceptId: 'carry-trade', name: '套息交易', evidenceIds: ['e-carry-trade'] }
  ],
  triggers: [
    // Cue 1: concept at 35s → context_card
    {
      triggerId: 'capital-destination',
      startMs: 35000,
      endMs: 41000,
      priority: 75,
      cueDurationMs: 5000,
      expectedInteractionMs: 8000,
      halfSheetMaxRatio: 0.48,
      cueLabel: '先想一下',
      prompt: '便宜的美元出现后，钱为什么会跨境流动？',
      learningObjective: '理解资本流动的基本逻辑：资金比较风险与回报后重新配置',
      evidenceIds: ['e-capital-flow'],
      reviewStatus: 'approved' as const,
      fallbackBehavior: 'collapse_to_timeline' as const,
      delivery: 'automatic' as const,
      kind: 'context_card' as const,
      payload: {
        title: '财包先陪你认认"资本流动"',
        body: '降息降低一部分美元资产回报后，资本可能寻找更高的风险调整后回报。但去向仍受风险、汇率和流动性约束。',
        keyPoint: '降息只是改变比较条件，不直接指定资金终点。',
        feedback: '对，资金先做相对比较。带着这个概念继续看。'
      }
    },
    // Cue 2: predict at 35s → quick_judgment
    {
      triggerId: 'correlation-causality',
      startMs: 80000,
      endMs: 86000,
      priority: 80,
      cueDurationMs: 5000,
      expectedInteractionMs: 9000,
      halfSheetMaxRatio: 0.48,
      cueLabel: '快判断',
      prompt: '历史上降息后出现牛市，能直接证明降息造成牛市吗？',
      learningObjective: '区分相关性与因果关系，保留因果判断的边界',
      evidenceIds: ['e-rate-cycle', 'e-capital-flow'],
      reviewStatus: 'approved' as const,
      fallbackBehavior: 'collapse_to_timeline' as const,
      delivery: 'automatic' as const,
      kind: 'quick_judgment' as const,
      payload: {
        title: '历史同时出现，就一定是因果吗？',
        options: [
          {
            id: 'context',
            label: '只能说明相关，需要继续检查经济背景和传导机制',
            result:
              '你保留了因果判断的边界。历史共现能提出假设，但还要检查降息原因、增长、通胀、风险偏好和市场是否提前计价。'
          },
          {
            id: 'proof',
            label: '足以证明每次降息都会带来资产大牛市',
            result:
              '这一步把相关性说成了必然因果。不同降息周期的背景不同；样本能提供线索，不能单独证明每次都会产生同样结果。'
          }
        ],
        feedback: '继续听视频怎么限定。'
      }
    },
    // Cue 3: chain at 88s → causal_stitch
    {
      triggerId: 'dollar-spillover-chain',
      startMs: 125000,
      endMs: 131000,
      priority: 85,
      cueDurationMs: 5000,
      expectedInteractionMs: 10000,
      halfSheetMaxRatio: 0.48,
      cueLabel: '补一条边',
      prompt: '美元利率变化，为什么会影响依赖美元的经济体？',
      learningObjective: '识别美元政策通过汇率、资本流动和美元融资影响别国的传导机制',
      evidenceIds: ['e-spillover'],
      reviewStatus: 'approved' as const,
      fallbackBehavior: 'collapse_to_timeline' as const,
      delivery: 'automatic' as const,
      kind: 'causal_stitch' as const,
      payload: {
        title: '财包陪你补上中间这一步',
        before: '美元利率与资金回报变化',
        after: '其他央行政策空间受到影响',
        options: ['汇率、跨境资金与美元融资压力变化', '其他央行必须无条件照抄美联储'],
        correctOption: '汇率、跨境资金与美元融资压力变化',
        feedback:
          '这一步把外溢渠道补完整了。美元政策通过汇率、资本流动和美元融资影响别国，但本国通胀与增长仍会限制政策选择。'
      }
    },
    // Cue 4: simulate at 152s → condition_slider (2 scenarios)
    {
      triggerId: 'policy-divergence',
      startMs: 170000,
      endMs: 176000,
      priority: 90,
      cueDurationMs: 5000,
      expectedInteractionMs: 12000,
      halfSheetMaxRatio: 0.48,
      cueLabel: '推演一下',
      prompt: '相同的全球环境，为什么不同国家会做相反选择？',
      learningObjective: '理解本国经济周期（通胀、增长、资本约束）对政策选择的决定性作用',
      evidenceIds: ['e-relative-rate', 'e-carry-trade'],
      reviewStatus: 'approved' as const,
      fallbackBehavior: 'collapse_to_timeline' as const,
      delivery: 'automatic' as const,
      kind: 'condition_slider' as const,
      payload: {
        title: '换掉本国条件，政策方向会变吗？',
        variable: '本国经济条件',
        options: [
          {
            id: 'cooling',
            label: '通胀回落、增长偏弱',
            result: '本国央行更有空间先降息，但汇率仍需检查美元压力，资本会重新比较相对回报。'
          },
          {
            id: 'japan',
            label: '日本式逆周期',
            result:
              '本国央行可能维持或推进加息，汇率受日美利差牵动，套息交易可能反转。同一全球背景下本国经济周期不同，政策结论可以相反。'
          }
        ]
      }
    },
    // Cue 5: counter at 197s → counterexample_flip
    {
      triggerId: 'carry-counterexample',
      startMs: 215000,
      endMs: 221000,
      priority: 85,
      cueDurationMs: 5000,
      expectedInteractionMs: 9000,
      halfSheetMaxRatio: 0.48,
      cueLabel: '换个条件',
      prompt: '日本加息，日元就一定持续上涨吗？',
      learningObjective: '识别利差变化之外影响汇率的其他条件（预期、仓位、干预、风险情绪）',
      evidenceIds: ['e-carry-trade', 'e-relative-rate'],
      reviewStatus: 'approved' as const,
      fallbackBehavior: 'collapse_to_timeline' as const,
      delivery: 'automatic' as const,
      kind: 'counterexample_flip' as const,
      payload: {
        title: '政策方向对了，汇率就一定照着走吗？',
        baseClaim: '日本加息、美联储降息缩小利差，日元必然上涨',
        options: [
          {
            id: 'conditions',
            label: '不一定，还要看预期、加息幅度、资金平仓和政策干预',
            result:
              '方向性机制可能成立，但价格还受预期差、仓位、风险情绪、干预和经济承受力共同影响。'
          },
          {
            id: 'certain',
            label: '一定，利差一缩小，日元就只会单向上涨',
            result: '即使利差缩小，市场提前计价、避险需求、政策幅度和干预都可能改变最终路径。'
          }
        ],
        feedback: '你找到了汇率链路的条件。收下这张反例卡。'
      }
    },
    // Cue 6: retell at 238s → retell (timeline_only, shown at video end)
    {
      triggerId: 'retell-capital-flow',
      startMs: 238000,
      endMs: 244000,
      priority: 70,
      cueDurationMs: 5000,
      expectedInteractionMs: 30000,
      halfSheetMaxRatio: 0.48,
      cueLabel: '复述一下',
      prompt: '用三句话说清：为什么各国不会总与美联储同步？',
      learningObjective: '用自己的话综合解释美元外溢、本国条件和例外',
      evidenceIds: ['e-spillover', 'e-rate-cycle', 'e-capital-flow'],
      reviewStatus: 'approved' as const,
      fallbackBehavior: 'collapse_to_timeline' as const,
      delivery: 'timeline_only' as const,
      kind: 'retell' as const,
      payload: {
        title: '轮到你带财包走一遍逻辑',
        prompt: '不用背术语，说清美元外溢、本国条件和例外即可。',
        placeholder: '我会这样解释……',
        minLength: 24,
        maxLength: 220,
        example:
          '美元利率会通过汇率、资本流动和融资条件影响其他国家，所以各国会关注美联储。但每个国家的通胀、增长和金融约束不同，政策不一定同步。像日本或受资本管制、财政压力影响的经济体，就可能走出不同路径。',
        rubrics: [
          { label: '美元外溢', keywords: ['美元', '美联储', '资本流动', '汇率'] },
          { label: '本国条件', keywords: ['通胀', '增长', '经济周期'] },
          { label: '条件边界', keywords: ['不一定', '可能', '但', '不同'] }
        ]
      }
    }
  ],
  report: {
    eyebrow: '美元降息与全球资本流动 · 本期推演复盘',
    title: '美联储降息后的资本传导',
    coreVariable: '美元\n利率下降',
    paths: [
      {
        tone: 'teal' as const,
        top: '美元资产回报下降',
        bottom: '资本寻找更高风险调整后回报',
        icon: '↗'
      },
      { tone: 'gold' as const, top: '各国通胀与增长不同', bottom: '央行降息节奏分化', icon: '◎' },
      { tone: 'blue' as const, top: '日美相对利差收窄', bottom: '套息交易与汇率承压', icon: '$' }
    ],
    counterPath: ['资本管制/财政/地缘约束', '跨境传导被改写', '政策不必同步'],
    skillStamps: [
      { icon: '⌁', label: '会区分相关与因果' },
      { icon: '⌕', label: '会检查本国经济周期' },
      { icon: '✓', label: '会识别美元外溢边界' }
    ],
    transferQuestion: '如果欧洲降息而美国暂不降息，资本和汇率可能怎样变化？',
    replayAt: 232
  },
  chapters: [
    { id: 'history', startMs: 0, endMs: 45000, title: '历史上的降息与资本去向' },
    { id: 'dollar', startMs: 45000, endMs: 106000, title: '美元与其他央行的政策联动' },
    { id: 'early', startMs: 106000, endMs: 144000, title: '为什么其他央行提前降息' },
    { id: 'japan', startMs: 144000, endMs: 206000, title: '日本：逆周期与利差交易' },
    { id: 'exceptions', startMs: 206000, endMs: 236000, title: '俄罗斯等特殊约束' },
    { id: 'summary', startMs: 236000, endMs: 256167, title: '理解政策背后的资本洪流' }
  ],
  transcriptCues: [
    { atMs: 0, text: '降息释放更便宜的美元，资本会寻找更高回报。' },
    { atMs: 12000, text: '历史上的降息周期，资本曾流向拉美、日本、亚洲和美国资产。' },
    { atMs: 35000, text: '历史同时性只是相关性，不能直接当成因果结论。' },
    { atMs: 55000, text: '美联储制定政策时主要考虑美国自己的经济数据。' },
    { atMs: 76000, text: '其他央行往往需要考虑美元利率带来的外溢影响。' },
    { atMs: 104000, text: '这次部分主要经济体先于美联储开始降息。' },
    { atMs: 128000, text: '通胀缓和、增长偏弱，使一些经济体更早获得降息空间。' },
    { atMs: 152000, text: '日本的经济周期不同，成为本轮政策方向的特例。' },
    { atMs: 172000, text: '日美利差变化会影响套息交易与汇率压力。' },
    { atMs: 206000, text: '资本管制、财政与地缘因素会改变一国的政策选择。' },
    { atMs: 236000, text: '看懂加息降息，要看政策背后的资本流动与约束。' }
  ],
  generation: {
    mode: 'mock' as const,
    provider: 'deterministic_llm_mock' as const,
    model: 'content-migration',
    promptVersion: 'moneybaby-fed-rate-v1',
    generatedAt: '2026-07-23T10:00:00.000Z',
    evidenceBasis: 'title_and_manifest_metadata_only' as const
  }
} as const

export const financeFedRate001Experience: ApprovedExperience =
  approvedExperienceSchema.parse(rawExperience)
