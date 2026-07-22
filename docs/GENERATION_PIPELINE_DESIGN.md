# 财经推演室 · 生成管线设计

状态：已采纳（核心管线已实现；真实内容与发布链路未验证；V2.4 为 Review Candidate）
日期：2026-07-23
当前产品裁决：`财经推演室_PRD_V2.0.md`
候选产品口径：`财经推演室_PRD_V2.4.md`（未批准前不能作为 approved 内容 baseline）
配套决策记录：`docs/ADR/0003-agentic-generation-pipeline.md`
落点代码仓：核心 `50b96560`；Planner/六类 checkpoint 与当前检出 `b8ced09d`。
未 push 的 foundation 分支 `4b34da1f` 只含后续回环修复，当前未检出且不改变本管线事实。

> 本文件是「离线内容生成管线」的规格，回答四个问题：如何判断时间轴、何时补全信息/弹出提问、tool call 与 loop 如何工程化、最终产出什么。核心落点已于 2026-07-22 在 `refer/douyin` 提交 `50b96560` 实现；本文同时作为实现边界与后续验证清单。

---

## 0. 目的与范围

PRD 把产品定义为「视频语义时间轴上的交互层」：离线理解整条视频 → 编排少量高价值知识触点 → 人工审核 → 发布版本化 `ApprovedExperience`；播放时只由确定性状态机读取，**绝不实时调模型**（PRD 3.3、4.3、15.4、19.1）。

本管线覆盖 PRD 15.2「内容流」这一端：

```
授权视频 → ASR/OCR/关键帧 → 多模态语义 → Trigger Planner → 人工审核 → ApprovedExperience
```

**不覆盖**「运行流」（`CueOrchestrator → 半屏模板 → LearningTrace → SummaryBuilder`）。二者的产物区别见 §6。

范围内：媒体预处理、ASR/OCR、语义抽取、自检修复、触点评分与规划、方向裁决、payload 授权、草稿组装、查漏补缺清单。
范围外：完整人工审核 UI、持久化、OAuth、运行时编排、学习足迹。V2.4 候选把最小
ReviewManifest 与受控 approve/publish/retire 动作列入 P0，但它们仍在本生成管线之后，且当前未实现。

---

## 1. 实施前缺口与当前状态（已核验）

`50b96560` 之前的分析管线是一条单次 LLM 线性链。本设计针对的四个结构性缺口已完成如下：

| 实施前缺口 | 当前实现 | 验证边界 |
|---|---|---|
| 单次调用无修复环 | `pipeline/analyze-video.ts` 编排抽取、可选评审、最多 2 轮定向修复与 payload 修复 | fake client 单测已通过；真实模型质量/时延/成本未验证 |
| 语义类型扁平 | `domain/contracts.ts` 已增加 causal edge `from/to`、condition 操作数、SemanticEvent 与 subSignals | schema 与规则单测已通过 |
| 候选无 payload | `pipeline/payload-author.ts` 已对六个 RENDERABLE_KINDS 生成前端形状 payload | 六类离线契约/成稿测试已通过；完整六类运行 E2E 与真实 Provider 未验证 |
| 三层命名不一致 | server/前端/PRD 已统一为 6 个 `CueKind`，前端六类渲染器均有单测 | 运行时 Demo 和 E2E 仍只绑定原三类 fixture |

确定性 Planner（`pipeline/cue-planner.ts`）的职责保持不变：只 accept/reject。`b8ced09d` 已把
自动邀请默认值和硬上限收紧为 4、最小间隔 45 秒，并保留证据/禁词/visualLoad/时长内等门禁；
内容时间轴仍可保留最多 6 个节点。评分、方向和成稿分别由可追溯的独立阶段负责。

---

## 2. 设计总览

现已将「单次 LLM」替换为**有界、以确定性为主的多阶段管线**。LLM 只做需要语言判断的事（抽取、评审、修复、文案）；规则拥有每个数字、每道门禁、每个方向。

三条不可动摇的界线：

