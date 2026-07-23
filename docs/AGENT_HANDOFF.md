# 财经推演室｜Agent 交接基线

更新时间：2026-07-23  
产品候选：PRD V2.7 Review Candidate  
唯一代码源：`wzxsph/caibao/apps/web`

应用发布提交：`65151c9b7f6625aca2558d25a2b2907a852ceb7d`  
Pages run：<https://github.com/wzxsph/caibao/actions/runs/29972348075>（success）

## 0. 5 分钟摘要

- 唯一站点：<https://wzxsph.github.io/caibao/#/home>。旧 `douyin` Pages 已退役，不得用于预览、验收或回滚。
- 前端、Express 后端、生成管线和测试已精简迁入 `apps/web/`，以后只在 `caibao` 主仓修改。
- 导入源为 `wzxsph/douyin@9a461b89dda782e30db2fd399b29068e95d3ec33`，旧仓合并提交为 `8f21006cc5fae25f1f1de11d2bdb25acbc431937`。
- 迁移未携带约 616MB 的旧 Git 历史、旧页面/数据/抓取器、依赖、缓存、密钥或媒体；源码快照本身约 2.7MB。
- 完整 manifest 与内容生成覆盖 25 条；公开展示其中 10 条，两位作者各 5 条。视频仍位于独立 Release，Pages 构建时只暂存公开十条。
- 视频先按浏览器要求静音自动播放，页面显式显示“点击开启声音”。用户点击后在同一手势中解除静音并播放，站点记住选择；自动播放被拒绝时显示可重试入口。
- 入口曝光不停播；点击财包暂停；完成/跳过/关闭后按进入前状态恢复。交互状态机本身不得修改声音、音量、倍速或播放位置。
- 自动触点没有 4/6 个固定上限；当前 3–6 个只是 Mock 模板与时长结果。
- V2.7 未批准，V2.0 仍为批准基线；不得创建 `prd-v2.7-approved`。

## 1. 仓库与工作树

```text
path:   /home/samsong/Desktop/maybe/caibao
remote: https://github.com/wzxsph/caibao.git
branch: main
app:    apps/web
```

接手时执行：

```bash
cd /home/samsong/Desktop/maybe/caibao
git status --short --branch
git rev-parse HEAD
git remote -v

cd apps/web
pnpm test
```

产品仓未跟踪 `.vscode/`、`output/real-runs/`、`output/screenshots/` 属于用户，不删除、不 stage。`refer/douyin` 与 `refer/moneybaby` 被父仓忽略，可能含其他 Agent 工作，不要 reset、清理或代提交。

## 2. 迁移与所有权

`apps/web/IMPORT_PROVENANCE.md` 是迁移追溯记录：

- 功能源提交：`9a461b89...`，包含有声入口修复；
- 旧仓合并提交：`8f21006...`；
- 旧仓 PR：<https://github.com/wzxsph/douyin/pull/5>；
- 旧仓最后一次应用部署：<https://github.com/wzxsph/douyin/actions/runs/29971301855>，仅作审计记录；
- 旧 Pages workflow `318209156` 已手动停用；`gh-pages@afcf216` 只保留跳转页，父提交 `c2a94450` 可恢复历史内容；
- 旧仓今后只保留迁移历史和媒体 Release，不再双向手工同步，也不作为在线产品地址。

这是精简快照，不是 subtree 历史导入。保留了 Vue/Vite 推荐流、财包交互、Express、媒体校验、ASR/OCR/多模态 adapter、确定性生成管线及测试；未导入旧商城/消息/个人中心、旧推荐数据、通用爬虫、历史截图、多语言文档或视频。

## 3. 发布结构

```text
GitHub Pages: https://wzxsph.github.io/caibao/#/home
Workflow:     .github/workflows/deploy-caibao-pages.yml
Deploy run:   29972348075 (head 65151c9b7f6625aca2558d25a2b2907a852ceb7d)
Web source:   apps/web
Media source: https://github.com/wzxsph/douyin/releases/tag/showcase-media-20260723-v1
```

工作流在主仓 `main` 的 `apps/web/**` 或 workflow 变化时：安装依赖 → 单测/type-check → 构建 → 从 Release 下载并校验十条 MP4/JPG → 暂存到 `dist/media/` → Pages 部署。浏览器只读取 Pages 同域媒体，Git 历史不含媒体。

Release 保存 25 个 H.264/AAC MP4 和 25 张封面；十条 Pages 媒体合计 68,687,281 bytes。完整清单只在本地 ignored 路径：

```text
apps/web/media-import/authorized-douyin/download-manifest.json
```

## 4. 当前内容事实

