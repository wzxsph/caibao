# 财包时间轴分析与交互系统｜实施计划

状态日期：2026-07-23  
产品主仓库：`/home/samsong/Desktop/maybe/caibao`  
应用代码仓库：`/home/samsong/Desktop/maybe/caibao/refer/douyin`

## 目标

把现有静态财经触点 Demo 升级为可交接的垂直切片：可以合规接入已授权视频，离线执行 ASR、OCR、语义理解和触点候选规划；审核后由视频内轻提示和不超过半屏的容器消费内容包。轻邀请不打断观看；用户进入财包后自动暂停，退出时按进入前状态恢复，最终形成无分数的过程学习总结。当前已批准基线仍为 V2.0，其“不自动暂停”条款已被用户最新指令覆盖；最新产品目标为 Review Candidate `财经推演室_PRD_V2.5.md`。

## 阶段与完成定义

### D0｜V2.5 文档候选

- [x] 保留 V2.4 为历史候选，基于用户直接裁决形成 V2.5 Review Candidate。
- [x] 增加 PRD/内容/Schema/规则/权重/Prompt/应用/媒体的独立版本治理。
- [x] 增加 ReviewManifest、批准/发布分离和 V2.4→V2.5 追溯材料。
- [ ] 产品、设计、研发/架构、测试、内容/财经、法务/版权、安全/隐私完成真实评审。

### D1｜V2.5 批准与权威切换

- [ ] 清空或明确延期全部影响 P0 的规范性待决策。
- [ ] Markdown 状态、PDF、评审记录、AGENTS/交接/计划权威指针在同一批准变更中更新。
- [ ] 合并到产品仓 `main` 后创建 annotated tag `prd-v2.5-approved`。
- [ ] 在批准前不创建 approved tag，不让内容版本引用候选 PRD 进入 approved/published。

### M0｜仓库和交接基线

- [x] 产品主目录初始化 Git。
- [x] 底座保留独立上游历史并建立功能分支。
- [x] 固定计划、架构、TDD、研究和 Agent 交接文档。
- [x] 创建不含真实密钥的双供应商环境模板；本地实际 `.env.*` 保持 Git ignored。

### M1｜内容来源边界

- [x] 实现抖音公开主页探测器，只返回可验证的公开资料与明确失败类型。
- [x] 实现抖音开放平台“已授权账号作品列表”客户端契约；尚未使用真实 OAuth token 调用。
- [x] 任意博主公开页、创作者 OAuth、用户上传/授权源文件三条路径明确分层。
- [x] 禁止验证码绕过、签名逆向、cookie 盗用和未授权媒体下载。

### M2｜离线分析流水线

- [x] 媒体预检、音轨和关键帧抽取适配器；FFmpeg 不存在时给出可诊断的 readiness。
- [x] ASR、视觉 OCR、多模态语义提供商接口与真实 HTTP 客户端。
- [x] Transcript、VisualEvidence、SemanticEvidence、TriggerCandidate 全链路 schema。
- [x] 确定性 Planner 完成证据门禁、去重、限频和安全过滤。
- [x] 单次语义分析已重构为有界多阶段管线：抽取、确定性校验、可选评审、最多 2 轮定向修复、评分/Planner、方向规则、payload 成稿与 CoverageReport。
- [x] Planner 自动邀请默认值和硬上限收紧为 4、最小间隔 45 秒；六类 server payload 均可离线成稿（`b8ced09d`）。
- [x] 产物固定为 `draft`，人工审核动作与发布动作分离。

实现完成不等于供应商已验证：本地凭据状态以 `docs/AGENT_HANDOFF.md` 为准，`LIVE_PROVIDER_TESTS` 仍只有配置解析，没有对可入库的授权真实视频执行付费全链路。

### M3｜服务与前端联调

- [ ] 先写 V2.5 播放状态失败用例：邀请不暂停；播放中进入自动暂停；退出从原位置恢复；原本暂停则保持暂停；重复事件幂等。
- [ ] 实现 `wasPlayingBeforeInteraction`、`pausePositionMs` 与播放转换状态；不得自动 seek、静音、改音量或倍速。
- [x] Express 提供健康检查、来源探测、分析任务、草稿与 CoverageReport 读取接口；默认只监听 `127.0.0.1:18787`。
- [ ] 前端内容仓库可从静态 fixture 切到已批准 API，断网时保留静态演示兜底。
- [ ] 完成前端 API 联调并验证模型超时、无效 JSON、缺少 FFmpeg 或密钥时不影响普通视频播放。
- [x] 自动邀请默认值和硬上限已收紧为最多 4 个、最小间隔 45 秒；内容时间轴节点仍可保留 6 个。
- [ ] 修复财经占位条目的媒体黑屏和错误复用 `@李子柒` 作者元数据。