1. **模型提议，规则 + 人裁决**——每个 LLM 阶段的输出都要过确定性校验或人工审核才算数。
2. **方向先于授权**——资产方向（`support_dominant/pressure_dominant/conflict/insufficient`）由版本化规则引擎在授权文案之前锁定，否则模型会在 `result/correctOption/feedback` 里偷偷发明方向。
3. **仅离线、draft-only**——管线终点永远是 `publishStatus:'draft'` + `blockers:['HUMAN_REVIEW_REQUIRED']`，无 publish 路径；运行时不可达任一阶段。

---

## 3. Q1 时间轴判断：SemanticTimeline + 候选评分

### 3.1 SemanticTimeline 数据模型

确定性构建（`server/src/pipeline/semantic-timeline.ts`），从 ASR 段 + OCR 证据出发，再由抽取 LLM 填入事件：

| 字段 | 类型 | 来源 |
|---|---|---|
| `durationMs` | number | `PreparedMedia`，权威 |
| `windows[]` | `{windowId, startMs, endMs, source:'shot'\|'utterance_gap'\|'fixed'}` | 以 ASR 语句边界、帧/镜头切换切分；触点只能锚在某个 window 内 |
| `events[]` | `SemanticEvent[]` | 模型提出、证据锚定，见 §4.1 |
| `evidenceIndex` | `Map<evidenceId, {startMs,endMs,source,confidence}>` | `analyze-video.ts` 已有的 `knownEvidenceIds` 扩展 |

`SemanticEvent` 字段：`eventId`、`type`（§4.1 枚举）、`timeMs`、`windowId`、`refs:{conceptIds[],edgeIds[],conditionIds[],claimIds[]}`、`evidenceIds[≥1]`（须存在于 `evidenceIndex`）、`subSignals:{learningValue,timeSensitivity,interactionFit}`（各 0..1）、`rationale`（≤120 字，给审核员，运行时不显示）。

### 3.2 候选评分（PRD 5.1 六维度）——按「谁能诚实计算」拆分

评分只帮助排序（写入 `priority`），硬约束仍在 Planner。PRD 5.1 明确「分数只帮助审核，不自动发布」，因此把六维度按可诚实计算与否拆开：

| 维度 | 范围 | 计算方 | 依据 |
|---|---|---|---|
| 学习价值 | 0..1 | **LLM** subSignal | 概念中心度、误读是否向后传播 |
| 时间敏感 | 0..1 | **LLM** subSignal | 此点后是否有作者结论值得提前想一下 |
| 交互适配 | 0..1 | **LLM** subSignal | 能否 8-12s、1-2 动作、在可渲染 kind 内完成 |
| 证据强度 | 0..1 | **确定性** | evidenceIds 数量 + ASR/OCR 一致性 + 最低置信度 |
| 认知负荷 | 0..1（取反） | **确定性** | window 内 OCR 文本密度 + 镜头切换邻近度 |
| 重复与间隔 | 0..1 | **确定性** | 与更高分事件的距离 + learningObjective 新颖度 |

最终分（`server/src/pipeline/cue-scorer.ts`，版本化权重表）：

```
priority = round(100 · Σ wᵢ·dᵢ)
默认权重 = { 学习价值 .28, 证据强度 .22, 时间敏感 .18, 交互适配 .14, 认知负荷 .10, 间隔新颖 .08 }
```

权重表版本化（`weightTableVersion`）以保证复现与可 diff。模型只输出 subSignal，最终分由规则表拥有——re-run 可复现，审核员能把分数变化 diff 到权重表版本。

两维同时是**硬门禁**（在 Planner 层，非仅权重）：`证据强度==0`→`EVIDENCE_REQUIRED`；window `visualLoad==='high'`→`HIGH_VISUAL_LOAD`。

---

## 4. Q2 信息补全/提问时机：事件类型 → 触点类型（全部离线）

### 4.1 SemanticEvent 类型 → 触点 kind

