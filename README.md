# 财包 · 财经推演室

财包是一套“边看财经视频、边做轻量因果推演”的移动 Web/PWA 产品。系统在视频关键时间点出现轻量入口；入口曝光时继续播放，用户主动点开后才暂停，完成、跳过或关闭后按进入前状态恢复。

主仓预览：<https://wzxsph.github.io/caibao/#/home>

> 当前线上内容是 `internal_poc`：完整清单与生成管线覆盖 25 条，公开页展示其中 10 条；学习交互是只依据标题和清单元数据生成的确定性 Mock，尚未使用最终 ASR/OCR/视觉证据，也未完成财经人工审核，不构成投资建议。

## 当前产品形态

- 首页只有竖屏财经视频推荐流，作者入口进入对应作者作品页。
- 当前公开目录共 10 条：小Lin说 5 条、大陆姓陆 5 条；每条展示作者归属和抖音原作品链接。
- 观看中出现“财包轻触点”：无蒙层；点开后视频暂停并使用不超过 48vh 的半屏交互。
- 自动触点不设固定数量上限；相邻自动邀请至少间隔 45 秒，同时只允许一个交互。
- 六类模板为背景卡、快速判断、因果拼接、条件滑杆、反例翻转、概念辨析。
- 作者头像与财包身份严格分离；总结不显示总分、虚假精度、财富画像或投资建议。

## 声音与播放

视频文件与播放链路支持声音。浏览器通常不允许页面未经用户操作就有声自动播放，因此首次进入会先静音播放，并显示 44px 的“点击开启声音”入口。点击视频、中央播放键或声音入口会在同一次用户手势中解除静音并播放，选择保存在当前站点；若浏览器仍拒绝播放，页面显示“点击有声播放”，不会静默失败。

财包交互自身不得改变静音、音量或倍速。这里的“不得改变静音”只约束 POI/半屏状态机，不禁止用户显式开关声音。

## 唯一代码源

从 2026-07-23 起，前端、Express 后端、生成管线与测试统一维护在本仓库：

```text
/home/samsong/Desktop/maybe/caibao/apps/web
https://github.com/wzxsph/caibao/tree/main/apps/web
```

旧 `wzxsph/douyin` 仓只保留迁移历史和媒体 Release，不再作为应用入口或代码源。旧 Pages 工作流已停用，旧站仅保留到本页的迁移跳转。迁移采用精简源码快照，没有带入约 616MB 的旧 Git 历史、旧推荐数据、旧商城/消息/个人中心、采集器、依赖、缓存、密钥或视频。来源与精确提交见 [`apps/web/IMPORT_PROVENANCE.md`](apps/web/IMPORT_PROVENANCE.md)。

当前应用发布基线为主仓提交 `65151c9b7f6625aca2558d25a2b2907a852ceb7d`；[Pages workflow 29972348075](https://github.com/wzxsph/caibao/actions/runs/29972348075) 成功。线上实测首条同域 MP4 为 `readyState=4`、无错误且持续播放；首次有声入口点击后 `muted=false`、`paused=false`，Range GET 返回 206。

## 媒体与权利

- 完整清单是本地 Git-ignored 的 `apps/web/media-import/authorized-douyin/download-manifest.json`；公开集合由 `apps/web/src/showcase/public-video-ids.json` 固定选择 10 条。
- 25 个 H.264/AAC 派生视频和 25 张封面仍保存在 [`showcase-media-20260723-v1`](https://github.com/wzxsph/douyin/releases/tag/showcase-media-20260723-v1)；Pages 构建只校验并暂存公开十条，Git 不跟踪媒体。
- 项目没有独立完成权利链法律核验，不得把用户声明写成平台或作者官方授权。
- 当前清单窗口截至 2026-08-22（Asia/Shanghai）；未续期必须下架 Release 并部署不含媒体的 Pages artifact，不能只隐藏前端。
- 不绕过抖音登录、验证码、签名或风控；公开可见不等于可任意下载或再分发。

## 文档入口

1. [`AGENTS.md`](AGENTS.md)：所有新 Agent 的第一入口。
2. [`docs/AGENT_HANDOFF.md`](docs/AGENT_HANDOFF.md)：代码、部署、测试和下一任务。
3. [`财经推演室_PRD_V2.7.md`](财经推演室_PRD_V2.7.md)：最新 Review Candidate。
4. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)、[`docs/TDD_TEST_PLAN.md`](docs/TDD_TEST_PLAN.md)、[`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md)、[`docs/VERSION_GOVERNANCE.md`](docs/VERSION_GOVERNANCE.md)。

PRD V2.0 仍是已批准基线；V2.7 是最新候选。用户直接裁决即时覆盖旧文档中的相反条款，但不会自动批准 V2.7 的其他内容。

## 本地运行

```bash
cd /home/samsong/Desktop/maybe/caibao/apps/web
corepack pnpm install --frozen-lockfile
pnpm dev
```

浏览器访问 `http://127.0.0.1:3000/#/home`。详细媒体、API 和 Provider 配置见 [`apps/web/README.md`](apps/web/README.md)。

完整离线门禁：

```bash
pnpm test
pnpm type-check
pnpm type-check:server
pnpm build
pnpm test:e2e
pnpm audit --prod
git diff --check
```

## 文档交付规则

- Markdown 是 PRD 唯一内容源。
- V2.7 不生成 PDF。后续若生成，只执行可读取、页数、文本抽取和关键标题机器校验；按用户要求不做 PDF 逐页视觉验收，也不得声称版式已通过。
- V2.7 未完成真实角色联合评审，不创建 `prd-v2.7-approved` 标签。
