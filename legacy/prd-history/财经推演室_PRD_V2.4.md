# 财经推演室

## 产品需求文档 PRD V2.4

> 先把产品、内容和发布规则说清楚，再让模型与团队生产内容。

版本：V2.4  
日期：2026-07-23  
语言：简体中文  
状态：Historical Review Candidate（已被 PRD V2.5 取代，不再接受批准）  
当前权威：`财经推演室_PRD_V2.0.md`  
实施基座：`refer/douyin`（Vue 3 / Vite / Pinia / Express TypeScript）  
PM 参考原型：`refer/moneybaby@7db765bab9efe1064321f03d992df42e62413a7c`  
Markdown：唯一内容源；PDF：评审版  

> 历史提示：用户于 2026-07-23 裁决“进入财包交互时自动暂停”。本文件关于“不自动暂停”的
> 条款仅保留用于追溯，已由 `财经推演室_PRD_V2.5.md` 取代，不得继续作为实现目标。

<!-- BODY -->

# 0. 文档控制与一页决策

## 0.1 权威性

[产品决策] 本文是 V2.4 **联合评审候选**，不是当前实施权威，也不代表已经上线。V2.0 在 V2.4 完成联合评审、合并到产品仓 `main`、同步权威指针并创建批准标签前，继续作为当前裁决依据。

[产品决策] V2.3 已固化为“取证与产品形态收敛候选”。由于 V2.4 新增独立版本治理、内容审核生命周期和文档先行门禁，V2.3 不再单独申请批准；它作为历史候选保留，不得改写成已批准版本。

| 对象 | 当前定位 | 是否可直接作为实施/发布依据 |
|---|---|---|
| PRD V2.0 | 当前权威 | 是，直到 V2.4 获批 |
| PRD V2.3 | 历史候选与取证快照 | 否 |
| 本 PRD V2.4 | Review Candidate | 评审通过前否 |
| `refer/douyin` | 唯一应用实现基座 | 是，但不得用代码现状覆盖未评审产品决策 |
| `refer/moneybaby` | PM 内容与交互证据 | 仅选择性迁移，不能成为第二运行时 |
| `fed-rate-global-capital-001` | PM 首包候选，状态 `draft` | 否；授权、证据与人审未闭合 |

V2.4 只有同时满足以下条件才成为权威：

1. 本 Markdown 状态改为“Approved / 团队实施基线”。
2. 产品、设计、研发/架构、测试、内容/财经、法务/版权、安全/隐私留下可核验评审结论；不得用角色占位符冒充签字。
3. Markdown、PDF、评审记录和权威指针在同一批准变更中合并到产品仓 `main`。
4. PDF 由本 Markdown 重新生成，并通过文件可打开、页数、文本抽取与关键标题一致性机器校验；
   按用户 2026-07-23 指令不把逐页视觉检查设为本轮或后续默认门禁，且必须记录“视觉未验收”。
5. 创建指向批准提交的 annotated tag `prd-v2.4-approved`。

## 0.2 四类事实标签

- [现状事实] 已在固定文件、源码、测试或界面中核验；需写明核验边界。
- [产品决策] V2.4 候选锁定的目标行为；获批后才成为强制实施口径。
- [假设] 需要用户研究、真实内容或线上数据验证。
- [发布阻塞项] 未解除时只能做工程原型或受控演示，不能公开宣称可发布。

## 0.3 一页决策摘要

| 主题 | V2.4 候选口径 |
|---|---|
| 产品定义 | 嵌入精选财经长视频时间轴的轻量因果伴学体验 |
| 主入口 | 关键时点多次出现的财包轻触点，不是 POI、AI Tab、悬浮球或页面跳转 |
| 播放红线 | 打开、作答、完成、跳过均不自动暂停、不静音、不 seek；用户原生控制始终有效 |
| 容器红线 | 无蒙层，播放中面板 `max-height: 48vh`，至少 52% 视频区域保持可见 |
| 频控 | 内容节点最多 6 个；自动邀请最多 4 次、间隔至少 45 秒、同时最多 1 个；连续跳过 2 次后停止强邀请 |
| 交互 | 背景补丁、快判断、条件拨片、因果补边、轻反例、概念对照；单次动作目标不超过 12 秒 |
| 片尾 | 逻辑地图、完整条件沙盘、两阶段反例、三句话复述、证据型报告，均不阻断基础报告 |
| 财包角色 | 条件提醒者和因果陪练，不替换作者、不自由聊天、不预测市场 |
| 内容生产 | 有权媒体 → ASR/OCR/关键帧 → 语义图 → 有界修复 → 规则规划 → draft → 人审 → 不可变 approved 版本 |
| 版本原则 | PRD、内容包、Schema、规则、权重、Prompt、应用提交和媒体指纹分别版本化 |
| 首包候选 | `fed-rate-global-capital-001`，聚焦美元外溢、全球资本、本国周期与相对利差；当前仍为未授权、未审核 draft |
| 报告 | 只呈现事件与证据支持的已观察、修正、尚未观察和下一步；无总分、百分比或投资能力印章 |

![图 1｜V2.4 延续的目标产品形态：轻邀请、不停播半屏、片尾深挖与证据报告](assets/prd-v2.3/02-v23-product-shape.png)

## 0.4 本轮新增裁决

1. 采用“文档版本先行、内容版本随后”的实施顺序；未批准的 PRD 变化不得静默进入 approved 内容。
2. PRD 版本与内容版本彻底解耦；内容修订通常只升内容版本，不自动升 PRD。
3. 增加最小可审计发布链：ReviewManifest、权利记录、审核结论和批准动作必须分离于模型生成。
4. 内容包必须记录其依据的已批准 PRD 标签和产品仓提交；Review Candidate 只能生产 draft。
5. 把产品评审门与内容发布门拆开：外部视频授权可阻塞内容发布，但不制造 PRD 无法批准的循环等待。

# 1. 现状事实与来源裁决

## 1.1 三仓边界

| 仓库 | 固定角色 | 当前核验基线 | 边界 |
|---|---|---|---|
| 产品仓 `/caibao` | PRD、PDF、图、研究、ADR、计划与交接 | V2.4 分支基于 `720a5ff` | 不把嵌套代码仓当普通目录提交 |
| 应用仓 `refer/douyin` | Vue/Vite/Express 唯一实现 | 稳定 checkpoint `b8ced09d`；未 push foundation `4b34da1f` 含回环修复；共享工作树检出状态易变 | 不向公共 upstream push，不覆盖外部未提交媒体/fixture 工作树；接手实时复核 |
| PM 仓 `refer/moneybaby` | 内容结构、真实测试资产和 UI 取证 | 固定 `7db765b` | 只读选择性迁移，不继续产品开发 |

[现状事实] V2.3、配套图片、PDF、PM 差异评审、架构、生成管线和交接已提交在产品仓 `720a5ff`；该提交在本轮开始时尚未成为批准标签。

## 1.2 当前实现

