# 财包时间轴分析与交互系统｜实施计划

状态日期：2026-07-23  
产品主仓库：`/home/samsong/Desktop/maybe/caibao`  
应用代码仓库：`/home/samsong/Desktop/maybe/caibao/refer/douyin`

## 目标

把现有静态财经触点 Demo 升级为可交接的垂直切片：本地推荐只消费授权 manifest 的有效子集，在关键点显示 44px 财包 POI 微入口；曝光不停播，进入暂停，退出按原状态恢复。自动触点不设独立数量上限，只受节点总数 ≤6、间隔 ≥45 秒和同时 1 个约束。四套估算触点可作为 `internal_poc` 本地验证，生产仍须完整审核。当前已批准基线仍为 V2.0，用户直接裁决覆盖旧的播放、入口、推荐与数量截断口径；最新产品目标为 Review Candidate `财经推演室_PRD_V2.6.md`。

## 阶段与完成定义

### D0｜V2.6 文档候选

- [x] 保留 V2.3/V2.4/V2.5 为历史候选，基于用户直接裁决形成 V2.6 Review Candidate。
- [x] 增加 PRD/内容/Schema/规则/权重/Prompt/应用/媒体的独立版本治理。
- [x] 增加 V2.5→V2.6 差异、POI、manifest-only 推荐、Range 与 `internal_poc` 边界。
- [ ] 产品、设计、研发/架构、测试、内容/财经、法务/版权、安全/隐私完成真实评审。

### D1｜V2.6 批准与权威切换

- [ ] 清空或明确延期全部影响 P0 的规范性待决策。
- [ ] Markdown 状态、PDF、评审记录、AGENTS/交接/计划权威指针在同一批准变更中更新。
- [ ] 合并到产品仓 `main` 后创建 annotated tag `prd-v2.6-approved`。
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
- [x] `b8ced09d` 完成 45 秒间隔与六类 server payload 离线成稿；其旧自动数量截断已被用户取消，不再视为目标完成项。
- [x] 产物固定为 `draft`，人工审核动作与发布动作分离。

实现完成不等于供应商已验证：本地凭据状态以 `docs/AGENT_HANDOFF.md` 为准，`LIVE_PROVIDER_TESTS` 仍只有配置解析，没有对可入库的授权真实视频执行付费全链路。

### M2.5｜授权媒体目录与派生服务

- [x] 先写 manifest v1/v2、当前 25→固定 4、21 个 `UNMAPPED`、schema 不扩权、重复 ID、路径 containment、期限、bytes、SHA-256、FFprobe 的失败测试。
- [x] 实现 `AuthorizedMediaCatalog`；只允许固定四 ID/Experience 交集，逐项排除并记录原因，全部失败为空目录，禁止新增条目或旧视频 fallback。
- [x] 从四条 HEVC 源生成 Git-ignored 的 H.264/AAC、yuv420p、fast-start 派生媒体和封面；源/派生 SHA 已记录，时长 173.710/341.262993/354.476009/233.478005 秒。
- [x] `7660817965343870248` 已完整重建为 341.262993 秒；约 177 秒截断文件不再作为有效产物。
- [x] 实现 Catalog、GET/HEAD video/poster、HTTP Range、404/410/416。
- [x] 普通首页、财经 Demo、长推荐只从 Catalog 分页；空目录显示“暂无可用授权视频”。

### M3｜服务与前端联调

- [x] 先写 V2.6 POI/播放失败用例：44px/216px/4—6 秒；邀请不暂停；进入暂停；退出恢复；原本暂停；重复事件幂等。
- [x] 实现 `wasPlayingBeforeInteraction`、`pausePositionMs` 与播放转换状态；不得自动 seek、静音、改音量或倍速。
- [x] 用 `pause-for-interaction`、`release-interaction`、`playbackPolicy` 替换 `keepPlayback=true`；触点显式 `automatic|timeline_only`。
- [x] Express 提供健康检查、来源探测、分析任务、草稿与 CoverageReport 读取接口；默认只监听 `127.0.0.1:18787`。
- [x] 推荐仓库只读 Catalog 且 fail closed；体验仓库的 ApprovedExperience-only 发布读取仍属于后续发布链。
- [x] 完成 Catalog/Media 前端 API 联调；API 失败和空目录进入明确空态，不影响普通播放且不回退旧视频。
- [x] 移除自动邀请数量截断；保留内容节点总数 ≤6、自动间隔 ≥45 秒、同时 1 个，并用 6 个合格 automatic 节点全部保留的测试锁定。
- [x] 推荐路径不再读取会黑屏或复用错误作者元数据的旧财经占位条目；非推荐历史页不在本轮迁移范围。

