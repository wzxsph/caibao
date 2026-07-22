# 财经推演室｜Agent 交接基线

最后更新：2026-07-23  
目标：下一位 Agent 在 5 分钟内知道事实、边界、第一任务和验证方法，不重新猜产品形态。

## 0. 5 分钟摘要

| 项目 | 当前事实 |
|---|---|
| 产品口径 | V2.0 仍是已批准基线；进入暂停、POI 微入口、manifest-only 推荐和取消自动数量上限由用户直接裁决；`财经推演室_PRD_V2.6.md` 是最新 Review Candidate，V2.3/V2.4/V2.5 为历史候选 |
| 产品仓 | `/home/samsong/Desktop/maybe/caibao`；主分支 `main`，V2.6 候选起始基线 `26cc11e`，当前提交以 `git rev-parse HEAD` 为准 |
| 代码仓 | `/home/samsong/Desktop/maybe/caibao/refer/douyin`；当前实现为未 push 的 `refactor/moneybaby-v2.4-foundation@b51e0a50`，本轮共 5 个提交；实时状态仍须重查 |
| PM 参考仓 | `/home/samsong/Desktop/maybe/caibao/refer/moneybaby`，固定 `7db765b`，只取证/选择性迁移 |
| Git 远端 | `origin=wzxsph/douyin`，`upstream=zyronon/douyin`；不 push upstream，未获得当次授权也不 push origin |
| 里程碑 | M0–M2 已完成；M3 已有静态前端切片与有界多阶段管线、六类 payload 可离线成稿；稳定 checkpoint 仍含已废止的自动数量截断，V2.6 只保留 45 秒间隔和同时 1 个 |
| 自动化基线 | `b51e0a50`：client 40/40、server 127/127、Playwright 9/9；两套 type-check、production build、`pnpm audit --prod`、`git diff --check` 全绿 |
| 本地媒体 | manifest 已为 schema v2/25 items；固定四财经 ID 才可推荐，其余 21 条 `UNMAPPED`。四条 H.264/AAC 派生已在 ignored `.analysis-work` 完成，时长 173.710/341.262993/354.476009/233.478005 秒 |
| 外部阻塞 | Catalog/Range/POI/四视口空态门禁已闭合；最终字幕/真实时间码与财经审核、公网分发权、真实 Provider、完整六类×四媒体 E2E 与人工发布链仍未闭合 |
| 凭据 | MiniMax 路径已有本地语义模型和 ASR 凭据但未真实调用；Doubao/OCR/抖音 OAuth 未配置 |
| Docker | 用户已明确暂停；镜像未验证，当前不得作为可用路径 |
| 当前第一任务 | 联合评审 V2.6，并以最终字幕/真实时间码和财经人审替换估算内容；如获费用与权利授权，再做真实 Provider 最小 dry run 和完整六类×四媒体 E2E |
| foundation 安全项 | 未 push 的 `b51e0a50` 保持 `dev/start/serve` 回环绑定并完成 V2.6 运行切片；合并或推送须由后续任务单独授权 |

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
2. `财经推演室_PRD_V2.0.md` 的第 0、15.5、23.4 节（当前权威）。
3. 具体任务需要时再读：
   - `财经推演室_PRD_V2.6.md`（最新 Review Candidate）
   - `docs/PRD_V2.5_TO_V2.6_DIFF.md`
   - `docs/VERSION_GOVERNANCE.md` 与 `docs/reviews/PRD_V2.6_REVIEW.md`
   - `财经推演室_产品功能PRD_V2.3.md`（历史候选与取证快照）
   - `docs/PRD_V2.2_GAP_REVIEW.md`（PM/当前项目实测差异）
   - `docs/ARCHITECTURE.md`
   - `docs/TDD_TEST_PLAN.md`
   - `docs/RESEARCH_SOURCES_AND_PROVIDERS.md`
   - `refer/douyin/server/README.md`

权威优先级：用户最新指令 > 已通过的 PRD（当前为 V2.0）> 本交接 > Architecture/TDD/ADR > 待评审 V2.6 > 历史候选 V2.3/V2.4/V2.5 > PM V2.2 > 历史材料。最新直接裁决是“POI 曝光不停播、点击进入自动暂停”“三个推荐入口只读授权 manifest”和“自动触点无独立数量上限”，不得被旧条款覆盖。
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

本轮还观察到其他 Agent/真实运行任务生成的未跟踪 `output/real-runs/` 与 `output/screenshots/`；其归属
不在文档工作，和 `.vscode/` 一样不得删除、移动或提交。任何后续文档提交都必须使用显式 pathspec。
旧 V1/后端说明已在产品仓提交 `1b64c6c` 移除，
不得在无新指令时恢复。

