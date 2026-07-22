# 财包视频理解与时间轴交互架构

状态：V2.6 为最新 Review Candidate；未 push 的本地切片已完成 POI/Catalog/Range/推荐/暂停与核心 E2E，公开发布仍阻塞  
代码 checkpoint：`refer/douyin` 的 `refactor/moneybaby-v2.4-foundation@b51e0a50`（本轮 5 个提交）。
该 HEAD 已通过 client 40/40、server 127/127、Playwright 9/9、两套 type-check、build、production audit
与 diff-check；共享工作树仍须在接手时实时复核，且未授权不得 push。

> 产品候选：`财经推演室_PRD_V2.6.md`。V2.6 沿用独立版本向量、ReviewManifest 与受控
> draft PATCH、ReviewManifest、job publish（物化 approved）与 content publish/retire（运行指针）
> 门禁，增加财包 POI 微入口和 manifest-only 推荐，并保持“邀请不暂停、进入自动暂停、退出按原状态恢复”。
> POI/Catalog/Range/推荐/暂停切片已经 `b51e0a50` 验证；Review/Publish、真实 Provider 与内容审核仍是目标能力。

## 系统分层

```mermaid
flowchart LR
  DM["授权 manifest v1/v2；当前 v2=25 items"] --> MAP["固定四财经 ID / Experience 映射"]
  MAP --> MC["Catalog: 四 ID 交集 + 期限/路径/bytes/SHA/FFprobe"]
  DM --> UX["其余条目 → UNMAPPED"]
  MC --> RF["普通 / Demo / 长推荐：最多四条或空态"]
  MC --> MS["GET/HEAD video + poster / HTTP Range"]
  RF --> VP["本地 PoC Player"]
  MS --> VP
  A["公开主页 URL"] --> B["来源建档 / 语义探测"]
  C["创作者 OAuth"] --> D["官方作品元数据列表"]
  E["用户上传或授权存储媒体"] --> F["MediaAsset + 权利声明"]
  B --> G["ExternalVideoRef"]
  D --> G
  G --> H{"是否有可分析 MediaAsset"}
  F --> H
  H -- "否" --> I["409 MEDIA_ASSET_REQUIRED"]
  H -- "是" --> J["FFprobe + SHA-256"]
  J --> K["FFmpeg 音轨"]
  J --> L["FFmpeg 关键帧"]
  K --> M["豆包 ASR 毫秒时间码"]
  L --> N["OCRNormal"]
  M --> O["证据融合"]
  N --> O
  L --> P1["语义抽取 emit_semantic_graph"]
  O --> P1
  P1 --> P2["确定性校验 + 证据引用"]
  P2 --> P3["可选语义评审 emit_critique"]
  P3 --> P4["定向修复环 ≤2 轮"]
  P4 --> P5["评分 cue-scorer + 确定性 Planner"]
  P5 --> P6["方向规则引擎 direction-rules"]
  P6 --> P7["payload 授权 payload-author ≤2 轮"]
  P7 --> Q["Zod Schema + 终检禁词"]
  Q --> S["DraftExperience"]
  Q --> CR["CoverageReport / 查漏补缺清单"]
  S --> T["ReviewManifest / 人工审核（待建设）"]
  CR --> T
  T --> AP["独立批准动作（待建设）"]
  AP --> U["不可变 ApprovedExperience"]
  U --> PP["可回滚发布指针（待建设）"]
  PP --> V["VideoExtensionHost"]
  VP --> V
  V --> W["44px CaibaoPoiEntry / 48vh HalfSheet / LearningTrace"]
```

> 生成管线的多阶段循环见 `docs/GENERATION_PIPELINE_DESIGN.md` 与
> `docs/ADR/0003-agentic-generation-pipeline.md`。上图 P1–P7 已在代码提交
> `50b96560` 实现核心管线，`b8ced09d` 开放六类 server payload 成稿；`b51e0a50` 已移除旧自动数量上限，
> 保留 45 秒间隔，并完成媒体目录、Range、推荐与 POI 运行切片。`CoverageReport` 已作为按内容版本
> 生成的确定性审核门产物。当前 9 项 Playwright 主要验证 FIFA/三类核心交互、空态与四目标视口；
> 真实供应商、最终财经内容、完整六类×四真实媒体 E2E、人工审核与发布链路仍未验证。

## 关键不变量

