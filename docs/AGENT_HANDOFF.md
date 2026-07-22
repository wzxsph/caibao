# 财经推演室｜Agent 交接基线

最后更新：2026-07-22  
目标：下一位 Agent 在 5 分钟内知道事实、边界、第一任务和验证方法，不重新猜产品形态。

## 0. 5 分钟摘要

| 项目 | 当前事实 |
|---|---|
| 唯一产品口径 | `财经推演室_PRD_V2.0.md`；PDF 只是评审版 |
| 产品仓 | `/home/samsong/Desktop/maybe/caibao`，`main`；本轮交接前内容基线 `2f6123cfb88aaaf6d01ac849665792f049add145` |
| 代码仓 | `/home/samsong/Desktop/maybe/caibao/refer/douyin`，`feat/caibao-analysis-pipeline`，当前 `5889acc329e60af6ed60b12213ec923f54b441d3` |
| Git 远端 | 代码仓只有公共 `upstream`，没有项目 `origin`；严禁 push `upstream` |
| 里程碑 | M0–M2 已完成；M3 只有分析原型和静态前端切片；M4 真实验证未完成 |
| 自动化基线 | 13 前端 Vitest + 25 服务端 Vitest + 6 Playwright；类型、构建、生产依赖审计通过 |
| 外部阻塞 | 本机无 FFmpeg；无授权真实视频；无审核发布链路 |
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
   - `docs/ARCHITECTURE.md`
   - `docs/TDD_TEST_PLAN.md`
   - `docs/RESEARCH_SOURCES_AND_PROVIDERS.md`
   - `refer/douyin/server/README.md`

权威优先级：用户最新指令 > PRD V2.0 > 本交接 > Architecture/TDD/ADR > 历史材料。
V1 PRD、旧后端说明、`PROJECT_STATUS_AND_ROADMAP.md` 和 `demoUI/` 不得覆盖 V2.0。

## 2. Git 与当前工作树

### 2.1 产品仓

- 路径：`/home/samsong/Desktop/maybe/caibao`
- 分支：`main`
- 责任：PRD、PDF、配图、研究、ADR、计划和交接。
- `refer/douyin/` 被父仓忽略，因为它有独立 Git。
- 当前交接提交以 `git rev-parse HEAD` 为准；Git commit 无法在自身内容里硬编码自身 SHA。

接手时预期仍可能看到以下用户所有的未确认状态：

```text
D  PROJECT_STATUS_AND_ROADMAP.md
D  财经推演室_PRD_V1.0.md
D  财经推演室_后端实现说明_V1.0.md
?? .vscode/
```

不要擅自恢复、提交或删除它们。旧决策原本要求“历史文件保留”，但当前删除意图尚未确认；需要处理时先问用户。

### 2.2 应用代码仓

- 路径：`/home/samsong/Desktop/maybe/caibao/refer/douyin`
- 分支：`feat/caibao-analysis-pipeline`
- 当前提交：`5889acc329e60af6ed60b12213ec923f54b441d3`
- 主实现提交：`cb24c3f744c87b56f922161149d172dc7542f80a`
- 安全/证据修复：`57daf3b6cbb61ce49376f9bc4d84b55869befec3`
- 公共上游：`upstream=https://github.com/zyronon/douyin`
- 项目 `origin`：未配置；功能分支没有远端跟踪。

不得删除任一 `.git`，不得把嵌套仓当父仓普通目录 add，不改写历史。

## 3. 产品形态不变量

- 财包在视频关键时点多次出现轻提示，4–6 秒后收起到时间轴圆点。
- 点击展开无蒙层 CaibaoHalfSheet，最高 48vh；答题、反馈和关闭期间不得自动暂停或静音。
- 财包不替换作者头像；视频、字幕和证据始终是主体。
- 自动触点最多 6 个、最小间隔 45 秒、同时最多 1 个；忽略只记“未观察”。
- P0 已实现三类：背景补丁、条件拨片、因果补边；不是每次都出题。
- 总结只呈现过程证据、条件意识和未观察项，无总分、无“68%”、无买卖建议。
- 完整沙盘属于看后深挖，不塞进播放中半屏。

## 4. 当前已实现

### 4.1 视频内轻交互

- `BaseVideo` 维护毫秒媒体时钟并挂载 `VideoExtensionHost`。
- 固定 Demo：`/?demo=finance-fed`，使用 150 秒本地合成占位视频。
- `CueOrchestrator`、CuePill、CaibaoHalfSheet、CueTimeline、三类交互模板。
- localStorage LearningTrace 和无总分 LearningSummary。
- 普通推荐流不加载财经扩展；作者头像保持原样。

### 4.2 内容分析原型

