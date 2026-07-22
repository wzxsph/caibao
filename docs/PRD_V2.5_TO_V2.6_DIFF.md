# 财经推演室｜PRD V2.5 → V2.6 差异与追溯

状态：Review Candidate 配套差异表  
日期：2026-07-23  
历史候选：`../财经推演室_PRD_V2.5.md`  
最新候选：`../财经推演室_PRD_V2.6.md`

## 1. 变更原因

用户于 2026-07-23 继续锁定三项规范行为：关键时间点出现可点击的超小 POI 入口；普通首页、财经 Demo 与长视频推荐只能展示 `refer/douyin/media-import/authorized-douyin/download-manifest.json` 中的有效媒体；取消“自动触点最多 4 个”的独立数量上限。变化影响产品命名、UI 尺寸、Planner、媒体接口、推荐数据源、失败策略、权利范围与验收，因此升级为 V2.6，不静默改写 V2.5。

V2.5 的播放状态机继续有效：入口曝光不停播；点击进入后暂停；完成、跳过或关闭时仅在进入前播放的情况下续播；不自动 seek、静音、改音量或倍速。

## 2. 规范差异

| 主题 | V2.5 | V2.6 |
|---|---|---|
| 入口命名 | 财包知识触点/CuePill，明确“不是 POI” | 财包 POI 微入口/CaibaoPoiEntry；页内按钮，不是外链或路由 |
| 入口形态 | 小胶囊，未锁最大宽度 | 高 44px、宽 ≤216px、24px 图标、单行省略、4—6 秒收起，主动作与稍后命中区均 ≥44px |
| 推荐数据 | 未锁定单一媒体目录 | 普通、Demo、长推荐都只读 manifest 有效子集；Demo 参数不决定白名单 |
| 失败策略 | 内容失败可继续普通视频 | 媒体目录 fail closed；空目录显示“暂无可用授权视频”，绝不回退旧视频 |
| 媒体接口 | 只定义 experience/session API | 新增 catalog、video、poster；GET/HEAD 与 HTTP Range |
| 内容范围 | PM 首包 draft 为主要候选 | 四套 `finance-xiaolin-*` 估算触点可作为本地 `internal_poc` 展示 |
| 权利范围 | 首媒体授权仍待确认 | 当前操作者声明仅覆盖内部 PoC，2026-08-22 到期；公网分发仍阻塞 |
| 频控 | 自动 ≤4、节点 ≤6、间隔 ≥45 秒 | 取消自动独立数量上限；保留节点总数 ≤6、自动间隔 ≥45 秒、同时 1 个，并增加 `delivery='automatic'|'timeline_only'` |

## 3. 授权清单与内容映射

唯一清单批次为 `douyin-authorized-20260723-01`。当前源 manifest 已升级为 schema v2、25 items，但推荐资格仍固定为下面 4 个 videoId 与 FinanceExperience 映射的有效交集；另外 21 条全部 `UNMAPPED`。服务兼容 schema v1/v2，schema 或条目变化不能扩大白名单：

- `7664748624454192393` → `finance-xiaolin-fifa`
- `7660817965343870248` → `finance-xiaolin-ai-power`
- `7660177158400216347` → `finance-xiaolin-autopilot`
- `7659728419487337747` → `finance-xiaolin-ai-capital`

四套内容统一为 `contentVersion='2026.07.23.2'`、`approvalScope='internal_poc'`。FIFA、AI 资本当前各 4 个节点且全部 `automatic`；AI 电力与自动驾驶当前各 5 个节点且全部 `automatic`。`aipower-compare-grid-dc`（约 150 秒，前后约 70 秒）与 `autopilot-judgment-l4`（约 240 秒，前后约 80/70 秒）此前仅因“自动最多 4 个”被降级；取消该上限后恢复为 `automatic`。`timeline_only` 类型保留给未来内容编排，当前四套内容不使用。估算时间码由本轮用户裁决接受用于本地 PoC，不代表财经审核、生产批准或公开发布。

## 4. Manifest 与媒体服务不变量

- 先用 v1/v2 adapter 规范化，再与固定四 ID/Experience 映射求交；未映射条目直接 `UNMAPPED`，不打开媒体。未知 schema 整体 fail closed。
- 对固定交集校验重复 ID、授权状态/期限、相对路径 containment、文件 bytes、SHA-256、FFprobe 时长/编解码和浏览器派生物。
- 单条失败只排除该条；全部失败返回空目录。任何错误都不得回退 `posts6.json`、`videos.md`、旧媒体 URL 或其他 fixture。
- 四条本地派生物已完成，均为 H.264/AAC、`yuv420p`、fast-start，写入 ignored `.analysis-work/authorized-media/<batchId>/`，不覆盖 `public/demo`。
- 源/派生 SHA 均已留痕；核验时长为 173.710/341.262993/354.476009/233.478005 秒，与源偏差 ≤250ms；约 177 秒截断文件无效。
- `/media/:videoId/video` 只服务有效目录项并支持 Range；未知 ID 为 404，过期为 410，非法范围为 416。
- 源媒体、派生媒体与封面都不进入 Git 或 GitHub Pages。

## 5. POI 与播放不变量

| 时刻 | 播放行为 |
|---|---|
| POI 曝光、超时、稍后 | 不改变播放状态 |
| 用户点击进入 | 捕获 `wasPlayingBeforeInteraction` 和 `pausePositionMs`，幂等调用一次 pause |
| 半屏交互 | 保持暂停；无蒙层，最高 48vh |
| 完成、跳过或关闭 | 进入前播放才从原位置续播；进入前暂停则保持暂停 |
| 回看证据 | 只有用户明确操作才允许 seek |

契约替换 `keepPlayback=true`：`playbackPolicy={ invitation:'continue', interaction:'pause', exit:'restore_previous' }`。播放器与扩展层通过 `pause-for-interaction` 和 `release-interaction` 类型化请求协作。

## 6. 新增验收

- T-CATALOG：四 ID 精确识别；重复、越界、过期、缺文件、bytes/SHA/时长不符全部 fail closed。
- T-RECOMMEND：普通、Demo、长推荐集合严格等于目录有效子集；空目录不展示其他视频。
- T-RANGE：完整 GET、HEAD、206、416、404、410 与响应头正确。
- T-POI：44px 高、≤216px、单行省略、4—6 秒收起、双 44px 命中区与完整可访问名称。
- T-PLAY：曝光时媒体时间增长；进入后暂停；退出按原状态恢复；位置漂移 ≤250ms；音量/静音/倍速不变。
- T-CONTENT：节点总数 ≤6、自动间隔 ≥45 秒、同时 1 个；6 个合格 automatic 节点必须全部保留；两套 5 节点内容均全部自动出现。`timeline_only` 作为未来编排类型时不自动弹出但可重访。

## 7. 发布与历史边界

- V2.5 改为 Historical Review Candidate，不再接受签字；V2.3/V2.4 继续只读保留。
- V2.6 仍是 Review Candidate；除用户直接裁决外，不代表联合批准，不创建 `prd-v2.6-approved`。
- `internal_poc` 是环境范围，不是 `reviewed/approved/published` 状态；生产客户端必须拒绝。
- 当前授权 2026-08-22 到期。续期前到期自动空推荐，媒体端点返回 410；公网部署仍为发布阻塞项。
- 本差异表只记录变更，不授权代码 push、媒体提交或公开分发。
- PDF 只做可读、页数、文本抽取和关键标题机器校验；视觉未验收。
