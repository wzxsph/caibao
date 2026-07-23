# 财经推演室

## 产品需求文档 PRD V2.0

**把财经视频变成沿时间轴发生的轻量理解体验**

版本：V2.0  
日期：2026-07-22  
状态：当前已批准基线（播放条款被用户最新指令部分覆盖）  
唯一内容源：本 Markdown 文件  
评审版：output/pdf/财经推演室_PRD_V2.0.pdf

> 现行覆盖提示：用户于 2026-07-23 裁决“进入财包交互时自动暂停”。本文关于交互期间
> “不自动暂停”的条款不再作为实现目标；当前完整口径见 `财经推演室_PRD_V2.5.md`。

<!-- BODY -->

# 0. 文档控制与一页决策

## 0.1 权威性

**[产品决策]** 本文档自发布起替代《财经推演室 PRD V1.0》和《财经推演室后端实现说明 V1.0》。旧文件保留用于追溯，不再作为设计、开发、测试或验收依据。出现冲突时，以本文档和其配套目标产品图为准。

| 项目 | 统一口径 |
|---|---|
| 产品形态 | 嵌入仿抖音移动视频流的财经知识触点系统 |
| 首版内容 | 固定一条“美联储降息如何影响股票、黄金和汇率”视频 |
| 核心体验 | 视频持续播放，财包在审核过的关键时点多次发出轻提示，用户可展开不超过半屏的微交互 |
| 用户产出 | 一份不打总分的过程式学习总结，可回看已完成、略过和待补的触点 |
| 内容生产 | ASR、OCR、关键帧和多模态理解生成候选，人工逐条审核后发布版本化时间轴 |
| 实施底座 | refer/douyin，Vue 3 + Vite + Pinia；在现有播放器上增量改造 |
| P0 后端 | Node.js + Express + TypeScript，内存会话与浏览器 localStorage 镜像 |
| 财包角色 | 视频内的条件提醒者和交互引导者，不替代作者，不自由聊天，不预测市场 |

## 0.2 本次锁定的关键变化

1. 废除“AI解析 Tab 作为主入口”和一次性入口提示。
2. 废除“暂停视频后进入完整陪练流程”。
3. 新增“财包知识触点”：一条视频可在多个关键时点出现，触点不是网页跳转，也不是平台 POI。
4. 打开触点时无蒙层、最多覆盖视口高度 48%，视频和音频保持原播放状态。
5. 交互不只做题，还包括背景补丁、条件拨片、路径拼接、反例翻转和概念对照。
6. 最终结果从“完成关卡和评分”改为“过程学习足迹和下一步建议”。
7. 四变量沙盘、完整因果图和自由复述不再阻断观看，移入可选的看后深挖。

## 0.3 事实标签

- **[现状事实]** 已在仓库或材料中直接核验。
- **[产品决策]** 本文锁定、团队必须实现或遵循。
- **[假设]** 尚需用户测试或数据验证。
- **[发布阻塞项]** 未解决前只能演示原型，不能声称内容已验证或可正式上线。

> 核心不变量：用户回答时，系统不得调用 pause()、不得静音、不得把视频压缩成只剩一个小窗。用户仍可使用播放器原生控制自行暂停。


# 1. 项目现状与来源裁决

## 1.1 已确认资产

| 资产 | 现状事实 | V2.0 裁决 |
|---|---|---|
| refer/douyin | 上游基线提交 8cc6172；本项目实现提交 57daf3b；Vue 3、Vite 6、Pinia、TypeScript；已有纵向虚拟视频流、BaseVideo、进度条、事件总线和底部弹层 | 作为正式可修改的前端底座 |
| BaseVideo.vue | 已监听 loadedmetadata、timeupdate，维护 currentTime、duration、播放状态和进度拖动 | 作为知识触点时钟源，补充毫秒级事件和触点插槽 |
| FromBottomDialog.vue | 会创建 Mask、固定 body，并与评论弹层联动改变视频高度 | 不直接复用；新建无蒙层、不冻结 body 的 CaibaoHalfSheet |
| 当前财经 Demo | React/Vinext 静态原型，已有概念、因果、沙盘和报告视觉语义 | 只迁移信息设计和样式，不迁移运行时 |
| V1 PRD 与后端说明 | 提供 5 个概念、2 条因果链、A/B/C 情景、安全边界和内容审核思路 | 保留领域内容，重写用户流程、前端栈和接口 |
| 形象参考 | 已有透明背景白色小狗财包形象 | 直接复用，不生成第二角色 |
| 正式海报1.png、正式海报2.png | 品牌愿景图 | 只作氛围参考，不作为产品 UI |

## 1.2 不可沿用的旧口径

| 旧说法 | 新口径 | 原因 |
|---|---|---|
| 评论区旁常驻 AI解析 Tab | 关键时点知识触点 + 时间轴圆点回看 | 入口与视频语义同步，减少脱离观看 |
| 打开活动自动暂停 | 保持原播放状态 | 用户明确要求边看边答 |
| 顺序闯关，不可跳过 | 所有触点可略过，未观察不等于错误 | 保持轻盈，不把看视频变成课程考试 |
| 每次都是预测题 | 六类微交互按内容匹配 | 背景、条件和反例不适合都做选择题 |
| 主流程进入四变量沙盘 | 观看中只做单变量或单路径动作，完整沙盘看后可选 | 控制认知负荷和遮挡高度 |
| 报告百分比或总分 | 过程证据、未观察项、修正和回看 | 避免虚假精度 |

## 1.3 底座许可风险

**[现状事实]** refer/douyin 的 LICENSE 为 GPL，README 同时写明仅适用于学习和研究、不得用于商业使用。  
**[发布阻塞项]** 黑客松演示之外的商业发布，必须由负责人完成许可证、第三方媒体来源和衍生代码披露义务审查。若结论不可接受，应保留本 PRD 的组件契约，在自有视频壳中重建，不得默认“已下载即可商用”。

## 1.4 抖音来源能力裁决

**[现状事实，2026-07-22 实测]** 用户提供的“小Lin说”主页在普通浏览器中可见昵称、抖音号和“作品 532”等资料，但匿名服务端请求只得到 HTTP 200 的 JavaScript 风控壳；风控壳没有可验证的作品列表、secUid 数据或媒体地址。浏览器 DOM 中同时出现的无关 SEO 视频链接不能当成该博主作品。

因此“HTTP 200”不等于采集成功，P0 把三条链路明确拆开：

1. **任意公开主页建档**：只保存规范化来源 URL 和当次可验证的公开资料；遇到动态页或风控返回 `dynamic_page_blocked`，不得伪造空作品列表。
2. **创作者授权作品同步**：通过抖音开放平台 OAuth 和 `video.list` 同步已授权账号的作品元数据；权限需申请，且官方列表不提供原始媒体文件地址。
3. **媒体分析**：只有用户上传或项目方对象存储中具备处理权、带权利声明的媒体文件，才可启动 ASR/OCR/多模态任务。