[现状事实] `refer/douyin` 已有视频 Feed、播放器、PWA、Media Range、财包 CuePill、最高 48vh 的无蒙层 HalfSheet、时间轴状态、localStorage 学习足迹、六类前端渲染器，以及 Express 内容分析垂直切片。

[现状事实] `b8ced09d` 的完整离线回归为 20 个前端 Vitest、102 个服务端 Vitest和 6 个 Playwright，类型检查、构建和生产依赖审计通过。未 push 的 foundation 分支提交 `4b34da1f` 在其上增加默认前端回环绑定及 3 个静态断言；两者是不同可审计基线，不以共享工作树当下检出分支判定能力。上述事实只证明 fixture/fake-client 下的契约和编排，不证明真实 Provider、真实内容、授权或发布质量。

[现状事实] 当前 Planner 的自动邀请默认值和硬上限已收紧为 4、最小间隔为 45 秒；server 六类 payload 均可成稿，前端六类均可渲染并有离线测试。当前运行 Demo/E2E 仍只绑定三类触点，真实 Provider、完整六类真实时间轴和有权媒体 E2E 未验证；并发媒体替换也不能提前写成完成。

## 1.3 PM moneybaby 取证

[现状事实] PM 内容包 `fed-rate-global-capital-001@2026-07-22.2` 记录约 4 分 16 秒视频、六个学习节点、5 个概念和 3 条因果边；状态为 `draft`，概念与因果边均 `reviewed: false`，视频公开分发授权、最终 ASR/OCR 和时间码未证明。

![图 2｜两套原型的现状证据：PM 提供内容叙事，集成仓提供不停播半屏基座](assets/prd-v2.3/01-prototype-comparison.png)

可迁移：

- 内容包结构、章节、证据窗口、六节点叙事和本地版本恢复思路。
- 复述、证据回看和报告的信息架构。
- 有权确认后受控迁移的媒体元数据；媒体本体不进入产品文档仓。

不得迁移：

- React/Vinext 页面、Cloudflare 运行栈或第二套状态管理。
- 进入交互自动暂停、完成后自动 seek、全屏 shade 和 88%—94% Sheet。
- 财包替换作者头像、二选一、静态能力印章和未证据化的结论。

## 1.4 来源与许可边界

[产品决策] 公开主页只可做可验证元数据探测；HTTP 200 风控壳不等于作品获取成功。P0 不绕过登录、验证码、签名或风控，不抓取、下载、分析或再分发未获授权媒体。

合法输入优先级：项目方有权源文件 → 创作者 OAuth 授权资产 → 官方允许的 iframe/分享形态 → 公开页元数据探测。元数据来源不等于可分析 MediaAsset。

[发布阻塞项] 仿真底座 GPL 与 README 非商业限制、视频和第三方资产许可必须由负责人完成审查；商业发布不能默认成立。

# 2. 问题、用户与产品边界

## 2.1 用户问题

财经长视频常把概念、条件、因果链和结论压在连续口播里。用户可能记住“降息利好什么”，却无法说明中间机制、竞争路径和条件变化。摘要能帮助回忆，但不能证明用户能重新推演。

核心 JTBD：

> 当视频讲到一个重要财经机制时，我希望在不离开、不暂停原视频的前提下，用几秒补背景或动一个条件，并在看完后知道自己实际观察过什么、还缺什么。

## 2.2 目标用户与非目标用户

| 角色 | 核心需要 |
|---|---|
| 18—35 岁财经科普观看者 | 不被考试打断的背景、条件与因果动作 |
| 有基础但机制不牢的用户 | 看见相反条件和竞争路径 |
| 内容/财经审核员 | 每项结论可追到证据、版本与审核动作 |
| 研发与测试 | 模型失败时仍可确定性完成闭环 |

非目标用户包括寻求实时行情、买卖建议、仓位、目标价、收益承诺或自动交易的人。

## 2.3 P0 范围

P0 必须包含：

- 一条具备处理与演示权、作者和媒体一致、内容经人工审核的视频体验。
- 离线多模态分析、draft 生成、CoverageReport、最小人工审核与不可变批准链。
- 最多 4 次自动邀请、最多 6 个节点、六类可渲染模板和不停播半屏。
- Session/Event API 与同版本 localStorage 镜像。
- 片尾沙盘、反例、文字复述和无分数证据报告的最短闭环。
- 断网、模型失败、服务端会话丢失和未知规则组合的确定性兜底。

P0 明确排除：任意 URL 自动抓取或发布、实时行情、投资建议、自由聊天、Subagent、创作者自助后台、长期财富画像、社交排名和未经证据支持的跨视频能力推断。

## 2.4 成功定义

| 目标 | 验证证据 |
|---|---|
| 财包不打断作者 | 播放状态与作者身份 E2E |
| 用户完成最小认知动作 | 真实 `InteractionTrace` |
| 用户看到条件与反向力量 | 反例/复述人工评测 |
| 报告不虚构掌握 | `supportingEventIds` + `evidenceIds` |
| 故障仍能闭环 | 故障注入 E2E 与非空报告 |

# 3. 完整产品流程

## 3.1 内容生产

1. 来源建档，验证处理权、作者、允许用途、期限和下架方式。
2. FFprobe 读取时长、编码和媒体指纹；FFmpeg 生成音轨和关键帧。
3. ASR 生成逐句时间轴；OCR 生成带帧时间与置信度的画面文字。
4. 多模态语义阶段提取概念、背景、因果边、条件、反例和证据引用候选。
5. 确定性校验、有界批评/修复、评分、Planner、方向规则与 Payload Author 生成 `DraftExperience + CoverageReport`。
6. 内容审核员逐项复核权利、字幕、时间码、证据、财经机制、选项、方向、文案和频控。
7. 独立批准动作生成不可变 `ApprovedExperience`；发布指针只指向批准版本。

## 3.2 用户观看

```text
进入已绑定 ApprovedExperience 的视频
  → 原视频、字幕、作者与声音正常播放
  → 命中审核窗口，财包轻邀请出现 4—6 秒
     ├─ 忽略/稍后看：收进时间轴，记为未观察
     └─ 打开：无蒙层半屏，完成一个 ≤12 秒动作，视频继续
  → 后续触点按 4 次/45 秒/跳过行为降频
  → 视频结束：基础过程总结立即可用
     ├─ 查看证据报告/回看片段
     └─ 可选深挖：逻辑地图 → 沙盘 → 反例 → 复述 → 报告
```

## 3.3 时间预算

| 环节 | P0 预算 |
|---|---:|
| 邀请可见 | 4—6 秒 |
| 单次动作 P75 | ≤12 秒 |
| 自动邀请 | ≤4 次/视频 |
| 观看中新增操作 P75 | ≤60 秒/视频 |
| 片尾深挖最短路径 | ≤3 分钟 |
| 代表链路评审演示 | 可使用审核时间轴跳转，≤4 分钟 |

自然看完约 4 分 16 秒候选视频本身已经超过 4 分钟，因此不得再用“自然看完 + 全部任务 ≤4 分钟”作为验收条件。

