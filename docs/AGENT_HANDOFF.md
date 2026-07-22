# 财经推演室｜Agent 交接基线

更新时间：2026-07-23  
产品候选：PRD V2.7 Review Candidate  
线上应用：`wzxsph/douyin@e85de2bfa1743aaea5204f6e1513de6d56c2e310`

## 0. 5 分钟摘要

- 线上：<https://wzxsph.github.io/douyin/#/home>。
- 产品已从“四条本地 PoC”变为“清单全部 25 条的公开工程展示”。
- 页面只保留推荐流和作者页；小Lin说 15 条、大陆姓陆 10 条。
- 25 个视频与 25 张封面放在 GitHub Release，未进 Git；每条页面有原作者与抖音原作品链接。
- 25 套学习内容是确定性 LLM Mock，仅使用标题和 manifest 元数据，未跑最终 ASR/OCR/视觉、未经财经人审。
- 入口曝光不停播，点击财包后暂停，完成/跳过/关闭后按进入前状态恢复。
- **自动触点没有“最多 4 个”或其他固定数量上限。** 当前每条 3–6 个、共 141 个，只是六模板和时长形成的结果。
- PRD V2.7 未批准；V2.0 仍为批准基线。不得创建 `prd-v2.7-approved`。
- 当前最高风险：Release 媒体窗口截至 2026-08-22；未续期必须下架 Release，不能只隐藏前端。

## 1. 精确仓库与 Git 状态

### 1.1 产品仓

```text
path:   /home/samsong/Desktop/maybe/caibao
remote: https://github.com/wzxsph/caibao.git
branch: main
V2.7 文档起始 parent: 096bf3dbbdeec2c216e3ddf28a9d76757dd19593
```

本文件与 V2.7 文档同提交发布；接手用 `git rev-parse HEAD` 获得产品仓精确文档 SHA。产品仓现有用户未跟踪目录：

```text
.vscode/
output/real-runs/
output/screenshots/
```

不得删除、stage 或代提交。

### 1.2 应用仓

```text
path:     /home/samsong/Desktop/maybe/caibao/refer/douyin
origin:   https://github.com/wzxsph/douyin.git
upstream: https://github.com/zyronon/douyin
feature:  feat/caibao-showcase-v2.7@dd6cfa0b57d980f067785683a2612fbef2d53229
master:   e85de2bfa1743aaea5204f6e1513de6d56c2e310
PR:       https://github.com/wzxsph/douyin/pull/3
```

PR #3 以精确 head SHA 合并。不得向 `upstream` push；不 force-push。

关键提交：

- `70e05e70da8a5c1f1943f443f27e84cbdaf1c297`：25 条展示、Mock、推荐流/作者页、媒体准备与 Pages。
- `dd6cfa0b57d980f067785683a2612fbef2d53229`：同步当时 `origin/master` 的 merge checkpoint。
- `e85de2bfa1743aaea5204f6e1513de6d56c2e310`：PR #3 合并后的线上 `master`。

### 1.3 PM 参考仓

```text
path: /home/samsong/Desktop/maybe/caibao/refer/moneybaby
reference: 7db765bab9efe1064321f03d992df42e62413a7c
```

只用于视觉、信息层级和内容结构取证。不迁 React/Vinext、暂停/seek、大遮罩、88–94% 面板或静态能力分数。

## 2. GitHub 发布事实

### 2.1 Media Release

<https://github.com/wzxsph/douyin/releases/tag/showcase-media-20260723-v1>

- 25 个 `.mp4` + 25 个 `.jpg`。
- GitHub 记录总大小 174,689,523 bytes；本地目录约 167 MiB。
- 抽查 `7507542741346176296.mp4`/`.jpg` 经 302 后返回 200。
- 视频为 H.264/AAC 浏览器派生，源 HEVC 未上传。
- Release tag 目标为 `dd6cfa0b...`；页面代码合并在 `e85de2bf...`。

本地派生目录（ignored）：

```text
/home/samsong/Desktop/maybe/caibao/refer/douyin/.analysis-work/showcase-media/douyin-authorized-20260723-01/
```

### 2.2 Pages

- URL：<https://wzxsph.github.io/douyin/#/home>
- Workflow run：<https://github.com/wzxsph/douyin/actions/runs/29955704172>
- 结果：success，39 秒。
- 构建变量：`VITE_SHOWCASE_MEDIA_BASE_URL=https://github.com/wzxsph/douyin/releases/download/showcase-media-20260723-v1/`

### 2.3 线上浏览器验证

- `article=25`，抖音原作品链接 `25`。
- 作者 href 只有 `#/author/xiaolin` 和 `#/author/dalu-xing-lu`。
- 首条视频从 Release 加载，`readyState=4`、时长 173.71 秒、正在播放。
- 点击财包触点后 `paused=true`；450ms 内时间不增长。
- 点击关闭后时间从 17.371 增至 18.499 秒且 `paused=false`。
- `#/author/dalu-xing-lu` 为 10 张作品卡和 10 个原作链接。

## 3. 产品不变量

1. 清单有效 25 条是当前唯一推荐集合；不回退旧视频或底座 fixture。
2. 轻触点是页内按钮，不是外链或路由。
3. 入口曝光继续播放；点击进入暂停；退出恢复进入前状态。
4. 不自动 seek，不改静音、音量、倍速；pause/release 幂等。
5. 面板≤48vh、无蒙层；作者头像不被财包替换。
6. 自动触点不设固定数量上限；至少间隔 45 秒、同时最多一个。
7. `timeline_only` 由内容显式编排，不是超过 N 个后的溢出桶。
8. 每条显示真实标题、作者、原作品链接和 Mock 边界；不伪造互动数据。
9. 报告无总分、虚假精度、财富画像或投资建议。