模型只**标注事件类型并引用证据**；一张**确定性映射表**把事件类型翻译成触点 kind。这样「题目不是默认答案」（PRD 8.3）才可强制执行——只有 `directional_claim` 才能产出问答式 `quick_judgment`。

| SemanticEvent.type | 触发条件（字幕/图） | → 触点 kind（PRD 8.1） |
|---|---|---|
| `concept_first_mention` | 核心概念首次出现 / 正式解释 | `context_card` 背景补丁 |
| `causal_jump` | 边省略中间机制（`omittedIntermediate=true`） | `causal_stitch` 路径拼接 |
| `condition_boundary` | 单变量改变路径强弱 | `condition_slider` 条件拨片 |
| `directional_claim` | 作者在给证据前断言方向 | `quick_judgment` 先想一下 |
| `counterexample_window` | 出现竞争/反向路径 | `counterexample_flip` 换个条件 |
| `concept_confusion` | 两个易混概念相邻（名义 vs 实际利率） | `concept_compare` 概念对照 |

映射是确定性表，不是 LLM 决定：模型标事件类型并给证据，表选 kind。

### 4.2 离线/运行时边界

以上全部离线。运行时编排器 `src/features/finance-cues/orchestrator.ts` 的 `advanceCueOrchestrator` 是纯时间窗状态机，只读冻结的 `triggers[]`，永远看不到 `SemanticEvent`。提问的「生成」在离线，「弹出」在运行时——两者用 `ApprovedExperience` 隔开（PRD 4.3、10.1）。

---

## 5. Q3 tool call / loop 工程：有界多阶段管线

循环放在**管线层**（`server/src/pipeline/analyze-video.ts` 的 `AnalysisPipeline.run`），provider（`server/src/providers/openai-compatible.ts`）保持「哑」——每次一个 tool call、`tool_choice:'required'`、Zod 校验、仅 HTTP 级重试。**循环永不放进 provider。**

### 5.1 阶段表

| # | 阶段 | 类型 | 输入 | 输出 | 失败/兜底 |
|---|---|---|---|---|---|
| 0 | media.prepare | 确定性 | asset | PreparedMedia（时长/指纹/帧） | 工具缺失→`MEDIA_TOOL_UNAVAILABLE`，job fail |
| 1 | ASR + OCR + 时间轴脚手架 | 确定性 | 音轨/帧 | 证据集、`knownEvidenceIds`、`windows` | ASR 越界→`ASR_TIMELINE_OUTSIDE_MEDIA`，job fail |
| 2 | **语义抽取** | **LLM** `emit_semantic_graph` | 字幕/OCR/≤8帧/windows | 富图 + `SemanticEvent[]` + subSignals | 结构非法→修复环（阶段5）；耗尽→job fail |
| 3 | 确定性校验 | 确定性 | 阶段2 | pass-set + `failed[]{itemId,reason}` | 纯函数，不失败 |
| 4 | **语义评审** | **LLM** `emit_critique`（可选） | pass-set + 证据 | 每项 `{verdict,issue,suggestedFix}` | 超预算/超时→跳过，用确定性 pass-set 继续 |
| 5 | **定向修复环** | **LLM** ≤2 轮 | 仅失败/被标项 + 错误串 | 修复项 | 到上限→丢 `rejected`(`REPAIR_EXHAUSTED`) |
| 6 | 评分 + Planner | 确定性 | 校验后事件 + subSignals | `priority`、`{accepted,rejected}` | 纯函数，可接受 0 个 |
| 7 | **方向规则引擎** | 确定性 | 需方向的入选候选 | 每候选 `{direction,activatedPaths,evidenceIds}` | 未知组合→`insufficient`，绝不猜 |
| 8 | **payload 授权成稿** | **LLM**（每 kind 一个 tool）≤2 轮 | 候选 + 锁定方向 + 证据 | 前端形状 payload | 到上限→丢 `rejected`(`PAYLOAD_UNAUTHORABLE`) |
| 9 | 组装 + 终检 | 确定性 | payloads + 图 + plan + 方向 | DraftExperience + CoverageReport | 重跑全部不变量，剔除不合格 |

