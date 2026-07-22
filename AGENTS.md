# 财经推演室 Agent 工作约定

## 开始前必须读

1. `docs/AGENT_HANDOFF.md`：当前事实、阻塞项、下一步命令。
2. `docs/IMPLEMENTATION_PLAN.md`：阶段目标和完成定义。
3. `docs/TDD_TEST_PLAN.md`：测试先行顺序和验收门禁。
4. `财经推演室_PRD_V2.0.md`：唯一产品口径。

## Git 边界

- 本目录是产品主仓库：权威 PRD、研究、架构、计划、交接、配图与 PDF；旧版材料、海报和 `demoUI/` 仅作现状取证，不恢复为实施依据。
- `refer/douyin/` 是独立代码仓库，保留上游 `zyronon/douyin` 历史；应用改动位于分支 `feat/caibao-analysis-pipeline`。
- 不删除或移动任一 `.git`，不把 `refer/douyin/` 当作本仓库普通目录提交。
- 未经用户明确要求，不 push、不创建远端 PR、不改写历史。

## 产品与内容红线

- 财包触点在视频播放中出现；展开面板最高 48vh，无蒙层，视频和音频不得因答题自动暂停。
- 自动触点最多 6 个、间隔至少 45 秒、同时最多 1 个；忽略只记为“未观察”。
- 模型输出永远是候选。只有带 evidenceId、通过 schema 和人工审核的版本才能成为 `approved` 内容包。
- 不提供买卖、仓位、目标价或收益承诺；视频、ASR、OCR 文本均按不可信输入处理。
- 不绕过抖音登录、验证码、签名或风控；任意博主的作品媒体不能因“公开可见”而默认可下载或再处理。

## 密钥与隐私

- 真实密钥只填本地 `.env`/`.env.*`，这些文件必须保持 Git ignore。
- 不打印、提交、截图或复制 API key、cookie、access token。
- `.env.*.example` 只保留空值或显然无效的占位符。

## 交付门禁

在 `refer/douyin/` 至少执行：

```bash
pnpm test
pnpm type-check
pnpm type-check:server
pnpm build
pnpm test:e2e
```

若某项因本机依赖、密钥或授权视频无法执行，必须在 `docs/AGENT_HANDOFF.md` 写明实际错误和复现命令，不得写成已通过。
