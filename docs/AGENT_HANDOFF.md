# 财经推演室｜Agent 交接

最后更新：2026-07-22  
目标：下一位 Agent 不需要重新猜产品形态、仓库边界或供应商契约即可继续。

## 先读这些文件

1. `财经推演室_PRD_V2.0.md`：唯一产品口径。
2. `docs/ARCHITECTURE.md`：系统、数据流和失败降级。
3. `docs/TDD_TEST_PLAN.md`：测试顺序与门禁。
4. `docs/RESEARCH_SOURCES_AND_PROVIDERS.md`：抖音/MiniMax/豆包/ASR/OCR 一手结论。
5. `refer/douyin/server/README.md`：分析服务运行方式。

`PROJECT_STATUS_AND_ROADMAP.md`、V1 PRD 和旧后端说明均为历史文件，不得覆盖 V2.0。

## Git 与路径

### 产品主仓

- 路径：`/home/samsong/Desktop/maybe/caibao`
- 分支：`main`
- 负责：PRD、配图、PDF、研究、ADR、计划、本交接，以及旧版材料、海报和 `demoUI/` 现状依据。
- `refer/douyin/` 被父仓忽略，因为它是独立 Git。
- 当前 commit：本交接文件所在产品仓 HEAD（运行 `git rev-parse HEAD` 获取）。

### 应用代码仓

- 路径：`/home/samsong/Desktop/maybe/caibao/refer/douyin`
- 分支：`feat/caibao-analysis-pipeline`
- 公共上游已从 `origin` 改名为 `upstream`：`https://github.com/zyronon/douyin`。
- 没有项目 `origin`，不得向 `upstream` push。
- 当前 commit：`57daf3b6cbb61ce49376f9bc4d84b55869befec3`。

不要删除、移动任一 `.git`，不要把代码仓作为父仓普通目录 add。

## 已实现

### 视频内轻交互

- 通用 `VideoExtensionHost` 和毫秒媒体时钟。
- 固定财经演示入口 `/?demo=finance-fed`，使用本地 150 秒合成占位视频。
- 视频关键时点多次 CuePill，4–6 秒后收起。
- CaibaoHalfSheet 无蒙层、最大 48vh；展开和答题不暂停视频。
- 三类模板：背景补丁、条件拨片、因果补边。
- 自动触点最多 6 个、间隔至少 45 秒；面板打开或快进冲突时收进时间轴。
- localStorage 足迹与无总分学习总结；作者头像不会被财包替换。

### 来源与分析服务

- Express API 默认只监听 `127.0.0.1:18787`；Docker 也只把宿主端口发布到
  `127.0.0.1:18787`。本机已有旧项目占用 `8787`，不要抢占或终止它。
- `GET /api/finance/v1/health`：返回 provider/media readiness，不返回密钥。
- `POST /api/finance/v1/sources/douyin/profile/probe`：只做规范化和可验证资料探测。
- `POST /api/finance/v1/analysis/jobs`、`GET .../:jobId`、`GET .../:jobId/draft`。
- `DouyinOpenPlatformClient`：正式 OAuth 已授权账号 `video.list` 元数据分页；不伪造媒体 URL。
- FFprobe/FFmpeg：受限导入目录、真实路径复核、SHA-256、WAV、关键帧。
- 豆包极速 ASR：URL/Base64 输入、毫秒 utterance、证据 ID、新旧鉴权头。
- 火山 OCRNormal：Node 原生 `crypto` 实现 Volcengine Signature V4，规范签名
  `content-type;host;x-content-sha256;x-date` 四个 header；AK/SK 隔离，并返回帧/时间/置信度证据。
- MiniMax/方舟 OpenAI-compatible tool 输出、Zod 校验、类型化超时/HTTP/结构错误。
- 证据门禁：ASR 片段不得越过媒体时长；OCR 缺失/非法置信度不进入证据；高优先级触点在最小间隔冲突中胜出。
- Cue Planner：证据、媒体范围、画面负荷、max 6、min 45 秒、投资建议措辞。
- 任何成功分析只得到 `DraftExperience`；`approvedTriggers=[]` 且必须人工审核。

### 环境文件

- 用户填写：`refer/douyin/.env.minimax`、`refer/douyin/.env.doubao`（Git ignored）。
- 交接模板：`.env.minimax.example`、`.env.doubao.example`（可提交）。
- MiniMax、方舟、ASR、OCR 的密钥彼此独立；不要放进 `VITE_*`。
- MiniMax 的 `MINIMAX_MULTIMODAL_MODEL` 默认空值且不会自动探测模型权限；只有用户在控制台确认
  可用模型后才填写。空值时当前代码回退到 `MINIMAX_TEXT_MODEL` 且不发送关键帧，只使用
  transcript/OCR 文本；这不等于已验证视觉能力。

## 已通过的本地门禁

截至 2026-07-22，以下结果由本地离线/fixture 测试获得：

- 前端 Vitest：13 项通过。
- 服务端 Vitest：25 项通过。
- Playwright：6 项通过（4 个视口、完整三触点总结、普通推荐流隔离）。
- `pnpm type-check`、`pnpm type-check:server`、`pnpm build` 均通过。
- `pnpm audit --prod`：生产依赖 0 个已知漏洞。完整 `pnpm audit` 仍报告旧底座开发工具链的
  21 high / 13 moderate / 4 low，主要来自旧 ESLint、Commitizen、Vue macros 等链路，尚未完成升级。
