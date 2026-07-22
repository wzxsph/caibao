# 财经推演室｜Agent 交接基线

最后更新：2026-07-22  
目标：下一位 Agent 在 5 分钟内知道事实、边界、第一任务和验证方法，不重新猜产品形态。

## 0. 5 分钟摘要

| 项目 | 当前事实 |
|---|---|
| 产品口径 | V2.0 仍是当前裁决；`财经推演室_产品功能PRD_V2.3.md` 是完成取证后的联合评审候选，通过后替代 V2.0/V2.2 |
| 产品仓 | `/home/samsong/Desktop/maybe/caibao`，`main`；当前提交以 `git rev-parse HEAD` 为准 |
| 代码仓 | `/home/samsong/Desktop/maybe/caibao/refer/douyin`，`feat/caibao-analysis-pipeline`，当前 `17f06c66`；并行 Agent 正在改服务端管线/测试，先查状态 |
| PM 参考仓 | `/home/samsong/Desktop/maybe/caibao/refer/moneybaby`，固定 `7db765b`，只取证/选择性迁移 |
| Git 远端 | `origin=wzxsph/douyin`，`upstream=zyronon/douyin`；不 push upstream，未获得当次授权也不 push origin |
| 里程碑 | M0–M2 已完成；M3 已有静态前端切片与有界多阶段生成管线；PM 真实测试包已取证但未迁移；M4 授权/供应商/审核发布未完成 |
| 自动化基线 | 20 前端 Vitest + 84 服务端 Vitest + 6 Playwright；类型、构建、生产依赖审计通过 |
| 外部阻塞 | FFmpeg/FFprobe 已安装；PM 有 4:16 测试视频但授权不明且内容未审核；无真实 Provider E2E；无人工审核发布链路 |
| 凭据 | MiniMax 路径已有本地语义模型和 ASR 凭据但未真实调用；Doubao/OCR/抖音 OAuth 未配置 |
| Docker | 用户已明确暂停；镜像未验证，当前不得作为可用路径 |
| 唯一第一任务 | 修复 `package.json` 裸 `vite --host` 导致的 `0.0.0.0` 监听，并验证默认脚本只绑定回环地址 |

接手后先运行：

```bash
cd /home/samsong/Desktop/maybe/caibao
git status --short
git rev-parse HEAD

cd /home/samsong/Desktop/maybe/caibao/refer/douyin
git status --short
git rev-parse HEAD
git remote -v
```

不要读取/打印 `.env`，不要 push `upstream`，不要 reset 或替用户清理工作树。

## 1. 阅读顺序与权威性

先读：

1. 本文件。
2. `财经推演室_PRD_V2.0.md` 的第 0、15.5、23.4 节。
3. 具体任务需要时再读：
   - `财经推演室_产品功能PRD_V2.3.md`（新候选口径）
   - `docs/PRD_V2.2_GAP_REVIEW.md`（PM/当前项目实测差异）
   - `docs/ARCHITECTURE.md`
   - `docs/TDD_TEST_PLAN.md`
   - `docs/RESEARCH_SOURCES_AND_PROVIDERS.md`
   - `refer/douyin/server/README.md`

权威优先级：用户最新指令 > 已通过的 PRD（当前为 V2.0）> 本交接 > Architecture/TDD/ADR > 待评审 V2.3 > PM V2.2 > 历史材料。
V1 PRD、旧后端说明、`PROJECT_STATUS_AND_ROADMAP.md` 和 `demoUI/` 不得覆盖 V2.0。

## 2. Git 与当前工作树

### 2.1 产品仓

- 路径：`/home/samsong/Desktop/maybe/caibao`
- 分支：`main`
- 责任：PRD、PDF、配图、研究、ADR、计划和交接。
- `refer/douyin/` 被父仓忽略，因为它有独立 Git。
- `refer/moneybaby/` 也被父仓忽略；固定取证提交为
  `7db765bab9efe1064321f03d992df42e62413a7c`，不要在参考仓继续产品开发。
- 当前交接提交以 `git rev-parse HEAD` 为准；Git commit 无法在自身内容里硬编码自身 SHA。

接手时预期可能看到以下本地编辑器状态：

```text
?? .vscode/
```

