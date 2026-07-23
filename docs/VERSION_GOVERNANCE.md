# 财经推演室｜文档、内容与发布版本治理

状态：PRD V2.7 Review Candidate 配套治理  
日期：2026-07-23  
当前已批准基线：`财经推演室_PRD_V2.0.md`  
最新候选：`财经推演室_PRD_V2.7.md`  
历史候选：V2.3、V2.4、V2.5、V2.6

## 1. 权威优先级

1. 用户当次最新明确指令。
2. 已批准且未被替代的 PRD；当前为 V2.0。
3. `AGENTS.md` 与 `docs/AGENT_HANDOFF.md` 的事实、安全和仓库边界。
4. Architecture、TDD、ADR、实施与本治理。
5. 最新 Review Candidate；当前为 V2.7。
6. 历史候选、PM 原型、旧 Demo 和口头示例。

用户 2026-07-23 最新直接裁决的“25 条完整输入与生成、10 条公开展示”、公开 Pages、逐条归属、入口曝光不停播、点击暂停、退出恢复和取消自动触点固定数量上限即时覆盖旧文档中的相反条款，但不会自动批准 V2.7 其他内容。

## 2. PRD 生命周期

```text
Draft → Review Candidate → Approved → Superseded
                     ↘ Changes Requested → new candidate revision
```

### Review Candidate

必须具备范围、交互、架构、约束、测试、风险、发布阻塞和变更追溯。可以指导探索和工程 Draft，但不得：

- 自称团队已批准规范；
- 成为生产 Approved 内容的 `prdBaseline`；
- 由 Agent 预填签字或创建批准标签；
- 把 Mock、目标管线或用户权利声明写成已审核事实。

### Approved

同时满足：真实角色签字；P0 待决关闭；Markdown、评审、README、AGENTS、交接、架构、TDD、实施一致；合并产品仓 `main`；创建指向批准提交的 annotated tag。

V2.7 批准标签只能是 `prd-v2.7-approved`，当前不得创建。

## 3. 版本升级规则

| 变化                                              | 动作  |
| ------------------------------------------------- | ----- |
| 错字、链接、纯排版                                | Patch |
| 功能范围、交互、API、数据源、部署、门禁或验收改变 | Minor |
| 产品形态或技术栈断代                              | Major |

从固定四条、本地-only 到完整 25 条生成、公开 10 条展示，以及取消数量上限，是 Minor 级规范变化，因此 V2.6→V2.7。V2.7 尚未批准，用户将公开集合由 25 调整为 10 作为同一候选的审阅修订记录，不另建 Approved 版本。

单个内容文案、证据修订、审核人变化、媒体替换或规则表在已批准接口内扩展，不自动升级 PRD；升级对应内容/媒体/规则版本。

## 4. 独立版本向量

| 字段               | 示例                         | 目的                     |
| ------------------ | ---------------------------- | ------------------------ |
| `prdBaseline`      | `prd-v2.7-approved@<sha>`    | 已批准规范；当前不能使用 |
| `contentVersion`   | `showcase-mock@2026.07.23.1` | 内容不可变修订           |
| `schemaVersion`    | `showcase-bundle/1.0.0`      | 契约兼容                 |
| `ruleVersion`      | `finance-causal/1.0.0`       | 确定性方向               |
| `plannerVersion`   | `cue-planner/1.0.0`          | 触点选择复现             |
| `promptVersion`    | `showcase-mock-prompt/1.0.0` | 生成差异                 |
| `appCommit`        | `caibao` 精确发布 SHA        | `apps/web` 运行实现      |
| `mediaFingerprint` | SHA-256                      | 媒体一致性               |
| `subtitleVersion`  | 内容 ID                      | 字幕/时间码追溯          |
| `mediaRelease`     | `showcase-media-20260723-v1` | 公网媒体批次与下架       |

不得将所有对象统称为“V2.7”。

## 5. 内容生命周期

```text
generated → draft → in_review → reviewed → approved → published → retired
          ↘ internal_poc
```

- 模型、Agent、adapter 和 Schema 校验最多到 `draft`。
- `internal_poc` 可由用户直接裁决用于工程展示，但不等于 reviewed/approved/published。
- `reviewed`、`approved` 和 `published` 是三个不同动作。
- 内容、证据、时间码、作者、权利、方向或反馈变化创建新 contentVersion。
- 回滚切换发布指针，不回写历史 Approved 内容。
- 权利到期或撤回立即 retire，不等待 PRD 升级。

当前完整 25 个 Experience 的真实状态：`internal_poc`、`estimated_mock`、`deterministic_llm_mock`；公开运行时只选择 10 个，二者都不能改写为 Approved。

## 6. 自动触点治理