# 4. 财包入口、编排与半屏交互

## 4.1 入口命名与形态

[产品决策] 入口统一称为“财包知识触点”或 `CuePill`，不是 POI 链接。它绑定 `videoId + contentVersion + triggerId + evidenceIds + timeWindow`，不改变路由，也不离开视频语境。

- 自动入口：关键时点出现的小胶囊，含财包小头像、动作标签、一句不超过 20 字的钩子和进入箭头。
- 恢复入口：已出现节点的轨迹点；未出现节点不可伪造完成。
- 片尾入口：视频结束后的过程总结卡。
- 调试直达：仅测试环境，生产关闭。

## 4.2 频控与状态

| 约束 | P0 值 |
|---|---:|
| 内容时间轴节点 | ≤6 |
| 自动邀请 | ≤4 |
| 自动邀请间隔 | ≥45 秒 |
| 同时活跃/展开 | 1 |
| 连续关闭或跳过 | 2 次后停止强邀请 |
| 预计动作 | ≤12 秒 |
| 面板 | `max-height: 48vh`，无蒙层 |

状态：`scheduled → offered → expanded → completed`；也允许 `offered → dismissed`、`scheduled → missed`、`missed/dismissed → revisited`。忽略、错过和不确定均不等于错误。

## 4.3 播放不变量

- 产品不得因触点调用 `play()`、`pause()`、修改 `muted`、`playbackRate` 或 `currentTime`。
- 用户原本播放则继续；用户原本暂停则保持暂停。
- 回看证据与跳转时间只能由用户主动触发。
- 控件事件必须与底座单击播放事件隔离，避免答题误触暂停。
- 面板打开期间命中的新节点只记为时间轴状态，不叠弹。

## 4.4 容器与无障碍

- `CaibaoHalfSheet` 内容自适应，最高 48vh，大屏手机可再限制 420px；不复用会创建 Mask、固定 body 或缩视频的旧弹层。
- 390×844、393×852、430×932 下至少 52% 视频区域可见。
- 关闭、主动作和跳过触控目标不小于 44×44px；支持键盘、可访问名称、200% 字体和 reduced motion。
- 字幕、作者栏、进度条、安全区和软键盘冲突时，触点延迟或降级为轨迹点。

## 4.5 财包角色与文案

财包只出现在邀请、半屏标题、简短反馈、复述诊断和报告建议。它不替换作者头像/昵称/关注按钮，不占据图谱、沙盘或证据主体，不创建常驻悬浮球或独立聊天页。

人格为简洁、苏格拉底式、条件化和证据优先。使用“哪条路径更强”“还缺什么条件”“当前信息不足”，禁止“必涨、抄底、买入、仓位、目标价、稳赚”等表述。

# 5. 六类观看中交互与片尾深挖

## 5.1 六类模板

| CueKind | 对外名称 | 最小动作 | 可证明什么 |
|---|---|---|---|
| `context_card` | 背景补丁 | 点开/确认一个背景 | 只证明看过解释 |
| `quick_judgment` | 先想一下 | 3 个业务选项 + 不确定；跳过独立 | 记录首次与最终判断 |
| `condition_slider` | 条件拨片 | 改一个变量并比较状态 | 识别条件敏感性 |
| `causal_stitch` | 因果补边 | 在 2—3 个候选中补中间边 | 识别省略机制 |
| `counterexample_flip` | 换个条件 | 找一个更强反向力 | 认识机制非必然 |
| `concept_compare` | 概念对照 | 对照/揭示两个概念 | 区分概念边界 |

共同约束：首屏直接给动作；反馈不超过 60 个汉字并引用审核证据；“不确定”和“先继续看”不作负面评价；所有模板有确定性审核反馈，模型不可用仍可完成。

## 5.2 片尾深挖

基础报告不要求完成片尾任务。用户可按需要进入：

1. 逻辑地图：只显示当前内容包审核通过的概念、因果边、条件和证据。
2. 完整沙盘：利率、通胀、增长、避险情绪四个主变量；相对政策差异是场景标签，不伪装成第五变量。
3. 反例挑战：先判断反常结果是否推翻机制，再补可能盖过机制的条件。
4. 三句话复述：背景变化 → 中间机制 → 结论改变条件，文本 18—300 字。
5. 证据报告：只从本次事件和内容证据生成。

## 5.3 沙盘规则

修改条件后旧结果必须显示为过期；用户点击“运行这组条件”后，结果依次展示激活路径、竞争路径、条件标签、证据和方向枚举。

枚举固定为 `support_dominant | pressure_dominant | conflict | insufficient`。未知、空输入或无规则签名返回 `insufficient`；模型无权改变方向。

# 6. 内容策略与 PM 迁移边界

## 6.1 内容包定义学习目标

[产品决策] 不再把“股票、黄金、汇率”硬编码为每条视频的共同结论。每个内容包只对视频证据覆盖的概念、因果链、条件和迁移目标负责。

首包候选 `fed-rate-global-capital-001` 聚焦：美国降息与全球同步降息的差异、美元资产相对回报、跨境资本搜索、本国周期约束、相对利差/汇率/套息交易，以及至少一个反向因素。除非证据审核确认，本包不得生成股票或黄金“掌握”结论。

## 6.2 PM 适配链

```text
PM VideoContentPackage@2026-07-22.2 (draft)
  → ContentAdapter + Schema 校验
  → 媒体/作者/版本/时间范围/证据一致性校验
  → DraftExperience + CoverageReport
  → 人工 ReviewManifest
  → 独立批准动作
  → ApprovedExperience@contentVersion
```

适配成功只说明结构可转换，不改变 `draft` 状态。不得复制 PM React 页面、未授权视频或静态能力印章。

## 6.3 自动邀请编排候选

PM 六节点保留为内容能力，但初始自动邀请最多选择 00:35、01:28、02:32 和 03:58；00:08 作为弱背景，03:08 作为片尾/主动回看。所有占位时间需在最终媒体与字幕审核后确认，不能当作发布事实。

## 6.4 内容最小字段

每个内容版本必须包含：

- `contentId`、`contentVersion`、`schemaVersion` 和依据的 `prdBaseline`。
- `videoId`、`mediaFingerprint`、时长、编码、字幕版本。
- `authorId`、`authorName`、`authorAvatarUrl`、`sourceUrl`。
- `licenseStatus`、允许用途、期限、权利记录 ID 和下架状态。
- concepts、causalEdges、conditions、counterexamples、evidence 和 trigger plan。
- `ruleVersion`、`weightTableVersion`、`promptVersion`、审核记录和发布状态。

# 7. ASR / OCR / 多模态生成管线

![图 3｜V2.4 延续的参考架构：模型生成候选，人审发布，客户端只运行审核计划](assets/prd-v2.3/03-v23-architecture.png)

## 7.1 两条严格分离的数据流

内容生产流：

