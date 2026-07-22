# moneybaby V0.8 / PRD V2.2 与当前集成项目差异评审

状态：已完成源码、线上交互、构建与测试核验  
日期：2026-07-22  
PM 仓库固定版本：`prac-fect/moneybaby@7db765bab9efe1064321f03d992df42e62413a7c`  
PM 在线原型：`https://finance-feed-lab.earthy-brush-4461.chatgpt.site/`  
集成仓：`refer/douyin@17f06c66`；另有并行 Agent 未提交文件，不纳入本次事实基线  
当时的候选基线：`../财经推演室_产品功能PRD_V2.3.md`  
当前后继候选：`../财经推演室_PRD_V2.4.md`（增加版本治理与审核/发布门禁；V2.0 仍权威）

> 本文件保留 V2.2→V2.3 取证语境；文中的“V2.3 裁决”是历史候选形成依据，不能单独解释为
> 已批准产品决定。当前产品候选及权威状态以 V2.4 §0 和 Agent 交接为准。

## 1. 结论

V2.2 对 PM 原型本身的描述大体有源码依据，但不等于当前集成项目的 As-Is，也不应直接作为实现说明。V2.3 采用如下合并策略：

1. 继续以 `refer/douyin` 的 Vue/Vite/Express TypeScript 仓作为唯一实施基座。
2. 复用 moneybaby 的真实测试视频、版本化内容包、六节点学习叙事、证据回看、复述和报告信息结构。
3. 不复制 moneybaby React/Vinext 页面，不引入第二套前端或 Cloudflare 运行栈。
4. 拒绝其自动暂停、全屏暗幕、88%—94% 底板、财包占作者头像位、二选一和静态能力印章。
5. 播放中只做不超过 48vh 的短交互；完整沙盘、反例深挖、主动复述和证据报告放在片尾。

## 2. 本次核验范围

### 2.1 PM 仓库与线上原型

- 仓库：`refer/moneybaby/`，保持独立 Git 历史并由父仓 `.gitignore` 排除。
- 源码：`finance-feed-lab/finance-feed-lab-delivery/source/`。
- PRD：PM 仓库中的 V2.2 与父仓 `财经推演室_产品功能PRD_V2.2.md` SHA-256 完全一致。
- 线上核验状态：视频首页、概念练习、条件情景、财包常驻态、证据报告。
- 屏幕证据：`assets/prd-v2.3/moneybaby-online-*.png`。

### 2.2 当前集成仓

- 分支：`feat/caibao-analysis-pipeline`。
- 核验提交：`50b96560`（多阶段触点生成管线）与 `17f06c66`（交接基线）。
- 线上静态前端：`https://wzxsph.github.io/douyin/?demo=finance-fed#/home`。
- 屏幕证据：`assets/prd-v2.3/current-integrated-demo.png`。

## 3. PM V0.8 已被证实的能力

| 能力 | 证据 | 判断 |
|---|---|---|
| 真实视频测试资产 | `public/videos/fed-rate-global-capital-001.mp4`，约 15MB；内容包记录 256.167 秒、400×224 | 可作为内部迁移样本；版权与发布授权仍未证明 |
| 独立内容包 | `app/content/types.ts`、`fed-rate-global-capital-001.ts`、`videos.ts` | 可复用内容结构与文案，不直接复用 React 组件 |
| 版本与草稿状态 | 版本 `2026-07-22.2`，状态 `draft` | 正确表达“待审”；不能公开宣称已验证 |
| 六个学习节点 | 00:08 概念、00:35 预测、01:28 因果链、02:32 情景、03:08 反例、03:58 复述 | 作为内容候选保留；不等于六次都自动强弹 |
| 刷新恢复 | `localStorage` 保存包版本、进度、节点状态、财包开关与尝试 | 可迁移；须补服务端恢复与事件证据 |
| 浏览器语音入口 | Web Speech Recognition，失败回退文字 | 只能是输入增强；不可作为跨浏览器关键路径 |
| 报告无百分比分数 | 页面按当前完成/跳过计数展示 | 方向正确；静态能力印章仍可能虚假归因 |
| 真实视频页叙事 | 章节、字幕提示、节点时间轴、证据回看 | 可作为目标内容体验参考 |

内容包中的 5 个概念与 3 条因果边全部仍为 `reviewed: false`，且 `sourceNote` 明确写明 OCR 首轮校准、时间戳和文字仍需人工复核。因此“真实视频”不等于“可发布内容”。

## 4. PM V0.8 不能直接移植的实现