1. 推荐集合固定为 `manifest v1/v2 有效条目 ∩ 四个财经 videoId/Experience 映射`；当前 v2 有 25 条，其余 21 条 `UNMAPPED`。schema、条目、作者或排序变化不得扩大白名单；普通、Demo、长推荐共享交集，失败为空态且不替补。
2. 来源元数据不等于媒体资产；没有权利明确的媒体文件，不启动分析。
3. ASR/OCR/关键帧是证据，模型输出是候选；模型不能发布。
4. ASR 时间码优先于模型猜测；未知 evidenceId 会被管线拒绝。
5. 内容节点总数最多 6 个；自动邀请不设独立数量上限，但相邻间隔至少 45 秒、同时最多 1 个；
   单次最多 12 秒，并扫描投资建议措辞。`timeline_only` 只由内容编排明确指定，不能因序号大于 4 自动降级。
   当前四套内容中 FIFA/AI 资本各 4 个、AI 电力/自动驾驶各 5 个现有节点均为 `automatic`；
   `aipower-compare-grid-dc@150s` 与 `autopilot-judgment-l4@240s` 不再使用旧的数量截断结果。
6. 播放时不实时请求模型决定弹点；生产前端只消费已批准、版本化内容包，本地可显式消费 `internal_poc`。
7. POI 微入口高 44px、宽 ≤216px、4—6 秒收起；邀请曝光不暂停；用户进入触点时记录 `wasPlayingBeforeInteraction` 和 `pausePositionMs` 后暂停。
   完成、跳过或关闭时仅在进入前正在播放的情况下从原位置恢复；不得自动 seek、静音、改音量或倍速。
   无蒙层，面板不超过 48vh。该状态机已在 `b51e0a50` 的组件与 Playwright 门禁验证。
8. 媒体、作者头像/昵称、来源 URL、字幕和内容包版本必须一致；财包不得替换作者身份。
9. PRD、内容、Schema、规则、Planner 权重、Prompt、应用提交和媒体指纹独立版本化；
   Review Candidate 只能生成 draft，approved 内容必须引用已批准 PRD tag。
10. 固定 4 条媒体仅限本地 `internal_poc`，2026-08-22 到期；四条 H.264/AAC、yuv420p 派生已在 ignored `.analysis-work` 完成并核验时长 173.710/341.262993/354.476009/233.478005 秒。源/派生媒体不进 Git/GitHub Pages，公网分发阻塞。

## PM 内容包迁移边界

`refer/moneybaby` 固定在 `7db765b`，只作为内容与 UI 取证来源。迁移链路固定为：

```text
PM VideoContentPackage (draft)
→ adapter + media/author/version validation
→ DraftExperience + CoverageReport
→ ReviewManifest + human review
→ independent approval
→ immutable ApprovedExperience
→ rollbackable publish pointer
```

- 可迁移：视频元数据、章节、字幕候选、六节点学习意图、证据窗口、复述/报告信息结构。
- 可迁移但必须重写：用户主动进入后暂停这一基础意图；退出恢复必须按 V2.6 的进入前状态实现。
- 不迁移：React/Vinext 页面、Cloudflare 运行栈、自动 seek、全屏 shade、88%–94% Sheet、财包占作者头像位、二选一与静态能力印章。
- PM 视频仍缺公开分发授权，概念与因果边均未审核；Schema 适配成功不改变其 `draft` 状态。
- 首包主题以美元外溢、全球资本、本国周期和相对利差为准，不向报告注入视频未覆盖的股票/黄金能力。

## P0 代码责任

| 位置 | 责任 |
|---|---|
| `src/features/video-extensions` | 与底座解耦的扩展匹配、上下文和媒体时钟 |
| `src/features/finance-cues` | 前端内容 schema、Cue 状态机、组件、足迹和 fixture |
| Catalog/推荐层（V2.6 已实现切片） | 兼容 manifest v1/v2，与固定四 ID 映射求交；未映射条目 `UNMAPPED`，无旧 mock/替补 fallback |
| Media API（V2.6 已实现切片） | Catalog、video/poster、GET/HEAD/Range、404/410/416 与本地派生物 |
| `server/src/sources` | 抖音 URL 规范化、匿名探测、授权作品元数据分页 |
| `server/src/media` | 受限导入目录、FFmpeg/FFprobe、指纹、音轨和帧 |
| `server/src/providers` | OpenAI-compatible tool 输出、语义抽取/评审/修复、豆包 ASR、火山 OCR 与原生 V4 签名 |
| `server/src/pipeline` | 语义时间轴、有界修复、评分与 Planner（节点 ≤6、自动间隔 ≥45 秒、同时 1 个、无自动数量截断）、方向规则、六类 payload 成稿、CoverageReport |
| `server/src/jobs` | P0 内存任务与 draft/CoverageReport；进程重启后丢失是已知限制 |
| `server/src/app.ts` | readiness、来源探测、分析任务、草稿与 coverage API |
| Review/Publish Gate（目标） | draft PATCH、ReviewManifest、job publish、content publish/retire、权限/幂等/审计；当前未实现，P0 可先用同契约 CLI |
| `refer/moneybaby/.../app/content` | PM 参考内容结构；不得成为运行时第二内容仓 |