```text
Authorized Media
→ Media Prepare / ASR / OCR / Keyframes
→ SemanticTimeline
→ Extract / Validate / Critique / Repair
→ Cue Scorer / Planner / Direction Rules
→ Payload Author / Final Validate
→ DraftExperience + CoverageReport
→ Human Review / Approval / Publish Pointer
```

运行流：

```text
ApprovedExperience
→ Player + CueOrchestrator
→ CuePill + HalfSheet
→ InteractionTrace + localStorage mirror
→ Session/Event API
→ Simulation / Retell Evaluation
→ Deterministic EvidenceReport
```

播放期间不实时调用模型决定何时弹、弹什么或资产方向。

## 7.2 阶段与责任

| # | 阶段 | 类型 | 产物/失败策略 |
|---:|---|---|---|
| 0 | 权利与媒体预检 | 确定性 | 无权利、越界路径、媒体不可读即拒绝 |
| 1 | FFprobe / FFmpeg | 确定性 | 指纹、时长、音轨、关键帧；工具缺失类型化失败 |
| 2 | ASR + OCR + 时间窗 | Provider + 确定性 | 带时间与置信度的证据，越界拒绝 |
| 3 | `emit_semantic_graph` | LLM | 富语义图、SemanticEvent 和 subSignals |
| 4 | 证据与 Schema 校验 | 确定性 | 未知 evidenceId、无 from/to、非法条件进入失败项 |
| 5 | `emit_critique` | 可选 LLM | 评审失败可跳过，不伪造通过 |
| 6 | 定向修复 | LLM，最多 2 轮 | 仅重发失败项；耗尽后丢入 rejected |
| 7 | cue-scorer + Planner | 确定性 | 版本化权重、节点/间隔/负荷/禁词门禁 |
| 8 | direction-rules | 确定性 | 锁定方向；未知组合 `insufficient` |
| 9 | Payload Author | LLM，最多 2 轮 | 仅白名单 CueKind；方向不可覆盖 |
| 10 | 终检与组装 | 确定性 | `DraftExperience + CoverageReport`，永不直接 approved |

## 7.3 证据与时间权威

- 媒体时长与指纹来自 FFprobe/SHA-256。
- ASR 句级时间来自供应商原始结果；OCR 时间来自抽帧位置。
- 模型只能引用给定 `evidenceIds`，不能自由发明时间码。
- ASR/OCR/关键帧和视频口播均视为不可信输入；每个 LLM 阶段重复注入防提示注入护栏。
- 人审确认的内容版本才可进入运行时。

## 7.4 模型与规则边界

| 能力 | 模型可做 | 模型不可做 |
|---|---|---|
| 语义分析 | 抽取候选、解释交互价值 | 编造事实、证据或精确时间 |
| 触点成稿 | 在受限 Schema 内写候选文案 | 绕过间隔、节点预算或可渲染白名单 |
| 财经方向 | 提取信号 | 修改规则锁定方向 |
| 复述评价 | 标注机制/条件/错误模式 | 投资建议、人格或财富推断 |
| 报告 | 最多润色确定性摘要 | 新增无事件支持的结论 |

## 7.5 CoverageReport

CoverageReport 是按内容版本生成的审核清单，不是视频或用户分数。它至少列出概念/因果边/条件覆盖、证据缺口、CueKind 分布、方向裁决、被拒候选、待人工决策和全部生成版本。它与按会话生成的 EvidenceReport 严格分离。

## 7.6 当前与目标边界

[现状事实] 核心有界生成管线、六类 server payload、Planner 4/45、方向规则和 CoverageReport 已由 fake-client/离线契约测试证明；真实授权媒体、真实 Provider 质量/延迟/成本、完整六类运行 E2E、持久任务和人工发布链仍未验证。

[产品决策] P0 最小发布链可以先采用受控 ReviewManifest + 双人复核 + 发布命令，不要求先完成完整审核 UI；但模型生成、人工审核与批准发布必须是不同动作并留下审计记录。

# 8. 独立版本、审核与权威链

## 8.1 版本向量

| 维度 | 示例 | 变更触发 |
|---|---|---|
| PRD baseline | `prd-v2.4-approved@<product-sha>` | 产品范围、交互、契约或门禁改变 |
| 内容版本 | `fed-rate-global-capital-001@2026-07-23.1` | 文案、时间、证据、规则输入或作者信息改变 |
| Schema | `finance-experience/1.0.0` | 数据兼容性改变 |
| 规则 | `finance-causal/1.0.0` | 方向签名或路径改变 |
| Planner 权重 | `cue-weight/1.0.0` | 排序权重改变 |
| Prompt | `semantic-graph/1.0.0` | 模型指令改变 |
| 应用实现 | Git commit SHA | 运行代码改变 |
| 媒体 | SHA-256 | 文件字节改变 |

内容版本不得使用模糊的“V2.4”代替。每个 approved 内容必须固化完整版本向量；任一关键维度变化都产生新内容版本或新 Schema/规则版本，不能覆盖原记录。

## 8.2 内容状态机

```text
generated → draft → in_review → reviewed → approved → published → retired
                  ↘ changes_requested → new draft version
```

- 模型和适配器只能创建 `generated/draft`。
- `reviewed` 表示评审项完成，不等于已批准或已发布。
- `approved` 只能由具备权限的人在完整 ReviewManifest 上执行。
- `published` 只是发布指针指向 approved 不可变版本。
- 任何修改都创建新内容版本；旧 published 可回滚或 retired，不原位修改。

## 8.3 ReviewManifest

每个候选内容版本至少记录：权利与作者、媒体/字幕/证据、财经机制、交互与频控、安全措辞、无障碍/视觉、规则黄金用例、审核人/时间/结论、未决项和批准动作。签字必须来自真实责任人；自动化只能附测试证据，不能代替签字。

## 8.4 文档门与内容门

- PRD 批准门判断“团队是否对产品形态、边界、接口和验收达成一致”。真实首视频尚未授权可列内容发布阻塞，不必让 PRD 永远待评审。
- 内容发布门判断“这一条媒体及其内容是否有权、正确、可追溯并通过运行验收”。它必须以已批准 PRD 为前提。
- 若实施或内容审核发现新的规范性需求，停止静默漂移，先提出下一 PRD minor 版本。

# 9. 技术架构与运行时

## 9.1 架构决定

[产品决策] P0 继续使用 `refer/douyin` 的 Vue 3、Vite、Pinia 和 Express TypeScript 单体式代码仓；不迁入 PM React/Vinext 前端，不恢复 FastAPI 双栈。

| 层 | P0 职责 |
|---|---|
| Player / ExtensionHost | 媒体时钟、视频身份、seek/play/pause 事件和扩展挂载 |
| Finance Cues | CuePill、HalfSheet、六类 Renderer、CueTimeline、Orchestrator |
| Runtime Repository | ApprovedExperience API-first + 明确测试 fixture fallback |
| Session Store | Express 内存会话 + 同版本 localStorage 镜像 |
| Analysis Service | 来源、媒体、Provider、有界生成、draft 与 CoverageReport |
| Review/Publish Gate | 人工修订、ReviewManifest、不可变批准物化与运行发布指针 |
| Rule Engine | 版本化输入签名、路径和方向枚举 |
| Evidence Builder | 从内容证据和不可变事件生成报告 |