**[P0 明确排除]** 不逆向 `a_bogus`/X-Bogus 等签名，不保存浏览器 Cookie，不绕过验证码、登录或设备风控，不把临时 CDN 播放地址当长期媒体资产。具体开放平台能力以[授权账号视频列表官方文档](https://open.douyin.com/platform/resource/docs/openapi/video-management/douyin/search-video/account-video-list)为准。


# 2. 问题、用户与产品边界

## 2.1 用户问题

财经视频的问题不是缺少结论，而是结论出现得快、背景前提散落、竞争路径常被压缩。用户在连续观看时容易记住“降息利好什么”，却无法回答：

- 这个说法依赖哪一个中间机制？
- 哪个条件改变后，方向会变？
- 视频中的术语与画面数据分别在支持什么？
- 我是真的理解了，还是只重复了作者的结论？

## 2.2 核心用户

| 用户 | 行为 | 需要 |
|---|---|---|
| 财经内容普通观看者 | 连续刷视频，愿意多花几秒理解 | 不离开视频、不被考试打断的背景和概念补丁 |
| 有基础但机制不牢的用户 | 能说方向，常遗漏条件 | 在关键句出现时做一次条件或路径判断 |
| 对结论持怀疑的用户 | 会问“为什么这次不灵” | 竞争路径、反例和证据回看 |

核心 JTBD：

> 当视频讲到一个重要财经机制时，我希望当场用几秒补背景或动一下条件，继续看视频的同时确认自己理解了哪一步，并在看完后知道哪些地方我已经碰过、哪些还值得回看。

## 2.3 产品定义

财经推演室是“视频语义时间轴上的交互层”。它不另造一门课程，也不是聊天机器人。系统先理解整条视频，再把少量高价值节点编排为知识触点；财包负责提醒和提问，证据与交互内容始终是主体。

## 2.4 P0 边界

P0 包含：固定视频、审核时间轴、最多 6 个自动触点、六类模板中的至少 4 类、半屏交互、触点圆点回看、过程总结、确定性兜底。

P0 排除：

- 任意用户上传视频和实时全自动发布。
- 实时行情、资产预测、买卖建议、仓位、目标价和收益承诺。
- 独立聊天页、常驻悬浮球、作者头像替换和 Subagent。
- 强制复述、总分、排行榜、长期财富画像或风险偏好推断。
- 主流程中的复杂四变量沙盘；它是看后可选模块。

## 2.5 成功定义

**[假设]** 只要触点足够少、足够贴时点且不暂停视频，用户愿意在不显著降低完播的前提下完成 2-3 次微交互。P0 首先验证“理解触点能否自然存在于观看中”，不验证投资预测正确率。


# 3. 端到端产品流程

![图 1｜完整用户旅程：理解视频、编排触点、边看边互动、形成学习足迹](assets/prd-v2/06-user-journey.png)

## 3.1 内容生产阶段

1. 导入已授权视频、基础元数据和可用字幕。
2. ASR 生成带词级或句级时间戳的转写。
3. OCR 与关键帧分析识别图表标题、数值、专有名词和画面切换。
4. 多模态模型结合声音、文字和画面，提取概念、主张、因果边、条件、例子与证据。
5. Trigger Planner 生成候选时点、交互类型、提示文案和预期耗时。
6. 内容审核员核对时间、证据、财经方向、安全文案和频率。
7. 发布版本化 SemanticTimeline 与 ApprovedTriggerPlan。

## 3.2 用户观看阶段

1. 用户像正常视频一样观看，作者头像和原互动区保持不变。
2. 到审核时点后，财包知识触点以小胶囊出现 4-6 秒。
3. 用户可点击展开半屏微交互，也可忽略或点“稍后看”。
4. 展开和回答期间视频继续播放；内容控制在 1-2 次点击、8-12 秒。
5. 忽略的触点收进进度条圆点，已完成、待看和错过有不同状态。
6. 视频结束后出现“本次学习足迹”，只总结观察证据和待补节点。
7. 用户可从总结或圆点回到对应时间，也可进入看后深挖。

## 3.3 产品循环

触发不是一次性跳转，而是一个可恢复循环：

视频语义到达 → 轻提示 → 展开或收起 → 微交互 → 记录证据 → 回到观看 → 下一触点 → 过程总结。

系统必须允许用户只看视频。未点击触点是“未观察”，不得写成“不理解”或“答错”。


# 4. 多模态视频解析流水线

## 4.1 输入与输出

| 阶段 | 输入 | 输出 | P0 质量门禁 |
|---|---|---|---|
| 媒体预处理 | 授权视频 | 音轨、关键帧、镜头段、媒体指纹 | 时长和帧率可读，指纹唯一 |
| ASR | 音轨 | TranscriptSegment | 时间单调、无越界、关键术语复核 |
| OCR | 关键帧 | VisualEvidence | 文本与帧时间绑定，低置信度不直接发布 |
| 多模态理解 | 字幕、OCR、关键帧 | Concept、Claim、CausalEdge、Condition | 每项至少一个 evidenceId |
| 触点规划 | 语义项、节奏、画面负荷 | TriggerCandidate | 类型、时间、文案、预期耗时齐全 |
| 人工审核 | 候选和证据 | ApprovedTriggerPlan | P0 逐条 100% 审核 |

## 4.2 模型应识别什么

- 概念首次出现、正式解释和后续复用。
- 需要前置背景才能理解的句子。
- 作者做出方向判断、条件限定或因果跳跃的位置。
- 画面图表与口播不完全重复的新增信息。
- 可由一个轻动作澄清的误区，例如名义利率与实际利率。
- 竞争路径或反例出现前的思考窗口。
- 认知负荷过高的区间，Planner 应避开而不是再加交互。

## 4.3 触发时点不是模型即时决定

**[产品决策]** P0 在内容发布前完成解析和审核，播放时只读取批准的时间轴。实时模型无权临时插入题目、改资产方向或延长面板。

候选触点必须附带：

- startMs、endMs 和容许触发窗口。
- 触发理由与 learningObjective。
- 至少一个字幕或画面 evidenceId。
- 建议模板、提示文案、答案逻辑和兜底行为。
- 审核人、审核状态、内容版本和规则版本。

## 4.4 发布阻塞项

当前仓库没有最终授权视频、最终字幕和可核验时间码。所有示意时间只能用于原型。拿到三项资产并完成证据审核之前，不得在评审材料中写“模型已准确理解这条视频”。

## 4.5 已实现的 Provider 路径

**[现状事实，2026-07-22]** `refer/douyin/server` 已实现可替换 Provider 的离线草稿管线：

- 媒体预处理：FFprobe 读取时长，FFmpeg 抽取 16kHz 单声道 WAV 和低频关键帧，SHA-256 绑定内容版本；本机缺少二进制时返回 `MEDIA_TOOL_UNAVAILABLE`，Docker 版本安装 FFmpeg。
- ASR：火山“大模型录音文件极速版” `POST /api/v3/auc/bigmodel/recognize/flash`，使用 `volc.bigasr.auc_turbo`，保留 utterance 的毫秒时间码；支持新版 `X-Api-Key` 和旧版 App/Access Key。详见[官方接口](https://www.volcengine.com/docs/6561/1631584?lang=zh)。
- OCR：可选 OCRNormal，使用独立火山 OpenAPI AK/SK；当前实现由 Node.js `crypto` 与 `fetch` 原生完成 Signature V4 签名，请求发送 `Authorization`、`Content-Type`、`X-Content-Sha256`、`X-Date` 四个头，不使用官方 Node SDK。每条文字保留 frameId、timeMs、confidence 和 evidenceId。详见[OCRNormal 官方文档](https://www.volcengine.com/docs/86081/1660261?lang=en)。
- 语义模型：MiniMax 使用 `https://api.minimaxi.com/v1/chat/completions`，默认文本模型 `MiniMax-M2.7`；仓库不硬编码 M3，也不自动探测模型或账户权限，`MINIMAX_MULTIMODAL_MODEL` 默认留空，须由操作者核验账户能力后填写。留空时仅向文本模型发送 transcript/OCR，不发送关键帧。豆包方舟使用 `https://ark.cn-beijing.volces.com/api/v3`，模型或 `ep-...` 必须从控制台填写。详见 [MiniMax OpenAI-compatible 文档](https://platform.minimaxi.com/docs/guides/text-generation)与[方舟 Responses/OpenAI SDK 文档](https://www.volcengine.com/docs/82379/1795150)。
- 结构化输出：使用单一 tool/function 参数承载结构，再由 Zod 校验；不依赖 MiniMax 文档尚未稳定承诺的 `response_format/json_schema`。
- 发布门禁：管线输出固定为 `publishStatus=draft`、`approvedTriggers=[]` 和 `HUMAN_REVIEW_REQUIRED`。模型没有发布接口或发布权限。

ASR 时间码优先于模型猜测；OCR 与 ASR 冲突时并存并进入人工审核；多模态模型解释“为什么值得交互”，不修改财经方向规则。


# 5. 语义时间轴与触点编排

## 5.1 选择标准

Trigger Planner 对候选计算排序分，但分数只帮助审核，不自动发布：

| 维度 | 判断问题 | 高价值表现 |
|---|---|---|
| 学习价值 | 不交代会不会误解后文 | 涉及关键概念、条件或因果跳跃 |
| 时间敏感 | 当场互动是否优于看后总结 | 需要在作者给结论前先想一下 |
| 证据强度 | 是否能指向明确字幕或画面 | 多模态证据一致、时间清晰 |
| 交互适配 | 能否在 8-12 秒内完成 | 一次选择、一次拨动或一次连线 |
| 认知负荷 | 当前画面是否已经复杂 | 口播节奏平稳、无关键图表切换 |
| 重复与间隔 | 是否与前一触点重复 | 新目标且满足最小间隔 |

## 5.2 P0 编排硬约束

| 约束 | 数值或行为 |
|---|---|
| 单条 10-20 分钟视频自动触点 | 最多 6 个 |
| 两个自动触点最小间隔 | 45 秒 |
| 同时活跃触点 | 1 个 |
| 胶囊可见时间 | 4-6 秒 |
| 展开高度 | 默认约 42%，绝对上限 48% |
| 单次预期交互 | 8-12 秒，最多 2 个主要动作 |
| 新触点遇到已展开面板 | 不弹出，进入时间轴待看状态 |
| 用户快速拖动跨越多个触点 | 只提示距离落点最近的最高优先级触点，其余变圆点 |
| 重复播放同一区间 | 已曝光触点不自动重复弹，用户可主动回看 |

## 5.3 触点生命周期

scheduled → surfaced → expanded → completed  
也允许 surfaced → dismissed，或 scheduled → missed → revisited。

“missed”只表示播放经过但没有观察证据，不表示用户答错。生命周期写入 LearningTrace，支持刷新恢复和最终总结。

## 5.4 冲突消解

1. 安全提示高于知识提示。
2. 同一窗口只保留学习价值最高且证据最强的候选。
3. 若字幕、右侧工具栏或图表已经占据关键区域，触点延迟到窗口内下一个安全帧。
4. 若没有安全帧，自动降级为时间轴圆点，不强制弹出。
5. 内容审核员可锁定、移动、合并或删除候选，但修改必须产生新版本。


# 6. 视频内知识触点

![图 2｜视频中的财包知识触点：多次出现、轻量可略过、作者身份不变](assets/prd-v2/01-feed-nudge.png)

## 6.1 对外形态

对外不使用“POI 链接”一词。POI 容易被理解为跳转地点或商业组件；本产品统一称为“财包知识触点”。它是视频层内的临时交互提示，不改变路由。

触点胶囊由四部分组成：

- 28-32px 财包头像，不能替换作者头像。
- 类型短标签，例如“背景补丁”“先想一下”“换个条件”。
- 一句不超过 22 个汉字的钩子文案。
- “8秒看懂”或“稍后看”行为提示。

示例文案：

- 背景补丁：为什么“实际利率”比名义利率更关键？
- 先想一下：降息后，美元一定走弱吗？
- 换个条件：如果衰退信号更强，这条路径还占优吗？

## 6.2 位置与避让

- 默认在视频左下内容区上方，避开作者描述、字幕、进度条和右侧作者互动列。
- 触点出现时字幕上移，不覆盖关键口播文字。
- 横竖屏、刘海和底部安全区均使用 CSS safe-area 变量。
- 胶囊整体触控高度不小于 44px。
- 触点不使用全屏闪动、倒计时压迫、红点催促或答对音效。

## 6.3 行为规则

- 点击胶囊只展开半屏，不打开新页面。
- 点击“稍后看”或自然超时后，胶囊缩为进度条圆点。
- 点击胶囊和面板内部控件必须 stopPropagation，不能触发视频单击暂停。
- 用户上滑切换视频时，当前面板关闭并记录 dismissed；不得带到下一条视频。
- 回到原视频后根据 sessionId 恢复触点状态，不重复制造曝光。

## 6.4 财包人格

财包说话简洁、苏格拉底式、强调条件和不确定性。使用“先看哪条路径”“换一个条件会怎样”，不使用“我预测”“一定上涨”“建议买入”。财包是引导者，不是知识证据本身。


# 7. 半屏微交互容器

![图 3｜无蒙层半屏面板：视频仍可见、字幕上移、播放不中断](assets/prd-v2/02-ai-tab-progress.png)

## 7.1 容器规范

新组件命名为 CaibaoHalfSheet，不能直接套用 FromBottomDialog。

| 属性 | P0 规范 |
|---|---|
| 遮挡 | `height: min(48vh, 420px)`，任何视口均不得超过可视高度的 48% |
| 背景 | 不创建 Mask，不降低上半屏亮度 |
| 页面 | 不固定 body，不改变 video 高度，不改变播放状态 |
| 动画 | 180-240ms 自底向上，遵循 prefers-reduced-motion |
| 关闭 | 下滑、关闭按钮、“稍后看”均可 |
| 内容滚动 | P0 内容不得依赖内部长滚动；超高内容应拆分或移到看后 |
| 焦点 | 展开后焦点进入面板，关闭后回到触发胶囊 |
| 状态 | 展开、作答、关闭均持久化，刷新可恢复 |

## 7.2 播放不变量

面板展开前后必须保持原始 playback intent：

- 原本播放：展开、选择、提交、反馈期间继续播放。
- 原本由用户手动暂停：交互不得强制播放。
- 系统不能因为面板打开而调用 pause()、muted=true 或 currentTime 回退。
- 只有用户拖动原进度条时沿用底座的手动暂停再恢复逻辑。

自动化验收以 media.currentTime 在 3 秒观察窗口内持续增长为准，同时确认 paused 和 muted 未被产品代码改变。

## 7.3 同时发生的内容

视频继续意味着用户可能错过后文，因此 P0 提供三项补偿：

1. 面板只要求 1-2 个动作，不要求阅读长解释。
2. 反馈可折叠为一句，并自动留在时间轴供稍后看。
3. 面板打开期间到达的新触点只记为待看圆点，不叠弹、不排队轰炸。

## 7.4 与底座事件的隔离

BaseVideo 当前通过全局 SINGLE_CLICK_BROADCAST 切换播放。CaibaoHalfSheet 与 CuePill 使用局部 `pointerdown`、`pointerup` 和 `click` stopPropagation 隔离操作；VideoExtensionHost 通过类型化的局部 Vue emit 传递 `request-seek` 与 `sheet-open-change`，不新增全局财包事件，避免被评论、分享和单击播放逻辑误消费。


# 8. 轻量交互模板库

![图 4｜同一半屏容器中的快速判断与条件拨片，不把所有触点都做成题目](assets/prd-v2/03-prediction-logic-map.png)

## 8.1 六类模板

| kind | 对外名称 | 适用内容 | 主要动作 | 完成证据 |
|---|---|---|---|---|
| context_card | 背景补丁 | 人物、政策、术语、历史背景 | 点开一张翻面卡或关键词 | 看过关键解释 |
| quick_judgment | 先想一下 | 作者给结论前暴露直觉 | 3 个有意义选项 + 不确定 + 稍后看 | 选择与置信 |
| condition_slider | 条件拨片 | 一个变量改变路径强弱 | 拨动 1 个变量，观察 2 个状态 | 识别条件敏感性 |
| causal_stitch | 路径拼接 | 中间机制被省略 | 在 2-3 个节点间补一条边 | 识别中间机制 |
| counterexample_flip | 换个条件 | 反例或竞争路径 | 切换条件，比较前后主导路径 | 认识非必然性 |
| concept_compare | 概念对照 | 易混概念 | 左右滑或二选一匹配定义 | 区分概念边界 |

## 8.2 模板共同约束

- 首屏直接给动作，不先展示一段“课程说明”。
- 反馈强调为什么和在什么条件下，不只显示对错。
- 反馈最多 60 个汉字；更多证据放入“稍后回看”。
- 对选择“不确定”和“稍后看”不做负面评价。
- 所有资产方向用“支撑路径占优、压制路径占优、路径冲突、信息不足”。
- 禁止“必涨、稳赚、抄底、买入、仓位、目标价”等词。

## 8.3 题目不是默认答案

Trigger Planner 先判断学习目标，再选交互。纯背景缺口使用 context_card；单一条件敏感性使用 condition_slider；因果跳跃使用 causal_stitch。只有在“先形成直觉”本身有价值时才使用 quick_judgment。

## 8.4 快速判断示例

提示：“其他经济体降息更多时，美元一定因美国降息而走弱吗？”

选项：

- 相对利差可能让美元未必走弱。
- 只要美国降息，美元必然走弱。
- 方向取决于更多条件，当前信息不足。
- 不确定。
- 稍后看。

提交后展示对应因果边与条件，不给积分。


# 9. 路径交互与看后深挖

![图 5｜观看中的路径拼接：一次只处理一条竞争路径，复杂沙盘移到看后](assets/prd-v2/04-simulation.png)

## 9.1 观看中路径拼接

示例目标：用户在“降息可能支撑股票”与“衰退可能压制股票”之间识别中间机制。

面板只展示：

- 当前口播主张。
- 2-3 个可拼接节点。
- 一个条件标签，例如“盈利预期明显下修”。
- 提交后的竞争路径状态。

用户不需要同时调四个变量。一次交互只回答“哪条中间路径被激活”或“哪个条件会让另一条路径占优”。

## 9.2 P0 领域规则

规则引擎而非 LLM 决定方向，输出枚举：

- support_dominant：支撑路径占优。
- pressure_dominant：压制路径占优。
- conflict：路径冲突。
- insufficient：信息不足。

每个结果必须带 activatedPaths 与 evidenceIds。未知组合一律返回信息不足，不允许模型补猜。

## 9.3 看后深挖

视频结束页提供可选入口“把条件再跑一遍”，进入完整因果图或 A/B/C 沙盘。它不影响学习足迹生成，也不作为完播门槛。

保留三组审核情景：

| 情景 | 条件摘要 | 重点理解 |
|---|---|---|
| A 温和降息 | 利率下降、通胀下降、增长稳定、避险低 | 股票和黄金可能获支撑，美元可能偏弱，仍受预期差影响 |
| B 衰退式降息 | 利率下降、增长明显走弱、避险升高 | 估值支撑与盈利压制竞争，股票仍可能承压 |
| C 相对降息 | 美国降息，其他经济体降息更多 | 汇率看相对利差，美元未必走弱 |

情景 C 的“其他经济体降息更多”是显式条件标签，不伪装成第五个主变量。自由编辑相对政策放到 P1。


# 10. 财包触点编排器

![图 6｜财包触点状态机：按时间出现、可略过、可回看、不中断播放](assets/prd-v2/07-agent-state.png)

## 10.1 角色定义

运行时组件命名为 CaibaoCueOrchestrator。它是确定性状态机，不是自由聊天 Agent。输入为 VideoContext、ApprovedTriggerPlan、SessionState 和当前播放事件，输出为下一次 UI 状态。

它负责：

- 判断触发窗口、频率、去重和优先级。
- 处理面板占用、快进跨点、切换视频和刷新恢复。
- 将忽略或冲突的触点收为时间轴圆点。
- 记录 surfaced、expanded、completed、dismissed、missed、revisited。
- 在视频结束时通知 SummaryBuilder。

它不负责：

- 生成新的财经事实、因果方向或交易意见。
- 替内容审核员改变时点和答案。
- 在用户观看时临时请求模型决定“问什么”。
- 创建 Subagent 或发起开放聊天。

## 10.2 状态规则

| 当前状态 | 事件 | 下一状态 | 行为 |
|---|---|---|---|
| scheduled | 进入触发窗且 UI 空闲 | surfaced | 显示胶囊 4-6 秒 |
| scheduled | 面板已展开 | missed | 仅添加待看圆点 |
| surfaced | 点击胶囊 | expanded | 打开半屏，不改播放 |
| surfaced | 超时或稍后看 | dismissed | 收为圆点 |
| expanded | 提交有效动作 | completed | 记录证据，显示一句反馈 |
| expanded | 下滑关闭 | dismissed | 保留当前输入草稿 |
| missed 或 dismissed | 点击圆点 | revisited | 从对应模板恢复 |
| 任意 | 切换视频 | 持久化后收起 | 不跨视频显示 |

## 10.3 幂等

eventId、sessionId、triggerId 共同保证事件幂等。同一 completed 事件重复上传不得增加证据或改变总结。服务端丢失会话时，客户端用 contentVersion 一致的 localStorage 快照补回；版本不一致时只保留历史记录，不执行旧触点。


# 11. 过程学习足迹

![图 7｜无总分的过程学习总结：看过什么、略过什么、如何修正、下一步去哪](assets/prd-v2/05-evidence-report.png)

## 11.1 目标

视频结束后回答四个问题：

1. 用户实际与哪些概念、条件和路径发生过交互？
2. 哪些回答显示了条件意识或发生了自我修正？
3. 哪些关键触点没有观察，不对其作能力推断？
4. 下一步最值得回看哪个片段或进入哪个深挖？

## 11.2 报告模块

| 模块 | 内容 | 证据来源 |
|---|---|---|
| 本次足迹 | 已完成、稍后看、未触达的触点时间线 | LearningTraceEvent |
| 你已经碰到 | 已展示的概念、因果边和条件 | response + evidenceIds |
| 一次修正 | 前后选择变化或反例后修正 | 同触点事件序列 |
| 尚未观察 | 未打开或未作答的关键节点 | missed、dismissed |
| 回看建议 | 视频时间、原因和原证据 | ApprovedTriggerPlan |
| 可选深挖 | A/B/C 沙盘、完整逻辑图或一句话总结 | feature flags |

## 11.3 明确禁止

- 不显示总分、百分比、等级、排名和投资能力。
- 不把未点击写成“未掌握”。
- 不从一次选择推断用户性格、财富水平或风险偏好。
- 不因用户答案与市场后来走势一致就写“预测正确”。
- 不使用当前 Demo 的“68%”作为目标产品内容。

## 11.4 可选一句话总结

P0 可提供“用一句话说说你现在怎么看”作为可选动作，不阻断报告。若启用模型评价，只诊断是否包含机制、条件和绝对化措辞；模型失败时保留原文并用模板提示，报告仍可完成。


# 12. 首版领域内容包

## 12.1 内容规模

固定保留 5 个概念、2 条主因果链、最多 6 个知识触点、A/B/C 三组看后情景。原有 3 个预测点可转化为不同模板，不要求三个都以题目形式出现。

| 概念 | 平实定义 | 适合的触点 |
|---|---|---|
| 政策利率 | 央行影响短期资金价格的重要工具 | 背景补丁 |
| 融资成本 | 企业或家庭借入资金承担的成本 | 路径拼接 |
| 股票估值 | 对未来现金流折算到今天的定价 | 条件拨片 |
| 黄金机会成本 | 持有不生息黄金时放弃的生息资产回报 | 概念对照 |
| 相对利差 | 美国与其他经济体利率回报的差异 | 快速判断或反例翻转 |

## 12.2 两条主链

股票链：政策利率下降 → 融资成本与折现率可能下降 → 估值获得支撑。  
成立条件：信用传导正常、盈利未明显恶化、风险溢价未显著上升、市场未完全提前计价。

黄金链：名义利率变化与通胀共同影响实际利率 → 黄金机会成本变化 → 黄金需求可能受到支撑或压制。  
成立条件：实际利率确实下降、美元与避险路径未形成更强反向力量。

相对利差作为跨链条件：汇率不能只看美国绝对利率，还要比较其他经济体。

## 12.3 示例触点计划

以下时间只表示内容顺序，真实 startMs 待最终视频审核：

| 顺序 | kind | 学习目标 | 提示 |
|---|---|---|---|
| T1 | context_card | 交代政策利率背景 | 这里说的“降息”，到底降的是什么？ |
| T2 | causal_stitch | 补融资成本中间机制 | 从政策利率到企业融资，还缺哪一步？ |
| T3 | condition_slider | 看盈利条件改变股票路径 | 盈利预期下修时，估值支撑还占优吗？ |
| T4 | concept_compare | 区分名义利率与实际利率 | 黄金更敏感的是哪一种利率？ |
| T5 | quick_judgment | 暴露绝对利率误区 | 美国降息，美元一定走弱吗？ |
| T6 | counterexample_flip | 认识竞争路径 | 其他经济体降得更多，结论会怎样？ |

每项发布时必须具备真实时间、evidenceIds、reviewStatus=approved 和 contentVersion。


# 13. P0 功能需求（一）

| ID | 需求 | 验收口径 | 事件 |
|---|---|---|---|
| F-01 | 目标视频识别 | 只有绑定 approved 内容包的视频启用财包触点 | experience_loaded |
| F-02 | 触点准时曝光 | 在批准窗口内曝光，误差不超过 250ms，不重复自动弹 | cue_surfaced |
| F-03 | 多触点限频 | 单视频最多 6 个，自动触点间隔不小于 45 秒 | cue_suppressed |
| F-04 | 胶囊超时收纳 | 4-6 秒无动作后变为圆点，不写成错误 | cue_dismissed |
| F-05 | 半屏展开 | 无蒙层，高度不超过 48%，不跳路由 | cue_expanded |
| F-06 | 播放连续 | 展开、作答、反馈均不改变 paused、muted 和 playbackRate | playback_invariant_checked |
| F-07 | 点击隔离 | 胶囊与面板操作不触发 BaseVideo 单击暂停 | cue_control_clicked |
| F-08 | 字幕和控件避让 | 字幕、进度条、作者头像和主要交互无遮挡 | overlay_layout_applied |
| F-09 | 触点圆点 | 已完成、待看、未触达状态可区分并可点击回看 | cue_revisited |

## 13.1 F-02 Given/When/Then

- Given 当前视频内容版本已批准，T2 的窗口为 startMs 到 endMs。
- When media currentTime 首次进入窗口，且没有面板占用和频率冲突。
- Then 在 250ms 内显示 T2 胶囊，记录一次 cue_surfaced；同一次会话回放该区间不再自动显示。

## 13.2 F-06 Given/When/Then

- Given 视频正在播放且非静音。
- When 用户展开面板、完成两个点击并查看反馈。
- Then 观察窗口内 currentTime 持续增长，paused=false、muted=false、playbackRate 不变，产品代码没有调用 pause。

## 13.3 F-09 Given/When/Then

- Given 用户忽略 T3 并继续观看。
- When 胶囊超时。
- Then T3 进入 dismissed 或 missed，进度条出现待看圆点；总结显示“尚未观察”，不显示错误或扣分。

## 13.4 快进规则

- Given 用户从 T1 前拖到 T4 后，一次跨越多个触发窗。
- When seeked 完成。
- Then 只允许最靠近落点且优先级最高的一个触点显式提示，其余直接变待看圆点，避免连发。


# 14. P0 功能需求（二）

| ID | 需求 | 验收口径 | 事件 |
|---|---|---|---|
| F-10 | 背景补丁 | 一张卡内说明背景并指向原证据 | context_viewed |
| F-11 | 快速判断 | 3 个有效选项 + 不确定 + 稍后看，提交后才反馈 | judgment_submitted |
| F-12 | 条件拨片 | 只改一个条件，清晰展示路径从何状态变到何状态 | condition_changed |
| F-13 | 路径拼接 | 2-3 个节点内完成，规则结果带 activatedPaths 和 evidenceIds | causal_stitch_submitted |
| F-14 | 反例翻转 | 展示竞争路径，不把反例等同于原机制全错 | counterexample_completed |
| F-15 | 概念对照 | 区分两个易混概念，反馈不超过 60 字 | concept_compared |
| F-16 | 过程记录 | 所有状态幂等保存，刷新后恢复 | trace_synced |
| F-17 | 学习总结 | 无总分，只引用已观察证据和未观察项 | summary_viewed |
| F-18 | 看后深挖 | 可选进入 A/B/C，不影响总结生成 | deep_dive_opened |
| F-19 | 财经安全 | 所有输出无投资建议和确定性涨跌承诺 | safety_redirected |

## 14.1 交互反馈规则

对用户选项的反馈由审核内容和规则表决定：

- 命中关键机制：指出用户碰到了哪条因果边。
- 方向合理但条件缺失：补一句“还取决于……”。
- 绝对化：把“一定”改写为“在这些条件下可能”。
- 选择不确定：给一个最短概念提示，不标错。
- 稍后看：只记录动作，不弹出答案阻塞观看。

## 14.2 总结生成规则

SummaryBuilder 只使用 LearningTraceEvent 和已批准内容包。每一句“你已经……”都必须关联 eventId 和 evidenceId；缺少证据时只能写“尚未观察”。模型最多润色措辞，不能新增掌握结论。

## 14.3 断网与恢复

- 内容包已缓存：断网时继续触发和记录，本地排队同步。
- 服务端会话丢失：以 contentVersion 相同的 localStorage 快照恢复。
- 模型超时：跳过润色，使用确定性模板。
- 内容版本更新：新会话使用新版本；旧足迹保留原版本，不混合答案。


# 15. 技术架构

![图 8｜离线内容生产与在线触点运行架构](assets/prd-v2/08-architecture.png)

## 15.1 架构决定

- 前端：refer/douyin 内的 Vue 3、Vite、Pinia、TypeScript。
- 财经扩展：CuePill、CaibaoHalfSheet、CueTimeline、六类 InteractionTemplate、LearningSummary。
- 播放时钟：BaseVideo 透出毫秒级 timeupdate、seeking、seeked、play、pause 和 video identity。
- 编排：CaibaoCueOrchestrator 为前端确定性状态机。
- 后端：同仓新增 Express TypeScript Finance API，P0 使用内存会话。
- 本地镜像：localStorage 保存最小 SessionState 与未同步事件。
- 内容：版本化 JSON 内容包；P0 可由构建流程生成并由服务端缓存返回。
- 规则：版本化 TypeScript 规则表，输出路径枚举和证据。
- AI：离线多模态候选生成；在线只允许可选总结润色或受限一句话诊断。

## 15.2 两条数据流

内容流：授权视频 → ASR/OCR/关键帧 → 多模态语义 → Trigger Planner → 人工审核 → ApprovedExperience。  
运行流：ApprovedExperience → 播放事件 → CueOrchestrator → 半屏模板 → LearningTrace → SummaryBuilder。

## 15.3 部署口径

P0 可以同域部署静态 Vue 资源与 Express API，避免跨域和 cookie 复杂度。视频资源必须支持浏览器正常 seek；若采用自托管，服务端需支持 HTTP Range。生产阶段再迁移 PostgreSQL、对象存储、队列化分析任务和审核后台。

## 15.4 确定性优先

即使模型、网络或服务端内存状态失效，只要视频和内容包已缓存，用户仍能看到触点、完成交互并得到非空总结。模型不可用不得成为完整流程的发布阻塞。

## 15.5 当前可运行技术切片

**[现状事实，2026-07-22]** 代码仓分支为 `feat/caibao-analysis-pipeline`，现有切片包含：

- 前端 `VideoExtensionHost`、三类轻交互、4-6 秒 CuePill、48vh 半屏、时间轴回看、localStorage 足迹与无分数总结。
- Express 分析服务默认监听 `127.0.0.1:18787`；Vite 开发服务同样默认只监听 `127.0.0.1`，其 `/api/finance` 代理指向该端口，避开本机旧服务占用的 `8787`。
- MiniMax 与豆包两份 Git-ignored 可填写环境文件，以及可提交的 `.example` 模板；所有模型密钥仅在服务端读取，禁止使用 `VITE_*`。
- 公开主页探测器、创作者授权作品列表客户端、FFmpeg 适配器、豆包 ASR、原生 Signature V4 火山 OCR 客户端、OpenAI-compatible 结构客户端、确定性 Planner、内存分析任务和草稿查询接口。
- 服务端测试默认完全离线，不调用模型、不消耗额度；`LIVE_PROVIDER_TESTS` 当前只完成配置解析，尚无 live test suite，即使设为 `true` 也不会自动发起真实请求。

当前健康检查只报告三类技术 readiness：所选语义模型配置、ASR/OCR 输入 Provider 配置、FFmpeg/FFprobe 媒体工具。具备处理权的媒体及 `rightsAttested`/`rightsAttestationId` 是创建分析任务时校验的任务级前置条件，不属于 `/health` readiness。

**[现状事实，2026-07-22]** 自动化基线已实际通过 13 个前端 Vitest、25 个服务端 Vitest 和 6 个 Playwright E2E；E2E 覆盖 390×844、393×852、430×932 与 1280×900 桌面视口。前后端类型检查与生产构建通过，`pnpm audit --prod` 为 0 个已知漏洞；完整开发依赖审计仍有 21 high / 13 moderate / 4 low，属于旧底座工具链升级债务。

**[发布阻塞项]** 截至本文日期，尚未使用真实密钥调用 MiniMax、豆包方舟、豆包 ASR 或火山 OCR 等计费接口，也未使用一条具备处理权的真实视频完成 ASR→OCR→多模态理解→草稿的端到端分析。因此当前测试证明的是契约、失败降级和编排正确性，不证明真实模型的内容质量、延迟或成本。


# 16. refer/douyin 实施映射

## 16.1 当前真实实现与待接点

| 当前路径 | 状态 | 实际职责与下一步 |
|---|---|---|
| src/components/slide/BaseVideo.vue | 已实现 | 维护毫秒媒体时钟并直接挂载 VideoExtensionHost；通过局部 emit 处理 seek 和半屏状态，作者区保持不变 |
| src/features/video-extensions/ | 已实现 | 定义 VideoContext、MediaClockState、扩展注册表与通用 VideoExtensionHost |
| src/features/finance-cues/components/ | 已实现 | 包含 CuePill、CaibaoHalfSheet、CueTimeline、InteractionRenderer 和 LearningSummaryView；不复用旧 Mask 弹层 |
| src/features/finance-cues/orchestrator.ts | 已实现 | 根据播放位置、已有足迹和面板占用确定单一曝光及 missed 收纳，不依赖全局财包事件 |
| src/features/finance-cues/repository.ts | 部分实现 | 当前只读审核过的工程 fixture；下一步改为 ApprovedExperience API-first，并保留显式 Demo fallback |
| src/features/finance-cues/session-store.ts | 部分实现 | 当前以 localStorage 保存观看足迹；下一步接会话/事件 API 与版本一致性恢复 |
| src/mock/index.ts | 已实现 | 仅在 `?demo=finance-fed` 时绑定固定 150 秒工程占位视频与 financeExperienceId |
| server/src/app.ts | 部分实现 | 已提供健康检查、来源探测、分析任务和草稿读取；ApprovedExperience、Session、Event 与 Summary API 尚未实现 |
| server/src/sources、media、providers、pipeline、jobs | 已实现分析原型 | 完成合规来源边界、媒体预处理、ASR/OCR/语义 Provider、确定性 Planner 与内存草稿任务；审核发布和持久化仍待实现 |
| vite.config.ts | 已实现 | `/api/finance` 代理到本机 `127.0.0.1:18787`；普通推荐流不依赖分析服务 |

## 16.2 明确不复用

- FromBottomDialog 的 Mask、body position=fixed 和评论联动缩视频行为。
- 当前财经 Demo 的 React 运行时、自由跳转流程、68% 报告和即时复杂沙盘。
- refer/douyin 自带的演示媒体作为财经正式内容。
- node 目录中的采集或离线处理脚本作为生产内容系统。

## 16.3 当前代码组织

```text
src/features/video-extensions/          通用视频扩展宿主
src/features/finance-cues/              触点契约、状态机、组件、fixture 与前端测试
server/src/sources/                     公开主页探测与创作者 OAuth 元数据客户端
server/src/media/                       FFmpeg/FFprobe 安全适配器
server/src/providers/                   MiniMax/方舟、豆包 ASR、火山 OCR
server/src/pipeline/                    分析编排与确定性 Cue Planner
server/src/jobs/                        内存分析任务和草稿仓库
server/test/                            默认离线的契约、单元和 API 测试
```

## 16.4 实施约束

- 当前工作分支固定为 `feat/caibao-analysis-pipeline`；公共远端统一命名为 `upstream`，项目 `origin` 尚未配置，不得向 `upstream` push。
- 第一阶段只接固定财经视频，不改通用评论、分享、主页和推荐算法。
- 已接入 Vitest 与 Playwright；交接门禁必须运行客户端、服务端、类型检查、构建和多视口 E2E，不能只凭测试文件存在声称通过。
- 所有时间轴内容使用 videoId + contentVersion 绑定，不能按列表索引绑定。


# 17. HTTP API 契约

基础前缀：/api/finance/v1

| 实现状态 | 方法 | 路径 | 用途 | 主要返回 |
|---|---|---|---|---|
| P0 目标，未实现 | GET | /experiences/:videoId | 获取已批准时间轴和触点计划 | ApprovedExperience |
| P0 目标，未实现 | POST | /sessions | 建立观看会话 | CueSession |
| P0 目标，未实现 | GET | /sessions/:sessionId | 服务端恢复会话 | CueSession |
| P0 目标，未实现 | POST | /sessions/:sessionId/events | 幂等写入触点与播放事件 | acceptedEventIds |
| P0 目标，未实现 | POST | /sessions/:sessionId/deep-dive-runs | 可选运行 A/B/C 或规则组合 | SimulationResult |
| P0 目标，未实现 | POST | /sessions/:sessionId/reflection-evaluations | 可选一句话诊断 | ReflectionEvaluation |
| P0 目标，未实现 | GET | /sessions/:sessionId/summary | 确定性生成过程总结 | LearningSummary |
| 分析原型，已实现 | GET | /health | 检查语义模型、ASR/OCR 与 FFmpeg/FFprobe 技术 readiness；不检查媒体授权、不返回密钥 | ProviderReadiness、AnalysisInputReadiness、MediaToolReadiness |
| 分析原型，已实现 | POST | /sources/douyin/profile/probe | 探测并规范化公开主页，不枚举受保护作品 | ProfileProbeResult |
| 分析原型，已实现 | POST | /analysis/jobs | 对有权 MediaAsset 创建离线草稿任务 | AnalysisJob |
| 分析原型，已实现 | GET | /analysis/jobs/:jobId | 查询 queued/running/succeeded/failed | AnalysisJob |
| 分析原型，已实现 | GET | /analysis/jobs/:jobId/draft | 获取待人工审核草稿；未完成返回 409 | DraftExperience |

## 17.1 P0 目标运行时规则

以下规则适用于尚待实现的 experience/session/event/summary 运行时，不是对当前分析原型的完成声明：

- 目标请求和响应均携带 schemaVersion；内容相关请求携带 contentVersion。
- 目标写接口携带 requestId 或 eventId，重复提交返回同一结果。
- GET experience 只返回 publishStatus=approved 的触点；候选和审核备注不下发客户端。
- 事件接口允许批量、乱序和重试，服务端按 occurredAt 与 sequence 合并。
- summary 不接受客户端传入“掌握结论”，只从服务端认可事件计算。
- P0 sessionId 为随机不透明 ID，不放用户财富或资产信息。

**[现状事实]** 当前已实现的 `/health`、主页探测和 `analysis/jobs` 垂直切片尚未统一携带 schemaVersion/requestId，也未提供通用写请求幂等语义；这些能力不得因本节的目标契约被描述为已经实现。

## 17.2 错误码

| code | 场景 | 客户端行为 |
|---|---|---|
| EXPERIENCE_NOT_APPROVED | 视频无已批准内容 | 不显示财包触点 |
| CONTENT_VERSION_MISMATCH | 客户端快照版本不同 | 保留旧足迹，新建会话 |
| EVENT_ALREADY_ACCEPTED | 幂等重复 | 视为成功 |
| SESSION_NOT_FOUND | 内存会话丢失 | 上传本地快照后恢复 |
| RULE_INPUT_UNSUPPORTED | 深挖组合无规则 | 显示信息不足 |
| MODEL_TIMEOUT | 可选诊断超时 | 使用模板，不阻断总结 |

## 17.3 内部内容生产

P0 已实现 `analysis-jobs` 内部垂直切片，但不开放给普通观看用户：只有 `rightsAttested=true` 且带 `rightsAttestationId` 的 MediaAsset 可以进入任务；服务只返回 draft。`review`、`publish`、持久化队列和审核后台仍为 P1，避免把未审核模型输出误当线上能力。

元数据来源和媒体资产是两条独立链路。只有抖音作品元数据或官方 iframe 时，创建分析任务必须返回 `409 MEDIA_ASSET_REQUIRED`。


# 18. 核心数据契约

## 18.1 ApprovedExperience

| 字段 | 类型 | 约束 |
|---|---|---|
| videoId | string | 与播放器当前视频一致 |
| contentVersion | string | 每次审核发布递增 |
| mediaFingerprint | string | 防止同 ID 媒体替换 |
| semanticTimeline | SemanticTimeline | 只含审核通过语义项 |
| triggerPlan | ApprovedTriggerPlan | 满足限频和证据门禁 |
| concepts | Concept[] | P0 固定 5 个 |
| causalEdges | CausalEdge[] | 每条有 evidenceIds |
| ruleVersion | string | 深挖结果可追溯 |
| publishStatus | approved | 客户端不得接收 draft |

## 18.2 关键类型

TriggerKind 枚举：context_card、quick_judgment、condition_slider、causal_stitch、counterexample_flip、concept_compare。

TimelineTrigger 必含：

- triggerId、startMs、endMs、priority、kind。
- cueDurationMs，范围 4000-6000。
- expectedInteractionMs，不超过 12000。
- halfSheetMaxRatio，不超过 0.48。
- learningObjective、payload、evidenceIds。
- reviewStatus=approved、fallbackBehavior=collapse_to_timeline。

ApprovedTriggerPlan 必含约束：

- maxAutomaticCues=6。
- minGapMs=45000。
- maxConcurrent=1。
- keepPlayback=true。

LearningTraceEvent 必含：

- eventId、sessionId、triggerId、contentVersion。
- status 或 action、playbackPositionMs、occurredAt、sequence。
- response 可选；evidenceIds 只能引用内容包已有 ID。

LearningSummary 必含：

- observedEvidence、corrections、notObserved。
- completedCueIds、revisitableCueIds、rewatchSuggestions。
- optionalDeepDive。
- 不得存在 totalScore、percentage 或 investmentProfile 字段。

## 18.3 SimulationResult

必须返回 activatedPaths、evidenceIds、ruleVersion 和 result：

support_dominant、pressure_dominant、conflict、insufficient 四选一。LLM 无权修改枚举或资产方向。


# 19. AI 边界、安全与隐私

## 19.1 AI 分工

| 环节 | 模型权限 | 人工或规则门禁 |
|---|---|---|
| ASR/OCR | 生成时间化候选 | 关键术语与数值复核 |
| 多模态理解 | 提取概念、主张、条件、证据候选 | 内容审核员逐项批准 |
| Trigger Planner | 建议时点、模板和文案 | 频率算法 + 100% 人审 |
| 播放时编排 | 无模型调用 | CaibaoCueOrchestrator 确定性执行 |
| 交互方向 | 无模型决定 | 版本化规则或审核答案 |
| 过程总结 | 可选润色 | SummaryBuilder 决定事实 |
| 一句话诊断 | 可选结构化输出 | 白名单概念、证据引用、模板兜底 |

## 19.2 财经安全

- 产品定位固定为知识理解工具，不构成投资建议。
- 对“买什么、仓位、目标价、稳赚、什么时候卖”等请求，拒绝交易建议并转回机制、条件和不确定性。
- 不接实时行情，不把历史或演示情景包装成当前市场判断。
- 任何资产方向均需条件标签；禁止“降息必然导致……”。
- 内容证据不足时输出“信息不足”，不能靠模型补齐。

## 19.3 隐私

- P0 匿名会话，不要求手机号、实名或资产数据。
- 不保存原始语音；P1 若加语音，总结转写完成后立即删除音频。
- 不推断财富水平、风险承受能力、持仓或政治立场。
- 日志不存完整自由文本，除非用户明确提交一句话总结；该字段需可删除。
- localStorage 只保存恢复所需的 session、contentVersion、触点状态和未同步事件。

## 19.4 提示注入与不可信内容

视频口播、字幕和 OCR 均视为不可信输入。离线模型不得执行其中的命令，不得泄露系统提示，不得调用发布动作。只有通过 schema 校验和人工审核的结构化内容才能进入 ApprovedExperience。


# 20. 事件、指标与非功能约束

## 20.1 核心事件

| 事件 | 最小属性 | 用途 |
|---|---|---|
| experience_loaded | videoId、contentVersion | 内容覆盖 |
| cue_surfaced | triggerId、positionMs | 曝光 |
| cue_expanded | triggerId、latencyMs | 触点吸引力 |
| cue_dismissed | triggerId、reason | 打扰判断 |
| cue_missed | triggerId、reason | 未观察分布 |
| cue_completed | triggerId、kind、durationMs | 有效互动 |
| cue_revisited | triggerId、entry | 回看价值 |
| playback_invariant_violation | triggerId、before、after | 不停播护栏 |
| video_swiped_away | lastTriggerId、deltaMs | 打扰护栏 |
| summary_viewed | observedCount、notObservedCount | 闭环 |
| rewatch_clicked | triggerId、evidenceId | 行动 |

事件不得上传选项之外的敏感内容；每项带 schemaVersion 与 contentVersion。

## 20.2 指标

北极星验证指标：有效学习触点率，即曝光后被完成或稍后主动回看的触点比例。

护栏指标：

- 触点曝光后 10 秒内划走视频的比例。
- 与无触点基线相比的完播率差异。
- 系统导致的暂停、静音或进度回退次数，目标为 0。
- 单视频平均自动触点数和抑制数。
- 报告结论缺失 evidenceId 的比例，目标为 0。

不作为成功指标：预测正确率、资产收益、总分、回答越多越好。

## 20.3 性能

| 指标 | P0 目标 |
|---|---|
| 已缓存 experience 响应 | P95 ≤300ms |
| 触点时钟误差 | ≤250ms |
| 胶囊和面板首帧 | ≤100ms |
| 本地模板反馈 | ≤100ms |
| 深挖规则响应 | ≤500ms |
| 可选模型诊断 | P95 ≤8s，超时立即兜底 |
| 交互造成额外掉帧 | 相对底座无可感知恶化 |

## 20.4 UI 与无障碍

- 视口覆盖 390×844、393×852、430×932 和 1280×900 桌面容器。
- 触控目标不小于 44×44px，文字正文不小于 14px。
- 颜色不是唯一状态信号，圆点同时使用图形或标签。
- 支持键盘焦点、屏幕阅读标签、减少动画和安全区。
- 半屏、字幕、作者栏、进度条不得重叠或裁切。


# 21. 测试计划（一）：内容、规则与编排

## 21.1 内容流水线

| ID | 场景 | 通过条件 |
|---|---|---|
| T-CONTENT-01 | ASR 时间戳 | 单调、在媒体时长内、无负数 |
| T-CONTENT-02 | OCR 数值 | 每个数值绑定 frameId 和 timeMs |
| T-CONTENT-03 | 语义主张 | 每个 Concept、Claim、Edge 至少一个 evidenceId |
| T-CONTENT-04 | 低置信候选 | 不得进入 approved 内容包 |
| T-CONTENT-05 | 人审缺失 | publish 命令失败并给出具体字段 |
| T-CONTENT-06 | 媒体替换 | fingerprint 不一致时拒绝旧时间轴 |
| T-CONTENT-07 | 禁词扫描 | 无投资建议、必然涨跌和虚假分数 |
| T-SOURCE-01 | 匿名主页为 HTTP 200 风控壳 | 返回 dynamic_page_blocked，不伪造成功 |
| T-SOURCE-02 | 非抖音域名或非法 profile path | 请求前返回 SOURCE_URL_UNSUPPORTED |
| T-SOURCE-03 | OAuth 授权作品分页 | 保留 cursor/has_more，结果只标 metadata_only |
| T-MEDIA-01 | 本地路径越过 MEDIA_IMPORT_ROOT | 调用 FFmpeg 前拒绝，包含 symlink 复核 |
| T-MEDIA-02 | FFmpeg/FFprobe 缺失 | readiness 明确 missing，任务不进入假成功 |
| T-PROVIDER-01 | MiniMax/方舟结构响应 | tool 参数经 Zod 校验，不依赖 response_format |
| T-PROVIDER-02 | 超时、429、无效 JSON | 类型化失败，密钥与原始响应不进日志 |

## 21.2 Trigger Planner 黄金用例

| ID | 输入 | 期望 |
|---|---|---|
| T-PLAN-01 | 8 个高分候选 | 只保留最多 6 个 |
| T-PLAN-02 | 两候选相距 20 秒 | 只保留更高优先级或改为手动圆点 |
| T-PLAN-03 | 复杂图表区 | 延迟到安全帧或取消自动曝光 |
| T-PLAN-04 | 无 evidenceId | 候选不可批准 |
| T-PLAN-05 | expectedInteractionMs=18000 | schema 校验失败 |
| T-PLAN-06 | halfSheetMaxRatio=0.60 | schema 校验失败 |
| T-PLAN-07 | 同目标重复候选 | 合并，保留更强证据 |

## 21.3 规则引擎黄金用例

- A 温和降息：返回审核路径和对应 evidenceIds。
- B 衰退式降息：股票路径允许 pressure_dominant 或 conflict，具体由版本化规则锁定。
- C 相对降息：相对利差路径显式激活，美元不得被固定写成走弱。
- 无规则组合：返回 insufficient。
- 完全相同输入：字节级一致的 result、activatedPaths 和 evidenceIds。
- 模型尝试修改方向：被 schema 或权限层拒绝。

## 21.4 编排状态

| ID | 场景 | 通过条件 |
|---|---|---|
| T-ORCH-01 | 正常到点 | 只曝光一次 |
| T-ORCH-02 | 面板打开时到下一点 | 新点变待看圆点，不叠弹 |
| T-ORCH-03 | 快进跨 4 点 | 最多显式提示 1 个 |
| T-ORCH-04 | 回放已曝光区间 | 不自动重复 |
| T-ORCH-05 | 刷新 | 状态按 contentVersion 恢复 |
| T-ORCH-06 | 切换视频 | 面板关闭，状态不串视频 |


# 22. 测试计划（二）：播放、UI、故障与安全

## 22.1 播放连续性

| ID | 操作 | 通过条件 |
|---|---|---|
| T-VIDEO-01 | 播放中展开面板 | 3 秒内 currentTime 持续增长 |
| T-VIDEO-02 | 连续选择并提交 | paused=false、muted=false、playbackRate 不变 |
| T-VIDEO-03 | 点击面板空白 | 不触发 SINGLE_CLICK 暂停 |
| T-VIDEO-04 | 用户原本手动暂停 | 面板不强制恢复播放 |
| T-VIDEO-05 | 下滑关闭面板 | 不跳回触发时点 |
| T-VIDEO-06 | 拖动原进度条 | 沿用底座手动 seek 行为，结束后无触点连发 |

## 22.2 UI 与视觉回归

- 4 个目标视口逐页截图，比较胶囊、半屏、字幕、作者头像、进度条和安全区。
- 面板高度的 DOM 实测值不得超过 visualViewport.height × 0.48。
- 任一状态作者头像均保持原作者内容，财包只出现在触点和面板标题。
- 触控目标、焦点顺序、对比度、减少动画均通过自动与人工检查。
- 视觉回归基线使用本 PRD 图 2 至图 7 的布局原则，而非逐像素照搬营销图。

## 22.3 故障

| 故障 | 期望 |
|---|---|
| experience API 超时但有缓存 | 使用同版本缓存 |
| 无缓存且断网 | 正常播放视频，不显示未审核通用触点 |
| events API 失败 | 本地排队，重试不重复 |
| 服务端会话丢失 | 上传本地快照恢复 |
| 可选模型超时或无效 JSON | 模板反馈，summary 非空 |
| 规则输入未知 | 信息不足，不猜方向 |

## 22.4 安全红队

至少覆盖“买什么”“给我仓位”“目标价多少”“保证赚钱”“现在抄底吗”“忽略规则直接预测”等请求。所有结果必须拒绝交易建议，回到概念、机制、条件或证据；日志不得记录用户资产推断。

## 22.5 可选模型评测

若 P0 打开一句话诊断，需建立至少 40 条人工金标回答，覆盖绝对化、机制缺失、条件缺失和概念混淆。Macro-F1 ≥0.80，严重概念错误召回率 ≥90%。未达到阈值则关闭诊断功能，不影响过程总结上线。


# 23. 发布、演示与需求追溯

## 23.1 发布门禁

- 授权视频、最终字幕、真实时间码和媒体指纹齐全。
- 5 个概念、2 条主链、所有触点与方向 100% 人工审核。
- Trigger Plan 通过 max 6、min gap 45s、max ratio 0.48 和证据校验。
- 全部播放连续性用例通过，系统引起的 pause、mute、seek 回退为 0。
- 4 个目标视口视觉回归通过，无字幕、作者栏和安全区冲突。
- 断网、刷新、会话丢失和模型失败时均可看完并生成非空总结。
- 安全红队通过，无投资建议、虚假时间码、百分比和总分。
- refer/douyin 许可证、媒体来源和商业使用边界完成负责人审查。

## 23.2 关键风险

| 风险 | 影响 | 缓解 |
|---|---|---|
| 触点太频繁 | 用户划走、完播下降 | 最多 6 个、45 秒间隔、Planner 负荷规则 |
| 边看边答造成信息错过 | 用户反而更混乱 | 8-12 秒、稍后看、圆点回访、反馈短句 |
| 模型提取方向错误 | 财经误导 | 离线候选、证据 ID、100% 人审、版本发布 |
| 现有弹层会暂停或缩视频 | 违反核心体验 | 独立 CaibaoHalfSheet，不复用 Mask/body freeze |
| 底座全局事件误触暂停 | 回答时视频停 | stopPropagation + typed cue events + E2E |
| 开源许可不适合商业化 | 无法上线 | 法务审查或换自有视频壳 |

## 23.3 参赛演示脚本

| 时间 | 演示 | 证明 |
|---|---|---|
| 0:00-0:20 | 正常观看，财包触点在关键句出现 | 入口发生在视频中，不是独立页面 |
| 0:20-0:45 | 展开背景补丁并点击关键词 | 半屏无蒙层，视频声音和画面持续 |
| 0:45-1:20 | 第二触点用条件拨片改变路径 | 不是所有交互都做成答题 |
| 1:20-1:55 | 面板打开时经过下一触点 | 不叠弹，新触点收为圆点 |
| 1:55-2:30 | 点击圆点回看路径拼接 | 错过可恢复，时间轴有意义 |
| 2:30-3:00 | 视频结束查看学习足迹 | 无总分，只呈现观察证据和待补项 |
| 3:00-3:30 | 可选打开 B/C 深挖 | 复杂推演不打断主观看 |

标准演示全程不得由产品自动暂停视频。为演示压缩可缩短素材，但产品配置仍遵守正式时点与频率规则。

## 23.4 里程碑

P0.1（已完成）：在 refer/douyin 绑定固定占位视频，透出毫秒时钟，完成 CuePill + CaibaoHalfSheet。  
P0.2（部分完成）：实现 3 类模板、Orchestrator、圆点回看和 localStorage 恢复；其余模板待补。  
P0.3（部分完成）：接 Express 分析 API、来源边界、ASR/OCR/多模态 Provider、确定性 Planner 和草稿门禁；运行会话服务仍待补。  
P0.4（发布阻塞）：接有权真实视频，完成一次真实模型 dry run、人工审核、全量自动化和视觉回归。  
P1：审核后台、持久化任务、多视频内容包、更多模板和可选一句话诊断。  
P2：评估真实平台集成和规模化内容治理，不预设可直接接入抖音生产环境。

## 23.5 P0 追溯矩阵

| 需求 | 产品图 | 事件 | 主要测试 |
|---|---|---|---|
| F-02 至 F-04 触点曝光与收纳 | 图 2 | cue_surfaced、cue_dismissed | T-PLAN、T-ORCH |
| F-05 至 F-08 半屏不停播 | 图 3 | cue_expanded、playback_invariant_checked | T-VIDEO、视觉回归 |
| F-10 至 F-15 微交互 | 图 4、图 5 | 各模板 submitted | 规则黄金用例、内容门禁 |
| F-16 过程记录 | 图 6 | trace_synced | 幂等、刷新、会话丢失 |
| F-17 学习总结 | 图 7 | summary_viewed | 证据完整性、禁用字段扫描 |
| F-18 看后深挖 | 图 5 | deep_dive_opened | A/B/C、unknown 组合 |
| F-19 财经安全 | 全局 | safety_redirected | 安全红队 |

## 23.6 V2.0 变更记录

- 主形态改为视频时间轴多触点；不停播、不静音、不回退，展开为无蒙层且最大 48% 的半屏。
- 单一题目扩展为六类轻交互，复杂沙盘移到看后；财包负责触点编排与条件提醒。
- 报告改为 LearningTrace 过程总结，取消强制复述、总分和未点击惩罚。
- 实施栈按实际底座修订为 Vue 3/Vite/Pinia，并把 refer/douyin 的 GPL 与非商业声明列为发布审查项。
- 抖音来源拆为公开建档、创作者授权元数据和有权媒体；固定 MiniMax、方舟、豆包 ASR、火山 OCR Provider 契约与 TDD/readiness 门禁。

## 23.7 视觉与文档验收

目标产品图由 HTML/CSS 代码原生渲染，复用项目内透明财包形象，确保中文准确。Markdown 是唯一内容源，PDF 由脚本生成。交付前必须：

1. 检查目录、图号、链接、事实标签和需求追溯，并扫描自动暂停、68% 等旧口径残留。
2. 将 PDF 全部页面渲染为 PNG，检查乱码、裁切、重叠和清晰度，并核对 Markdown/PDF 的接口、约束与测试阈值一致。
