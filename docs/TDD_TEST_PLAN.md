# TDD 与验收计划

状态日期：2026-07-23  
当前产品权威：V2.0；Review Candidate：`财经推演室_PRD_V2.4.md`

## 测试顺序

每个能力按 Red → Green → Refactor 推进：先写失败的契约/边界用例，再写最小实现，最后跑全量回归。默认测试不得联网、不得消耗额度。配置层已经能够解析 `LIVE_PROVIDER_TESTS`，但仓库**尚未实现 live test suite**；因此当前即使设置 `LIVE_PROVIDER_TESTS=true`，也不能把它视为已执行真实供应商验证。

## 当前回归基线

截至 `refer/douyin@b8ced09d` 完整门禁，在无真实密钥、无有权真实视频、无付费调用的前提下验证：

| 命令 | 结果 | 范围 |
|---|---:|---|
| `pnpm test:client` | 20 项通过 | 财包编排、六类渲染、组件、契约、会话与总结 |
| `pnpm test:server` | 102 项通过 | 来源、媒体、富语义、多阶段管线、Planner 4/45、六类 payload、方向、coverage 与 API |
| `pnpm test:e2e` | 6 项通过 | 4 个视口、三触点总结、普通推荐流隔离 |
| `pnpm type-check` | 通过 | Vue/TypeScript |
| `pnpm type-check:server` | 通过 | Express/服务端 TypeScript |
| `pnpm build` | 通过 | 前端生产构建 |
| `pnpm audit --prod` | 0 漏洞 | 生产依赖已知供应链漏洞 |
| `pnpm audit` | 21 high / 13 moderate / 4 low | 旧底座开发工具链债务，尚未完成升级 |

`4b34da1f` 增加 3 个默认回环绑定断言；本轮在该提交实际复核 `pnpm test:server` 为 105/105。
完整 client/type/build/E2E 基线仍引用 `b8ced09d`；六类 server 成稿/前端渲染测试不等于完整六类
有权媒体 E2E 或真实 Provider 已验证。

## P0 测试矩阵

| 编号 | 层级 | 场景 | 通过标准 |
|---|---|---|---|
| T-SRC-01 | 单元 | 非抖音域名、非法 secUid | 入口拒绝且不发网络请求 |
| T-SRC-02 | 契约 | 匿名页只有 JS 风控壳 | 返回 `dynamic_page_blocked`，不伪造作品 |
| T-SRC-03 | 契约 | 开放平台已授权作品分页 | 保留 cursor/has_more；不声称含媒体源地址 |
| T-MEDIA-01 | 单元 | 导入目录外的本地路径 | 在调用 FFmpeg 前拒绝 |
| T-MEDIA-02 | 单元 | FFmpeg/FFprobe 缺失 | readiness 指出缺失二进制，任务进入可诊断失败态 |
| T-ASR-01 | 契约 | 带时间戳转写 | 时间单调、非负、不超过媒体时长 |
| T-OCR-01 | 契约 | OCRNormal 的 V4 签名与帧中文字 | Node 原生实现签名；规范签名 `content-type;host;x-content-sha256;x-date`，每条证据绑定 frameId、timeMs、confidence、evidenceId |
| T-AI-01 | 契约 | 供应商返回有效结构 JSON | 通过 schema 并保留 evidence 引用 |
| T-AI-02 | 故障 | 超时、429、无效 JSON | 有类型化错误，草稿不发布，密钥不进入日志 |
| T-PLAN-01 | 黄金 | 候选密集或重复 | 时间轴节点 ≤6、自动邀请 ≤4、间隔 ≥45 秒、同时仅 1 个 |
| T-PLAN-02 | 黄金 | 缺证据或投资建议措辞 | 候选被拒并记录理由 |
| T-PIPE-01 | 集成 | Fake ASR/OCR/AI 完整流水线 | 只生成 `draft` 内容包和审核清单 |
| T-API-01 | API | 创建和轮询分析任务 | 状态只按 queued→running→succeeded/failed 转移 |
| T-VIDEO-01 | 组件/E2E | 展开触点 | 面板 ≤48vh、无蒙层、视频继续播放 |
| T-VIDEO-02 | E2E | 快进跨越多触点 | 只出现一个，其他进入时间轴 |
| T-REPORT-01 | E2E | 完成/略过混合 | 无总分；只陈述已观察证据和未观察项 |
| T-ADAPT-01 | 契约 | PM draft 完成 Schema 适配 | 状态仍 draft；不复制未授权媒体 |
| T-VERSION-01 | 契约 | PRD/内容/Schema/规则等版本向量缺失 | 不可 reviewed/approved |
| T-REVIEW-01 | API/CLI | ReviewManifest 缺权利、内容、安全或真实审核人 | `REVIEW_INCOMPLETE`，状态不提升 |
| T-PUBLISH-01 | API/CLI | draft、reviewed 或引用 Review Candidate 的内容尝试发布 | 拒绝；发布指针只接受 approved |
| T-PUBLISH-02 | 集成 | publish、retire、回滚 | 不可变历史和审计保留，新会话只读当前指针 |
| T-DRAFT-01 | API | PATCH draft 使用旧 expectedDraftVersion | 拒绝覆盖；成功修改创建新 revision 且仍为 draft |
| T-JOB-PUBLISH-01 | API | 已 reviewed draft 调 job publish | 物化不可变 ApprovedExperience，但不切运行指针 |
| T-JOB-PUBLISH-02 | API | 缺 ReviewManifest 或候选 PRD baseline | 拒绝，draft/review 状态不越权 |
| T-CONTENT-PUBLISH-01 | API | content publish/retire/回滚 | 只切换或撤销 approved 运行指针，与 job publish 分离 |