### 2.2 应用代码仓

- 路径：`/home/samsong/Desktop/maybe/caibao/refer/douyin`
- 历史 checkpoint：`feat/caibao-analysis-pipeline@b8ced09d`（六类成稿、45 秒间隔及已废止的旧自动数量截断）。
- 当前本地实现：`refactor/moneybaby-v2.4-foundation@b51e0a50`，未 push；本轮 5 个提交已完成
  manifest/Catalog/Range、Catalog-only 推荐、POI 暂停恢复、四套内容映射和 E2E/交接。
- 共享工作树被外部 Agent 反复切换分支；不要把本文记录当实时 `HEAD`，接手先运行下面的检查命令。
- 主实现提交：`cb24c3f744c87b56f922161149d172dc7542f80a`
- 安全/证据修复：`57daf3b6cbb61ce49376f9bc4d84b55869befec3`
- 公共上游：`upstream=https://github.com/zyronon/douyin`
- 项目 `origin`：`https://github.com/wzxsph/douyin.git`；当前 refactor 分支尚未 push，未经授权不 push。

媒体、`.analysis-work`、本地 fixture 和任何未跟踪文件仍按用户资产处理，不得 stage、覆盖、回退、
移动或代提交；接手时以 `git status --short` 重新确认最新状态。

不得删除任一 `.git`，不得把嵌套仓当父仓普通目录 add，不改写历史。

## 3. 产品形态不变量

- 财包在视频关键时点出现 POI 微入口：高 44px、最大约 216px、24px 图标、单行省略，4–6 秒后收起到时间轴；主入口与稍后命中区均 ≥44px。
- 轻邀请曝光不暂停；点击进入无蒙层 CaibaoHalfSheet 时，记录进入前播放状态和当前时间后自动暂停。
- 面板最高 48vh；完成、跳过或关闭时仅在进入前正在播放的情况下从原暂停点恢复。不得自动 seek、
  静音、改音量或倍速；重复打开/关闭必须幂等。
- 财包不替换作者头像；视频、字幕和证据始终是主体。
- 内容时间轴节点总数最多 6 个；自动邀请不设独立数量上限，最小间隔 45 秒、同时最多 1 个；
  忽略只记“未观察”。`b8ced09d` 的旧数量截断已被用户取消，必须用 6 个合格节点不被截断的测试移除。
- 普通首页、`?demo=finance-fed` 和长视频推荐只从 manifest v1/v2 与固定四个财经 videoId/Experience
  映射的有效交集取数；当前 v2 另外 21 条均为 `UNMAPPED`。schema 升级、新条目、作者或排序变化
  不得扩权；固定 ID 缺失时缩小/空态，禁止用其他视频替补或回退旧 mock。
- 当前四条映射为 `finance-xiaolin-fifa/ai-power/autopilot/ai-capital@2026.07.23.2`，范围
  `internal_poc`；FIFA/AI 资本各 4 个、AI 电力/自动驾驶各 5 个现有节点均为 `automatic`。
  `aipower-compare-grid-dc`（约 150 秒）和 `autopilot-judgment-l4`（约 240 秒）不得再沿用旧的
  数量截断降级；`timeline_only` 只保留给未来内容编排。估算时间码获用户接受不等于生产内容审核。
- 四条 H.264/AAC、yuv420p 派生媒体与封面已在 ignored `.analysis-work` 完成并记录 SHA；核验时长
  依次为 173.710/341.262993/354.476009/233.478005 秒。源媒体、派生物和封面不进 Git/GitHub Pages；
  2026-08-22 未续期后目录必须为空、媒体为 410。
- 运行时 Demo/E2E 仍绑定三类：背景补丁、条件拨片、因果补边；前端六类渲染器和 server 六类
  payload 均有离线测试，新三类尚未进入完整运行时 fixture/E2E。
- 总结只呈现过程证据、条件意识和未观察项，无总分、无“68%”、无买卖建议。
- 完整沙盘属于看后深挖，不塞进播放中半屏。

## 3.1 PM moneybaby 取证结论

