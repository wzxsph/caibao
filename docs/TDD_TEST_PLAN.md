# TDD 与验收计划

状态日期：2026-07-23  
当前已批准基线：V2.0；用户直接裁决覆盖旧的播放/入口/推荐/自动数量截断相反条款；Review Candidate：`财经推演室_PRD_V2.6.md`

## 测试顺序

每个能力按 Red → Green → Refactor 推进：先写失败的契约/边界用例，再写最小实现，最后跑全量回归。默认测试不得联网、不得消耗额度。配置层已经能够解析 `LIVE_PROVIDER_TESTS`，但仓库**尚未实现 live test suite**；因此当前即使设置 `LIVE_PROVIDER_TESTS=true`，也不能把它视为已执行真实供应商验证。

## 当前回归基线

截至未 push 的 `refer/douyin` 分支 `refactor/moneybaby-v2.4-foundation@b51e0a50`，在无付费调用的前提下验证：

| 命令 | 结果 | 范围 |
|---|---:|---|
| `pnpm test:client` | 40/40 | 财包编排、六类渲染、POI、暂停恢复、推荐仓储、契约、会话与总结 |
| `pnpm test:server` | 127/127 | manifest v1/v2、固定四 ID、Range、Planner 无数量截断、六类 payload、方向、coverage 与 API |
| `pnpm test:e2e` | 9/9 | Catalog-only 推荐、空态、Range、FIFA/三类核心交互、POI 暂停恢复和 4 个目标视口 |
| `pnpm type-check` | 通过 | Vue/TypeScript |
| `pnpm type-check:server` | 通过 | Express/服务端 TypeScript |
| `pnpm build` | 通过 | 前端生产构建 |
| `pnpm audit --prod` | 0 漏洞 | 生产依赖已知供应链漏洞 |
| `git diff --check` | 通过 | 代码与文档补丁无空白错误 |

该基线证明 Catalog/Range、三个推荐入口 fail closed、明确空态、POI 暂停恢复、自动数量上限移除
和四目标视口。四条 H.264/AAC 派生仍只存在 ignored `.analysis-work`，时长为
173.710/341.262993/354.476009/233.478005 秒。现有 9 项 E2E 主要覆盖 FIFA/三类核心运行交互；
不证明真实 Provider、最终财经内容或完整六类×四真实媒体 E2E。

## P0 测试矩阵

| 编号 | 层级 | 场景 | 通过标准 |
|---|---|---|---|
| T-SRC-01 | 单元 | 非抖音域名、非法 secUid | 入口拒绝且不发网络请求 |
| T-SRC-02 | 契约 | 匿名页只有 JS 风控壳 | 返回 `dynamic_page_blocked`，不伪造作品 |
| T-SRC-03 | 契约 | 开放平台已授权作品分页 | 保留 cursor/has_more；不声称含媒体源地址 |
| T-MEDIA-01 | 单元 | 导入目录外的本地路径 | 在调用 FFmpeg 前拒绝 |
| T-MEDIA-02 | 单元 | FFmpeg/FFprobe 缺失 | readiness 指出缺失二进制，任务进入可诊断失败态 |
| T-CATALOG-01 | 单元/契约 | 当前 schema v2、25 items manifest | 只产出固定 4 个财经 ID，另外 21 条 reason=`UNMAPPED`；标题/作者/时长/SHA/体验映射正确 |
| T-CATALOG-02 | 单元/契约 | 等价 schema v1 与 v2 fixture | 两者规范化出相同四 ID、字段和排除原因 |
| T-CATALOG-03 | 单元 | 过期、缺文件、bytes/SHA/FFprobe 不符 | 非法项 fail closed，全部固定项失败为空目录，不回退/替补 |
| T-CATALOG-04 | 集成 | 普通首页、财经 Demo、长推荐初次/翻页 | 三处集合严格等于固定四 ID 的有效交集；当前全有效时 `total=4` |
| T-CATALOG-05 | E2E | API 失败或目录为空 | 显示“暂无可用授权视频”；不请求 `videos.md`、旧 URL 或其他 fixture |
| T-CATALOG-06 | 集成 | 未知视频 ID 的评论请求 | 返回空结果，不随机映射旧视频评论 |
| T-CATALOG-07 | 单元/属性 | 新增、重排其他有效条目或固定 ID 缺失 | 白名单不扩大；新条目 `UNMAPPED`，缺失使 total 缩小 |
| T-CATALOG-08 | 单元/契约 | schema 非 1/2、重复 ID、路径越界 | 整体或非法项按契约 fail closed，不得因解析宽松扩权 |
| T-RANGE-01 | API | 完整 GET、HEAD、合法/尾部/非法 Range | 正确 200/206/416、长度、Accept-Ranges、Content-Range |
| T-RANGE-02 | API | 未知 ID、授权过期 ID | 分别 404、410；不得从旧目录命中 |
| T-DERIVE-01 | 集成 | 已生成的四条浏览器派生物 | H.264/AAC、yuv420p、fast-start、源/派生 SHA；时长 173.710/341.262993/354.476009/233.478005 秒，偏差 ≤250ms |
| T-DERIVE-02 | E2E | `7660817965343870248` loadedmetadata | 341.262993 秒；约 177 秒截断派生物被拒绝 |
| T-ASR-01 | 契约 | 带时间戳转写 | 时间单调、非负、不超过媒体时长 |
| T-OCR-01 | 契约 | OCRNormal 的 V4 签名与帧中文字 | Node 原生实现签名；规范签名 `content-type;host;x-content-sha256;x-date`，每条证据绑定 frameId、timeMs、confidence、evidenceId |
| T-AI-01 | 契约 | 供应商返回有效结构 JSON | 通过 schema 并保留 evidence 引用 |
| T-AI-02 | 故障 | 超时、429、无效 JSON | 有类型化错误，草稿不发布，密钥不进入日志 |
| T-PLAN-01 | 黄金 | 候选密集或重复 | 时间轴节点总数 ≤6、自动触点间隔 ≥45 秒、同时仅 1 个；无独立自动数量上限 |
| T-PLAN-02 | 黄金 | 缺证据或投资建议措辞 | 候选被拒并记录理由 |
| T-PLAN-03 | 黄金 | 6 个证据完整且相邻 ≥45 秒的 automatic 节点 | 6 个全部保留，不得截断为 4 个或自动改成 timeline_only |
| T-PIPE-01 | 集成 | Fake ASR/OCR/AI 完整流水线 | 只生成 `draft` 内容包和审核清单 |
| T-API-01 | API | 创建和轮询分析任务 | 状态只按 queued→running→succeeded/failed 转移 |
| T-PLAY-00 | 组件/E2E | 轻邀请曝光或自动收起 | 视频继续播放，不调用 pause/play/seek |
| T-PLAY-01 | 组件/E2E | 视频播放中点击进入财包 | 记录进入前状态与位置并自动暂停；面板 ≤48vh、无蒙层、不 seek |
| T-PLAY-02 | 组件/E2E | 从播放态进入后完成、跳过或关闭 | 从原暂停点续播，位置漂移 ≤250ms；静音、音量和倍速不变 |
| T-PLAY-03 | 组件/E2E | 视频已暂停时进入并退出 | 始终保持暂停，不误调用 play |
| T-PLAY-04 | 组件/E2E | 重复打开、关闭或重复事件 | pause/play 幂等，状态和事件不重复计数 |
| T-POI-01 | 组件/E2E | 关键点自动入口 | 高 44px、宽 ≤216px、图标 24px、单行省略、4—6 秒收起；两个命中区均 ≥44px |
| T-POI-02 | a11y/E2E | 截断文案、键盘与时间轴重访 | 完整可访问名称；按钮可键盘操作；收起后可重访 |
| T-VIDEO-02 | E2E | 快进跨越多触点 | 只出现一个，其他进入时间轴；邀请阶段不暂停 |
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
| T-INTERNAL-POC-01 | 契约 | 四套 `finance-xiaolin-*@2026.07.23.2` | 明确 `approvalScope=internal_poc`；生产 API 拒绝，回环显式模式可读 |
| T-DELIVERY-01 | 黄金/E2E | 四套 estimated cues | 节点 ≤6、自动间隔 ≥45 秒；FIFA/AI 资本各 4 个、AI 电力/自动驾驶各 5 个现有节点均为 automatic |
| T-DELIVERY-02 | 黄金/E2E | `aipower-compare-grid-dc@150s`、`autopilot-judgment-l4@240s` | 分别与相邻自动节点保持约 70/70 秒、80/70 秒间隔；两者自动出现且不因序号为第 5 个被改成 timeline_only |
| T-DELIVERY-03 | 单元/契约 | 未来内容显式声明 `delivery=timeline_only` | 不自动出现，但可从时间轴重访；类型能力保留且不影响当前四套映射 |