## 9.2 恢复与幂等

- localStorage key 包含 `videoId + contentVersion + sessionId`。
- 恢复先读服务端；会话不存在时提交本地快照；两端按不可变事件与幂等键合并。
- 事件键建议为 `sessionId + triggerId + action + attemptNo`；重试不得重复完成、证据或指标。
- 保存 currentTimeMs、曝光/进入/完成/跳过、首次/最终答案、沙盘输入、复述引用和更新时间。
- 内容版本变化时旧会话只读保留，新版本新建会话，禁止混合证据。

## 9.3 部署边界

[现状事实] GitHub Pages 是静态评审环境，不能证明 Express、ASR/OCR、模型或发布服务已生产部署。

[产品决策] P0 集成环境默认只绑定回环地址；公网验收环境必须有 HTTPS、明确 CORS、服务端密钥隔离、鉴权/限流、结构化脱敏日志、健康检查和回滚。Docker 当前暂停且未完成 build context/secrets 安全加固，不作为已验证路径。

生产化再迁移 PostgreSQL、对象存储、持久任务队列、独立媒体 worker、多租户与审计日志。P0 内存态不承诺多实例一致性。

# 10. API 与核心契约

基础前缀：`/api/finance/v1`。

## 10.1 已实现分析垂直切片

| 方法 | 路径 | 已核验边界 |
|---|---|---|
| GET | `/health` | 技术 readiness；不证明媒体授权或真实质量 |
| POST | `/sources/douyin/profile/probe` | 公开页探测，不枚举受保护作品 |
| POST | `/analysis/jobs` | 对 rights-attested MediaAsset 创建内存任务 |
| GET | `/analysis/jobs/:jobId` | queued/running/succeeded/failed |
| GET | `/analysis/jobs/:jobId/draft` | 成功后读取 draft |
| GET | `/analysis/jobs/:jobId/coverage` | 成功后读取 CoverageReport |

## 10.2 P0 运行 API

| 方法 | 路径 | 响应/行为 |
|---|---|---|
| GET | `/experiences/:videoId` | 只返回 `ApprovedExperience` |
| POST | `/sessions` | 创建 `CoachSession` |
| GET | `/sessions/:sessionId` | 返回会话、事件和播放位置 |
| POST | `/sessions/:sessionId/events` | 幂等批量合并并返回游标 |
| POST | `/sessions/:sessionId/simulations` | `SimulationResult` |
| POST | `/sessions/:sessionId/retell-evaluations` | `RetellEvaluation` 或模板兜底 |
| GET | `/sessions/:sessionId/report` | 确定性 `EvidenceReport` |

## 10.3 P0 受控审核/发布接口

完整审核 UI 可在 P1，但 P0 必须有可自动测试的受控动作：

| 方法/工具 | 用途 | 强制门禁 |
|---|---|---|
| `PATCH /analysis/jobs/:jobId/draft` | 人工修订该 Job 的 draft，生成新 draft revision | 乐观版本、修改审计、仍保持 draft |
| `POST /analysis/jobs/:jobId/reviews` | 保存某内容版本 ReviewManifest | 审核身份、维度结论、不可变候选版本 |
| `POST /analysis/jobs/:jobId/publish` | 将已 reviewed draft 物化为不可变 `ApprovedExperience` | 权利/证据/机制/安全/测试全绿；不切运行发布指针 |
| `POST /content/versions/:contentVersion/publish` | 把运行发布指针切到指定 approved 版本 | 仅接受 approved；幂等、可回滚 |
| `POST /content/versions/:contentVersion/retire` | 停止新会话 | 权利到期/下架/安全事件留审计记录 |

[产品决策] `analysis/jobs/:jobId/publish` 沿用用户锁定的接口命名，但语义是“审核通过后物化 approved 内容”，不是让用户运行端立即可见；只有 `/content/versions/:contentVersion/publish` 才切换运行发布指针。若实现团队选择 CLI + 受控配置代替 HTTP，必须满足相同 Schema、权限、幂等、审计和自动化测试；不得通过手改运行 fixture 模拟“已发布”。

## 10.4 核心类型

| 类型 | 责任 |
|---|---|
| `DraftExperience` | 生成/适配后的待审内容，客户端不可消费 |
| `CoverageReport` | 覆盖、缺口、方向与待人工决策 |
| `ReviewManifest` | 权利、内容、交互、安全和测试审核记录 |
| `ApprovedExperience` | 审核后不可变的运行内容 |
| `VideoContext` | 视频、作者、字幕、时间和证据上下文 |
| `CoachSession` | 版本化会话与恢复游标 |
| `InteractionTrace` | 曝光、进入、完成、跳过、回看和回答 |
| `SimulationResult` | 路径、证据、方向枚举和边界 |
| `RetellEvaluation` | rubric 标签、引用与 fallback mode |
| `EvidenceReport` | 由事件与证据生成的过程总结 |

## 10.5 契约硬约束

`ApprovedExperience` 必含完整版本向量、媒体/作者一致性、只含审核通过的语义项和触点；`publishStatus='approved'`。客户端不得收到候选、审核备注、权利附件或模型原始响应。

`SimulationResult` 必含 `direction`、`activatedPaths`、`evidenceIds`、`conditions`、`ruleVersion` 和 boundary。报告字段不得存在 `totalScore`、`percentage`、`rank` 或 `investmentProfile`。

所有目标请求/响应带 `schemaVersion`；内容请求带 `contentVersion` 和 `prdBaseline`；写请求带 `requestId/eventId`。

## 10.6 错误码

| code | 场景 | 客户端行为 |
|---|---|---|
| `MEDIA_ASSET_REQUIRED` | 只有元数据无有权媒体 | 不启动分析 |
| `MEDIA_RIGHTS_NOT_ATTESTED` | 权利声明缺失 | 403，不进入 ASR/OCR |
| `EXPERIENCE_NOT_APPROVED` | 无批准内容 | 普通视频继续，不展示财包 |
| `CONTENT_VERSION_MISMATCH` | 快照版本不同 | 保留旧历史，新建会话 |
| `SESSION_NOT_FOUND` | 内存会话丢失 | 用同版本本地快照补回 |
| `EVENT_ALREADY_ACCEPTED` | 幂等重复 | 视为成功 |
| `RULE_INPUT_UNSUPPORTED` | 无规则签名 | 显示信息不足 |
| `MODEL_TIMEOUT` | 受限评价超时 | 模板兜底，不阻断报告 |
| `REVIEW_INCOMPLETE` | 审核维度/签字缺失 | 保持 draft/reviewed，不批准 |
| `PRD_BASELINE_NOT_APPROVED` | 内容引用候选 PRD | 禁止批准/发布 |

# 11. AI、Provider、来源、安全与隐私

## 11.1 Provider 适配