### 5.2 关键 tool 契约（字段表）

**阶段2 `emit_semantic_graph`**（替代现 `emit_video_analysis`）：
- `concepts[]`: `{conceptId, name, firstMentionMs, isCore, evidenceIds[≥1]}`
- `claims[]`: `{claimId, statement, assetClass?:'equity'|'gold'|'fx'|null, assertedDirection?:<方向枚举>|null, evidenceIds[≥1]}`
- `causalEdges[]`: `{edgeId, from:{nodeType,nodeId}, to:{nodeType,nodeId}, mechanism, omittedIntermediate, evidenceIds[≥1]}` ← 补 from/to
- `conditions[]`: `{conditionId, variable, operator:'increase'|'decrease'|'above'|'below'|'crosses', threshold?, unit?, affectsEdgeId?, statement, evidenceIds[≥1]}` ← 补操作数
- `semanticEvents[]`: 见 §3.1
- 系统提示逐字重述不可信输入护栏（见 §8）。

**阶段4 `emit_critique`**: `items[]: {itemId, verdict:'ok'|'kind_mismatch'|'weak_evidence'|'leading_prompt'|'unsafe', issue, suggestedFix}`。

**阶段8 授权**——每 kind 一个 tool，schema 收紧，均校验**与前端同形的 payload schema**（§7）。例 `author_causal_stitch` 参数 = `{title, before, after, options[2..3], correctOption, feedback≤80}`；`correctOption` 必须与规则引擎锁定的路径一致——模型写文案，不写方向。

### 5.3 循环终止

- **仅阶段 5、8 循环**，各 `MAX_REPAIR_ITERS = 2`。
- re-ask **只由**阶段3的具体校验失败或阶段4的阻断评审触发；re-ask 载荷是单项 + 错误串，不重发整图（约束 token）。
- 每次修复后阶段3只对被修项重跑。终止条件：全通过 / 到轮上限 / 超 token+时延预算。
- 非终止：单项丢到 `rejected`（带类型化 reason），管线继续。**零触点 draft 也是合法输出**。整 job 失败只保留给阶段 0-2 硬失败（无证据、根本无图），与现 `jobs/analysis-job-service.ts` 行为一致。

### 5.4 确定性 vs LLM 的界线

LLM：抽取(2)、评审(4)、修复(5)、文案(8)。其余——校验、评分、planning、**方向**、组装、终检——全部确定性且版本化。「模型提议，规则 + 人裁决」在每一阶段成立。

---

## 6. Q4 最终产出物：查漏补缺，不是打分

管线输出**两件离线产物，都给审核员，都不是对视频的评分**：

### 6.1 DraftExperience

带授权 payload 的候选，仍 `publishStatus:'draft'`、`approvedTriggers:[]`、`blockers:['HUMAN_REVIEW_REQUIRED']`（沿用 `analyze-video.ts:116-131` 硬编码）。相较现状新增：候选携带 `payload`（阶段8 产物）、语义图携带 `from/to` 与条件操作数。

### 6.2 CoverageReport / 查漏补缺清单

确定性构建（`server/src/pipeline/coverage-report.ts`），**绝不 LLM 撰写**（审核员才敢信）：

| 字段 | 内容 |
|---|---|
| `coverage` | concepts/causalEdges/conditions → `{total, coveredByAcceptedCue, uncovered[]}` |
| `evidenceGaps[]` | 单源 / 低置信证据支撑的项 |
| `kindBalance` | 各 CueKind 计数 vs 推荐分布（标记「全是题」，PRD 8.3） |
| `directionResolutions[]` | `{candidateId, direction, activatedPaths, evidenceIds, insufficientReason?}` |
| `rejectedCandidates[]` | Planner + 修复/授权丢弃项，各带类型化 reason |
| `reviewDecisionsRequired[]` | 显式待裁决项，如「T4 方向=insufficient 需人工裁定」「概念『相对利差』未覆盖」 |
| `versions` | `contentVersion`、`mediaFingerprint`、`ruleEngineVersion`、`weightTableVersion`、`promptVersion` |

