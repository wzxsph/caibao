# 财经推演室｜Agent 工作约定

本文件是新 Agent 的第一入口。先读 `docs/AGENT_HANDOFF.md`，再按任务选择 PRD、架构或 TDD。不要从老 PRD、PM 原型或旧 Demo 猜测当前口径。

## 当前权威与直接裁决

- 已批准产品基线仍是 `财经推演室_PRD_V2.0.md`。
- 最新 Review Candidate 是 `财经推演室_PRD_V2.7.md`；V2.3–V2.6 均为历史候选，不得写成 Approved。
- 用户 2026-07-23 的最新直接裁决立即覆盖旧文档的相反条款：完整清单与生成管线保留 25 条，公开推荐只展示清单内显式选出的 10 条（两位作者各 5 条）；入口曝光继续播放、点击财包后暂停、退出恢复、公开 GitHub Pages 并标注来源、自动触点不设固定数量上限。
- 不得创建 `prd-v2.7-approved` 标签；没有真实签字时不得把 Mock 内容写成财经审核通过。

## 5 分钟接手

1. 阅读 `docs/AGENT_HANDOFF.md` 的摘要、Git 基线、线上状态和“下一位 Agent 第一任务”。
2. 检查三个仓库；所有未提交内容先视为用户资产：

```bash
cd /home/samsong/Desktop/maybe/caibao
git status --short --branch
git rev-parse HEAD

cd /home/samsong/Desktop/maybe/caibao/refer/douyin
git status --short --branch
git rev-parse HEAD
git remote -v

cd /home/samsong/Desktop/maybe/caibao/refer/moneybaby
git status --short --branch
git rev-parse HEAD
```

3. 产品仓现有未跟踪 `.vscode/`、`output/real-runs/`、`output/screenshots/` 属于用户，不删除、不 stage。
4. 不 reset、不 force-push、不删除任一子仓 `.git`；应用仓绝不向 `upstream` 推送。
5. 代码变更先写失败测试，再实施；文档变更必须同步 PRD、交接、架构、TDD、治理中的规范性指针。

## 三仓边界

- 产品仓：`/home/samsong/Desktop/maybe/caibao`，`main`，远端 `wzxsph/caibao`。只跟踪 PRD、研究、架构、测试、交接和配图。
- 应用仓：`/home/samsong/Desktop/maybe/caibao/refer/douyin`，远端 `origin=wzxsph/douyin`、`upstream=zyronon/douyin`。当前线上 `master=9b5bd02503c951a8b416e66bdd81f48ba89931d5`。
- PM 参考仓：`/home/samsong/Desktop/maybe/caibao/refer/moneybaby`，固定参考 `7db765bab9efe1064321f03d992df42e62413a7c`，只用于视觉与信息结构取证。
- 产品仓忽略两个 `refer/` 子仓。媒体、依赖、缓存、运行输出、模型产物和密钥不得借父仓提交。

## 已上线工程事实

- Pages：<https://wzxsph.github.io/douyin/#/home>
- 应用展示 PR：<https://github.com/wzxsph/douyin/pull/3>
- 同域媒体修复 PR：<https://github.com/wzxsph/douyin/pull/4>
- 媒体 Release：<https://github.com/wzxsph/douyin/releases/tag/showcase-media-20260723-v1>
- 完整生成目录 25 条：小Lin说 15、大陆姓陆 10；公开 Pages 由 `src/showcase/public-video-ids.json` 固定选择 10 条，两位作者各 5 条。
- 25 个浏览器视频 + 25 张封面仍位于 Release，约 167 MiB；Pages workflow 校验后只把所选 10 个视频与封面暂存进同域 `dist/media/`，媒体不进 Git。
- 25 个 Experience、141 个 `automatic` 触点；每视频 3–6 个是当前六模板生成结果，不是产品上限。
- 内容标记为 `internal_poc`、`deterministic_llm_mock`、`estimated_mock`，只依据标题与 manifest 元数据，未执行最终 ASR/OCR 或财经人审。
- 门禁：前端 45/45、服务端 131/131、Playwright 8/8、两套 type-check、build、production audit、diff-check 通过。
- 线上浏览器已验证 10 条/10 个来源链接、作者页 5/5；首条视频使用 Pages 同域 URL，`readyState=4` 且连续播放。媒体响应为 `video/mp4`，完整请求 200、Range 请求 206。

## 产品不变量

- 财包入口是页内轻量按钮，不是外链 POI，也不自动跳页。入口可自动出现并可从时间轴重访。
- 入口曝光期间视频继续播放；用户点击进入才暂停。完成、跳过、关闭时，仅当进入前在播放才恢复。
- 不自动 seek，不修改 `muted`、`volume`、`playbackRate`；重复 pause/release 必须幂等。
- 半屏最高 48vh、无蒙层；作者头像永不被财包替换；触控目标至少 44×44px。
- 自动触点不设 4 个或 6 个等固定上限。编排按证据、视频时长、学习价值和至少 45 秒间隔决定，同时最多一个。
- 当前推荐源只允许 `download-manifest.json` 的有效条目；公开集合必须严格等于其中由 `src/showcase/public-video-ids.json` 指定的 10 条。失败时空态，不回退 `posts6.json`、`videos.md`、旧媒体 URL 或随机评论。
- 线上每条必须展示真实清单标题、作者和抖音原作品链接；不伪造点赞、评论、远程头像或官方认证。
- 学习内容不得给出买什么、仓位、目标价、稳赚等交易建议；报告无总分、虚假精度、财富画像。

## 媒体与权利红线

- 公网发布来自用户本轮直接要求，但项目未独立完成权利链法律核验；不得写成抖音或作者官方授权。
- 清单窗口截至 2026-08-22（Asia/Shanghai）。未续期必须删除/下架 `showcase-media-20260723-v1`、部署不含媒体的 Pages artifact 并停止推荐；仅让前端显示空态不足以阻止已有 Release 或 Pages 媒体 URL。
- 不提交 `media-import/`、`.analysis-work/`、`public/demo` 大视频、Cookie、临时下载地址、字幕原文、关键帧或模型原始响应。
- 不绕过登录、验证码、签名、风控或平台限制。遇到撤权、指纹失败或期限到期，fail closed。

## 密钥

- 真实密钥只允许在应用仓 Git-ignored 的 `.env.minimax`、`.env.doubao` 或开发者本地环境。
- 只记录变量名和配置位置，不打印、不截图、不复制值，不把服务端密钥放进 `VITE_*`。
- 当前静态 Pages 不需要模型密钥；线上内容来自已提交的确定性 Mock bundle。

## 应用门禁

```bash
cd /home/samsong/Desktop/maybe/caibao/refer/douyin
pnpm test
pnpm type-check
pnpm type-check:server
pnpm build
pnpm test:e2e
pnpm audit --prod
git diff --check
```

涉及清单或媒体时还要验证 25 个源 ID 与生成映射、10 个公开 ID、SHA/bytes/时长、H.264/AAC、Pages 同域 `video/mp4`、HTTP HEAD/Range、空目录 fail-closed 与来源链接。涉及触点时验证曝光继续播放、点击暂停、退出恢复、45 秒间隔、单并发和无数字上限。

## 文档与 PDF

- Markdown 是 PRD 唯一内容源；V2.7 本轮不生成 PDF。
- 后续如生成 PDF，只做 `pdfinfo`、文本抽取、文件可打开、页数和关键标题等机器校验。
- 用户已取消当前及后续 PDF 逐页 PNG、截图和肉眼视觉验收；必须明确写“视觉未验收”，不得声称版式通过。