不要擅自提交或删除。旧 V1/后端说明已在产品仓提交 `1b64c6c` 移除，
不得在无新指令时恢复。

### 2.2 应用代码仓

- 路径：`/home/samsong/Desktop/maybe/caibao/refer/douyin`
- 分支：`feat/caibao-analysis-pipeline`
- 当前提交：`17f06c66`（`50b96560` 为多阶段生成管线，`17f06c66` 为交接更新）
- 主实现提交：`cb24c3f744c87b56f922161149d172dc7542f80a`
- 安全/证据修复：`57daf3b6cbb61ce49376f9bc4d84b55869befec3`
- 公共上游：`upstream=https://github.com/zyronon/douyin`
- 项目 `origin`：`https://github.com/wzxsph/douyin.git`；功能分支跟踪同名远端分支，当前本地领先 2 个提交。

当前观察到另一个 Agent 正在修改多项服务端管线、payload 契约、CoverageReport、Planner 与测试文件。
这些不是本次 PRD 工作的改动，不得顺手 stage、覆盖、回退或替对方提交；接手时以
`git status --short` 重新确认所有者和最新状态。

不得删除任一 `.git`，不得把嵌套仓当父仓普通目录 add，不改写历史。

## 3. 产品形态不变量

- 财包在视频关键时点多次出现轻提示，4–6 秒后收起到时间轴圆点。
- 点击展开无蒙层 CaibaoHalfSheet，最高 48vh；答题、反馈和关闭期间不得自动暂停或静音。
- 财包不替换作者头像；视频、字幕和证据始终是主体。
- 内容时间轴节点最多 6 个；V2.3 目标自动邀请最多 4 次、最小间隔 45 秒、同时最多 1 个；忽略只记“未观察”。当前契约仍允许 6 个自动点，是待改差异。
- 运行时 Demo 已绑定三类：背景补丁、条件拨片、因果补边；前端六类渲染器均有单测，新三类尚未进入运行时 fixture/E2E。
- 总结只呈现过程证据、条件意识和未观察项，无总分、无“68%”、无买卖建议。
- 完整沙盘属于看后深挖，不塞进播放中半屏。

## 3.1 PM moneybaby 取证结论

- 参考仓包含 `fed-rate-global-capital-001`：约 4 分 16 秒真实测试视频、版本 `2026-07-22.2`、状态 `draft`、6 个节点。
- 5 个概念和 3 条因果边全部 `reviewed: false`；视频授权、最终 ASR/OCR/时间码仍是发布阻塞。
- 可迁移：内容包结构、章节/证据窗口、六节点叙事、本地版本恢复、复述与报告信息架构。
- 不迁移：React/Vinext 页面、自动暂停/seek、全屏 shade、88%–94% Sheet、作者头像被财包替换、二选一、静态能力印章。
- 首包实际主题是美元外溢、全球资本和相对利差，不足以自动证明股票/黄金路径；V2.3 改为内容包定义学习目标。
- 线上/源码/测试差异的完整证据见 `docs/PRD_V2.2_GAP_REVIEW.md` 和 `assets/prd-v2.3/`。

## 4. 当前已实现

### 4.1 视频内轻交互

- `BaseVideo` 维护毫秒媒体时钟并挂载 `VideoExtensionHost`。
- 固定 Demo：`/?demo=finance-fed`，使用 150 秒本地合成占位视频，仍绑定三类可渲染 fixture `finance-fed-v1`。
- `CueOrchestrator`、CuePill、CaibaoHalfSheet、CueTimeline、交互模板。
- **InteractionRenderer 现支持全 6 类触点**：context_card、condition_slider、causal_stitch（可渲染）+ quick_judgment、counterexample_flip、concept_compare（新增，前端契约 3→6）。新增 6-kind 渲染由单元测试覆盖；`finance-fed-6kinds` 为**测试专用 fixture，尚未绑定到运行时 Demo/mock**，E2E 仍只跑三类 Demo。
- localStorage LearningTrace 和无总分 LearningSummary。
- 普通推荐流不加载财经扩展；作者头像保持原样。

### 4.2 内容分析原型（已重构为有界多阶段管线）

