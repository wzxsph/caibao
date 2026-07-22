# 财经推演室｜PRD V2.3 → V2.4 差异与追溯

> **历史差异表：** V2.4 已被 V2.5 取代。本文关于“不停播”的比较只用于追溯；当前播放口径以
> `PRD_V2.4_TO_V2.5_DIFF.md` 为准：邀请不暂停，进入财包自动暂停，退出按进入前状态恢复。

状态：Review Candidate 配套差异表  
日期：2026-07-23  
旧候选：`../财经推演室_产品功能PRD_V2.3.md`  
新候选：`../财经推演室_PRD_V2.4.md`  
当前权威：V2.0

## 1. 结论

V2.4 不改变 V2.3 已收敛的用户产品形态。它解决的是“文档确定后如何安全地产生、审核、批准和发布内容”：加入独立版本向量、文档先行门禁、ReviewManifest、人工修订与批准物化、运行发布指针及回滚。

V2.3 从未批准，因此不是“V2.4 替代已上线 V2.3”。正确关系是：V2.3 固化为历史候选，V2.4 成为新的 Review Candidate；V2.0 在 V2.4 获批前继续权威。

## 2. 保持不变的产品决策

| 主题 | V2.3 | V2.4 | 判断 |
|---|---|---|---|
| 入口 | 时间轴多次财包轻邀请 | 相同 | 无变化 |
| 播放 | 打开/作答/关闭不自动 pause/mute/seek | 相同 | 红线不变 |
| 容器 | 无蒙层、≤48vh、至少 52% 视频可见 | 相同 | 红线不变 |
| 频率 | 节点 ≤6、自动邀请 ≤4、间隔 ≥45 秒 | 相同；`b8ced09d` 已实现 Planner 4/45 | 目标不变，As-Is 更新 |
| 六类交互 | 背景、判断、拨片、补边、反例、对照 | 相同 | 无变化 |
| 片尾 | 逻辑图、完整沙盘、反例、复述、报告 | 相同 | 无变化 |
| 财包身份 | 不替作者、不自由聊天、不预测市场 | 相同 | 无变化 |
| 内容目标 | 内容包定义，不硬套股票/黄金/汇率 | 相同 | 无变化 |
| 报告 | 无总分，事件/证据驱动 | 相同 | 无变化 |
| 技术栈 | Vue/Vite/Pinia/Express TypeScript | 相同 | 无变化 |

## 3. 新增规范性决策

| ID | V2.4 新增 | 原因 | 影响模块 | 主要测试 |
|---|---|---|---|---|
| N-01 | 文档先行；Review Candidate 只能生产 draft | 防止未评审需求直接成为发布事实 | 产品仓/内容门 | T-PRD-01 |
| N-02 | PRD、内容、Schema、规则、权重、Prompt、App、媒体独立版本 | 保证重放、diff 与责任可追溯 | 全链路 | T-VERSION-01/02 |
| N-03 | 内容状态拆为 generated/draft/in_review/reviewed/approved/published/retired | 不让“Schema 合法”冒充发布 | 内容仓/发布门 | T-PUB-01/02 |
| N-04 | ReviewManifest 覆盖权利、证据、财经、交互、安全和测试 | 让人工审核可执行、可审计 | Review Gate | T-REVIEW-01 |
| N-05 | `PATCH /analysis/jobs/:jobId/draft` 生成新 draft revision | 支持人工修订且防并发覆盖 | Analysis API | T-DRAFT-01 |
| N-06 | `POST /analysis/jobs/:jobId/publish` 物化不可变 ApprovedExperience | 沿用锁定接口名，但不直接切运行指针 | Analysis API | T-JOB-PUBLISH-01/02 |
| N-07 | `/content/versions/:contentVersion/publish|retire` 管运行指针 | 把批准与分发、回滚分离 | Runtime Content API | T-CONTENT-PUBLISH-01 |
| N-08 | P0 可用受控 CLI/API 完成门禁，完整审核 UI 可 P1 | 避免 UI 阻塞最小可信链 | Backend/Ops | API/CLI 负向测试 |
| N-09 | PRD 批准门与内容发布门分离 | 视频授权不制造文档批准循环等待 | Governance | Review checklist |
| N-10 | PDF 只做非视觉机器 QA，明确视觉未验收 | 遵守用户最新指令 | Docs | pdfinfo/pdftotext |

