# 财经推演室｜文档、内容与发布版本治理

状态：Review Candidate 配套治理规则  
日期：2026-07-23  
当前产品权威：`财经推演室_PRD_V2.0.md`  
最新候选产品口径：`财经推演室_PRD_V2.5.md`  
历史候选：`财经推演室_产品功能PRD_V2.3.md`、`财经推演室_PRD_V2.4.md`

## 1. 目的

本文件解决五个问题：哪个 PRD 有权裁决、何时升级文档版本、内容版本如何独立演进、批准与发布如何留下证据，以及 Agent 如何在三个仓库间安全交接。

核心原则是“规范先批准，内容后生产；生成、审核、批准、发布彼此分离”。本文件存在不等于 V2.5 已批准，也不授予任何 Agent 创建批准标签或把 draft 升级为 approved 的权限。用户直接裁决的“进入财包自动暂停”优先于旧 PRD 的相反条款，但不会自动批准 V2.5 的其他内容。

## 2. 权威优先级

1. 用户当次最新明确指令。
2. 已批准且未被替代的 PRD；当前为 V2.0。
3. `AGENTS.md` 与 `docs/AGENT_HANDOFF.md` 的事实/安全边界。
4. Architecture、TDD、ADR 与实施计划。
5. Review Candidate；当前为 V2.5。
6. 历史候选 V2.3/V2.4、PM V2.2、旧 PRD、原型与口头示例。

Review Candidate 可以指导评审、设计探索和 draft 实验，但不得：

- 改写当前权威状态。
- 成为 approved 内容的 `prdBaseline`。
- 触发批准标签、公开发布或生产数据迁移。
- 把目标架构写成 As-Is。

## 3. PRD 版本规则

采用 `Major.Minor.Patch` 语义，但文件主版本通常保留到 Minor：

| 变更 | 版本动作 | 示例 |
|---|---|---|
| 错字、链接、排版或 PDF 元数据；不改变规范行为 | Patch | V2.4.1 |
| 功能范围、交互约束、API、版本/审核门禁、P0 验收变化 | Minor | V2.5 |
| 核心产品形态、运行栈或兼容性断代 | Major | V3.0 |

以下不是独立升级 PRD 的理由：内容文案/证据修订、审核人变化、单个视频替换、规则表在已批准接口内扩展、应用 bugfix。它们应升级各自内容/规则/应用版本。

若无法确定是否规范性变化，先按 Minor 候选处理；评审确认无行为变化后再降为 Patch，不能先静默落代码。

## 4. PRD 生命周期

```text
Draft → Review Candidate → Approved → Superseded
                     ↘ Changes Requested → new candidate revision
```

### 4.1 Draft

仅作者工作稿。可不稳定，不能引用为团队共识。

### 4.2 Review Candidate

必须具备完整范围、约束、接口、测试、发布阻塞和变更追溯。评审材料可以在文档分支共享，但仍由前一 Approved PRD 裁决。

### 4.3 Approved

同时满足：

1. 评审记录包含真实姓名/身份、角色、日期、结论和阻塞处理。
2. 所有 P0 规范性待决策已关闭或明确延期且不影响实施。
3. Markdown、PDF、评审记录、实施计划和权威指针一致。
4. 变更合并到产品仓 `main`。
5. 创建指向批准提交的 annotated tag。

### 4.4 Superseded

后继 Approved PRD 生效后，旧版只读保留。Review Candidate 也可以在批准前被新候选取代；V2.3 和 V2.4 即属于此类历史候选，不能回写成已批准。

## 5. V2.5 批准动作

V2.5 批准必须是一个可审计的原子变更：

- `财经推演室_PRD_V2.5.md` 状态改为 Approved。
- `docs/reviews/PRD_V2.5_REVIEW.md` 记录真实结论。
- `AGENTS.md`、`docs/AGENT_HANDOFF.md`、`docs/IMPLEMENTATION_PLAN.md`、架构/TDD 指针同步。
- PDF 从同一 Markdown 重新生成并完成用户允许的机器校验。
- 合并到 `main` 后创建 annotated tag `prd-v2.5-approved`。

当前分支不得创建该 tag，也不得预填签字。批准提交建议使用：