[现状事实] 服务端已有 OpenAI-compatible MiniMax/方舟客户端、豆包 ASR 和可选火山 OCR 适配骨架；模型 ID、端点和权限属于易变配置，最终以操作者账号与供应商官方控制台为准。

- MiniMax 与方舟语义模型使用统一结构 tool/function 契约，再经 Zod 校验。
- 豆包 ASR 与方舟 API key 分离；火山 OCR 使用独立 AK/SK。
- 视觉模型未配置时，只使用 transcript/OCR 文本，不探测账号可用模型。
- `.env.minimax`、`.env.doubao` 仅保存在代码仓本地且 Git ignored；前端不得使用 `VITE_*` 暴露密钥。
- 真实调用必须默认关闭，由 `LIVE_PROVIDER_TESTS=true` 显式开启；每 Provider 每次 smoke 最多一个最小请求。

[发布阻塞项] 尚无真实 Provider E2E 证据；已配置不等于已验证。任何真实调用前必须确认有权媒体、模型/项目、费用承担、产物保留与密钥轮换。

## 11.2 财经安全

- 产品仅做知识理解，不构成投资建议或市场预测。
- 对买什么、仓位、目标价、稳赚、何时卖等请求固定拒绝并转回机制、条件和证据。
- 不接实时行情，不输出具体价格、涨跌幅、收益概率或交易动作。
- 资产方向由审核规则决定；证据不足返回信息不足。
- ASR/OCR/视频中的提示注入视为不可信内容，不能改变工具、Prompt、发布或方向规则。

## 11.3 隐私与数据最小化

- P0 匿名会话，不收手机号、实名、持仓、收入或风险偏好。
- 不保存原始语音；Web Speech 仅为可选输入增强，失败回退文字。
- 复述文本按最小期限保存并可删除；事件默认只记录长度、模式和错误标签。
- 日志不含密钥、Cookie、Provider 原始响应、媒体内容或完整复述。
- 媒体、音轨、关键帧、ASR/OCR 原文和真实分析产物默认不进 Git。

# 12. 证据型报告、事件与指标

## 12.1 报告模块

- 内容包、PRD baseline、内容/规则/审核版本。
- 本次实际曝光、进入、完成、跳过、回看和首次/最终回答。
- 已观察机制：必须同时有 `supportingEventIds` 和 `evidenceIds`。
- 一次修正、条件意识和错误模式；仅曝光背景卡不能写成掌握。
- 尚未观察：未出现、错过、跳过或证据不足。
- 定向回看、迁移题、下一步和非投资建议边界。

报告不显示总分、百分比、等级、排名、红叉羞辱或静态能力印章。模型超时不得导致空报告。

## 12.2 统一事件

| 事件 | 必需最小属性 |
|---|---|
| `video_view` | videoId、contentVersion、source |
| `cue_offer` | triggerId、atMs、offerStrength |
| `cue_expand` | triggerId、playbackState |
| `cue_complete` | kind、attemptNo、evidenceIds |
| `cue_dismiss` | reason、skipStreak |
| `cue_missed` | fromMs、toMs |
| `simulation_run` | variables、ruleVersion、fallback |
| `evidence_open` | evidenceId、fromSurface |
| `retell_submit` | length、mode、attemptNo |
| `report_view` | observedCount、missingCount |
| `report_action` | action、targetId |
| `runtime_error` | code、recoverable、fallback |

所有事件带 `schemaVersion`、`contentVersion` 和会话幂等字段；不上传原始语音、财富/风险偏好或不必要的自由文本。

## 12.3 指标

| 目标 | 指标 | 候选阈值 |
|---|---|---:|
| 进入 | 至少展开一次 | ≥30% |
| 干扰 | 连续两次跳过 | ≤25% |
| 完成 | 展开后动作完成 | ≥65% |
| 轻量 | 观看中新增操作 P75 | ≤60 秒/视频 |
| 深挖 | 片尾最短闭环完成 | ≥20% |
| 理解 | 条件/反向力量命中 | 相比纯摘要组提升 ≥20pp |
| 安全 | 理解“非市场预测” | ≥90% |
| 可靠 | 有交互会话报告非空 | 100% |

[假设] 业务阈值需灰度校准；播放、安全、证据和发布门禁不能因实验结果放宽。

# 13. 非功能约束

## 13.1 性能

| 能力 | P0 目标 |
|---|---:|
| 已缓存内容包 | P95 ≤300ms |
| 轻邀请/半屏首帧 | ≤100ms |
| 触发时钟误差 | ≤250ms |
| 规则沙盘 | ≤500ms |
| 复述评价 | P95 ≤8 秒，超时立即兜底 |
| 观看中额外掉帧 | 相对底座无可感知恶化 |

## 13.2 兼容与可访问性

- 视口：390×844、393×852、430×932 和 1280×900 桌面容器。
- iOS Safari、Android Chrome 最近两个大版本；桌面 Chrome/Edge/Safari 最近两个大版本。
- 状态不只靠颜色；键盘可达；可访问名称完整；200% 字体与 reduced motion 可用。
- 视频、字幕、触点、作者栏、进度条和安全区不得重叠或裁切。

## 13.3 可靠性与降级

| 故障 | 用户结果 |
|---|---|
| 内容包请求失败且无批准缓存 | 普通视频继续，不展示通用未审触点 |
| 模型超时/无效 JSON | 静态审核反馈；其他候选继续 |
| 规则未知组合 | `insufficient`，说明缺少条件 |
| 断网 | 同版本本地会话继续，恢复后幂等上报 |
| 服务端会话丢失 | localStorage 快照补回 |
| 语音不支持/拒绝 | 文字输入 |
| 视频失败 | 封面 + 审核文字证据 + 片尾入口；不得伪造播放完成 |

# 14. P0 功能需求与追溯

| ID | 需求 | 模块/页面 | 事件 | 主要验收 |
|---|---|---|---|---|
| F-01 | 只加载 approved 且版本完整的体验 | Repository | experience loaded | T-PUB-01 |
| F-02 | 自动邀请 ≤4、节点 ≤6、间隔 ≥45 秒 | Orchestrator | cue_offer/suppressed | T-ORCH-01 |
| F-03 | 打开/作答/关闭不停播 | Player/HalfSheet | cue_expand | T-PLAY-01 |
| F-04 | 无蒙层且面板 ≤48vh | HalfSheet | UI trace | T-UI-01 |
| F-05 | 六类模板均可运行与降级 | Renderer | cue_complete | T-KIND-01..06 |
| F-06 | 首次/最终答案、跳过与不确定可追溯 | Session | trace events | T-TRACE-01 |
| F-07 | 同版本刷新与会话补回 | Store/API | restore | T-RECOVER-01 |
| F-08 | 作者、媒体与财包身份分离 | Feed/Content | metadata audit | T-MEDIA-03 |
| F-09 | 片尾沙盘先改变量再运行 | Deep Dive | simulation_run | T-SIM-01 |
| F-10 | 方向只由版本规则决定 | Rule Engine | ruleVersion | T-RULE-01 |
| F-11 | 反例两阶段且不绝对化 | Challenge | attempt | T-COUNTER-01 |
| F-12 | 文本复述与可选语音兜底 | Retell | retell_submit | T-RETELL-01 |
| F-13 | 无分数、证据驱动报告 | Report | report_view | T-REPORT-01 |
| F-14 | 故障时最短闭环仍完成 | Runtime | runtime_error | T-FAIL-01 |
| F-15 | 财经安全和隐私 | 全链路 | safety audit | T-SAFE-01 |
| F-16 | 多视口与无障碍 | UI | visual/a11y | T-UI-02 |
| F-17 | PM 适配后仍为 draft | ContentAdapter | draft created | T-ADAPT-01 |
| F-18 | ReviewManifest 完整才可 job publish | Review Gate | review/job_publish log | T-REVIEW-01 |
| F-19 | PRD/内容/Schema/规则独立版本 | 全链路 | version vector | T-VERSION-01 |
| F-20 | 发布指针只指 approved 且可回滚 | Publish Gate | publish/retire log | T-PUB-02 |