- 参考仓包含 `fed-rate-global-capital-001`：约 4 分 16 秒真实测试视频、版本 `2026-07-22.2`、状态 `draft`、6 个节点。
- 5 个概念和 3 条因果边全部 `reviewed: false`；视频授权、最终 ASR/OCR/时间码仍是发布阻塞。
- 可迁移：内容包结构、章节/证据窗口、六节点叙事、本地版本恢复、复述与报告信息架构。
- 可迁移但必须重写：用户主动进入后暂停这一基础意图；退出恢复必须按 V2.6 的进入前状态实现。
- 不迁移：React/Vinext 页面、自动 seek、全屏 shade、88%–94% Sheet、作者头像被财包替换、二选一、静态能力印章。
- PM 首包实际主题是美元外溢、全球资本和相对利差，不足以自动证明股票/黄金路径；V2.6 延续“由内容包定义学习目标”，但本地推荐改用四套小Lin内容。
- 线上/源码/测试差异的完整证据见 `docs/PRD_V2.2_GAP_REVIEW.md` 和 `assets/prd-v2.3/`。

## 3.2 V2.6 文档与版本治理

- V2.6 是最新 Review Candidate；V2.0 仍是已批准基线，V2.3/V2.4/V2.5 只作历史候选。当前没有任何真实联合签字。
- 用户对进入暂停、POI 微入口、manifest-only 推荐和取消自动数量截断的直接裁决立即约束实现；这不代表 V2.6 其余内容已批准。
- V2.6 获批必须同一变更完成 Markdown 状态、PDF、评审记录、AGENTS/交接/计划权威指针，
  并在合并到 `main` 后创建 annotated tag `prd-v2.6-approved`；不得提前创建该 tag。
- PRD、contentVersion、schemaVersion、ruleVersion、weightTableVersion、promptVersion、appCommit
  与媒体 SHA-256 独立版本化。Review Candidate 可以产 draft，不能作为 approved 内容的 `prdBaseline`。
- PM adapter、ReviewManifest、approve、publish 与 retire 必须由不同动作表达；Schema 适配成功不能把
  `draft` 自动提升为 `approved`。
- 规则与完整流程见 `docs/VERSION_GOVERNANCE.md`；待签字项见
  `docs/reviews/PRD_V2.6_REVIEW.md`；最新差异见 `docs/PRD_V2.5_TO_V2.6_DIFF.md`。

## 4. 当前已实现

### 4.1 视频内轻交互

- `BaseVideo` 维护毫秒媒体时钟并挂载 `VideoExtensionHost`。
- `b51e0a50` 已实现并交接 `CueOrchestrator`、`CaibaoPoiEntry`、`CaibaoHalfSheet`、`CueTimeline`、
  POI 曝光不停播、进入暂停和按进入前状态恢复；不 seek、不修改静音、音量或倍速。
- `?demo=finance-fed` 只选择展示模式，不决定视频白名单；普通、Demo、长推荐现已共享 Catalog，
  API/清单失败显示明确空态，不回退旧 mock。
- **前后端契约现支持全 6 类触点**：InteractionRenderer 可渲染，payload-author 可对六类成稿，
  server/client golden 与单元测试覆盖。9 项 Playwright 已验证 FIFA 媒体上的当前三类运行交互、
  POI 暂停恢复、Catalog/Range、空态和四个目标视口；`finance-fed-6kinds` 仍是测试专用 fixture，
  完整六类交互尚未在四条真实媒体上逐项完成 E2E。
- localStorage LearningTrace 和无总分 LearningSummary。
- 推荐流已只加载 manifest 与固定四 ID 的有效交集；当前其余 21 条为 `UNMAPPED`。未知视频评论返回空结果，不随机映射旧评论；作者头像保持原样。

### 4.2 内容分析原型（已重构为有界多阶段管线）

设计见 `docs/GENERATION_PIPELINE_DESIGN.md` 与 `docs/ADR/0003-agentic-generation-pipeline.md`。`AnalysisPipeline.run()` 现返回 `{ draft, coverageReport }`：