```text
docs: approve PRD v2.5 and switch authority
```

## 6. 独立版本向量

批准内容必须固定下列字段，不能用一个“V2.5”替代全部版本：

| 字段 | 格式建议 | 所有者 | 目的 |
|---|---|---|---|
| `prdBaseline` | `prd-v2.5-approved@<product-sha>` | 产品仓 | 证明依据的产品规范 |
| `contentId` | 稳定 slug | 内容 | 标识同一内容系列 |
| `contentVersion` | 日期序列或 SemVer | 内容 | 不可变内容修订 |
| `schemaVersion` | `finance-experience/1.0.0` | 架构 | 数据兼容性 |
| `ruleVersion` | `finance-causal/1.0.0` | 财经审核/后端 | 路径与方向复现 |
| `weightTableVersion` | `cue-weight/1.0.0` | 产品/算法 | Planner 排序复现 |
| `promptVersion` | `semantic-graph/1.0.0` | AI/内容 | 生成差异追踪 |
| `appCommit` | Git SHA | 研发 | 运行实现复现 |
| `mediaFingerprint` | SHA-256 | 媒体/内容 | 防止同 ID 换媒体 |
| `subtitleVersion` | 内容版本 ID | 内容 | 时间与文案追溯 |

版本向量应写入 DraftExperience、CoverageReport、ReviewManifest、ApprovedExperience 和报告的审计元数据。客户端只需要运行所需的非敏感子集。

## 7. 内容版本生命周期

```text
generated → draft → in_review → reviewed → approved → published → retired
                  ↘ changes_requested → new draft version
```

| 状态 | 允许执行者 | 含义 |
|---|---|---|
| `generated` | 模型/adapter | 尚未完成确定性终检 |
| `draft` | 管线/内容编辑 | 结构可审阅，客户端不可消费 |
| `in_review` | 审核协调者 | 候选冻结，审核进行中 |
| `reviewed` | 审核流程 | 必审维度完成，不等于批准 |
| `approved` | 具备批准权限的真实人员 | 不可变运行内容，可被发布指针选择 |
| `published` | 发布动作 | 新会话可获取；内容本体仍不可变 |
| `retired` | 内容/法务/安全 | 停止新会话，保留必要审计 |

规则：

- 模型、LLM Agent、adapter 和 Schema 校验只能到 `draft`。
- 任何文案、时间、证据、作者、权利、规则输入或反馈变化创建新 `contentVersion`。
- `reviewed`、`approved` 和 `published` 是三个动作；不能在同一生成请求中连跳。
- 发布指针只接受 `approved` 不可变版本；回滚改变指针，不回写历史内容。
- 权利到期、安全事故或来源下架立即停止新会话；历史报告保留版本引用但不得继续分发媒体。

### 7.1 P0 锁定写接口

| 接口 | 生命周期语义 |
|---|---|
| `PATCH /analysis/jobs/:jobId/draft` | 以 expectedDraftVersion 防并发覆盖，保存人工修改并创建新 draft revision |
| `POST /analysis/jobs/:jobId/reviews` | 对冻结 revision 保存 ReviewManifest，不改变批准/分发状态 |
| `POST /analysis/jobs/:jobId/publish` | 沿用锁定名称，将已 reviewed draft 物化为不可变 ApprovedExperience；不切运行指针 |
| `POST /content/versions/:contentVersion/publish` | 将运行发布指针切到指定 approved 版本 |
| `POST /content/versions/:contentVersion/retire` | 撤销该版本的新会话分发并记录原因；可将指针回滚到上一 approved |

因此“job publish”是批准物化，“content publish”才是运行分发。两者必须使用不同权限、幂等键、
审计事件与负向测试；不得因接口名称相同而合并动作。

## 8. ReviewManifest

每个内容版本至少包含：

| 审核维度 | 必需证据 |
|---|---|
| 权利与来源 | 授权记录 ID、允许用途、期限、来源 URL、下架方式 |
| 媒体与作者 | 指纹、时长、编码、作者 ID/昵称/头像一致性 |
| ASR/OCR/时间 | 字幕版本、关键术语/数值/时间窗人工复核 |
| 财经内容 | 概念、因果边、条件、反例、方向与边界结论 |
| 交互 | CueKind、选项、反馈、≤4/≤6/45 秒/≤12 秒/≤48vh |
| 安全与隐私 | 禁词、投资建议红队、数据最小化、提示注入 |
| 测试 | Schema、规则黄金、运行 E2E、恢复、无障碍与发布负向用例 |
| 版本 | 完整版本向量及其不可变引用 |