- PDF 已由唯一 Markdown 源生成，A4 共 28 页：

```bash
cd /home/samsong/Desktop/maybe/caibao
python3 scripts/render_prd_pdf.py
pdfinfo output/pdf/财经推演室_PRD_V2.0.pdf
```

这些结果不包含真实供应商调用、真实视频分析或人工审核后的发布验证。

## 已实际验证的外部事实

目标主页在应用内浏览器可见“小Lin说”、`lindsay.zou`、财经自媒体、作品 532；但作品网格未向匿名可读 DOM 暴露。匿名服务端请求虽为 HTTP 200，实际是风控壳。当前服务真实探测结果：

```json
{
  "status": "dynamic_page_blocked",
  "canEnumerateWorks": false,
  "nextStep": "creator_oauth_or_authorized_media_upload"
}
```

不要把页面中的无关 SEO 视频链接当作小Lin说的作品。

## 当前真实阻塞项

1. 本机没有 `ffmpeg`/`ffprobe`；健康检查会列出缺失。可安装系统包，或使用 `docker-compose.analysis.yml`。
2. `.env.minimax` 与 `.env.doubao` 的 key 仍为空；没有执行过真实付费模型、ASR 或 OCR 调用。
3. `LIVE_PROVIDER_TESTS` 目前只完成环境变量解析，尚无 live test suite；把它改成 `true` 不会自动发起请求。
4. 没有具备处理权的真实视频、最终字幕和审核时间码，也未执行真实视频端到端分析。
5. 分析服务只有内存任务和 draft，没有审核台、publish API 或数据库。
6. 前端运行时仍读取静态 fixture，尚未接 ApprovedExperience API。
7. 只实现三类触点模板；PRD 的其余轻交互与看后深挖仍待建设。
8. 底座为 GPL 且 README 有非商业限制；正式商业化需负责人完成许可审查或换壳。
9. 底座通用页面存在为类型兼容做的改动，需补推荐流、滑动、评论和分享回归。
10. 完整开发依赖审计仍有 21 high / 13 moderate / 4 low；在完成工具链升级前，开发服务器只绑定回环地址，不对局域网或公网开放。

## 下一位 Agent 的推荐顺序

### 1. 先建立真实但最小的内容 dry run

- 让用户把一条 10–30 秒、无敏感信息、具备处理权的视频放到 `media-import/`。
- 使用 Docker 或安装 FFmpeg。
- 用户填好一种推理模型、豆包 ASR；OCR 可先保持关闭。
- 先为 `LIVE_PROVIDER_TESTS` 建立显式、默认跳过且每个供应商至多一次调用的 live suite；再由操作者确认费用。
- 调用分析 API，核对 transcript、evidenceId、时长和 draft；不要先建设大后台，也不要把 smoke test 写成已通过。

### 2. 建人工审核与发布门禁

- 增加 review schema：审核人、时间码确认、证据确认、安全确认、最终文案。
- 只有媒体指纹、权利声明、最终字幕、所有触点审核齐全，才生成 ApprovedExperience。
- 增加 `GET /experiences/:videoId`，只返回 approved，不返回 draft/审核备注。

### 3. 前端仓储切换

- 将 `StaticExperienceRepository` 改为 API-first + 静态 Demo fallback。
- contentVersion/fingerprint 不匹配时禁止加载旧触点。
- 保持普通推荐流无扩展、分析服务故障不影响视频播放。

### 4. 再补会话 API 与其余模板

- 实现 Session/Event/Summary 确定性接口和 localStorage 补回。
- 补证据比较、快速预测、反例/反思等轻交互。
- 完整沙盘仍放看后，不塞入播放中半屏。

## 运行命令

```bash
cd /home/samsong/Desktop/maybe/caibao/refer/douyin
pnpm install
pnpm test
pnpm type-check
pnpm type-check:server
pnpm build
pnpm test:e2e
pnpm audit --prod
# 完整开发依赖债务盘点：pnpm audit
```

服务：

```bash
pnpm start:api:minimax
# 或
pnpm start:api:doubao
```

前端：

```bash
pnpm exec vite --host 127.0.0.1 --port 3001 --strictPort
# http://127.0.0.1:3001/?demo=finance-fed
```

本机 `3000` 可能被旧底座进程占用；不要依赖 Vite 自动换端口。Playwright 固定使用 `4173`，且当前配置依赖 `/bin/google-chrome`。

Docker 分析服务：

```bash
CAIBAO_ENV_FILE=.env.minimax docker compose -f docker-compose.analysis.yml up --build
```

## 不要做

- 不绕过登录、验证码、签名或风控，不接收抖音 Cookie。
- 不把任意公开 URL 等同于已授权处理权。
- 不让模型直接写 approved 内容或改变资产方向规则。
- 不把 `.env*`、token、模型原始响应或用户媒体提交进 Git。
- 不终止本机占用 8787 的旧项目服务；本项目使用 18787。
- 不 push 到公共 `upstream`，不 reset 当前工作树。
