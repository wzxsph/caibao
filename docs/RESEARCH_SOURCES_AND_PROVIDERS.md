# 来源与模型调研记录

调研日期：2026-07-22。易变参数以供应商控制台和官方文档为最终依据。

## 抖音主页实测

目标：用户提供的“小Lin说”主页。

- 应用内普通浏览器可看到昵称“小Lin说”、抖音号 `lindsay.zou`、财经自媒体和“作品 532”。
- 当前未登录页面的作品网格没有向可读 DOM 提供该账号作品；页面中的 8 条视频链接属于无关 SEO/推荐内容，不能归因给该博主。
- 服务端匿名请求返回 HTTP 200、约 73KB HTML，但内容是空 body 与 JavaScript 风控执行器，没有可验证 title、aweme_list 或 secUid。
- 因而适配器同时检查 HTTP 状态和语义内容；当前真实调用返回 `dynamic_page_blocked`。

结论：任意主页只能做易失的资料建档，不能承诺稳定枚举作品或下载媒体。

## 抖音官方路径

- [授权账号视频列表](https://open.douyin.com/platform/resource/docs/openapi/video-management/douyin/search-video/account-video-list)：OAuth、`video.list` 权限、分页作品元数据，不提供原始媒体文件地址。
- [通过 item_id 获取 iframe](https://developer.open-douyin.com/docs/resource/zh-CN/dop/develop/openapi/video-management/douyin/iframe-player/get-iframe-by-item)：可用于合规对照播放，不等于媒体下载。
- [用户 access token](https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/basic-abilities/interface-request-credential/user-authorization/get-user-access-token)：令牌只存服务端。

## MiniMax

- Base URL：`https://api.minimaxi.com/v1`
- Chat：`POST /chat/completions`
- 鉴权：Bearer API key。
- 文本默认：`MiniMax-M2.7`。
- `MINIMAX_API_KEY` 和 `MINIMAX_MULTIMODAL_MODEL` 的环境模板默认都为空。
- 本项目不会枚举模型或自动探测账号权限；多模态模型必须由用户依据自己控制台实际可用项填写。
- 当 `MINIMAX_MULTIMODAL_MODEL` 为空时，当前实现回退到 `MINIMAX_TEXT_MODEL` 且不发送关键帧，只使用 transcript/OCR 文本；不能据此声称图片/视频输入已受该模型支持。
- OpenAI-compatible Chat 文档未稳定列出 `response_format/json_schema`，本项目使用 tools + Zod。

官方资料：[文本生成与兼容配置](https://platform.minimaxi.com/docs/guides/text-generation)、[Chat Completions](https://platform.minimaxi.com/docs/api-reference/text-chat-openai)、[API Key 准备](https://platform.minimaxi.com/docs/guides/quickstart-preparation)。

## 火山方舟 / 豆包

- Base URL：`https://ark.cn-beijing.volces.com/api/v3`
- 支持 Chat Completions 与 Responses。
- `model` 可为 Model ID 或推理接入点 `ep-...`。
- 模型可用性依赖账号与地域，不把示例模型硬编码成唯一值。

官方资料：[Responses / OpenAI SDK](https://www.volcengine.com/docs/82379/1795150)、[工具调用](https://www.volcengine.com/docs/82379/1958524)、[视频理解](https://www.volcengine.com/docs/82379/1895586?lang=zh)。

## 豆包 ASR

- 极速录音文件识别：`POST https://openspeech.bytedance.com/api/v3/auc/bigmodel/recognize/flash`
- 资源 ID：`volc.bigasr.auc_turbo`
- 新控制台使用 `X-Api-Key`；旧控制台为 App Key + Access Key。
- 需要 Request UUID 和 `X-Api-Sequence: -1`。
- `audio.url` 或 `audio.data` 二选一；本地 Base64 建议不超过 20MB。
- 最长 2 小时、最大 100MB，输入为 WAV/MP3/OGG OPUS；MP4 先抽音轨。
- utterances/words 的毫秒时间码是 P0 时间轴事实源。

官方资料：[大模型录音文件极速版](https://www.volcengine.com/docs/6561/1631584?lang=zh)、[控制台参数 FAQ](https://www.volcengine.com/docs/6561/196768)。

## 火山 OCR

- Host：`https://visual.volcengineapi.com`
- `Action=OCRNormal`、`Version=2020-08-26`
- `application/x-www-form-urlencoded`
- 输入 `image_base64`/`image_url`，使用独立 OpenAPI AK/SK 和 HMAC 签名。
- 图片编码后上限 8MB；输出行文本、坐标与置信度。
- 当前代码不依赖厂商 SDK，使用 Node 原生 `crypto` 实现 Volcengine Signature V4；canonical request
  按 `content-type;host;x-content-sha256;x-date` 四个 header 签名，并在 HTTP 请求中发送
  `Authorization`、`Content-Type`、`X-Content-Sha256`、`X-Date`（`Host` 由 Node HTTP 栈发送）。
- 固定时间向量与 query 排序/转义均有离线单测；AK/SK 不写日志、不进入客户端环境。

官方资料：[OCRNormal](https://www.volcengine.com/docs/86081/1660261?lang=en)、[OCR 产品](https://www.volcengine.com/product/OCR)。

## 当前验证边界

- 抖音公开主页已做真实匿名探测，结论为 `dynamic_page_blocked`；这不是作品抓取成功。
- MiniMax、方舟、豆包 ASR 与火山 OCR 目前只完成配置解析、HTTP 契约实现和离线 fake/固定向量测试。
- `LIVE_PROVIDER_TESTS` 目前只有配置字段，没有 live test case；未发生真实付费调用。
- 当前没有具备处理权的真实视频，因此没有执行真实 ASR/OCR/多模态流水线，也没有已审核内容包。