每个结论记录 reviewer、role、reviewedAt、outcome、evidenceRef 和 comment。自动化结果可以作为 evidenceRef，但不能填 reviewer 或代替业务/法务签字。

## 9. 分支与提交治理

### 9.1 产品仓

文档候选从明确产品仓 SHA 开始。本轮用户要求以 `caibao/main` 为主，V2.5 起始基线为：

```text
base: dff09ee70792d626cacf2a3d638b5b22e9b77591
branch: main
```

建议保留三个审计清晰的提交组：

1. `docs: define enter-to-pause interaction in PRD v2.5`
2. `docs: align project entrypoint and handoff with v2.5`
3. `docs: generate PRD v2.5 review PDF`

评审后另建批准提交，不修改上述候选提交。未经用户明确授权不 push、不创建远端 PR、不改写历史。

### 9.2 应用代码仓

只有在 V2.5 获批且并发工作树归属清晰、干净后，才从明确 SHA 建内容分支，例如：

```text
content/fed-rate-global-capital-v1
```

建议提交顺序：

1. `test(content): lock package and publication invariants`
2. `feat(content): adapt PM package to DraftExperience`
3. `feat(content): validate media author evidence and rights`
4. `feat(content): add ReviewManifest and approval gate`
5. `content: add reviewed package <contentVersion>`
6. `feat(runtime): consume approved package and enforce cue policy`
7. `test(e2e): cover six cues recovery and evidence report`
8. `docs: record evidence against prd-v2.5-approved`

候选生成、人工 reviewed、approved 和 published 不合并为一个无审计边界的大提交。当前代码仓存在并发未提交文件时，不创建内容分支、不 stage、不代他人提交。

## 10. 评审门与发布门

### 10.1 PRD 评审门

- 产品：范围、用户旅程、P0/P1、指标和待决策。
- 设计/无障碍：48vh/无蒙层/52% 可见、六模板、作者分离、视口与键盘。
- 研发/架构：API、Schema、状态机、版本向量、模型/规则边界与降级可实现。
- 测试：每个规范 F-ID 可映射到页面/事件/用例；事实与目标能力区分。
- 内容/财经：学习目标、因果正确性、证据、条件和安全措辞。
- 法务/版权：视频、作者、底座/第三方许可、用途、期限和下架。
- 安全/隐私：密钥、提示注入、保留期、鉴权/限流、日志与费用边界。

真实首视频或 Provider 尚未就绪可以作为内容发布阻塞；只要不改变产品规范，不应造成 PRD 批准的循环等待。

### 10.2 内容发布门

必须同时具备已批准 PRD baseline、权利、媒体/作者一致、最终 ASR/OCR/时间码、财经人审、完整版本向量、≤4/45 秒、六类运行/恢复/安全测试、ReviewManifest 和受控批准/发布动作。

## 11. PDF 与文档校验

Markdown 是唯一内容源。PDF 由仓库脚本生成并至少进行：

- `pdfinfo` 可读取、页数和纸张尺寸存在。
- `pdftotext` 可抽取中文，关键标题/状态/版本可匹配。
- PDF 文件非空且与 Markdown 文件名/版本一致。
- `git diff --check`、图片路径和内部文档路径校验。

按用户 2026-07-23 最新指令，当前及后续默认**不进行 PDF 逐页 PNG、截图或肉眼视觉验收**。QA 必须明确记录“视觉未验收”，不能把机器校验写成版式、溢出、图片清晰度已经通过。

## 12. 例外与变更

- 需要偏离本治理时，用户必须明确给出范围与原因；交接记录例外，不隐含扩大授权。
- 安全、版权或数据事件可以立即阻止发布/retire 内容，不需要等待 PRD 升级；后续补审计。
- 如果实现发现 PRD 无法落地或需求需要变化，先创建新的 PRD candidate；不通过改 Schema 或文案掩盖规范变化。