设计见 `docs/GENERATION_PIPELINE_DESIGN.md` 与 `docs/ADR/0003-agentic-generation-pipeline.md`。`AnalysisPipeline.run()` 现返回 `{ draft, coverageReport }`：

```text
0 media.prepare → 1 ASR + OCR + semantic-timeline（确定性切窗）
2 语义抽取 emit_semantic_graph（LLM，富 schema：因果边 from/to、条件操作数、SemanticEvent+subSignals）
3 确定性校验（证据引用 + 时间戳边界） → 4 可选评审 emit_critique（LLM）
5 定向修复环 ≤2 轮（LLM，仅失败项）→ 6 cue-scorer（版本化权重表）+ 确定性 Planner
7 direction-rules（版本化规则引擎，未知组合→insufficient）
8 payload-author（LLM，仅 RENDERABLE_KINDS 授权 payload，≤2 修复）
9 组装 DraftExperience + CoverageReport；终检禁词跑在授权 payload 文本上
```

- 循环在管线层，`OpenAICompatibleStructuredClient` 保持每次一个 tool call；`SemanticGraphAnalyzer` 三方法（extract/critique/repair）与 `PayloadAuthor` 共用同一 client。
- 触点类型三层统一为 PRD 6 名（`CueKind`）；server 旧枚举错名已修，前端判别联合 3→6。
- **产出是查漏补缺，不是打分**：`CoverageReport`（确定性、非 LLM 撰写）列 覆盖/证据缺口/kind 平衡/方向裁决/待人工决策/版本。它是 per-content-version 的审核门产物，与运行时 per-session 的 `LearningSummary` 是两回事。
- 方向枚举只由 `direction-rules.ts` 置位；模型 `assertedDirection` 永不覆盖规则表（2 个测试证明）。
- 每个读不可信输入的 LLM 阶段（抽取/评审/修复/授权）都重复注入护栏。
- API：`/health`、公开主页 probe、分析任务创建/查询、draft 查询，**新增 `GET /analysis/jobs/:jobId/coverage`**（succeeded 前 409）。
- 成功分析仍只返回 `publishStatus=draft`、`approvedTriggers=[]`、`HUMAN_REVIEW_REQUIRED`；管线无 publish 路径。
- server∥frontend payload schema 双实现（模块边界无法 live 共享），由 `server/test/payload-contract.spec.ts` + golden fixture 守漂移。

“离线分析”指不在用户播放时实时调用模型，不代表断网可运行；ASR/OCR/语义/授权 Provider 都需要外网。

## 5. 当前没有实现

- 前端读取 ApprovedExperience API；当前仍使用静态 fixture。
- PM `VideoContentPackage` 到 `DraftExperience` 的适配器、作者/媒体一致性校验和审核迁移流程。
- 人工审核台、publish API、数据库、持久队列和内容版本仓库。
- Session/Event/Summary 服务端接口与 localStorage 补回。
- OAuth 登录、token 生命周期和已授权作品同步产品流程。
- 任务取消、并发/额度控制、重启恢复和分析产物清理策略；管线晚期阶段失败仍会重跑昂贵的 ASR/抽取（内存单次 job，无逐阶段 checkpoint）。
- 默认跳过的真实 Provider smoke suite；`LIVE_PROVIDER_TESTS` 目前只有配置解析。
- **真实授权视频的 ASR→OCR→语义→修复→授权→draft→人工审核全链路**：多阶段管线的编排、修复环终止、方向裁决、payload 授权、CoverageReport 均由离线 faked-client 测试证明契约与降级正确，**未用真实密钥或真实媒体验证内容质量、延迟与成本**。
- **3 个新触点类型（quick_judgment/counterexample_flip/concept_compare）的 E2E 视觉验证**：渲染器与前端契约已实现且有单元测试，但 `finance-fed-6kinds` fixture 未绑定运行时 Demo，6 个 Playwright 仍只覆盖三类；这三类在真机上的布局/无障碍未做视觉回归。
- 自动邀请上限仍是 6，尚未按 V2.3 收紧为 4；PM 六个候选间隔中 27 秒和 36 秒两处违反 45 秒约束。
- 线上财经占位条目仍可能黑屏，并错误复用 `@李子柒` 作者元数据；必须与真实媒体一起修正。
- 方向规则表仅编码 A/B/C 三情景，其余组合返回 `insufficient`（正确的安全默认，扩表是人工内容工作）。
- 看后完整深挖（A/B/C 沙盘、完整因果图）。

