# 财包 · 财经推演室

财包是一套“边看财经视频、边做轻量因果推演”的移动 Web/PWA 产品。系统在视频关键时间点出现轻量入口；入口曝光时继续播放，用户主动点开后才暂停，完成、跳过或关闭后按进入前状态恢复。

线上工程原型：<https://wzxsph.github.io/douyin/#/home>

> 当前线上内容是 `internal_poc`：25 条视频来自用户提供的授权清单，学习交互为确定性 LLM Mock，仅依据标题和清单元数据生成，尚未使用最终 ASR/OCR，也未完成财经人工审核，不构成投资建议。

## 当前产品形态

- 首页只有竖屏财经视频推荐流，作者入口进入对应作者作品页。
- 当前目录共 25 条：小Lin说 15 条、大陆姓陆 10 条；每条都展示抖音原作品链接和作者归属。
- 观看中出现“财包轻触点”：入口轻、无蒙层；点开后使用不超过 48vh 的半屏交互。
- 触点不设“自动最多 4 个”或其他产品级固定数量上限。当前 Mock 每条生成 3–6 个，是六类模板和视频时长共同形成的实现结果，不是规范上限。
- 自动邀请之间至少间隔 45 秒，同一时间只允许一个交互；视频不自动 seek，不改静音、音量或倍速。
- 六类模板为背景卡、快速判断、因果拼接、条件滑杆、反例翻转、概念辨析。
- 作者头像与财包身份严格分离；总结不显示总分、虚假精度、财富画像或投资建议。

## 2026-07-23 可复现基线

| 项目 | 当前事实 |
|---|---|
| 应用仓 | `wzxsph/douyin` |
| 应用 `master` | `e85de2bfa1743aaea5204f6e1513de6d56c2e310` |
| 变更 PR | <https://github.com/wzxsph/douyin/pull/3> |
| 媒体 Release | <https://github.com/wzxsph/douyin/releases/tag/showcase-media-20260723-v1> |
| Pages 部署 | <https://wzxsph.github.io/douyin/#/home> |
| 媒体 | 25 个 H.264/AAC 浏览器派生视频 + 25 张封面；约 167 MiB，本仓与应用 Git 均不跟踪视频 |
| 内容 | 25 个 `internal_poc` Experience，141 个自动触点 |
| 自动触点分布 | 1 条视频 3 个、1 条 4 个、4 条 5 个、19 条 6 个 |
| 测试 | 前端 44、服务端 131、Playwright 8；两端 type-check、production build、production audit、diff-check 通过 |

线上浏览器实测已确认：25 条卡片和 25 个原作链接存在，Release 视频可播放，点击财包暂停、关闭后恢复，“大陆姓陆”作者页为 10 条。

## 数据、权利与到期处理

- 唯一清单源是应用仓本地忽略路径 `media-import/authorized-douyin/download-manifest.json`；线上只发布由该清单生成的静态目录和浏览器派生媒体。
- 公网展示是用户 2026-07-23 的直接发布要求；项目没有独立完成权利链法律核验，不能把用户声明表述为平台或作者官方授权。
- 当前清单记录的窗口截至 2026-08-22（Asia/Shanghai）。未续期时必须下架/删除媒体 Release，并停止推荐；静态页面的空态不能代替 Release 资产下架。
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

PRD V2.0 仍是已批准基线；V2.7 是最新候选。用户直接裁决的 25 条展示、进入暂停、公开 Pages、来源归属和取消自动触点数量上限即时覆盖旧文档中的相反条款，但不会自动批准 V2.7 的其他内容。

## 本地运行应用

```bash
cd /home/samsong/Desktop/maybe/caibao/refer/douyin
corepack pnpm install --frozen-lockfile
pnpm dev
```

浏览器访问 `http://127.0.0.1:3001/#/home`。本地真实媒体需要先按应用仓 README 准备派生文件；公开预览从 GitHub Release 读取媒体。

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