- 不存在 `maxAutomaticCues=4`、`<=4`、`<=6` 等产品级固定自动数量限制。
- 当前 3–6 个/视频是六类模板、时长和 45 秒间隔形成的实现分布，不是新上限。
- Planner 取舍必须引用证据、学习价值、重复度、时长预算和最小间隔。
- automatic 相邻至少 45 秒，同时最多 1 个。
- `timeline_only` 只能由内容编排显式决定，不能用来隐藏超过 N 个的节点。

任何恢复数字截断的变更都需要新 PRD 候选、失败测试和用户确认。

## 7. ReviewManifest

每个可批准内容版本至少记录：

| 维度         | 必需证据                                              |
| ------------ | ----------------------------------------------------- |
| 权利         | 来源、作者、用途、期限、环境、下架方式、证据 ID       |
| 媒体         | 源/派生指纹、时长、编码、封面和作者一致性             |
| ASR/OCR/视觉 | 字幕版本、时间窗、术语/数值人工复核                   |
| 财经内容     | 概念、因果、条件、反例、方向、边界                    |
| 交互         | CueKind、选项、反馈、45 秒间隔、单并发、≤12 秒、≤48vh |
| 安全         | 投资建议、提示注入、数据最小化、日志/费用             |
| 测试         | Schema、规则、播放器、恢复、报告、发布负向用例        |
| 版本         | 完整独立版本向量                                      |

每条结论包含 reviewer、role、reviewedAt、outcome、evidenceRef、comment。自动化结果只能作 evidenceRef，不能代签。

## 8. 发布治理

### 8.1 当前工程展示

- App：`wzxsph/caibao/apps/web`；导入源 `wzxsph/douyin@9a461b89dda782e30db2fd399b29068e95d3ec33`。
- 主 Pages：<https://wzxsph.github.io/caibao/#/home>；旧 `/douyin/` 只作历史预览。
- Media：Release `showcase-media-20260723-v1` 保存完整派生源；Pages artifact 同域暂存公开 10 条。
- 发布是用户直接要求的工程展示，不代表生产内容审批或权利独立核验。

### 8.2 生产发布门

必须同时具备：Approved PRD baseline、目标环境权利、媒体/作者一致、最终多模态证据、财经/安全人审、完整版本向量、运行/恢复/报告 E2E、ReviewManifest 和受控发布动作。

缺任一 blocker 时发布接口返回 409；查询参数或静态 Fixture 不得绕过。

### 8.3 到期与撤权

当前窗口截至 2026-08-22（Asia/Shanghai）。未续期的 retire 顺序：

1. 下架或删除 GitHub Release 资产；
2. 部署不含媒体的 Pages artifact 与移除目录/空态；
3. 验证 Release 和 Pages 媒体直链均不可访问；
4. 保存最小审计记录。

仅让页面不再引用媒体并不能满足撤权，因为直链仍可能访问。

## 9. Git 治理

### 主仓

- 分支 `main`，远端 `wzxsph/caibao`。
- 文档、前端、Express 后端、生成管线与测试统一跟踪；运行代码位于 `apps/web/`。
- 当前 V2.7 文档基于 `096bf3d` 之后的同一线性历史。
- 产品仓未跟踪 `.vscode/`、`output/real-runs/`、`output/screenshots/` 不纳入提交。
- 不 force-push；不修改或清理 ignored 的 `refer/` 历史/参考工作树。

### 历史应用仓与迁移来源

- `wzxsph/douyin` 保留旧上游历史、迁移期预览和媒体 Release，不再双向维护代码。
- 精简导入来源为 `9a461b89`，旧仓合并提交为 `8f21006c`；追溯见 `apps/web/IMPORT_PROVENANCE.md` 和 ADR-0004。
- 媒体不进任一 Git 历史；Release 保存完整派生，主仓 Actions 只把 10 条复制进临时 Pages artifact；密钥和模型原始响应不进 Git。
- 所有后续应用变更在 `caibao` 主仓走功能分支、意图明确的提交、PR 或用户明确要求的普通 main push。

## 10. PDF 与文档

- Markdown 是 PRD 唯一内容源。
- 本轮 V2.7 不生成 PDF。
- 后续需要 PDF 时，仅做 `pdfinfo`、`pdftotext`、文件可打开、页数、大小和关键标题机器校验。
- 用户已取消当前及后续 PDF 逐页 PNG、截图和肉眼视觉验收；必须记录“视觉未验收”，不得声称版式通过。

## 11. V2.7 批准动作

批准必须是一个原子、可审计变更：

1. 真实签字与 blocker 关闭。
2. PRD 状态改为 Approved。
3. README、AGENTS、交接、架构、TDD、实施、治理同步。
4. 合并产品仓 `main`。
5. 创建 annotated `prd-v2.7-approved` 指向批准提交。

当前结论：**不得执行第 2–5 步。**