### M3.5｜PM 内容包选择性迁移

- [x] 固定 `prac-fect/moneybaby@7db765b`，完成源码、线上交互、构建和测试取证。
- [x] 裁决只迁移内容结构/学习叙事，以及“主动进入后暂停”的基础意图；不迁移 React/Vinext 页面、自动 seek、大遮罩和作者头像替换。暂停恢复必须按 V2.5 重写。
- [ ] 先写 `VideoContentPackage` → `DraftExperience` 适配测试；迁入后仍必须是 `draft`。
- [ ] 增加媒体指纹、作者昵称/头像/来源、时长和内容包版本一致性校验。
- [ ] 授权确认后再迁移真实媒体；授权前不复制 15MB 视频到产品仓或公开发布路径。
- [ ] 将 6 个候选编排为最多 4 次自动邀请；00:08 背景和 03:08 反例默认弱化/片尾处理。
- [ ] 固化 `prdBaseline`、`contentVersion`、`schemaVersion`、`ruleVersion`、`weightTableVersion`、
  `promptVersion`、`appCommit` 与 `mediaFingerprint`；缺任一版本不得批准。

### M3.6｜最小审核与发布门禁

- [ ] 先写 Review Candidate/draft 不可 approved、审核维度不完整不可批准的失败测试。
- [ ] 实现 ReviewManifest；模型/adapter 只能生成 draft，不能填写真实审核签字。
- [ ] 实现 `PATCH /analysis/jobs/:jobId/draft`，以乐观版本和修改审计保存新 draft revision。
- [ ] 实现 `POST /analysis/jobs/:jobId/publish`：只把已 reviewed draft 物化为不可变
  ApprovedExperience，不切运行发布指针。
- [ ] 实现 `/content/versions/:contentVersion/publish|retire` 与回滚；运行指针动作与 job publish
  的权限、幂等和审计分离。
- [ ] 客户端只读取不可变 ApprovedExperience；不得以手改 fixture 模拟发布。
- [ ] 完整审核 UI 可延后 P1，但 P0 的同契约 CLI/API 和自动化门禁不可省略。

### M4｜验证与真实内容

- [ ] 建立并通过真实供应商 smoke suite；`LIVE_PROVIDER_TESTS=true` 必须是唯一显式开关且默认不联网。
- [ ] 用户提供一条具备处理权的视频或创作者授权后，执行一次真实管线 dry run。
- [ ] 人工核对字幕、OCR、关键概念、证据时间码和触点文案。
- [ ] 审核后的内容包替换当前占位时间码，再进行正式演示。
- [ ] 六类触点在真实时长媒体上的单元、集成、Playwright 和四视口视觉回归全部通过。
- [ ] 片尾沙盘、反例、复述和证据报告只从真实事件与证据生成，不使用静态能力印章。
- [ ] 内容版本引用已批准 PRD tag；Review Candidate 产物只能保持 draft。

`b8ced09d` 自动化基线已通过 20 个前端单测、102 个服务端单测、6 个 Playwright E2E、两套类型
检查、构建与 `pnpm audit --prod`（生产依赖 0 已知漏洞）。`4b34da1f` 新增回环绑定测试后，本轮
服务端复核 105/105。完整开发依赖仍是旧底座工具链债务；完整六类真实时间轴、真实 Provider 与
有权媒体尚未验证。这些是 M4 的工程前置条件，不代表 M4 已完成。

## 当前不做

- 不承诺抓取任意抖音博主的完整作品和原始媒体。
- 不让模型直接发布触点，不在播放期间实时调用大模型决定弹窗。
- 不建设投资建议、实时行情、用户财富画像或自由聊天 Agent。
- 不重做已完成的半屏视觉结构；下一轮代码任务只按 V2.5 重构播放状态机并补测试。
- 不在 V2.5 获批前从并发脏工作树建立内容发布分支，不把未批准产品决策静默写进代码。