- 完整 Catalog / Experience：25 / 25；公开运行时：10 / 10。
- 完整作者分布：小Lin说 15、大陆姓陆 10；公开作者页 5 / 5。
- `contentVersion=showcase-mock@2026.07.23.1`。
- `generation.mode=mock`、`provider=deterministic_llm_mock`。
- `evidenceBasis=title_and_manifest_metadata_only`。
- `publishStatus=internal_poc`、`timecodeQuality=estimated_mock`。
- 141 个 automatic 触点；1 条×3、1 条×4、4 条×5、19 条×6。六类模板构成当前结果，不是规范上限。

## 5. 声音问题的根因与修复

线上排查确认首条媒体 `readyState=4`、无媒体错误、时间持续增长，但页面每次激活卡片都会设置 `muted=true`。浏览器又不允许未经过用户手势的有声自动播放，于是用户只看到一个不醒目的静音按钮，容易判断为无声或无法播放。

修复位于：

```text
apps/web/src/showcase/sound-preference.ts
apps/web/src/showcase/components/ShowcasePlayer.vue
apps/web/e2e/finance-cues.spec.ts
```

行为：

1. 首次加载静音自动播放，显示 44px “点击开启声音”。
2. 点击声音入口、视频或中央播放键时，在同一次用户手势内执行 unmute + `play()`。
3. 成功后把 `caibao-showcase-sound-enabled=true` 写入当前站点 localStorage。
4. 若 `play()` 被拒绝，显示“点击有声播放”供重试。
5. 用户显式静音会清除偏好；财包 pause/release 不修改声音属性。

## 6. 已执行门禁

主仓精简应用：

```text
frontend Vitest: 10 files / 42 passed
server Vitest:   21 files / 131 passed
client type-check: passed
server type-check: passed
production build: passed
Playwright: 9 passed（390×844、393×852、430×932、1280×900）
pnpm audit --prod: no known vulnerabilities
Pages staging: 10 items / 68,687,281 bytes
```

Playwright 新增并锁定：首次显式有声入口、unmute + play、偏好保存；其余覆盖 POI 曝光继续播放、进入暂停、条件恢复、半屏尺寸、作者归属和旧路由移除。

主站实页复核：10 个 article、10 个原作品链接；首条 `currentSrc` 为 `/caibao/media/7664748624454192393.mp4`，`readyState=4`、`error=null`、持续播放；点击声音入口后 `muted=false`、`paused=false`。MP4 HEAD 200、Range GET 206、`Content-Type: video/mp4`。

## 7. 常用命令

```bash
cd /home/samsong/Desktop/maybe/caibao/apps/web

corepack pnpm install --frozen-lockfile
pnpm dev
pnpm dev:api

pnpm prepare:showcase-media
pnpm generate:showcase-content

VITE_SHOWCASE_MEDIA_BASE_URL=./media/ pnpm build-gp-pages
SHOWCASE_MEDIA_SOURCE_DIRECTORY=.analysis-work/showcase-media/<batchId> pnpm stage:showcase-pages-media

pnpm test
pnpm type-check
pnpm type-check:server
pnpm build
pnpm test:e2e
pnpm audit --prod
git diff --check
```

## 8. 环境变量（仅变量名）

- `VITE_SHOWCASE_MEDIA_BASE_URL`
- `VITE_FINANCE_API_BASE_URL`
- `AUTHORIZED_MEDIA_ROOT`
- `AUTHORIZED_MEDIA_MANIFEST_PATH`
- `CAIBAO_ENV_FILE`
- `MINIMAX_API_KEY` / `MINIMAX_BASE_URL` / `MINIMAX_MODEL`
- `DOUBAO_API_KEY` / `DOUBAO_BASE_URL` / `DOUBAO_MODEL`

真实值只放 `apps/web/.env.minimax`、`apps/web/.env.doubao` 或本地环境，绝不打印或提交。Pages 不需要 Provider key。

## 9. 红线与阻塞

- 公网展示来自用户直接要求，但项目未独立核验权利链；不得写成平台/作者官方授权。
- 当前窗口截至 2026-08-22（Asia/Shanghai）。未续期必须下架 Release，再部署无媒体 Pages artifact，并验证两类直链不可访问。
- 不提交媒体、字幕原文、关键帧、Cookie、临时 URL、模型响应或密钥。
- V2.7 联合评审、最终多模态证据、25 套财经审核、Review/Publish、Session/Event/Report、Provider 质量/费用报告仍未完成。

## 10. 下一位 Agent 第一任务

先在 `apps/web` 选择 2–3 条黄金视频，建立真实 ASR/OCR/视觉证据时间线与人工时间窗；不要继续修改旧 `refer/douyin`。同时为 2026-08-22 到期的 Release/Pages 媒体指定 retire/续期负责人和可执行操作记录。
