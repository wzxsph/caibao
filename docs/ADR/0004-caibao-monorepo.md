# ADR-0004｜以 caibao 主仓统一维护产品与应用

状态：已采纳  
日期：2026-07-23  
取代：ADR-0001 的双仓维护边界

## 背景

重构后的财包应用只需要 Vue/Vite 推荐流、财包交互、Express 后端、媒体校验、生成管线和测试。原 `wzxsph/douyin` 仓包含约 616MB Git 历史及大量不再使用的页面、数据、素材和采集代码；继续双仓维护会造成实现、PRD、测试和部署口径漂移。

## 决策

- 将精简后的运行源码纳入 `wzxsph/caibao` 的 `apps/web/`。
- `apps/web` 自导入提交起是前端、后端、生成管线和测试的唯一代码源。
- 不执行 subtree 历史导入；用 `apps/web/IMPORT_PROVENANCE.md` 固化来源提交与许可证。
- 保留 `wzxsph/douyin` 作为迁移历史和 `showcase-media-20260723-v1` 的媒体 Release 宿主，不再双向手工编辑代码；旧 Pages 退役为指向 `caibao` 主站的迁移跳转。
- 不迁入旧路由、旧推荐数据、通用抓取器、依赖、缓存、密钥、源/派生视频或模型产物。
- 主仓 Pages workflow 从 `apps/web` 构建，并从旧 Release 校验、暂存公开十条媒体；媒体仍不进入 Git。

## 来源

- 功能源：`wzxsph/douyin@9a461b89dda782e30db2fd399b29068e95d3ec33`。
- 旧仓合并：`8f21006cc5fae25f1f1de11d2bdb25acbc431937`，PR #5。
- 完整说明：`apps/web/IMPORT_PROVENANCE.md`。

## 后果

- 新 Agent 只在主仓创建应用提交、分支和 PR；旧工作树视为只读历史/参考。
- 产品文档与实现可以在同一提交中追溯，但仍保持 PRD、内容、Schema、规则、Prompt、媒体与应用版本独立。
- 克隆主仓即可运行测试；媒体和真实密钥仍需独立准备。
- 若未来迁移媒体 Release 或保留旧 Git 历史，需要新的 ADR，不得静默复制大对象。