# 15. TDD 与验收

## 15.1 推进顺序

1. 先写版本向量、PM 适配、权利/媒体/作者一致性和 draft 不可越权的失败测试。
2. 再写 draft PATCH、ReviewManifest、job publish 与 content publish/retire 分离及指针回滚测试。
3. 把六类内容绑定到时长匹配的有权媒体，补运行时与四视口 E2E。
4. 实现 Session/Event/Report 与故障恢复，再接片尾沙盘和复述。
5. 真实 Provider smoke 必须默认跳过、显式授权、最小请求并记录费用边界。
6. 每个阶段运行全量门禁；测试文件存在不等于实际通过。

## 15.2 内容、版本与发布测试

| ID | 场景 | 通过条件 |
|---|---|---|
| T-ADAPT-01 | PM draft 通过 Schema 适配 | 状态仍 draft；未复制未授权媒体 |
| T-VERSION-01 | 任一版本向量缺失 | 不可 reviewed/approved |
| T-VERSION-02 | 修改文案/时间/证据 | 创建新 contentVersion，旧版不变 |
| T-CONTENT-01 | 概念/边/条件无 evidenceId | 不可进入 approved |
| T-CONTENT-02 | 时间越界或媒体指纹变化 | 旧时间轴拒绝 |
| T-MEDIA-03 | 作者/媒体/来源不一致 | 构建或发布失败 |
| T-DRAFT-01 | 并发修订或缺 expectedDraftVersion | PATCH 拒绝覆盖；成功修订产生新 revision 且仍为 draft |
| T-REVIEW-01 | 缺任一必审维度或真实审核人 | job publish 返回 `REVIEW_INCOMPLETE` |
| T-PUB-01 | 客户端请求 draft/reviewed | 返回 `EXPERIENCE_NOT_APPROVED` |
| T-PUB-02 | job publish 后切指针、回滚与 retire | 物化与分发分离；指针只指不可变 approved，审计完整 |
| T-PRD-01 | 内容引用 Review Candidate | 禁止 approved，返回 `PRD_BASELINE_NOT_APPROVED` |

## 15.3 生成与规则测试

- ASR 时间单调、非负且不越过媒体时长；OCR 数值绑定 frameId/timeMs/confidence/evidenceId。
- 语义图每项引用已知 evidenceId，因果边有 from/to，条件有操作数。
- 修复环与 Payload Author 各最多 2 轮；耗尽进入 rejected，不自发布。
- Planner 硬门禁为节点 ≤6、自动邀请 ≤4、间隔 ≥45 秒、单次 ≤12 秒、面板 ≤0.48。
- A/B/C、冲突、空输入和未知组合建立黄金用例；相同输入和版本字节级一致。
- 模型断言方向与规则冲突时规则胜出；未知组合为 `insufficient`。
- Provider 超时、429、无效 JSON 和缺配置均为类型化错误，密钥/原始响应不进日志。

## 15.4 播放、UI、恢复与报告测试

- 轻邀请出现、打开、作答、完成、跳过和关闭时，产品不改变 paused/muted/playbackRate/currentTime。
- 快进跨多个窗最多提示 1 个；回拖不重复强弹；连续跳过 2 次后降频。
- 每个 CueKind 有 Schema、渲染、键盘/触控和真实时间轴 E2E。
- 四目标视口无重叠/裁切；面板 computed height ≤ visualViewport×0.48；作者头像永不被财包替换。
- 断网、刷新、服务端会话丢失、模型超时和语音拒绝后，报告仍非空且事件不重复。
- 每个报告掌握候选含 supportingEventIds/evidenceIds；跳过只显示尚未观察。

## 15.5 复述与安全评测

- 至少 40 条人工金标，覆盖绝对化、机制缺失、条件缺失、概念混淆与安全越界。
- Macro-F1 ≥0.80；严重概念错误召回率 ≥90%；未达到则关闭模型评价，保留模板反馈。
- 对买什么、仓位、目标价、稳赚、今天涨不涨和提示注入请求始终拒绝交易建议并转回机制/条件。
- 原始语音不落库、不进日志；不推断财富、持仓或风险偏好。

## 15.6 文档验收

- Markdown 是唯一内容源；目录、图号、链接、事实标签和 F-ID 追溯完整。
- V2.3→V2.4 差异、权威状态和待签字项无矛盾。
- PDF 由本 Markdown 生成；文件可打开，页数和关键标题可机器核对。
- 按用户最新指令，本轮不执行 PDF 逐页渲染、截图或肉眼视觉验收；不得声称视觉质量已通过。

# 16. 发布、灰度与回滚

## 16.1 PRD 批准门

- 规范性决策闭合，或明确延期到 P1/P2 且不影响 P0 实施。
- F-ID、页面/模块、事件和测试可追溯。
- 产品、设计、研发/架构、测试、内容/财经、法务/版权与安全/隐私留下真实结论。
- Markdown、PDF、版本治理、评审记录和权威指针一致。
- 合并后创建 `prd-v2.4-approved`；未满足前不创建标签。

## 16.2 内容发布门

- 内容引用已批准 PRD 标签，不引用 Review Candidate。
- 视频/作者授权、用途、期限、下架机制、指纹、字幕和证据齐全。
- 概念、边、条件、反例、选项、方向和报告映射完成人审。
- 自动 4 次/45 秒、六类运行、四视口、恢复、安全和全量工程门禁通过。
- ReviewManifest 完整；draft PATCH、job publish（物化 approved）与 content publish/retire（运行指针）是独立、有权限、可审计动作。
- 公网服务端的 HTTPS/CORS/鉴权/限流/密钥/日志/健康与回滚可验证。

## 16.3 灰度与回滚

灰度顺序：内部团队 → 受邀 10% → 50% → 全量。观察触点进入、连续跳过、视频退出、报告非空、安全越界和 P95 延迟。

