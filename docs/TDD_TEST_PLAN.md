# 财包 V2.7｜TDD 与验收计划

状态：PRD V2.7 Review Candidate 配套  
日期：2026-07-23

## 1. 原则

1. 先写失败用例，再改契约/实现。
2. 区分当前工程原型与生产目标；未执行的真实 Provider/人审测试不得写成已通过。
3. Manifest/媒体、生成、播放、发布、报告分别测试，避免一个 E2E 掩盖分层错误。
4. 自动触点不设固定数量上限；测试锁定 45 秒间隔和单并发，不再断言 `<=4` 或 `<=6`。
5. 权利、Schema 或完整性失败全部 fail closed，不允许旧推荐 fallback。

## 2. 当前回归基线

应用：`wzxsph/douyin@e85de2bfa1743aaea5204f6e1513de6d56c2e310`

| 门禁 | 结果 |
|---|---|
| 前端 Vitest | 11 files / 44 passed |
| 服务端 Vitest | 21 files / 131 passed |
| Client type-check | passed |
| Server type-check | passed |
| Production build | passed |
| Playwright | 8 passed，四视口 |
| `pnpm audit --prod` | no vulnerabilities |
| `git diff --check` | passed |
| 媒体目录 | 25 ready / 0 excluded |
| 媒体 HTTP | HEAD 200 / Range 206 |
| Pages workflow | run `29955704172` passed |
| 线上实页 | 25 卡片、25 原作链接、视频可播、点击暂停、退出恢复、作者页 10 条 |

## 3. 测试矩阵

### 3.1 Manifest 与目录

- 正常识别 25 个不同 videoId、15/10 作者分布和真实标题/来源 URL。
- 重复 ID、未知 schema、路径穿越、绝对路径、缺文件、过期、bytes/SHA/时长/编解码不符。
- 单条失败只剔除该条；全部失败返回空目录。
- 推荐集合严格等于有效子集，不读取 `posts6.json`、`videos.md` 或旧媒体 URL。
- 评论或作者未知 ID 不随机映射旧数据。

### 3.2 媒体派生与 HTTP

- 25 个派生均为 H.264/AAC、`yuv420p`、fast-start。
- 派生时长与 manifest 偏差≤250ms；记录源与派生 SHA/bytes。
- GET 完整请求 200；合法 Range 206；HEAD 无 body；非法 Range 416；未知 ID 404；过期 410。
- Release 资产精确 50 个，总 bytes 与发布记录一致；抽查视频/封面公网 200。
- 源 HEVC、`.analysis-work`、`media-import` 不进入 Git。

### 3.3 Mock 生成与 Schema

- 25 个 Catalog 对应 25 个 Experience，videoId/指纹一一匹配。
- 六类 Payload 有 golden；所有 Trigger 有 evidenceIds、reviewStatus、timecodeQuality、delivery。
- 当前 evidenceBasis 明确为 `title_and_manifest_metadata_only`。
- 相同输入产生字节级稳定或规范化稳定输出。
- Schema 错误只做有限结构修复；修复耗尽返回明确失败。
- 非格式错误不重试，模型不得设置 approved/published。

### 3.4 Planner 与数量规则

- 合格 automatic 节点间隔≥45秒，同一时刻最多一个。
- 6 个符合条件的候选全部可保留；第 5/6 个不得被旧数字上限截断。
- 更长视频出现 7 个及以上合格候选时，契约允许输出；是否选择由证据、学习价值、重复度和时间预算解释。
- 密集候选按确定性策略取舍，相同输入顺序稳定。
- `timeline_only` 只由内容显式指定，不由“超过 N 个”自动降级。

### 3.5 播放状态

- 入口出现 4–6 秒内 `currentTime` 持续增长。
- 点击后 450ms 观察窗口时间不增长。
- 原播放进入：完成、跳过、关闭均恢复。
- 原暂停进入：三种退出均保持暂停。
- 重复 pause/release、双击、快速开关、组件卸载、视频切换、已结束、`play()` 拒绝。
- 不写 `currentTime`；位置漂移≤250ms；`muted`、`volume`、`playbackRate` 不变。
- 面板打开期间背景单击不误触播放；时间轴重访允许用户主动 seek。