```text
有处理权的本地视频
→ FFprobe/FFmpeg
→ 豆包 ASR
→ 可选火山 OCR
→ MiniMax 或方舟语义分析
→ 确定性 Cue Planner
→ 内存 AnalysisJob + DraftExperience
→ 人工审核阻塞
```

- API：`/health`、公开主页 probe、分析任务创建/查询、draft 查询。
- 公开主页 probe 只做合规探测；遇风控返回 `dynamic_page_blocked`。
- `DouyinOpenPlatformClient` 只实现已授权账号 `video.list` 元数据客户端；没有 OAuth 登录、token 保存、同步路由，也不提供媒体源。
- FFmpeg 适配器包含导入根目录、realpath/symlink、SHA-256、音轨和关键帧。
- ASR/OCR/语义 Provider 是真实 HTTP 客户端，但尚未用真实授权视频做付费端到端验证。
- ASR 时间不得越过媒体时长；OCR 缺失/非法置信度不进入证据。
- Planner 执行证据、时间范围、频率、优先级和投资措辞门禁。
- 成功分析也只返回 `publishStatus=draft`、`approvedTriggers=[]`、`HUMAN_REVIEW_REQUIRED`。

“离线分析”指不在用户播放时实时调用模型，不代表断网可运行；ASR/OCR/语义 Provider 都需要外网。

## 5. 当前没有实现

- 前端读取 ApprovedExperience API；当前仍使用静态 fixture。
- 人工审核台、publish API、数据库、持久队列和内容版本仓库。
- Session/Event/Summary 服务端接口与 localStorage 补回。
- OAuth 登录、token 生命周期和已授权作品同步产品流程。
- 任务取消、并发/额度控制、重启恢复和分析产物清理策略。
- 默认跳过的真实 Provider smoke suite；`LIVE_PROVIDER_TESTS` 目前只有配置解析。
- 真实授权视频的 ASR→OCR→语义→draft→人工审核全链路。
- PRD 中其余轻交互模板与看后完整深挖。

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

- 本机没有 `ffmpeg` / `ffprobe`，媒体流水线未跑通。
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

完成定义：默认脚本不监听 `0.0.0.0`，Finance API proxy 不可从局域网间接访问，现有 13/25/6
测试基线不退化。

## 9. 第一任务之后的队列

1. 实现默认跳过、默认不联网、单 Provider 最多一次请求的 live preflight/smoke harness；缺 key/媒体时明确拒绝。
2. 用户提供 10–30 秒有处理权视频且确认费用后，安装系统 FFmpeg 或另开已授权的 Docker 安全任务，执行最小 dry run。
3. 建 review schema、审核动作和 ApprovedExperience-only 发布接口。
4. 前端仓储改为 ApprovedExperience API-first + 明确 Demo fallback。
5. 再补 Session/Event/Summary、剩余模板和看后深挖。

## 10. 验证基线

最近一次完整离线/fixture 基线：

- 前端 Vitest：13 项。
- 服务端 Vitest：25 项。
- Playwright：6 项，覆盖 390×844、393×852、430×932、1280×900、三触点总结和普通流隔离。
- `pnpm type-check`、`pnpm type-check:server`、`pnpm build`：通过。
- `pnpm audit --prod`：生产依赖 0 个已知漏洞。
- 完整开发依赖审计：21 high / 13 moderate / 4 low，来自旧底座工具链债务。
- PRD PDF：A4 28 页，已渲染逐页检查。

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
| `server/src/providers/` | MiniMax/方舟、ASR、OCR 客户端 |
| `server/src/pipeline/` | 分析编排与确定性 Planner |
| `server/src/jobs/` | 内存任务与 draft 仓库 |
| `server/src/app.ts` | Express 路由与错误映射 |
| `server/test/` | 默认离线契约、单元和 API 测试 |

## 12. 不要做

- 不 push `upstream`，不 reset/checkout 用户工作树，不清理未确认的根仓删除或 `.vscode/`。
- 不读取后打印 `.env`，不提交密钥、Cookie、模型原始响应、用户媒体、音轨、帧或分析产物。
- 不绕过抖音登录、验证码、签名或风控，不把公开可见等同于有权下载/处理。
- 不让模型直接生成 approved，不让模型改变资产方向规则。
- 不把静态 fixture、占位时间码、HTTP 客户端或单测写成真实内容/真实供应商已验证。
- 不对局域网或公网开放当前无鉴权 API；不运行裸 `vite --host`。
- 不恢复 Docker 工作，除非用户重新授权，并先修 build context、secret、工作卷和资源限制。
- 底座是 GPL 且 README 有非商业限制；商业化前必须完成许可审查或换壳。