## 4. 当前数据与内容

### 4.1 Bundle

```text
src/showcase/generated/showcase-bundle.json
```

- Catalog 25 / Experience 25。
- 作者：`xiaolin=15`、`dalu-xing-lu=10`。
- `contentVersion=showcase-mock@2026.07.23.1`。
- `generation.mode=mock`。
- `provider=deterministic_llm_mock`。
- `evidenceBasis=title_and_manifest_metadata_only`。
- `publishStatus=internal_poc`、`timecodeQuality=estimated_mock`。

### 4.2 触点

- 总计 141，全部 `automatic`。
- 分布：1 条×3、1 条×4、4 条×5、19 条×6。
- 类型：context 25、quick 25、causal 23、condition 23、counterexample 23、concept 22。
- 当前最多 6 是六类模板的实现结果，**不是产品上限**。

## 5. 当前测试证据

在应用仓已通过：

```text
frontend Vitest: 11 files, 44 passed
server Vitest:   21 files, 131 passed
Playwright:      8 passed
type-check:      client + server passed
build:           passed
audit --prod:    no vulnerabilities
diff-check:      passed
```

Playwright 视口：390×844、393×852、430×932、1280×900。覆盖推荐/作者、来源披露、曝光继续、点击暂停、48vh、恢复前态和旧路由重定向。

真实本地 Media API 冒烟：Catalog `ready`、total 25、0 exclusions；HEAD 200；Range 0–1023 返回 206/1024 bytes。

## 6. 代码地图

### 6.1 展示前端

```text
src/showcase/catalog.ts
src/showcase/components/ShowcasePlayer.vue
src/showcase/pages/FeedPage.vue
src/showcase/pages/AuthorPage.vue
src/showcase/styles.css
src/showcase/generated/showcase-bundle.json
```

### 6.2 内容生成

```text
server/src/showcase/content-seeds.ts
server/src/showcase/mock-content-generator.ts
server/src/cli/generate-showcase-content.ts
```

### 6.3 媒体

```text
server/src/cli/prepare-showcase-media.ts
server/src/authorized-media/*
media-import/authorized-douyin/download-manifest.json   # ignored
.analysis-work/showcase-media/*                         # ignored
```

### 6.4 播放交互

现有 `FinanceCue`/`VideoExtensionHost`/Cue orchestrator 仍负责半屏、触点和 pause/release；`ShowcasePlayer.vue` 将其接入简化推荐流。

## 7. 常用命令

```bash
cd /home/samsong/Desktop/maybe/caibao/refer/douyin

corepack pnpm install --frozen-lockfile
pnpm dev
pnpm dev:api

pnpm prepare:showcase-media
pnpm generate:showcase-content
# 或：pnpm prepare:showcase

pnpm test
pnpm type-check
pnpm type-check:server
pnpm build
pnpm test:e2e
pnpm audit --prod
git diff --check
```

## 8. 环境变量（只记录名称）

### 展示/媒体

- `VITE_SHOWCASE_MEDIA_BASE_URL`
- `VITE_FINANCE_API_BASE_URL`
- `AUTHORIZED_MEDIA_ROOT`
- `AUTHORIZED_MEDIA_MANIFEST_PATH`

### Provider

- `CAIBAO_ENV_FILE`
- `MINIMAX_API_KEY`
- `MINIMAX_BASE_URL`
- `MINIMAX_MODEL`
- `DOUBAO_API_KEY`
- `DOUBAO_BASE_URL`
- `DOUBAO_MODEL`

真实值只放应用仓 ignored `.env.minimax` / `.env.doubao`，绝不打印或提交。Pages 当前不需要 Provider key。

## 9. 权利、安全与到期

- 公网展示来自用户直接要求；项目未独立核验平台/作者权利链，不得写成官方授权。
- 当前窗口截至 2026-08-22（Asia/Shanghai）。未续期必须下架 `showcase-media-20260723-v1`。
- Runbook 顺序：下架 Release → 发布目录移除/空态 → 验证直链不可访问 → 保存审计记录。
- 不提交原始媒体、字幕原文、关键帧、Cookie、临时 URL、模型原始响应或密钥。
- 不绕过登录、验证码、签名或风控。

## 10. 当前未完成 / 发布阻塞

- V2.7 联合评审和真实签字。
- 公网分发权独立核验、续期或到期 retire Owner。
- 真实 ASR/OCR/视觉证据、最终字幕和人工时间码。
- 25 套概念/因果/条件/反例的财经与事实审核。
- Review/Approve/Publish 生命周期。
- Session/Event/Simulation/Retell/Report 闭环。
- MiniMax/豆包真实质量、延迟、费用和降级报告。
- 25 条×六类完整浏览器矩阵；当前 E2E 为代表路径。

## 11. 下一位 Agent 第一任务

先完成 Release 到期/撤权 Runbook：明确 owner、提醒时间、续期证据字段、删除命令、验证直链和审计记录。该任务必须在 2026-08-22 前落地。

完成后再从 25 条中选 2–3 条黄金视频，建立真实 ASR/OCR/视觉 `EvidenceItem` 和人工时间窗，不要直接全量调用付费 Provider。

## 12. 不要做

- 不恢复固定四条白名单或旧 mock fallback。
- 不重新加入自动触点最多 4/6 个的截断。
- 不把当前 Mock 写成真实多模态或财经审核结果。
- 不删产品仓未跟踪目录，不动其他 Agent/用户工作树。
- 不 push upstream、不 force-push、不提交媒体或密钥。
- 不创建 `prd-v2.7-approved` 标签。
- 不生成 V2.7 PDF；后续若生成，按用户要求不做 PDF 视觉验收。