### 6.3 为什么是查漏补缺而非打分

分数暗示模型判定了内容对错，违反「模型提议/人裁决」与无确定性措辞（PRD 8.2、11.3）。CoverageReport 在审核门（PRD 4.1 人工审核行）**可直接行动**：它告诉审核员要决定什么，而不是视频好不好。

### 6.4 与 LearningSummary 的边界（务必区分）

运行时的 **LearningSummary / 学习足迹**（PRD 11，`src/features/finance-cues/summary.ts` 从 `LearningTraceEvent` 逐会话构建）是**另一件产物**——per-user、per-session、播放后，「这位观众碰过什么」。CoverageReport 是 per-content-version、发布前，「这份体验覆盖什么 / 审核员必须决定什么」。二者同为无分数哲学，处在 PRD 15.2 两条数据流的两端。**本管线产出 CoverageReport，不得产出 LearningSummary。**

### 6.5 V2.4 版本向量与审核交接

管线产物必须携带可追溯但彼此独立的版本：`contentVersion`、`schemaVersion`、`ruleVersion`、
`weightTableVersion`、`promptVersion`、`appCommit` 与 `mediaFingerprint`。`prdBaseline` 在候选阶段可记录
Review Candidate 来源，但任何 approve/publish 动作必须拒绝未批准的 PRD baseline。

生成结束后的目标链路是：

```text
DraftExperience + CoverageReport
→ ReviewManifest（真实人员审核）
→ independent approve
→ immutable ApprovedExperience
→ rollbackable publish pointer
```

Schema 合法、修复成功或 `RENDERABLE_KINDS` 命中，都不能自动完成上述任一步。

---

## 7. 解决三处结构缺口

**缺口 a（无 payload 桥）**：新增阶段8 `server/src/pipeline/payload-author.ts`，对每个入选候选授权前端形状 payload。draft 候选获得 `payload`，形状趋近 `ApprovedExperience` 但缺 `reviewStatus:'approved'`（只有人能置位）。这是现在未建模的人工授权步骤，改为两侧被规则围栏的离线 LLM 阶段。

**缺口 b（扁平语义）**：退役 `contracts.ts:64` 复用的 `semanticItemSchema`，替换为带 `from/to` 的 `causalEdgeSchema` 和带 `operator/threshold/unit` 的 `conditionSchema`（§5.2）；`assertEvidenceReferences`（`analyze-video.ts:37`）扩展到新数组。`from/to` 是让 `causal_stitch` 与方向规则引擎成为可能的前提。

**缺口 c（三层命名）**：已定义唯一 `CueKind = context_card | quick_judgment | condition_slider | causal_stitch | counterexample_flip | concept_compare`（PRD 6 名），并完成：
- server 旧枚举 `quick_prediction/evidence_compare/reflection` 已改为 PRD 名称。
- 前端判别联合从 3 扩到 6，`InteractionRenderer.vue` 已补 3 个渲染器并有单测。
- **用 `RENDERABLE_KINDS` 集合门控授权**：`b8ced09d` 后 server 已对六个 CueKind 开放
  payload 成稿并由 golden/单测覆盖。该事实只证明离线形状与成稿，不代表新三类已进入完整运行
  Demo/E2E，也不代表真实 Provider 内容质量通过。

**payload schema 契约（配套）**：server 与前端受 TypeScript 模块边界限制，使用两份同形 schema；`server/test/payload-contract.spec.ts` 通过六类 golden payload 守住漂移，避免 server 已授权但前端 `.parse` 失败。

---

## 8. 失败 / 降级（必须守住的不变量）

