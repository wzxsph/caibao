# ADR-0003｜Agentic 生成管线：有界多阶段与规则裁决

状态：已采纳；核心历史实现见旧仓 `50b96560`，当前实现位于 `apps/web/server`
日期：2026-07-22
关联：细化 `ADR-0002｜证据优先的离线管线与人工发布门禁`（非替代）
规格：`docs/GENERATION_PIPELINE_DESIGN.md`

## 背景

ADR-0002 锁定「播放前完成解析/规划/审核、模型输出必须引用 evidenceId、确定性 Planner 定数量间距、只产 DraftExperience」。本 ADR 决策时，旧 `refer/douyin/server` 是**单次 LLM、无自检修复**的线性链，且存在三处结构缺口：语义类型扁平（因果边无 from/to）、触点候选无 payload、触点 kind 命名在 server/前端/PRD 三层不一致。ADR-0002 的门禁思想正确，但生成过程本身不足以产出可审核、可上线的内容。这些核心缺口已由历史提交 `50b96560` 修复，并按 ADR-0004 迁入 `apps/web/server`；真实供应商/媒体与人工发布门仍未验证。

## 决策

1. **单次 LLM → 有界多阶段管线**。循环放在管线层（`analyze-video.ts`），provider 保持每次一个 tool call、`tool_choice:'required'`、Zod 校验、仅 HTTP 级重试。阶段：媒体→ASR/OCR→语义抽取→确定性校验→可选语义评审→定向修复环→评分+Planner→方向规则引擎→payload 授权→组装+终检。仅修复环与授权环循环，各 `MAX_REPAIR_ITERS=2`。

2. **评分归版本化规则表**。PRD 5.1 六维度按「谁能诚实计算」拆分：学习价值/时间敏感/交互适配由模型出 subSignal，证据强度/认知负荷/间隔新颖由确定性计算，最终 `priority` 由版本化权重表合成。模型不直接产 priority。

3. **方向先于授权**。资产方向（`support_dominant/pressure_dominant/conflict/insufficient`）由版本化规则引擎在授权文案之前锁定；未知组合返回 `insufficient`，绝不模型猜；授权阶段消费锁定方向、不可覆盖。

4. **产出是查漏补缺，不是打分**。管线产出 DraftExperience + CoverageReport（确定性、非 LLM 撰写）；CoverageReport 列覆盖/缺口/待裁决项，供审核门行动。不产运行时 LearningSummary（那是运行流、逐会话产物）。

5. **统一 CueKind + 渲染器门控**。三层统一为 PRD 6 名；`RENDERABLE_KINDS` 门控授权，无渲染器的 kind 仅候选态，不授权 payload。

## 原因

- **有界修复环**在不放弃确定性兜底的前提下，把「结构非法即失败」变成「定向 re-ask + 单项降级」，提升产出率而不牺牲可复现。
- **评分归规则**保证 re-run 可复现、可 diff，符合 ADR-0002 与 PRD 15.4 的确定性优先。
- **方向先于授权**堵住模型在文案里发明资产方向的路径，守住 PRD 9.2、19.1「方向由规则/审核决定」。
- **查漏补缺而非打分**避免暗示模型判定了内容对错，符合 PRD 8.2、11.3 的无确定性、无总分立场，且直接服务人工审核门。
- **渲染器门控**避免产出播放器画不出的「已批准」内容——统一枚举不等于能上线。

## 不变量（继承 ADR-0002，本 ADR 加固）

- 仅离线；运行时不实时调模型。
- 模型输出永远是候选；只有 evidenceId、schema、权利声明、人工审核齐全才 approved。
- 管线终点恒为 `publishStatus:'draft'` + `blockers:['HUMAN_REVIEW_REQUIRED']`；无 publish 路径。
- 每个读不可信输入（字幕/OCR/帧）的 LLM 阶段都重复注入护栏；终检把禁词正则跑在授权后的 payload 文本上。

## 暂不解决

- 人工审核台、review/publish API、ApprovedExperience 持久化（P1，同 ADR-0002）。
- 逐阶段 checkpoint / 任务持久化（现内存单次 job runner 晚期失败会重跑 ASR/抽取）。
- 方向规则表的内容扩展（人工内容工作）。
- 前端新 3 个 kind 虽已有渲染器与单测，但尚未绑定运行时 Demo、未做 E2E/视觉回归，server 授权白名单仍保持原 3 类。

## 影响

落点见 `docs/GENERATION_PIPELINE_DESIGN.md` §9。核心改动：`server/src/domain/contracts.ts`、`server/src/domain/payload-contracts.ts`、`server/src/pipeline/analyze-video.ts`、`server/src/providers/semantic-graph-analyzer.ts`、`server/src/pipeline/cue-planner.ts`、`src/features/finance-cues/contracts.ts` 与 `InteractionRenderer.vue`；新增 `semantic-timeline.ts`、`cue-scorer.ts`、`direction-rules.ts`、`payload-author.ts`、`coverage-report.ts`。