## 6. 环境、密钥与安全事件

两份真实文件均为 Git ignored、权限 600。只检查“是否配置”，绝不输出值。

| 文件/能力 | 状态 |
|---|---|
| `.env.minimax` 语义 key/model | 已配置，未做真实调用验证 |
| `.env.minimax` 多模态 model | 已配置，账号权限与视觉效果未验证 |
| 豆包 ASR 凭据 | 已配置，未做真实调用验证 |
| `.env.doubao` 方舟 key/model | 未配置 |
| 火山 OCR AK/SK | 未配置，OCR 默认关闭 |
| 抖音 OpenAPI Client Key/Secret | 未配置 |

本轮本地调试曾让已展开的 MiniMax/ASR 环境值进入私有工具执行输出。本文不复述任何值；按安全口径，
在真实调用或外部交付前应轮换这两组凭据。禁止运行或粘贴未脱敏的 `docker compose config`。

健康检查不会调用模型；创建分析任务可能产生 ASR/模型费用。任何真实任务前必须同时确认：

1. 媒体有处理权；
2. 使用哪个项目和模型；
3. 费用由谁承担；
4. 产物保留和删除方式。

## 7. 当前运行边界

- 本机已有 `/bin/ffmpeg` 与 `/bin/ffprobe`；但没有用可入库的授权真实视频跑过付费 Provider 全链路，不得写成“媒体流水线已验证”。
- Docker 引擎存在，但用户已明确要求暂停 Docker；没有可宣称已验证的服务镜像或容器。
- 原 Docker 路径有已知问题：build context 未排除 `.env*`、媒体、`.analysis-work` 和 `.git`；
  Compose `env_file` 会在配置输出中展开密钥；工作 bind 目录还可能出现 UID 权限问题。
- 在独立安全加固任务完成前，不运行 Docker，不把 `server/README.md` 中 Docker 命令当作已验证路径。
- API 无鉴权、限流和额度保护，`rightsAttested` 只是调用者自声明；API 与前端必须保持回环绑定。
- `package.json` 的 `pnpm dev/start/serve` 使用裸 `vite --host`，会覆盖配置并可能监听 `0.0.0.0`。

安全的临时前端启动方式：

```bash
cd /home/samsong/Desktop/maybe/caibao/refer/douyin
pnpm exec vite --host 127.0.0.1 --port 3001 --strictPort
# http://127.0.0.1:3001/?demo=finance-fed
```

API 本地启动只有在确认凭据轮换与费用边界后再使用：

```bash
pnpm start:api:minimax
# 或在配置完成后：pnpm start:api:doubao
```

## 8. 唯一第一任务

修复本地前端默认监听边界，不先做新功能：

1. 先写可验证默认 host 的配置/启动测试或静态断言。
2. 将 `dev`、`start`、`serve` 改为显式 `--host 127.0.0.1`，或去掉覆盖配置的裸 `--host`。
3. 验证普通推荐流和 `/?demo=finance-fed`。
4. 运行完整门禁并更新本文件。

完成定义：默认脚本不监听 `0.0.0.0`，Finance API proxy 不可从局域网间接访问，现有 20/84/6
测试基线不退化。

## 9. 第一任务之后的队列

1. 实现默认跳过、默认不联网、单 Provider 最多一次请求的 live preflight/smoke harness；缺 key/媒体时明确拒绝。
2. 用户提供 10–30 秒有处理权视频且确认费用后，安装系统 FFmpeg 或另开已授权的 Docker 安全任务，执行最小 dry run。
3. 联合评审 V2.3；通过后先为 PM 内容适配、作者/媒体一致性和“draft 不可直接 approved”写失败测试。
4. 建 review schema、审核动作和 ApprovedExperience-only 发布接口。
5. 前端仓储改为 ApprovedExperience API-first + 明确 Demo fallback；自动邀请上限改为 4。
6. 把六类触点绑定到时长匹配的授权媒体并补 E2E，再补 Session/Event/Report 与片尾深挖。

