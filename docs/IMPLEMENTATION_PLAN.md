# 财包 V2.7｜实施计划

状态：Review Candidate 配套；工程展示已上线，生产内容链未完成  
日期：2026-07-23

## 1. 目标

在不混淆工程原型与生产审批的前提下，完成三层交付：

1. 可公开访问的 25 条清单视频展示与轻交互；
2. 可复现、可审核的真实 ASR/OCR/视觉内容生成链；
3. Draft→Review→Approved→Published 与学习报告闭环。

## 2. 已完成基线

### M0｜仓库与文档治理

- [x] 产品仓、应用仓、PM 参考仓边界明确。
- [x] V2.7 为最新 Review Candidate，V2.0 仍为批准基线。
- [x] 自动触点固定数量上限取消。
- [x] 密钥、媒体、运行产物与子仓隔离。

### M1｜25 条目录与 Mock 内容

- [x] manifest 25 条全部进入 Catalog。
- [x] `finance-showcase-<videoId>` 一一映射 25 个 Experience。
- [x] 两作者分布 15/10，逐条原作品链接。
- [x] 六类确定性 LLM Mock；141 个 automatic 触点。
- [x] 当前 3–6 个/视频仅为生成结果，不作为产品上限。

完成证据：应用提交 `70e05e70`，同步合并提交 `dd6cfa0b`，最终 `master=e85de2bf`。

### M2｜浏览器媒体

- [x] 25 条 HEVC 源生成 H.264/AAC、`yuv420p`、fast-start 派生。
- [x] 源/派生 SHA、bytes、时长校验。
- [x] 25 MP4 + 25 JPG 上传 Release `showcase-media-20260723-v1`。
- [x] Git 不跟踪源或派生视频。

### M3｜前端产品壳

- [x] 只保留 `#/home` 推荐流和 `#/author/:authorSlug` 作者页。
- [x] 旧路由 catch-all 回到首页，不再暴露旧底座产品形态。
- [x] 入口曝光不停播、点击暂停、退出恢复。
- [x] 半屏≤48vh、无蒙层、作者/财包分离、时间轴重访。
- [x] 来源归属、Mock/未审核/非投资建议披露。

### M4｜测试、PR 与部署

- [x] Client 44、Server 131、Playwright 8。
- [x] 两套 type-check、build、production audit、diff-check。
- [x] PR #3 合并到 `wzxsph/douyin/master`。
- [x] Pages workflow run `29955704172` 成功。
- [x] 线上 25 条/来源/播放/暂停恢复/作者页浏览器验证。

## 3. 下一阶段：真实多模态垂直切片

### M5｜2–3 条黄金视频

目标：先证明证据质量，不立即对 25 条全量调用 Provider。

- [ ] 选 2–3 条题材和画面复杂度不同的视频。
- [ ] 固化媒体指纹、最终字幕版本和人工时间窗金标。
- [ ] 跑 ASR、OCR、关键帧/视觉；输出统一 `EvidenceItem`。
- [ ] 校验多来源聚合、时间对齐、置信度和费用。
- [ ] 记录 MiniMax 与豆包质量/延迟/费用/失败降级对比。

完成定义：每个候选概念、因果、条件、反例均可追溯 evidenceId；人工复核能解释为何在该时间出现触点。

### M6｜语义生成与 Planner

- [ ] 证据时间轴→语义图→Critic/Schema Repair。
- [ ] 六类 Payload 只生成 Draft。
- [ ] Planner 基于证据、学习价值、重复度和≥45秒间隔确定性排序。
- [ ] 不存在 `maxAutomaticCues=4/6`；输出取舍原因。
- [ ] 未知或证据不足返回 blocker/insufficient。

完成定义：相同输入/版本输出稳定；第 5、6、7 个合格节点不会因数字上限丢失。

### M7｜审核与发布

- [ ] `PATCH draft` 乐观锁与 revision。
- [ ] ReviewManifest 覆盖版权、作者、时间码、财经、安全、测试和版本。
- [ ] 缺 blocker 时 publish 409。
- [ ] ApprovedExperience 不可变；content publish 单独切运行指针。
- [ ] 公共环境关闭审核写接口。

完成定义：generated/draft/reviewed/approved/published/retired 无越级；负向用例通过。

### M8｜会话、报告与安全

- [ ] Session/Event API 与 localStorage 恢复。
- [ ] `eventId` 幂等，切换/刷新不重复计数。
- [ ] 沙盘、复述评价、模板兜底和证据报告。
- [ ] 40 条复述金标及安全红队。
- [ ] 无总分、财富画像或投资建议。

完成定义：断网、超时、非法 JSON 和会话丢失仍能完成非空报告。

## 4. 发布与权利工作流

### M9｜到期/撤权 Runbook（最高优先级）

- [ ] 指定 Release Owner 和替补责任人。
- [ ] 在 2026-08-22 前确认续期或 retire 决策。
- [ ] retire 顺序：下架 Release → 发布移除/空目录 → 验证直链不可访问 → 保存审计记录。
- [ ] 不把前端到期判断当成媒体删除。

### M10｜生产批准

- [ ] V2.7 产品、设计、研发、测试、财经、版权、安全真实签字。
- [ ] 公网分发权独立核验并覆盖目标环境/期限。
- [ ] 完整多模态、内容、人审、发布、报告 E2E。
- [ ] 原子切换权威并创建 annotated `prd-v2.7-approved`。

当前不得执行 M10 的批准标签动作。

## 5. 提交顺序建议

后续应用代码每层独立提交：

1. `test(evidence): lock multimodal golden fixtures`
2. `feat(evidence): build ASR OCR and vision timeline`
3. `test(planner): remove numeric cue caps and lock spacing`
4. `feat(pipeline): generate evidence-backed draft cues`
5. `feat(review): add review manifest and blockers`
6. `feat(publish): materialize immutable approved content`
7. `feat(runtime): add sessions events and reports`
8. `test(e2e): cover provider fallback and publication gates`
9. `docs: record exact versions and handoff`

不将 Provider、审核、发布、前端与内容全量迁移压成一个不可回滚大提交。

## 6. 当前不做

- 不批量爬取或绕过抖音限制。
- 不把标题 Mock 批量送审为正式财经内容。
- 不在 GitHub Pages 暴露服务端密钥或审核写接口。
- 不在未续期时继续保留 Release 资产。
- 不生成 V2.7 PDF；若未来生成，不做 PDF 视觉验收。

## 7. 下一位 Agent 第一任务

先做 M9：为 `showcase-media-20260723-v1` 写可执行 retire/续期 Runbook 与负责人字段，并验证 Release 资产可以完整枚举和删除。随后才进入 M5，选择 2–3 条黄金视频搭建真实证据链。