| 问题 | 源码/线上事实 | V2.3 裁决 |
|---|---|---|
| 进入交互暂停视频 | `startCoach` 调用 `setPlaying(false)` | 禁止；打开、作答、完成、跳过均不自动暂停、静音或 seek |
| 完成后强制续播位置 | 完成后跳到 `max(current, cue.at + 0.25)` | 禁止；只记录事件，用户播放头不被任务修改 |
| 大面积遮挡 | `.shade` 覆盖全屏；`.coach-sheet` 最高 88%，报告约 94% | 播放中无全屏 shade，容器最高 48vh；完整页只用于片尾 |
| 作者头像被替换 | 右侧作者按钮直接显示“财＋” | 财包与作者实体分离；作者头像、昵称、来源不可被替换 |
| 常驻强品牌态 | `?agent=caibao` 为整机黄边、上方大头像与文字卡 | P0 只保留轻邀请、半屏标题和小状态标识，不加整机光环 |
| 二元题 | concept/predict/chain 均只有两个选项 | 快判断采用 3 个有意义选项 + 不确定 + 跳过；其他模板按动作需要设计 |
| 情景切换即出结果 | 情景按钮直接替换结果，没有“运行”动作 | 播放中只做单变量拨片；片尾沙盘修改条件后必须点击运行 |
| 静态报告能力印章 | 未完成任何节点时仍展示三项“会……”能力 | 每项能力必须绑定 `supportingEventIds`；证据不足显示“尚未观察” |
| 直接时间轴任意进入 | 六个节点均可直接跳进练习 | 时间轴可回看已出现节点；核心闭环由 Orchestrator 管理，不允许伪造完成 |
| 复述门槛未落实 | `canSubmit = response.length > 0` | P0 校验 18—300 字；基础模板与受限模型均可完成 |

## 5. 当前集成仓真实状态

### 5.1 已实现

- Vue 3 + Vite + Pinia 前端和 Express TypeScript 服务端。
- `CaibaoCueOrchestrator`、时间窗、频控、跳过、快进、幂等和版本化本地 LearningTrace。
- `CaibaoHalfSheet` 最高 48vh、无蒙层；E2E 已验证面板打开后视频继续、作者头像与财包素材分离、控件不小于 44px。
- 前端契约/渲染器支持 `context_card`、`quick_judgment`、`condition_slider`、`causal_stitch`、`counterexample_flip`、`concept_compare` 六类。
- 当前运行 Demo 只绑定 `context_card`、`condition_slider`、`causal_stitch` 三类。
- 服务端已实现媒体预处理、ASR/OCR Provider 适配、语义时间轴、有界抽取、批评、最多两次修复、确定性评分与 Planner、方向规则、payload 成稿、DraftExperience 与 CoverageReport。
- GitHub Pages 已部署静态前端；服务端与真实付费 Provider 未上线。

### 5.2 当前缺口

- 线上工程媒体仍可能黑屏，且文案明确为占位素材。
- 财经视频所在 Feed 条目复用了 `@李子柒` 的作者元数据；必须与视频来源一起替换并校验。
- `finance-fed-6kinds` 只在单元测试；其中一个触点时间超过当前 150 秒占位视频。
- 服务端 payload 成稿白名单只开放三类，与前端六类能力存在阶段差。
- LearningTrace 未恢复播放器当前时间，且无服务端 Session/Event API。
- 只有基础 LearningSummary；四变量沙盘、反例两阶段、复述评价和证据型报告未实现。
- 没有 review/publish API、数据库、持久队列或不可变内容版本仓。
- 真实 Minimax/豆包、ASR、OCR、多模态调用尚无付费环境验收报告。

## 6. 构建与测试质量对比

| 仓库 | 核验结果 | 说明 |
|---|---|---|
| moneybaby | `npm run build` 通过 | 线上原型可构建 |
| moneybaby | `npm test` 失败 | SSR HTML 测试仍要求“真实视频测试”，与当前输出不一致；默认脚本未包含内容包测试 |
| moneybaby | 内容包测试 2/2 通过 | 仅验证源码字符串与媒体文件大小，不验证交互和事实质量 |
| moneybaby | `npm run lint` 失败 | 5 个 error、3 个 warning；包括 effect 内 setState、Web Speech `any` 与图片规则 |
| refer/douyin | 前端 20/20、服务端 84/84、Playwright 6/6 | 对应提交 `50b96560` 的完整基线 |
| refer/douyin | 前后端 type-check、build、prod audit 通过 | 真实 Provider 与授权媒体仍不在测试范围 |

PM 原型可作为产品素材，但当前不能称为“测试全绿的可交付实现”。V2.3 把 Build + Unit + E2E + Lint + 内容发布门禁全部设为合并条件。