## 真实供应商冒烟测试

当前没有可运行的 live test case。下一阶段先补测试，再仅在用户填好本地环境文件并显式设置
`LIVE_PROVIDER_TESTS=true` 后执行：

1. 使用 10–20 秒、无敏感信息、具备处理权的测试素材。
2. 每个提供商只调用一次最小请求。
3. 断言返回结构与延迟，不把原始响应或密钥写入仓库。
4. 产生费用前由执行者确认当前项目、模型和额度。
5. MiniMax 的 `MINIMAX_MULTIMODAL_MODEL` 必须由用户按账号实际权限填写；测试不得自动枚举或探测模型。

在 live suite 落地、短视频授权和密钥就绪以前，任何文档都不得写“真实供应商测试已通过”或“真实视频分析已完成”。

## V2.6 文档、版本与内容门禁

1. V2.6 未形成真实联合评审结论前，V2.0 仍为已批准基线，不创建 `prd-v2.6-approved`；但进入暂停、
   POI 微入口、manifest-only 推荐和取消自动数量截断是用户直接裁决，代码不得继续把旧行为作为目标。
2. approved 内容必须引用已批准 PRD tag，并固化 content/schema/rule/weight/prompt/app/media 版本。
3. 模型、PM adapter 与 Schema 校验只能生成 draft；draft PATCH、ReviewManifest、job publish
   （物化 approved）与 content publish/retire（运行指针）是不同动作。
4. 内容或实现发现规范性变化时，先提出下一 PRD minor 版本，不修改内容掩盖需求漂移。
5. `internal_poc` 不是 approved/published；当前四条权利声明 2026-08-22 到期且不覆盖公网，媒体不得进 Git/GitHub Pages。
6. Markdown 是 PRD 唯一内容源。PDF 只做文件可打开、`pdfinfo`、文本抽取、页数和关键标题等机器校验；
   按用户 2026-07-23 最新指令，不做逐页 PNG、截图或肉眼视觉验收，并明确记录“视觉未验收”。

## 发布门禁

- 单元/契约测试全部通过；不存在 `.only`、跳过的 P0 用例或真实密钥。
- `LIVE_PROVIDER_TESTS` 对应的 live suite 已存在并由操作者显式运行；真实调用结果与费用确认有记录。
- 真实视频的授权、字幕、时间码和证据审核完成前，只能标记“工程原型”。
- Markdown PRD、代码 schema、环境模板和 API 文档字段一致。
- Review Candidate 不得成为 approved 内容 baseline；ReviewManifest 与发布审计齐全。
