# 财包 · 财经推演室

财包是一套“边看财经视频、边做轻量因果推演”的移动 Web/PWA 产品。系统在视频关键时间点出现轻量入口；入口曝光时继续播放，用户主动点开后才暂停，完成、跳过或关闭后按进入前状态恢复。

线上工程原型：<https://wzxsph.github.io/douyin/#/home>

> 当前线上内容是 `internal_poc`：完整清单与生成管线保留 25 条，公开页从中展示 10 条；学习交互为确定性 LLM Mock，仅依据标题和清单元数据生成，尚未使用最终 ASR/OCR，也未完成财经人工审核，不构成投资建议。

## 当前产品形态

- 首页只有竖屏财经视频推荐流，作者入口进入对应作者作品页。
- 当前公开目录共 10 条：小Lin说 5 条、大陆姓陆 5 条；每条都展示抖音原作品链接和作者归属。底层 manifest 与内容生成仍覆盖全部 25 条。
- 观看中出现“财包轻触点”：入口轻、无蒙层；点开后使用不超过 48vh 的半屏交互。
- 触点不设“自动最多 4 个”或其他产品级固定数量上限。当前 Mock 每条生成 3–6 个，是六类模板和视频时长共同形成的实现结果，不是规范上限。
- 自动邀请之间至少间隔 45 秒，同一时间只允许一个交互；视频不自动 seek，不改静音、音量或倍速。
- 六类模板为背景卡、快速判断、因果拼接、条件滑杆、反例翻转、概念辨析。
- 作者头像与财包身份严格分离；总结不显示总分、虚假精度、财富画像或投资建议。

## 2026-07-23 可复现基线

| 项目               | 当前事实                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| 应用仓             | `wzxsph/douyin`                                                                                                           |
| 应用 `master`      | `9b5bd02503c951a8b416e66bdd81f48ba89931d5`                                                                                |
| 展示 / 播放修复 PR | [#3](https://github.com/wzxsph/douyin/pull/3) / [#4](https://github.com/wzxsph/douyin/pull/4)                             |
| 媒体 Release       | <https://github.com/wzxsph/douyin/releases/tag/showcase-media-20260723-v1>                                                |
| Pages 部署         | <https://wzxsph.github.io/douyin/#/home>                                                                                  |
| 媒体               | Release 保留 25 个 H.264/AAC 派生视频 + 25 张封面；Pages artifact 同域暂存公开 10 条，共 68,687,281 bytes；Git 不跟踪媒体 |
| 内容               | 25 个 `internal_poc` Experience，141 个自动触点                                                                           |
| 自动触点分布       | 1 条视频 3 个、1 条 4 个、4 条 5 个、19 条 6 个                                                                           |
| 测试               | 前端 45、服务端 131、Playwright 8；两端 type-check、production build、production audit、diff-check 通过                   |

此前无法播放的直接原因是浏览器需从 GitHub Release 跳转到 `release-assets.githubusercontent.com`，最终响应还是 `application/octet-stream` + attachment；部分网络或内嵌浏览器无法稳定流式播放。现已改为 Pages 同域 `/douyin/media/*.mp4`。线上实测确认：10 个原作链接、作者页 5/5；首条视频 `readyState=4` 且持续播放，媒体为 `video/mp4`，完整请求 200、Range 请求 206。

## 数据、权利与到期处理

- 唯一清单源是应用仓本地忽略路径 `media-import/authorized-douyin/download-manifest.json`；线上只发布由该清单生成的静态目录和浏览器派生媒体。
- 公网展示是用户 2026-07-23 的直接发布要求；项目没有独立完成权利链法律核验，不能把用户声明表述为平台或作者官方授权。
- 当前清单记录的窗口截至 2026-08-22（Asia/Shanghai）。未续期时必须下架/删除媒体 Release、部署不含媒体的 Pages artifact，并停止推荐；静态页面空态不能代替媒体撤下。
- 原始 HEVC 视频、Cookie、临时下载地址、ASR/OCR 原文、关键帧和模型原始响应不进入 Git。
- 不绕过抖音登录、验证码、签名或风控；公开可见不等于可下载或可再分发。

## 仓库边界

- 产品与文档仓：`/home/samsong/Desktop/maybe/caibao`，远端 `wzxsph/caibao`。
- 应用仓：`/home/samsong/Desktop/maybe/caibao/refer/douyin`，远端 `wzxsph/douyin`。
- PM 参考仓：`/home/samsong/Desktop/maybe/caibao/refer/moneybaby`，只作设计取证，不直接搬运 React/Vinext 页面。

两个 `refer/` 子仓均保留自己的 `.git`，不能作为产品仓普通目录提交。媒体、缓存、密钥和运行产物保持 Git ignored。

## 文档入口

1. [AGENTS.md](AGENTS.md)：所有新 Agent 的第一入口。
2. [Agent 交接](docs/AGENT_HANDOFF.md)：精确代码、部署、测试与下一任务。
3. [PRD V2.7](财经推演室_PRD_V2.7.md)：最新 Review Candidate。
4. [V2.6 → V2.7 差异](docs/PRD_V2.6_TO_V2.7_DIFF.md)。
5. [架构](docs/ARCHITECTURE.md)、[TDD](docs/TDD_TEST_PLAN.md)、[实施计划](docs/IMPLEMENTATION_PLAN.md)、[版本治理](docs/VERSION_GOVERNANCE.md)。

PRD V2.0 仍是已批准基线；V2.7 是最新候选。用户最新直接裁决的“25 条完整输入、10 条公开展示”、进入暂停、公开 Pages、来源归属和取消自动触点数量上限即时覆盖旧文档中的相反条款，但不会自动批准 V2.7 的其他内容。

## 本地运行应用

```bash
cd /home/samsong/Desktop/maybe/caibao/refer/douyin
corepack pnpm install --frozen-lockfile
pnpm dev
```

浏览器访问 `http://127.0.0.1:3001/#/home`。本地真实媒体需要先按应用仓 README 准备派生文件；公开预览由 Actions 从 Release 校验并暂存 10 条到 Pages artifact，浏览器只读取同域媒体。

完整门禁：

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
- 本轮 V2.7 不生成 PDF。后续若生成，只执行可读取、页数、文本抽取和关键标题等机器校验；按用户要求不做 PDF 逐页视觉验收，也不得声称版式已通过。
- V2.7 未完成真实角色联合评审，不创建 `prd-v2.7-approved` 标签。