## 10. 验证基线

最近一次完整离线/fixture 基线（生成管线重构后，2026-07-22）：

- 前端 Vitest：**20 项**（原 13；新增 InteractionRenderer 6 类渲染 7 项）。
- 服务端 Vitest：**84 项**（原 25；新增 semantic-timeline 8、cue-scorer 7、direction-rules 10、coverage-report 13、semantic-graph-analyzer 6、payload-author 9、payload-contract 3，pipeline 由 3→5）。
- Playwright：6 项，覆盖 390×844、393×852、430×932、1280×900、三触点总结和普通流隔离。**仍只跑三类可渲染 Demo**；新增 3 类触点无 E2E 视觉覆盖（见 §5）。
- `pnpm type-check`、`pnpm type-check:server`、`pnpm build`：通过。
- `pnpm audit --prod`：生产依赖 0 个已知漏洞。
- 完整开发依赖审计：旧底座工具链债务不变（`pnpm audit --prod` 为 0）。
- 全部离线测试用 faked client，不调用计费模型、不消耗额度。
- PRD V2.3 PDF：A4 28 页，已用 Poppler 全量渲染并逐页检查；路径为
  `output/pdf/财经推演室_产品功能PRD_V2.3.pdf`。

代码交付门禁：

```bash
cd /home/samsong/Desktop/maybe/caibao/refer/douyin
pnpm install --frozen-lockfile
pnpm test
pnpm type-check
pnpm type-check:server
pnpm build
pnpm test:e2e
pnpm audit --prod
git diff --check
git status --short
```

Playwright 当前依赖 `/bin/google-chrome`。任何没有实际执行的真实 Provider、真实媒体、人工审核或视觉验证，
必须写成阻塞，不得根据“代码存在”推断通过。

## 11. 代码地图

| 路径 | 职责 |
|---|---|
| `src/components/slide/BaseVideo.vue` | 媒体时钟与扩展挂载 |
| `src/features/video-extensions/` | 通用扩展契约和 Host |
| `src/features/finance-cues/` | 财包组件、状态机、fixture、足迹、总结和前端测试 |
| `server/src/sources/` | 抖音公开探测与已授权元数据客户端 |
| `server/src/media/` | FFmpeg/FFprobe 安全适配器 |
| `server/src/providers/` | MiniMax/方舟 OpenAI-compatible client、`SemanticGraphAnalyzer`（抽取/评审/修复）、ASR、OCR 客户端 |
| `server/src/pipeline/` | 多阶段编排 `analyze-video.ts` + `semantic-timeline`/`cue-scorer`/`cue-planner`/`direction-rules`/`payload-author`/`coverage-report` |
| `server/src/domain/` | `contracts.ts`（富语义/时间轴/候选/draft/coverage 类型）、`payload-contracts.ts`（CueKind + 6 类 payload schema + RENDERABLE_KINDS）、errors |
| `server/src/jobs/` | 内存任务与 draft + coverageReport 仓库 |
| `server/src/app.ts` | Express 路由与错误映射（含 `/analysis/jobs/:jobId/coverage`） |
| `server/test/` | 默认离线契约、单元和 API 测试（含 `fixtures/authored-payloads.ts` golden、`payload-contract.spec.ts` 跨侧守漂移） |

## 12. 不要做

- 不 push `upstream`，不 reset/checkout 用户工作树，不清理未确认的根仓删除或 `.vscode/`。
- 不读取后打印 `.env`，不提交密钥、Cookie、模型原始响应、用户媒体、音轨、帧或分析产物。
- 不绕过抖音登录、验证码、签名或风控，不把公开可见等同于有权下载/处理。
- 不让模型直接生成 approved，不让模型改变资产方向规则。
- 不把静态 fixture、占位时间码、HTTP 客户端或单测写成真实内容/真实供应商已验证。
- 不对局域网或公网开放当前无鉴权 API；不运行裸 `vite --host`。
- 不恢复 Docker 工作，除非用户重新授权，并先修 build context、secret、工作卷和资源限制。
- 底座是 GPL 且 README 有非商业限制；商业化前必须完成许可审查或换壳。
