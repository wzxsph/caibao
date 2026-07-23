# 财经推演室｜Agent 工作约定

本文件是新 Agent 的第一入口。先读 `docs/AGENT_HANDOFF.md`，再按任务选择最新 PRD、架构或 TDD。不要从老 PRD、PM 原型、旧 `douyin` 仓或底座 Demo 猜测当前口径。

## 当前权威与直接裁决

- 已批准产品基线仍是 `财经推演室_PRD_V2.0.md`。
- 最新 Review Candidate 是 `财经推演室_PRD_V2.7.md`；V2.3–V2.6 均为历史候选，不得写成 Approved。
- 用户 2026-07-23 的直接裁决覆盖旧文档相反条款：完整清单/生成管线保留 25 条，公开推荐展示清单内指定的 10 条；入口曝光继续播放、点击财包后暂停、退出恢复；公开 Pages 标注来源；自动触点无固定数量上限。
- 同日最新工程裁决：`caibao/apps/web` 是前端、Express 后端、生成管线和测试的唯一代码源；旧 `wzxsph/douyin` 只保留历史部署与媒体 Release，不做双向修改。
- 首次有声播放必须符合浏览器策略：先静音自动播放并提供显式“点击开启声音”；同一次用户手势解除静音并播放，失败时显示可重试入口。不得把浏览器的静音自动播放误写成媒体无声或强制永久静音。
- 不得创建 `prd-v2.7-approved` 标签；没有真实签字时不得把 Mock 内容写成财经审核通过。

## 5 分钟接手

```bash
cd /home/samsong/Desktop/maybe/caibao
git status --short --branch
git rev-parse HEAD
git remote -v

cd apps/web
pnpm test
```

1. 产品仓未跟踪的 `.vscode/`、`output/real-runs/`、`output/screenshots/` 是用户资产，不删除、不 stage。
2. 不 reset、不 force-push；未获用户当次明确授权，不 push、不创建 PR。
3. `refer/douyin`、`refer/moneybaby` 是 ignored 历史/参考工作树。里面可能有其他 Agent 的未提交工作，不修改、不清理、不代提交。
4. 代码变更先写失败测试；文档变更同步最新 PRD、交接、架构、TDD、治理中的规范指针。

## 单仓边界

- 主仓：`/home/samsong/Desktop/maybe/caibao`，远端 `origin=https://github.com/wzxsph/caibao.git`。
- 运行应用：`apps/web/`，Vue 3 / Vite / Express TypeScript；这是唯一后续代码源。
- 旧应用仓：`refer/douyin` / `wzxsph/douyin`，只作导入来源和媒体 Release 宿主；旧 Pages 已退役并跳转到主站。
- PM 参考仓：`refer/moneybaby`，只作视觉与信息结构取证，不复制 React/Vinext 页面。
- 导入来源：`wzxsph/douyin@9a461b89dda782e30db2fd399b29068e95d3ec33`；旧仓合并提交 `8f21006cc5fae25f1f1de11d2bdb25acbc431937`。详见 `apps/web/IMPORT_PROVENANCE.md`。
- `node_modules`、媒体、缓存、运行输出、模型产物和密钥不得提交。

## 当前工程事实

- 唯一 Pages：<https://wzxsph.github.io/caibao/#/home>。不得再把旧 `douyin` Pages 作为预览、回滚或验收地址。
- 当前主仓应用发布提交：`65151c9b7f6625aca2558d25a2b2907a852ceb7d`；Pages run `29972348075` 成功。
- 完整生成目录 25 条；公开 `src/showcase/public-video-ids.json` 选择 10 条，两位作者各 5 条。
- 媒体 Release：<https://github.com/wzxsph/douyin/releases/tag/showcase-media-20260723-v1>。Actions 只把十条校验后的 MP4/JPG 暂存进 `dist/media/`，媒体不进 Git。
- 25 个 Experience、141 个 `automatic` 触点；每视频 3–6 个只是六模板与时长形成的当前结果，不是产品上限。
- 内容标记为 `internal_poc`、`deterministic_llm_mock`、`estimated_mock`；未执行最终 ASR/OCR/视觉和财经人审。
- 精简主仓基线已通过：前端 42、服务端 131、Playwright 9、两套 type-check、build、production audit、diff-check。
- 线上验证：10 条/10 个原作链接；首条媒体同域、`readyState=4`、无错误；有声入口点击后 `muted=false && paused=false`；Range GET 206。

## 产品不变量

- 轻触点是页内按钮，不是外链或自动跳页；可自动出现并从时间轴重访。
- 入口曝光期间继续播放；点击进入才暂停；完成、跳过或关闭时，仅在进入前播放且上下文未变时恢复。
- 财包 pause/release 不自动 seek，也不修改 `muted`、`volume`、`playbackRate`；用户显式声音操作可以修改 `muted`。
- 首次加载允许浏览器策略要求的静音自动播放，但必须有 44px 可见有声入口；点击入口、视频或播放键要在同一手势内执行 unmute + play，并记住站点偏好。
- 半屏最高 48vh、无蒙层；作者头像永不被财包替换；触控目标至少 44×44px。
- 自动触点不设 4/6 等固定上限；至少间隔 45 秒，同时最多一个。
- 推荐严格等于 manifest 有效集合中的公开十条。失败时空态，不回退旧数据、旧媒体 URL 或随机评论。
- 不伪造点赞、评论、头像、官方认证、掌握程度或投资结论。

## 媒体、权利与密钥

- 完整清单仅存在于 ignored 的 `apps/web/media-import/authorized-douyin/download-manifest.json`。
- 当前记录窗口截至 2026-08-22（Asia/Shanghai）。未续期必须下架 Release 并部署无媒体 Pages artifact；只隐藏前端不足以撤下直链。
- 不提交源/派生视频、字幕原文、关键帧、Cookie、临时 URL、模型原始响应或真实 `.env`。
- 真实密钥只放 `apps/web/.env.minimax`、`apps/web/.env.doubao` 或开发者本地环境；不打印、不截图、不放进 `VITE_*`。
- 不绕过登录、验证码、签名、风控或平台限制。

## 应用门禁

```bash
cd /home/samsong/Desktop/maybe/caibao/apps/web
pnpm test
pnpm type-check
pnpm type-check:server
pnpm build
pnpm test:e2e
pnpm audit --prod
git diff --check
```

涉及声音必须验证：首次静音播放、有声入口可见、一次手势后 `muted=false && paused=false`、偏好保存、自动播放拒绝可重试、财包进入/退出不改变声音属性。涉及媒体还要验证公开十条、SHA/bytes/时长、H.264/AAC、同域 MIME/Range、空目录 fail closed 与来源链接。

## PDF

- Markdown 是 PRD 唯一内容源；V2.7 不生成 PDF。
- 后续若生成，仅做可打开、页数、文本抽取和关键标题机器校验。
- 用户已取消当前及后续 PDF 视觉验收；不得声称版式通过。