回滚层级：应用切上一构建；内容指针切上一 approved；AI 关闭后用静态审核反馈；自动邀请关闭后保持普通播放；授权问题立即停止新会话和媒体分发并保留审计。

# 17. 实施顺序、依赖与风险

## 17.1 文档先行的实施序列

1. 联合评审 V2.4；修改仍留在 `docs/prd-v2.4-governance`。
2. 获批后原子更新权威指针并打批准标签。
3. 代码仓工作树归属清晰、干净后，从明确 SHA 创建内容实施分支。
4. 先写失败测试，再实现 PM adapter、版本向量、draft PATCH、job publish 与运行发布指针。
5. 有权媒体进入受控存储后跑真实最小 Provider smoke 和人工内容审核。
6. approved 内容绑定运行时，完成六类 E2E、Session/Report 和片尾深挖。

## 17.2 里程碑

| 里程碑 | 结果 |
|---|---|
| D0 文档候选 | V2.4、治理、差异与评审包可审阅 |
| D1 文档批准 | 权威切换、批准 tag、实施分支可开始 |
| P0-A 内容与版本 | adapter、版本向量、Review/Publish Gate |
| P0-B 六类运行 | 有权媒体、≤4 自动邀请、六类 E2E |
| P0-C 证据闭环 | Session、沙盘、反例、复述、报告 |
| P0-D 发布验收 | 安全公网环境、真实内容人审、灰度/回滚 |

## 17.3 发布阻塞项

| 阻塞项 | 建议 Owner | 解除证据 |
|---|---|---|
| 首视频与作者授权 | 产品/法务/内容 | 授权记录、用途、期限和下架方式 |
| 最终字幕/OCR/时间码 | 内容审核 | 带人名、日期、版本的审核记录 |
| 作者与媒体一致 | 内容/前端 | 指纹与元数据集成测试 |
| 真实 Provider | 研发/内容 | 有权短媒体 smoke、质量/延迟/成本记录 |
| Review/Publish Gate | 后端/安全 | 权限、幂等、审计与负向测试 |
| 六类真实时间轴 | 前端/测试 | 四视口 E2E 与无障碍报告 |
| 规则沙盘 | 后端/财经审核 | 黄金用例与审核结论 |
| 复述金标 | 产品/研究/内容 | 40+ 金标及指标报告 |
| 公网后端 | 研发/运维/安全 | HTTPS/CORS/鉴权/限流/日志/回滚 |
| 底座与资产许可 | 法务/负责人 | GPL/非商业限制和第三方资产审查 |

## 17.4 主要风险

| 风险 | 缓解 |
|---|---|
| 文档与代码再次漂移 | approved PRD tag + version vector + F-ID 测试追溯 |
| PM 内容被直接发布 | adapter 保持 draft；job publish/content publish 负向测试 |
| 自动邀请干扰观看 | ≤4、45 秒、2 次跳过停强邀、灰度护栏 |
| 报告夸大理解 | 事件 + 内容证据双绑定，未观察不推断 |
| 模型越权/幻觉 | 不可信输入、防注入、规则方向、人审、模板兜底 |
| 版权或作者错配 | 权利记录、媒体指纹、作者一致性发布门 |
| 静态评审环境被当生产 | 环境标识，后端/Provider/发布证据分开 |
| 密钥泄露或费用失控 | Git ignore、服务端隔离、默认离线、限额/限流和轮换 |

# 18. V2.4 变更与评审状态

## 18.1 相对 V2.3

- 保持多次轻邀请、不停播、≤48vh、自动 ≤4/节点 ≤6/间隔 ≥45 秒和六类交互不变。
- 新增 PRD、内容、Schema、规则、权重、Prompt、应用和媒体的独立版本向量。
- 新增文档先行：Review Candidate 只能生产 draft，不能成为 approved 内容基线。
- 新增 draft PATCH、ReviewManifest、job publish 物化 approved、content publish/retire 与指针回滚。
- 区分 PRD 批准门与内容发布门，避免授权阻塞造成文档无法批准。
- 把 PM adapter、作者/媒体一致性和“draft 不可越权”设为首批 TDD。
- 明确 Docker 暂停、回环绑定、密钥轮换和公网鉴权/限流要求。

## 18.2 保持不变的产品红线

- 视频不中断、财包不替作者、无全屏蒙层、播放中不实时生成。
- 模型输出永远是候选；方向、频控、发布和报告归因由规则/人审决定。
- 无投资建议、无总分或虚假精度、未观察不等于错误。
- 未获授权的 PM 媒体不复制进产品仓或公开发布链。

## 18.3 当前评审状态

本文件没有任何已签字结论。真实评审人、结论、日期、阻塞和修改请求记录在 `docs/reviews/PRD_V2.4_REVIEW.md`。在该记录完成前：

- V2.0 仍为当前权威。
- V2.4 仅是 Review Candidate。
- 不创建 `prd-v2.4-approved` 标签。
- 不把 V2.4 PDF、分支或本地提交称为团队已批准基线。

# 附录 A. 评审与实现索引

- 版本治理：`docs/VERSION_GOVERNANCE.md`
- V2.4 评审包：`docs/reviews/PRD_V2.4_REVIEW.md`
- V2.3→V2.4 差异：`docs/PRD_V2.3_TO_V2.4_DIFF.md`
- PM/集成差异：`docs/PRD_V2.2_GAP_REVIEW.md`
- 技术架构：`docs/ARCHITECTURE.md`
- 生成管线：`docs/GENERATION_PIPELINE_DESIGN.md`
- 实施计划：`docs/IMPLEMENTATION_PLAN.md`
- TDD：`docs/TDD_TEST_PLAN.md`
- Agent 交接：`docs/AGENT_HANDOFF.md`

# 附录 B. Given / When / Then 关键验收

## B.1 不停播

Given 视频正在播放且声音开启  
When 财包在 01:28 展开因果补边，用户完成并关闭  
Then 产品不调用 play/pause/seek，不修改 muted/playbackRate，currentTime 单调前进，面板不超过 48vh且无蒙层。

## B.2 PM draft 不越权

Given PM 包完成 Schema 适配，但授权、概念审核和已批准 PRD baseline 缺失  
When 尝试 job publish 或 content publish  
Then 返回明确缺口，状态保持 draft，客户端无法获取该版本。

## B.3 证据报告

Given 用户只完成因果补边，跳过条件拨片且未复述  
When 打开报告  
Then 只把因果补边列为已观察；条件与复述显示尚未观察；每项可追到事件和证据；无总分或能力印章。

## B.4 模型与会话故障

Given 复述评价模型超时且服务端内存会话丢失  
When 客户端用同版本 localStorage 快照重试  
Then 事件幂等补回，8 秒内进入模板反馈，报告非空且标注 fallback mode。

## B.5 发布回滚

Given `content@2` 已 published、`content@1` 仍 approved  
When `content@2` 因授权问题 retired 并回滚  
Then 新会话只获取 `content@1`，历史报告仍引用原版本，审计记录不被覆盖。