### 3.6 UI 与无障碍

视口：390×844、393×852、430×932、1280×900。

- 轻触点主动作与“稍后”命中区≥44×44px，文本单行省略且 aria-label 完整。
- 半屏≤48vh、无蒙层、无安全区遮挡；作者头像不被财包替换。
- 推荐位置 1/25，上一条/下一条可键盘与读屏操作。
- 作者页分别 15/10，明确“不是官方账号主页”。
- LLM Mock、未用最终 ASR/OCR、未经财经审核和非投资建议可见。

### 3.7 API、审核与发布（目标能力）

- Draft 禁止被普通播放器读取。
- 缺版权、证据、最终时间码、财经审核或 Schema blocker 时 publish 409。
- ApprovedExperience 不可变；修改创建新 contentVersion。
- ReviewManifest 真实 reviewer/role/time/outcome，不允许模型代签。
- 审核写接口在公开部署关闭；运行 API 只返回 Approved。
- 内容 publish 与 job approval 分离，权限、幂等键、审计事件不同。

### 3.8 会话、报告与安全（目标能力）

- Event 以 `eventId` 幂等；刷新恢复不重复计数。
- 服务端会话丢失时可用 localStorage 快照补回。
- 模型超时、非法 JSON、断网时确定性模板完成全流程，报告非空。
- 报告只引用实际事件/证据；忽略为“未观察”，不伪造错误或掌握。
- “买什么、仓位、目标价、稳赚”等请求始终拒绝并转回机制解释。
- 不保存原始语音，不推断财富、持仓或风险偏好。

### 3.9 真实多模态与复述（待执行）

- ASR/OCR/视觉时间窗和证据 ID 与人工标注对齐。
- 先用 2–3 条建立黄金集，不直接用 25 条替代质量门。
- 至少 40 条复述人工金标，覆盖绝对化、机制缺失、条件缺失、概念混淆。
- Macro-F1≥0.80；严重概念错误召回≥90%。
- Provider P95、费用、超时和降级达到 PRD 指标后再扩容。

## 4. 端到端场景

### E2E-01 推荐与归属

Given 线上 bundle 有 25 条，When 打开 `#/home`，Then 只出现这 25 条及 25 个原作链接，作者分布 15/10。

### E2E-02 曝光不停播、进入暂停

Given 视频在播放，When 轻触点出现，Then 时间继续增长；When 用户点击，Then 半屏≤48vh 且视频暂停。

### E2E-03 恢复前态

Given 进入前在播放/暂停，When 完成、跳过或关闭，Then 分别恢复播放/保持暂停，且无 seek、音量或倍速变化。

### E2E-04 无固定数量上限

Given 第 5、6 个节点满足证据和 45 秒间隔，When 播放到对应时间，Then 都可自动出现，不被 `maxAutomaticCues=4` 截断。

### E2E-05 作者页

Given 点击作者入口，When 进入作者页，Then 仅显示该作者清单子集，并提供原作品链接。

### E2E-06 失效与到期

Given 目录全部失效，When 打开推荐，Then 明确空态且无旧视频网络请求。Given 到期 retire，Then Release 直链也不可访问。

## 5. 发布前命令

```bash
cd /home/samsong/Desktop/maybe/caibao/refer/douyin
pnpm test
pnpm type-check
pnpm type-check:server
pnpm build
pnpm test:e2e
pnpm audit --prod
git diff --check
```

另检查：`gh release view showcase-media-20260723-v1` 资产数、Pages workflow 结果、线上 DOM/视频播放和原作链接。

## 6. 文档门

- V2.7、差异、评审、README、AGENTS、交接、架构、实施和治理指针一致。
- Markdown 链接存在，事实 SHA/URL/测试数准确，历史候选未写成 Approved。
- 本轮 V2.7 不生成 PDF。
- 后续若生成 PDF，只做 `pdfinfo`、`pdftotext`、文件大小、页数和关键标题机器校验；按用户要求不做逐页视觉验收，记录“视觉未验收”。
