# 真实 Agent（财包追问）运行步骤

测试版（`/home/beta`）的"问财包"功能使用真实 MiniMax API。

## 1. 配置 backend

`apps/web/.env.minimax` 已包含 `MINIMAX_API_KEY`（gitignored）。

```bash
cd apps/web
cp .env.minimax.example .env.minimax  # 如果 .env.minimax 不存在
# 编辑 .env.minimax 填入 MINIMAX_API_KEY=...
```

## 2. 启动 server

```bash
cd apps/web
pnpm install
pnpm start:api --env-file=.env.minimax
# → http://localhost:18787
```

## 3. 启动前端（另一个终端）

```bash
cd apps/web
cp .env.example .env  # 包含 VITE_FINANCE_API_BASE_URL=http://localhost:18787
pnpm dev
# → http://localhost:5173
```

## 4. 访问测试版

打开 `http://localhost:5173/#/home/beta`，进入视频，点击右上角"问财包"按钮，会真实调 MiniMax API 流式回答。

## 5. 版本切换

页面顶部有"稳定版 | 测试版"切换器：
- 稳定版 (`/home`)：当前生产行为，48vh 半屏，CuePill 被动
- 测试版 (`/home/beta`)：新增 POI 链接按钮、接入真实 Agent

## 6. 后端 curl 测试

```bash
curl -X POST http://localhost:18787/api/finance/v1/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"videoId":"finance-fed-demo","contentVersion":"2026.07.22.1","sessionId":"test-session","anonymousId":"test-anon","messages":[{"role":"user","content":"为什么降息影响汇率？"}]}'
```

应返回 text/event-stream，包含 MiniMax 流式 chunks。