- **确定性兜底（PRD 15.4）**：任何 LLM 阶段超时/超预算 → 保留确定性通过项、其余丢 `rejected`；评审(4)完全可选；零触点 draft 合法。
- **draft-only / 不自发布**：阶段9 硬编码 `publishStatus:'draft'`、`approvedTriggers:[]`、`blockers`；管线无 publish 路径，授权后再断言一次。健康检查已断言 `modelCanPublish:false`（`server/src/app.ts`）。
- **方向归规则引擎**：阶段7 是唯一置位方向枚举处；未知路径/条件组合返回 `insufficient` + 原因，绝不猜（PRD 9.2）；授权(8)消费锁定方向、不可覆盖。
- **仅离线**：运行时 orchestrator 与 `approvedExperienceSchema` 不动，无阶段在播放时可达。
- **每个 LLM 阶段都防注入**：`semantic-graph-analyzer.ts` 的抽取/评审/修复与 `payload-author.ts` 均重复不可信输入护栏；阶段 9 还把禁词正则**跑在授权后的 payload 文本上**（不只 prompt+objective），堵住 `feedback`/`result` 走私投资措辞的路径（PRD 19.4）。

---

## 9. 关键文件与落点

已实现落点：

| 文件 | 变更 |
|---|---|
| `server/src/domain/contracts.ts` | 富语义 schema（causalEdge from/to、condition 操作数）、统一 `CueKind`、候选加 `payload` |
| `server/src/pipeline/analyze-video.ts` | 单次调用改多阶段循环编排（§5.1） |
| `server/src/providers/semantic-graph-analyzer.ts` | 抽取/评审/修复多个 tool 调用，各自重复注入护栏 |
| `server/src/pipeline/cue-planner.ts` | 保留 accept/reject，评分移出到 `cue-scorer.ts` |
| `src/features/finance-cues/contracts.ts` | 判别联合从 3 扩到 6，抽出共享 payload schema |
| `src/features/finance-cues/components/InteractionRenderer.vue` | 补 `quick_judgment`/`counterexample_flip`/`concept_compare` 渲染器 |

配套新增（`server/src/pipeline/`）：`semantic-timeline.ts`、`cue-scorer.ts`、`direction-rules.ts`、`payload-author.ts`、`coverage-report.ts`；API 增加 `GET /analysis/jobs/:jobId/coverage`。

---

## 10. 风险

| 风险 | 缓解 |
|---|---|
| 成本/时延膨胀（逐候选授权 + 修复环） | Planner 先于授权、每阶段+总预算、评审可选 |
| 内存单次 job runner 晚期失败重跑昂贵 ASR/抽取 | 逐阶段 checkpoint；属 `docs/ARCHITECTURE.md` 已记 P1 持久化缺口，标记而非默认 |
| 方向表覆盖不足，早期内容偏薄 | `insufficient` 是正确安全默认；扩表是人工内容工作，非模型任务 |
| server↔前端 payload 漂移 | 两份同形 schema + 六类 golden payload 契约测试守住漂移 |
| 六类离线 vs 运行 | 前后端六类契约、成稿与渲染单测已通过；新 3 类仍须绑定有权媒体，完成运行时 fixture/E2E、真机与无障碍验证 |

---

## 11. 验证

设计自洽与实现回归均已执行：

1. **文档交叉核对**：阶段表、tool 字段、`CueKind` 枚举与 PRD 8.1、9.2、18.2 逐一对齐；扫描确认无「打分/68%/投资建议」旧口径回潮（PRD 23.7）。
2. **落点真实性**：核心文件由 `50b96560` 落地；六类成稿与 Planner 4/45 由 `b8ced09d` 落地。
3. **不变量回归**：逐条对照 PRD 红线（离线、draft-only、方向归规则、模型不自发布、注入防护、无总分），确认每条都有对应机制（§8）。
4. **ADR 一致**：`0003` 是 `0002` 证据优先门禁的细化，非替代。

`b8ced09d` 已执行完整门禁：20 个前端 Vitest、102 个服务端 Vitest、6 个 Playwright 全部通过，
类型、构建与生产依赖审计通过。`4b34da1f` 增加 3 个回环绑定断言，本轮复核服务端为 105/105。
这些阶段全部由离线 fixture/fake client 驱动，**没有验证真实 Provider、完整六类真实时间轴或有权媒体内容质量**。
