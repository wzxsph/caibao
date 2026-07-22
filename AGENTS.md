# 财经推演室｜Agent 工作约定

本文件是所有新 Agent 的入口。详细现状以 `docs/AGENT_HANDOFF.md` 为准。当前产品争议仍以
`财经推演室_PRD_V2.0.md` 裁决；`财经推演室_PRD_V2.4.md` 是加入版本治理、审核与发布门禁后的
Review Candidate，联合评审通过后才替代 V2.0。V2.3 保留为历史候选与取证快照。不得把候选稿、
PM 原型或 draft 内容写成已批准/已上线事实。

## 5 分钟接手

1. 先读 `docs/AGENT_HANDOFF.md` 的“5 分钟摘要”和“唯一第一任务”。
2. 只按当前任务再读 `docs/ARCHITECTURE.md`、`docs/TDD_TEST_PLAN.md` 或
   `docs/RESEARCH_SOURCES_AND_PROVIDERS.md`，不要一开始重读全部历史材料。
   涉及内容版本或发布时还必须读 `docs/VERSION_GOVERNANCE.md` 与
   `docs/reviews/PRD_V2.4_REVIEW.md`。
3. 在三个仓分别检查工作树，任何未提交内容先视为用户资产：

```bash
cd /home/samsong/Desktop/maybe/caibao
git status --short
git rev-parse HEAD

cd /home/samsong/Desktop/maybe/caibao/refer/douyin
git status --short
git rev-parse HEAD
git remote -v

cd /home/samsong/Desktop/maybe/caibao/refer/moneybaby
git status --short
git rev-parse HEAD
```

4. 不 push、不 reset、不恢复或删除未确认文件；先写测试，再改实现。

## 三仓边界

- 产品仓：`/home/samsong/Desktop/maybe/caibao`，分支 `main`。跟踪 PRD、PDF、配图、研究、
  ADR、计划与交接；旧版材料和 `demoUI/` 只作取证。
- 代码仓：`/home/samsong/Desktop/maybe/caibao/refer/douyin`，分支
  `feat/caibao-analysis-pipeline`，有独立 `.git`。
- PM 参考仓：`/home/samsong/Desktop/maybe/caibao/refer/moneybaby`，固定
  `7db765bab9efe1064321f03d992df42e62413a7c`，只用于取证和选择性迁移。
- 父仓忽略两个 `refer/` 子仓。不得删除任一 `.git`，不得把子仓作为父仓普通目录提交。
- 代码仓 `origin` 是项目仓 `wzxsph/douyin`，`upstream` 是公共 `zyronon/douyin`；不得向
  `upstream` push。未获得用户当次明确授权时，也不 push `origin`。

## 产品红线

- 财包在视频时间轴上多次轻量出现；半屏最高 48vh、无蒙层，回答时视频和音频继续播放。
- 内容节点最多 6 个；自动邀请最多 4 次、间隔至少 45 秒、同时最多 1 个；忽略只记“未观察”。
- 作者头像不被财包替换；总结无总分、无虚假精度、无投资建议。
- 完整沙盘、两阶段反例和复述在片尾；播放中只做预计不超过 12 秒的单一动作。
- 模型输出永远是候选。只有 evidenceId、schema、权利声明和人工审核齐全才能 approved。
- Review Candidate 只能指导探索和 draft；approved 内容必须引用已批准 PRD tag，并固化内容、
  Schema、规则、权重、Prompt、应用提交和媒体指纹等独立版本。
- 不绕过抖音登录、验证码、签名或风控；公开可见不代表有权下载或再处理。

## 密钥与隐私

- 真实密钥只在代码仓 Git-ignored 的 `.env.minimax` / `.env.doubao`，禁止打印、截图、复制或提交。
- 不运行会展开密钥的未脱敏配置命令；不得把密钥放进 `VITE_*` 或 Docker build context。
- 用户视频、ASR/OCR 原文、音轨、关键帧和模型原始响应默认不进 Git。
- 当前凭据状态和轮换要求只看 `docs/AGENT_HANDOFF.md`，不要自行探测或调用付费接口。

## 交付门禁

在代码仓至少执行：

```bash
pnpm test
pnpm type-check
pnpm type-check:server
pnpm build
pnpm test:e2e
pnpm audit --prod
git diff --check
```

涉及 PRD 时，以 Markdown 为唯一内容源重建 PDF。按用户 2026-07-23 的最新指令，当前及后续
默认只做 `pdfinfo`、文本抽取、文件可打开、页数和关键标题一致性等非视觉机器校验；不执行逐页
PNG、截图或肉眼视觉验收，且必须明确写“视觉未验收”，不得声称版式通过。任何因密钥、媒体、
FFmpeg、授权或人工审核未执行的验证，都必须在交接文档写成阻塞项，不能写成已通过。