## 真实供应商冒烟测试

当前没有可运行的 live test case。下一阶段先补测试，再仅在用户填好本地环境文件并显式设置
`LIVE_PROVIDER_TESTS=true` 后执行：

1. 使用 10–20 秒、无敏感信息、具备处理权的测试素材。
2. 每个提供商只调用一次最小请求。
3. 断言返回结构与延迟，不把原始响应或密钥写入仓库。
4. 产生费用前由执行者确认当前项目、模型和额度。
5. MiniMax 的 `MINIMAX_MULTIMODAL_MODEL` 必须由用户按账号实际权限填写；测试不得自动枚举或探测模型。

在 live suite 落地、短视频授权和密钥就绪以前，任何文档都不得写“真实供应商测试已通过”或“真实视频分析已完成”。

## V2.4 文档、版本与内容门禁

1. V2.4 未形成真实联合评审结论前，V2.0 仍为权威，不创建 `prd-v2.4-approved`。
2. approved 内容必须引用已批准 PRD tag，并固化 content/schema/rule/weight/prompt/app/media 版本。
3. 模型、PM adapter 与 Schema 校验只能生成 draft；draft PATCH、ReviewManifest、job publish
   （物化 approved）与 content publish/retire（运行指针）是不同动作。
4. 内容或实现发现规范性变化时，先提出下一 PRD minor 版本，不修改内容掩盖需求漂移。
5. Markdown 是 PRD 唯一内容源。PDF 只做文件可打开、`pdfinfo`、文本抽取、页数和关键标题等机器校验；
   按用户 2026-07-23 最新指令，不做逐页 PNG、截图或肉眼视觉验收，并明确记录“视觉未验收”。

## 发布门禁

- 单元/契约测试全部通过；不存在 `.only`、跳过的 P0 用例或真实密钥。
- `LIVE_PROVIDER_TESTS` 对应的 live suite 已存在并由操作者显式运行；真实调用结果与费用确认有记录。
- 真实视频的授权、字幕、时间码和证据审核完成前，只能标记“工程原型”。
- Markdown PRD、代码 schema、环境模板和 API 文档字段一致。
- Review Candidate 不得成为 approved 内容 baseline；ReviewManifest 与发布审计齐全。
