# 财包 · 财经推演室

> 让财经视频从“看过”变成“能讲清因果、条件与反例”。

财包是面向财经长视频的移动 Web / PWA 学习陪练。它先用 ASR、OCR 与多模态模型理解视频，
再把需要补背景、判断条件或验证因果的时刻编排成轻量时间轴触点。邀请出现时不打断观看；
用户主动进入财包后视频自动暂停，退出时按进入前状态恢复。看完后可以继续做条件沙盘、
反例挑战和复述，得到一份有证据、无总分的理解报告。

[体验工程 Demo](https://wzxsph.github.io/douyin/?demo=finance-fed#/home) ·
[阅读 PRD V2.5](财经推演室_PRD_V2.5.md) ·
[查看评审 PDF](output/pdf/财经推演室_PRD_V2.5.pdf) ·
[5 分钟接手](docs/AGENT_HANDOFF.md)

> V2.5 目前仍是 Review Candidate；在联合评审完成前，[PRD V2.0](财经推演室_PRD_V2.0.md)
> 仍是已批准基线，但其中“不自动暂停”条款已被用户 2026-07-23 最新指令覆盖。

## 产品形态

观看中，财包只做轻量、可忽略的小动作：

- 在关键时间点出现 4–6 秒轻提示，错过后仍可从时间轴回看；
- 点击进入后视频在当前位置自动暂停；展开后无蒙层、最多占 48vh；
- 完成、跳过或关闭时，进入前正在播放才从原位置续播；进入前已暂停则保持暂停；
- 自动邀请最多 4 次、间隔至少 45 秒，同时只处理一个触点；
- 支持背景卡、快速判断、因果拼接、条件滑杆、反例翻转和概念辨析；
- 不替换作者头像，不显示虚假分数，不提供买卖、仓位或目标价建议。

片尾再承载完整逻辑图、显式运行的条件沙盘、两阶段反例、三句话复述与证据报告。

```text
有权视频
  → FFmpeg / ASR / OCR / 多模态理解
  → 证据时间轴与语义图
  → 触点评分、频控与六类交互草稿
  → 人工审核与不可变内容版本
  → 观看中轻触点
  → 片尾深挖与证据报告
```

## 当前进展

| 模块 | 当前状态 |
|---|---|
| 产品口径 | V2.5 候选稿已统一“邀请不停播、进入自动暂停、退出按原状态恢复”，尚待真实联合签字 |
| 视频运行时 | 已有 Vue/Vite 抖音式 Feed、播放器、财包轻提示、无蒙层半屏和学习足迹；暂停状态机尚待按 V2.5 重构 |
| 交互类型 | 前端六类渲染器及服务端六类 Payload 已有离线测试；公开 Demo 仍以工程 Fixture 为主 |
| 生成管线 | 已有 FFmpeg、ASR/OCR Provider、语义图、修复、Planner、规则方向和 CoverageReport 垂直切片 |
| 发布链路 | 模型只生成 Draft；人工审核、Approved API、持久发布指针和回滚仍待实现 |
| 真实内容 | 授权、作者一致性、最终字幕/时间码、财经审核和真实 Provider 全链路仍是发布阻塞项 |

最新可执行状态、分支和测试数字以 [Agent 交接](docs/AGENT_HANDOFF.md) 为准，README 不固定容易过期的
工作树状态。

## 仓库定位

`caibao` 从现在起是项目主仓：

- 产品需求、架构、测试口径、版本治理、评审记录、Issue 与后续 Release 以本仓为准；
- 新 Agent 首先阅读本仓 [AGENTS.md](AGENTS.md) 与 [交接文档](docs/AGENT_HANDOFF.md)；
- 当前可运行应用仍在过渡代码仓 [wzxsph/douyin](https://github.com/wzxsph/douyin)，本地放在
  `refer/douyin/`，后续工程收敛以本仓计划为准；
- PM 原型 [prac-fect/moneybaby](https://github.com/prac-fect/moneybaby) 只作为设计与内容结构参考，
  不是第二套产品运行时。

```text
caibao/
├── README.md                         # 项目首页
├── 财经推演室_PRD_V2.5.md             # 最新评审候选
├── docs/
│   ├── AGENT_HANDOFF.md              # 当前事实、阻塞和接手顺序
│   ├── ARCHITECTURE.md               # 产品与技术架构
│   ├── GENERATION_PIPELINE_DESIGN.md # ASR/OCR/多模态生成管线
│   ├── TDD_TEST_PLAN.md              # 测试与验收口径
│   └── VERSION_GOVERNANCE.md         # PRD、内容和规则版本治理
├── assets/                           # PRD 配图和产品取证
├── output/pdf/                       # 评审 PDF
└── refer/                            # 本地参考仓；默认不进入 caibao Git
```

## 快速开始

### 产品、设计与评审

建议按以下顺序阅读：

1. [PRD V2.5](财经推演室_PRD_V2.5.md)
2. [V2.4 → V2.5 差异](docs/PRD_V2.4_TO_V2.5_DIFF.md)
3. [V2.5 评审表](docs/reviews/PRD_V2.5_REVIEW.md)
4. [技术架构](docs/ARCHITECTURE.md)
5. [实施计划](docs/IMPLEMENTATION_PLAN.md)

### 本地运行当前工程

```bash
git clone https://github.com/wzxsph/caibao.git
cd caibao

git clone --branch feat/caibao-analysis-pipeline \
  https://github.com/wzxsph/douyin.git refer/douyin

cd refer/douyin
pnpm install --frozen-lockfile
pnpm test
pnpm type-check
pnpm type-check:server
pnpm build
pnpm test:e2e
```

本地启动时只绑定回环地址：

```bash
pnpm exec vite --host 127.0.0.1 --port 3001 --strictPort
# http://127.0.0.1:3001/?demo=finance-fed
```

模型、ASR 与 OCR 配置模板位于代码仓 `.env.minimax.example` 和 `.env.doubao.example`。
不要提交真实密钥，也不要在没有素材处理权和费用确认时运行真实分析任务。

## 文档权威与交付规则

- Markdown 是 PRD 唯一内容源，PDF 只用于评审分发；
- V2.5 获批前保持 Review Candidate，不创建 `prd-v2.5-approved` 标签；
- PRD、内容包、Schema、规则、Prompt、媒体指纹与应用提交分别版本化；
- 模型不能直接发布内容，也不能改变确定性方向规则；
- 所有内容结论必须能追溯到 evidenceId、媒体版本和真实审核记录。

## 合规说明

本项目用于财经知识理解与学习反馈，不构成投资建议。公开视频可访问不等于拥有下载、加工或再发布权；
任何真实视频进入分析或发布链路前，都必须完成授权、作者、媒体指纹与内容审核。

本仓目前未提供开源许可证；公开可见不代表获得复制、修改、分发或商业使用授权。抖音仿真底座的
上游许可与非商业限制也需要在商业化前单独完成审查。
