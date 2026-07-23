import {
  approvedExperienceSchema,
  type ApprovedExperience
} from '@/features/finance-cues/contracts'

const rawExperience = {
  experienceId: 'finance-xiaolin-autopilot',
  videoId: '7660177158400216347',
  contentVersion: '2026.07.23.2',
  mediaFingerprint: 'fd5729d1e4b98b87c911d832d26c659aa138102f3364db869b46e9a6af26d878',
  publishStatus: 'approved' as const,
  approvalScope: 'internal_poc' as const,
  approvalDecisionRef: 'user-chat-2026-07-23',
  timecodeQuality: 'estimated_accepted' as const,
  title: '港股自动驾驶or物理AI IPO？揭开了它赚钱的商业机密...',
  notice: 'Internal PoC：用户已接受当前估算触点；不代表公开生产内容审核。',
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
    { conceptId: 'autopilot-tech-stack', name: '自动驾驶技术栈', evidenceIds: ['e-tech-stack'] },
    { conceptId: 'commercialization-model', name: '商业化路径', evidenceIds: ['e-commercial'] },
    { conceptId: 'regulatory-approval', name: '监管审批', evidenceIds: ['e-regulatory'] },
    { conceptId: 'ipo-valuation', name: 'IPO估值逻辑', evidenceIds: ['e-ipo-val'] }
  ],
  triggers: [
    {
      triggerId: 'autopilot-context-tech-stack',
      startMs: 20000,
      endMs: 26000,
      priority: 75,
      cueDurationMs: 5000,
      expectedInteractionMs: 8000,
      halfSheetMaxRatio: 0.48,
      cueLabel: '背景补丁',
      prompt: '自动驾驶从技术到商业，中间的关键栈是什么？',
      learningObjective: '理解自动驾驶技术栈与商业化之间的中间层',
      evidenceIds: ['e-tech-stack'],
      reviewStatus: 'approved' as const,
      fallbackBehavior: 'collapse_to_timeline' as const,
      delivery: 'automatic' as const,
      backgroundContext: {
        setting: 'L4自动驾驶技术栈分为感知、规划、控制三层，各层成熟度差异显著。',
        keyFacts: ['感知层已成熟', '规划层仍在迭代', '控制层依赖车规'],
        relevance: '在讨论商业化之前，先看清技术栈的分层和成熟度。'
      },
      kind: 'context_card' as const,
      payload: {
        title: '自动驾驶的商业化技术栈',
        body: '自动驾驶不是单一技术突破，而是感知、规划、控制三层的系统集成。商业化还额外需要数据闭环、车规量产、运营牌照三个中间层——这些才是L4公司IPO的底气所在。',
        keyPoint: '技术栈是地基，但商业化需要数据闭环和量产能力两个中间层才能真正变现。',
        feedback: '你理解了自动驾驶的技术栈全景，这是分析商业化路径的基础。'
      }
    },
    {
      triggerId: 'autopilot-stitch-commercial-ipo',
      startMs: 90000,
      endMs: 96000,
      priority: 85,
      cueDurationMs: 5000,
      expectedInteractionMs: 10000,
      halfSheetMaxRatio: 0.48,
      cueLabel: '补一条边',
      prompt: '技术成熟 → 商业化 → IPO？缺了哪一环？',
      learningObjective: '识别技术商业化到IPO之间的关键中间环节',
      evidenceIds: ['e-commercial', 'e-ipo-val'],
      reviewStatus: 'approved' as const,
      fallbackBehavior: 'collapse_to_timeline' as const,
      delivery: 'automatic' as const,
      backgroundContext: {
        setting: '萝卜快跑运营数据成为自动驾驶公司估值的关键支撑。',
        keyFacts: ['萝卜累计单量大', '运营数据可量化', '盈利模型可推'],
        relevance: '让IPO链条回到"可验证运营"这一现实约束。'
      },
      kind: 'causal_stitch' as const,
      payload: {
        title: '补全商业化到IPO的中间环节',
        before: '自动驾驶技术实现商业化落地',
        after: '公司在港股成功IPO',
        options: ['规模化运营数据和盈利模型验证', '技术论文发表数量达标', '政府补贴金额突破阈值'],
        correctOption: '规模化运营数据和盈利模型验证',
        feedback: '关键中间环节是规模化运营数据闭环，没有实路验证技术就无法定价。'
      }
    },
    {
      triggerId: 'autopilot-condition-regulatory',
      startMs: 160000,
      endMs: 166000,
      priority: 80,
      cueDurationMs: 5000,
      expectedInteractionMs: 9000,
      halfSheetMaxRatio: 0.48,
      cueLabel: '换个条件',
      prompt: '监管审批速度是快是慢，对IPO影响多大？',
      learningObjective: '评估监管审批速度对自动驾驶公司IPO估值的影响',
      evidenceIds: ['e-regulatory', 'e-ipo-val'],
      reviewStatus: 'approved' as const,
      fallbackBehavior: 'collapse_to_timeline' as const,
      delivery: 'automatic' as const,
      backgroundContext: {
        setting: '北京、深圳等地率先发放L4级别测试与运营许可，监管节奏分化。',
        keyFacts: ['北京发放许可', '深圳先行示范', '地方节奏不一'],
        relevance: '用监管变量校准商业化时间表，避免高估IPO速度。'
      },
      kind: 'condition_slider' as const,
      payload: {
        title: '监管速度如何影响IPO估值',
        variable: '监管审批速度',
        options: [
          {
            id: 'fast-approval',
            label: '审批快速推进',
            result: '审批快则估值模型确定性高，更容易招股；审批慢则不确定性折价明显。'
          },
          {
            id: 'slow-approval',
            label: '审批缓慢不确定',
            result: '审批不确定性本身就是最大风险，机构投资者会要求更高的安全边际。'
          }
        ]
      }
    },
    {
      triggerId: 'autopilot-judgment-l4',
      startMs: 240000,
      endMs: 246000,
      priority: 75,
      cueDurationMs: 5000,
      expectedInteractionMs: 7000,
      halfSheetMaxRatio: 0.48,
      cueLabel: '快判断',
      prompt: 'L4自动驾驶三年内能大规模落地吗？',
      learningObjective: '判断L4自动驾驶大规模商业化的时间节点',
      evidenceIds: ['e-tech-stack', 'e-commercial'],
      reviewStatus: 'approved' as const,
      fallbackBehavior: 'collapse_to_timeline' as const,
      delivery: 'automatic' as const,
      backgroundContext: {
        setting: 'L4在限定场景（园区、港口）已落地，但在全域开放道路仍有差距。',
        keyFacts: ['限定场景已落地', '全域开放困难', '政策与成本并行'],
        relevance: '把"大规模落地"具体拆为不同场景，技术乐观主义需要限定。'
      },
      kind: 'quick_judgment' as const,
      payload: {
        title: 'L4大规模落地：三年内能实现吗？',
        options: [
          {
            id: 'yes-l4',
            label: '可以，技术已经成熟',
            result: '限定场景（如园区物流、港口）已实现，但全域开放道路还需迭代验证和法规配合。'
          },
          {
            id: 'no-l4',
            label: '不能，障碍远超预期',
            result: 'L4大规模落地需要技术、法规、成本三角同时解，三年内大概率是限定场景突破。'
          }
        ],
        feedback: 'L4大规模落地需要技术、法规、成本三角同时解，三年内大概率是限定场景突破。'
      }
    },
    {
      triggerId: 'autopilot-counterexample-crash',
      startMs: 310000,
      endMs: 316000,
      priority: 80,
      cueDurationMs: 5000,
      expectedInteractionMs: 9000,
      halfSheetMaxRatio: 0.48,
      cueLabel: '换个条件',
      prompt: '如果发生重大事故，自动驾驶公司还能IPO吗？',
      learningObjective: '评估重大事故对自动驾驶公司商业前景的冲击',
      evidenceIds: ['e-regulatory', 'e-ipo-val'],
      reviewStatus: 'approved' as const,
      fallbackBehavior: 'collapse_to_timeline' as const,
      delivery: 'automatic' as const,
      backgroundContext: {
        setting: 'Cruise因重大事故暂停运营，是行业黑天鹅事件的典型案例。',
        keyFacts: ['Cruise暂停运营', '监管立刻收紧', '公众信任崩塌'],
        relevance: '用反例提醒：自动驾驶估值对安全事件极度敏感。'
      },
      kind: 'counterexample_flip' as const,
      payload: {
        title: '换个条件：重大事故的影响',
        baseClaim: '自动驾驶公司技术领先，IPO估值高企',
        options: [
          {
            id: 'minor-impact',
            label: '短期冲击，长期无影响',
            result: '事故会冲击短期估值，但如果技术迭代快、事故根因明确可控，长期趋势不变。'
          },
          {
            id: 'major-impact',
            label: '连锁反应，估值崩塌',
            result: '一次重大事故可能引发连锁反应——监管收紧、保险成本飙升、公众信任崩塌。'
          }
        ],
        feedback: '重大事故是自动驾驶公司的黑天鹅。一次致命事故足以改变整个行业监管格局。'
      }
    }
  ]
} as const

export const financeXiaolinAutopilotExperience: ApprovedExperience =
  approvedExperienceSchema.parse(rawExperience)