```text
0 media.prepare → 1 ASR + OCR + semantic-timeline（确定性切窗）
2 语义抽取 emit_semantic_graph（LLM，富 schema：因果边 from/to、条件操作数、SemanticEvent+subSignals）
3 确定性校验（证据引用 + 时间戳边界） → 4 可选评审 emit_critique（LLM）
5 定向修复环 ≤2 轮（LLM，仅失败项）→ 6 cue-scorer（版本化权重表）+ 确定性 Planner
7 direction-rules（版本化规则引擎，未知组合→insufficient）
8 payload-author（LLM，六个 RENDERABLE_KINDS 均可授权 payload，≤2 修复）
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
- **3 个新触点类型（quick_judgment/counterexample_flip/concept_compare）的完整真媒体运行 E2E**：
  前后端契约、payload 成稿和渲染单测已实现；9 项 Playwright 已覆盖 FIFA/当前三类核心运行路径和
  四个目标视口，但尚未证明六类交互在四条真实媒体上全部成立。
- 历史 `b8ced09d` 含旧自动数量截断；当前 `b51e0a50` 已移除该上限并保留 45 秒间隔。PM 六候选本身仍有 27 秒和
  36 秒两处冲突，需要 adapter 调整时间或明确 `timeline_only`，但不得仅因总数超过 4 个而截断。
- 推荐入口已不再读取会黑屏或复用错误作者元数据的旧占位条目；非推荐历史页不在本轮迁移范围。
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
- 未 push 的 foundation 分支 `b51e0a50` 保持 `pnpm dev/start/serve` 显式绑定 `127.0.0.1`；
  本轮完整门禁为 client 40/40、server 127/127、Playwright 9/9、两套 type-check、build、
  production audit 与 diff-check 全绿。该能力尚未合并或推送，不得写成远端已完成。

无论当前检出哪个分支，均可使用以下显式回环命令作为安全启动方式：

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

## 8. 当前第一任务

Catalog/Range、三个推荐入口、POI/播放状态机、数量上限移除、空态和四视口核心 E2E 已在
`b51e0a50` 完成。下一次任务转向内容与发布闭环：

1. 先确认 `b51e0a50` 与工作树所有者；未经授权不 merge/push，不提交媒体或 `.analysis-work`。
2. 联合评审 V2.6；候选未批准前不执行内容 approved/published 状态切换。
3. 获取最终字幕/真实时间码，完成人工财经、证据、版权与安全审核，替换估算内容。
4. 在权利和费用明确后执行真实 Provider 最小 dry run；默认继续不联网、不计费。
5. 把六类交互逐项绑定到四条真实媒体并补完整 E2E；现有 9 项只证明 FIFA/当前三类核心运行路径。
6. 再实现 draft PATCH、ReviewManifest、job publish、content publish/retire、ApprovedExperience-only
   读取，以及 Session/Event/Report 与片尾深挖。

## 9. 文档批准与代码队列

1. 先联合评审 V2.6；评审意见记录在 `docs/reviews/PRD_V2.6_REVIEW.md`。通过前 V2.0 仍是已批准
   基线，但四项用户直接裁决立即约束实现；不创建 approved tag，不启动公网媒体或 approved 内容发布。
2. 保留 `b51e0a50` 的 Catalog/Range/三推荐入口、POI/播放和四视口回归；它们已完成，不再列阻塞。
3. 评审通过后，同一批准提交切换权威指针并创建 `prd-v2.6-approved` annotated tag。
4. 再为四套 internal_poc、独立版本向量、作者/媒体一致性、
   “Review Candidate/draft 不可直接 approved”写失败测试。
5. 建 draft PATCH、ReviewManifest、job publish（物化 approved）、content publish/retire（运行指针）
   分离动作和 ApprovedExperience-only 读取接口。
6. 实现默认跳过、默认不联网、单 Provider 最多一次请求的 live preflight/smoke harness；缺 key/媒体时明确拒绝。
7. 只在确认费用后对当前有处理权媒体执行最小 Provider dry run；Docker 仍暂停，不因有 FFmpeg 自动恢复。
8. 推荐仓储已改为 Catalog-only 且 fail closed；后续补体验仓储 ApprovedExperience-only、本地显式 internal_poc。
9. 继续补六类触点×四真实媒体 E2E、Session/Event/Report 与片尾深挖；Range、空态和四视口核心路径不重复作为未完成项。

## 10. 验证基线

最近一次完整工程基线（未 push 的 `refactor/moneybaby-v2.4-foundation@b51e0a50`，2026-07-23）：

- Client Vitest：**40/40**。
- Server Vitest：**127/127**。
- Playwright：**9/9**，覆盖 Catalog-only 推荐、空态、Range、POI 暂停恢复以及
  390×844、393×852、430×932、1280×900 四个目标视口；当前运行内容以 FIFA/三类核心交互为主。
- `pnpm type-check`、`pnpm type-check:server`、`pnpm build`：通过。
- `pnpm audit --prod`：通过，生产依赖 0 个已知漏洞；`git diff --check`：通过。
- 全部上述测试不调用计费模型、不消耗额度；它们不等于真实 Provider、最终财经内容或完整六类×四媒体 E2E 已验证。
- PRD V2.3 PDF：历史候选为 A4 28 页；原有记录显示曾全量渲染检查，路径为
  `output/pdf/财经推演室_产品功能PRD_V2.3.pdf`。
- PRD V2.6 PDF：由同名 Markdown 生成。按用户 2026-07-23 最新指令，本轮及后续默认只做
  pdfinfo/文本抽取/页数/关键标题等非视觉机器校验，**不进行逐页视觉验收，也不得声称视觉通过**。

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