## 4. As-Is 更新

V2.3 取证时的代码基线是 `17f06c66`。V2.4 评审包采用以下更新事实：

| 能力 | V2.3 记录 | V2.4 当前事实 | 未完成边界 |
|---|---|---|---|
| Planner | 契约仍允许自动 6，目标 4 | `b8ced09d` 默认值/硬上限 4，min gap 45 秒 | PM 六候选仍需 adapter 选择 |
| Server payload | 3 类白名单 | `b8ced09d` 六类均可离线成稿 | 新三类未进入完整运行 E2E |
| 自动化 | 20 client / 84 server / 6 E2E | `b8ced09d` 20 / 102 / 6 全绿 | E2E 仍为三类 fixture；真实 Provider 未验 |
| 回环绑定 | 裸 `vite --host` 是风险 | 未 push foundation `4b34da1f` 有修复和 3 断言 | 能力只存在该分支；合并/推送仍是后续代码任务 |
| 当前代码工作树 | 服务端并发修改 | 当前有外部媒体/fixture 未提交工作 | 本文档任务完全不触碰 |

外部未提交项为：删除工程占位 WebM、修改 `finance-fed-v1.ts` 与 `src/mock/index.ts`、新增未跟踪 `finance-real-venezuela.mp4`。它们不进入本次产品仓提交，也不证明媒体授权、作者一致或真内容 E2E 已完成。

## 5. API 语义差异

V2.3 只列内容分析读取和 P0 运行 API，人工审核/发布仍是缺口。V2.4 固定最小写链：

```text
PATCH analysis job draft
→ POST job reviews
→ POST job publish（reviewed draft → immutable ApprovedExperience）
→ POST content version publish（切运行指针）
→ POST content version retire（撤销新会话/必要时回滚）
```

`job publish` 与 `content publish` 名字相近但语义不同：前者是批准物化，后者是运行分发。两者必须有不同权限、幂等键、审计事件和负向测试。

## 6. PM 迁移差异

V2.3 已决定“只迁内容，不迁 React/UI”。V2.4 再增加三个门：

1. adapter 输出必须固化完整版本向量，且始终保持 draft。
2. 人工修改通过 draft PATCH 形成新 revision，不原位覆盖 PM 版本。
3. 只有已批准 PRD baseline + 完整 ReviewManifest 才能 job publish；运行端仍需 content publish 指针。

未授权 PM 视频不复制进产品仓或公开 Git；真实媒体、作者、字幕、证据和时间码必须重新校验。

## 7. 测试追溯增量

| V2.4 需求 | 新/强化用例 | 失败即阻止 |
|---|---|---|
| F-17 PM 适配仍 draft | T-ADAPT-01 | reviewed/approved |
| F-18 ReviewManifest | T-REVIEW-01 | job publish |
| F-19 独立版本 | T-VERSION-01/02 | review/approve |
| F-20 发布指针 | T-JOB-PUBLISH、T-CONTENT-PUBLISH | runtime distribution |
| 人工 draft revision | T-DRAFT-01 | 并发覆盖/审计丢失 |
| 候选 PRD 越权 | T-PRD-01 | approved/published |

V2.3 的不停播、48vh、六类、恢复、规则、报告、安全与 40 条复述金标测试继续有效。

## 8. 文档与批准差异

- V2.3 的状态永远保留为历史候选，不回写签字。
- V2.4 的真实评审落在 `reviews/PRD_V2.4_REVIEW.md`；当前全部未评审。
- V2.4 获批需原子更新 Markdown 状态、PDF、评审记录、AGENTS/交接/计划指针，并合并到 `main`。
- 只有完成上述动作后才创建 annotated tag `prd-v2.4-approved`。
- 当前分支不创建批准 tag、不 push、不声称团队已统一签字。

## 9. 发布阻塞保持不变

V2.4 没有解除以下阻塞：首视频/作者授权、最终 ASR/OCR/时间码与财经人审、真实 Provider 验证、完整六类真实时间轴 E2E、公网后端安全、规则沙盘审核、复述金标、底座与第三方资产许可。

因此 V2.4 即使成为 Approved PRD，也不等于首内容包可以公开发布；内容仍须单独通过发布门。