## Provider 选择

### MiniMax 方案

- `MINIMAX_BASE_URL=https://api.minimaxi.com/v1`
- 文本默认 `MiniMax-M2.7`。
- `MINIMAX_MULTIMODAL_MODEL` 默认留空；操作者确认账号权限后填写可用的视觉模型，当前代码不自动探测模型授权。留空时使用 transcript/OCR 文本并不发送关键帧。
- 结构数据由 tool/function 参数返回，再经 Zod 校验；不假定原生 JSON Schema 支持。

### 豆包方案

- `ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3`
- `ARK_MODEL`/`ARK_MULTIMODAL_MODEL` 使用控制台可用的 Model ID 或 `ep-...`。
- ASR 与方舟 API key 分离；OCR 又使用独立 AK/SK。
- OCRNormal 使用 Node `crypto` + `fetch` 实现火山 V4 签名，签入 `content-type;host;x-content-sha256;x-date`，不依赖通用 OpenAPI SDK。

## 失败降级

| 失败 | 行为 |
|---|---|
| 公开主页只返回风控壳 | `dynamic_page_blocked`，建议 OAuth 或人工导入 |
| 只有作品元数据/iframe | `409 MEDIA_ASSET_REQUIRED` |
| manifest 不可读或全部无效 | Catalog 空；三个推荐入口显示“暂无可用授权视频”，不回退 |
| manifest schema 非 1/2 | 整体 fail closed，不猜字段 |
| v2 新增、重排或出现其他作者条目 | 固定四 ID 集合不变；未知项 `UNMAPPED`，不打开或服务媒体 |
| 固定财经 ID 缺失/失效 | 集合缩小或为空，不以另外 21 条替补 |
| 单条路径/bytes/SHA/FFprobe 不符 | 排除该条并记录原因，其余有效子集可用 |
| 授权在 2026-08-22 后未续期 | Catalog 为空；媒体端点 410 |
| 无权利声明 | `403 MEDIA_RIGHTS_NOT_ATTESTED` |
| FFmpeg 不存在 | readiness 和任务返回 `MEDIA_TOOL_UNAVAILABLE` |
| 模型 key/model 缺失 | readiness 返回缺失变量名，不返回变量值 |
| 模型超时/429/无效结构 | 任务失败为类型化错误，不产生 approved 内容 |
| 服务进程重启 | P0 内存任务丢失；前端静态已批准内容不受影响 |

## 版本与发布链

批准内容必须固化以下版本向量：`prdBaseline`、`contentVersion`、`schemaVersion`、
`ruleVersion`、`weightTableVersion`、`promptVersion`、`appCommit`、`mediaFingerprint`。
模型/adapter 只能创建 draft；reviewed、approved、published 是三个不同状态，修改产生新内容版本。
完整规则见 `docs/VERSION_GOVERNANCE.md`。

## P1 设计缺口

- 对象存储上传、病毒/MIME 魔数扫描、短时签名 URL。
- OAuth state、token 加密存储、撤销与刷新完整流程。
- 场景切换抽帧与长视频分段/并发控制。
- 完整审核 UI、企业级权限/双人复核、ApprovedExperience 持久化；P0 仍必须先完成可测试的
  draft PATCH、ReviewManifest、job publish 与 content publish/retire 动作，不能继续用手改 fixture 代替发布。
- PostgreSQL/队列、租户隔离、审计日志和额度控制。
- FFmpeg 子进程超时、任务并发/TTL、派生文件清理与独立媒体 worker。
- 前端 `StaticExperienceRepository` 切换为 API + 缓存的生产仓储。