### M3.5｜PM 内容包选择性迁移

- [x] 固定 `prac-fect/moneybaby@7db765b`，完成源码、线上交互、构建和测试取证。
- [x] 裁决只迁移内容结构/学习叙事，以及“主动进入后暂停”的基础意图；不迁移 React/Vinext 页面、自动 seek、大遮罩和作者头像替换。暂停恢复必须按 V2.6 重写。
- [ ] 先写 `VideoContentPackage` → `DraftExperience` 适配测试；迁入后仍必须是 `draft`。
- [ ] 增加媒体指纹、作者昵称/头像/来源、时长和内容包版本一致性校验。
- [ ] 授权确认后再迁移真实媒体；授权前不复制 15MB 视频到产品仓或公开发布路径。
- [ ] 将最多 6 个候选按 45 秒间隔和内容意图编排；不按总次数截断。00:08 背景和 03:08 反例是否弱化只由内容审核决定。
- [ ] 固化 `prdBaseline`、`contentVersion`、`schemaVersion`、`ruleVersion`、`weightTableVersion`、
  `promptVersion`、`appCommit` 与 `mediaFingerprint`；缺任一版本不得批准。

### M3.5b｜四套小Lin本地内容

- [x] 四套体验升级到 `2026.07.23.2`，媒体指纹逐项使用 manifest SHA，范围固定为 `internal_poc`。
- [x] FIFA、AI 资本当前各 4 个节点均为 automatic；AI 电力与自动驾驶当前各 5 个节点均为 automatic。`aipower-compare-grid-dc`（约 150 秒）和 `autopilot-judgment-l4`（约 240 秒）已从旧数量截断产生的 timeline-only 恢复为 automatic；`timeline_only` 类型只保留给未来内容编排。
- [x] 估算时间码记录用户决策引用；不得包装为最终字幕/OCR/财经审核或 production approved。
- [ ] 生产环境和公网 API 硬拒绝 internal_poc；本地显式模式才能读取。

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
- [ ] 当前 4 条媒体仅在费用确认后执行一次最小真实管线 dry run；权利范围仍限内部 PoC。
- [ ] 人工核对字幕、OCR、关键概念、证据时间码和触点文案。
- [ ] 审核后的内容包替换当前占位时间码，再进行正式演示。
- [ ] 六类触点在四条完整媒体上的单元、集成与 Playwright 全部通过；现有 9 项已通过 FIFA/三类核心路径、空态和四视口，不得外推为六类×四媒体。
- [ ] 片尾沙盘、反例、复述和证据报告只从真实事件与证据生成，不使用静态能力印章。
- [ ] 内容版本引用已批准 PRD tag；Review Candidate 产物只能保持 draft。

未 push 的 `refactor/moneybaby-v2.4-foundation@b51e0a50`（本轮 5 个提交）已通过 client 40/40、
server 127/127、Playwright 9/9、两套 type-check、production build、`pnpm audit --prod` 与
`git diff --check`。Catalog/Range、Catalog-only 推荐、POI 暂停恢复、空态和四目标视口不再是工程
阻塞；最终字幕/真实时间码与财经审核、公网分发权、真实 Provider 和完整六类×四媒体 E2E 仍是 M4 前置条件。

## 当前不做

- 不承诺抓取任意抖音博主的完整作品和原始媒体。
- 不让模型直接发布触点，不在播放期间实时调用大模型决定弹窗。
- 不建设投资建议、实时行情、用户财富画像或自由聊天 Agent。
- 不把当前媒体、派生物、封面上传 Git/GitHub Pages/CDN；2026-08-22 后未续期则自动空推荐。
- 不重做已完成的半屏结构；只收敛 POI 微入口并按 V2.6 重构播放状态机。
- 不在 V2.6 获批前从并发脏工作树建立正式内容发布分支，不把 internal_poc 冒充 approved。