## 7. 节点语言统一

| PM 学习节点 | 集成仓 CueKind | V2.3 位置 |
|---|---|---|
| concept | `context_card` | 观看中背景补丁，通常静默或弱邀请 |
| predict | `quick_judgment` | 观看中 4—8 秒快判断 |
| chain | `causal_stitch` | 观看中补一条因果边 |
| simulate | `condition_slider` | 观看中拨一个条件；完整四变量沙盘放片尾 |
| counter | `counterexample_flip` | 观看中轻量换条件；两阶段反例放片尾 |
| retell | 无一对一 CueKind | 片尾任务，不把 `concept_compare` 当复述 |
| 易混概念 | `concept_compare` | 观看中对照卡，按内容需要出现 |

## 8. 频率与真实视频时长冲突

moneybaby 的六个节点间隔分别为 27、53、64、36、50 秒，违反当前自动邀请最短间隔 45 秒的产品约束。V2.3 裁决如下：

- 六个节点全部保留为内容时间轴能力。
- 自动邀请最多 4 次，推荐候选为 00:35、01:28、02:32、03:58，间隔为 53、64、86 秒。
- 00:08 概念只做无强弹的背景标签；03:08 反例进入片尾或用户主动回看。
- Planner 最终仍可根据认知负荷、字幕密度、上一次动作和跳过行为降频。

原“自然看完整段视频并完成所有交互 ≤4 分钟”的验收也不成立，因为视频本身为 4 分 16 秒。V2.3 改为：观看中新增操作总时长 P75 ≤60 秒；片尾深挖最短路径 ≤3 分钟；评审演示可通过审核时间轴跳转在 4 分钟内展示代表链路。

## 9. 迁移清单

### 9.1 迁入 refer/douyin

- `fed-rate-global-capital-001` 的视频元数据、章节、字幕线索、六节点文案、证据窗口和报告信息结构。
- 真实媒体文件仅在授权确认后迁入受控媒体目录；父仓和普通 Git 历史不复制大文件。
- 内容包适配器：PM `VideoContentPackage` → 集成仓 `DraftExperience` → 人审 → `ApprovedExperience`。
- 当前播放时间、已曝光/进入/完成/跳过、第一次答案与最终答案的版本化恢复。
- Web Speech 作为 feature-detect 的可选增强，始终保留文本输入。

### 9.2 不迁入

- React/Vinext 页面、Cloudflare Sites 运行结构和空数据库 Schema。
- `.shade`、88%—94% Sheet、进入自动暂停、完成后自动 seek。
- 财包替换作者头像、常驻整机黄边和大面积浮动头像。
- 二选一题、静态 if/else 情景结果、静态能力印章。

## 10. 发布阻塞项

1. 视频及创作者授权、允许的分发范围与授权期限。
2. 与真实视频匹配的作者头像、昵称、来源链接和免责声明。
3. 最终 ASR、OCR、章节和六个证据窗口人工复核。
4. 5 个概念、因果边、条件、反例和题目均完成审核并带审核人。
5. 自动邀请的 45 秒间隔、最多 4 次策略通过真机干扰测试。
6. 六类运行时 E2E、报告证据归因、刷新/断网/服务端丢失恢复通过。
7. moneybaby 迁移内容不得以 `draft` 身份进入公开发布路径。

## 11. 核验依据

- PM 页面：`../refer/moneybaby/finance-feed-lab/finance-feed-lab-delivery/source/app/page.tsx`
- PM 样式：`../refer/moneybaby/finance-feed-lab/finance-feed-lab-delivery/source/app/douyin.css`
- PM 内容包：`../refer/moneybaby/finance-feed-lab/finance-feed-lab-delivery/source/app/content/fed-rate-global-capital-001.ts`
- PM 类型：`../refer/moneybaby/finance-feed-lab/finance-feed-lab-delivery/source/app/content/types.ts`
- PM 测试：`../refer/moneybaby/finance-feed-lab/finance-feed-lab-delivery/source/tests/`
- 当前运行 fixture：`../refer/douyin/src/features/finance-cues/fixtures/finance-fed-v1.ts`
- 六类测试 fixture：`../refer/douyin/src/features/finance-cues/fixtures/finance-fed-6kinds.ts`
- 不停播/半屏 E2E：`../refer/douyin/e2e/finance-cues.spec.ts`
- 会话：`../refer/douyin/src/features/finance-cues/session-store.ts`
- 当前服务端路由：`../refer/douyin/server/src/app.ts`
- 多阶段管线：`../refer/douyin/server/src/pipeline/analyze-video.ts`
