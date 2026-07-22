# ADR-0001｜保留产品仓与底座代码仓边界

状态：已采纳  
日期：2026-07-22

## 背景

项目根目录原本没有 Git；`refer/douyin` 已有独立上游 Git 历史和当前产品改动。删除嵌套 `.git`
会丢失追溯能力；把它直接加入父仓会得到错误边界或不可复现的 gitlink。

## 决策

- 根目录初始化 `main`，跟踪权威 PRD、图片与 PDF、研究、架构、计划、交接，以及旧版材料、海报、
  `demoUI/` 等现状取证；这些历史材料不因此恢复为实施依据。
- 根 `.gitignore` 忽略 `/refer/douyin/`。
- 代码仓保留上游历史，在 `feat/caibao-analysis-pipeline` 工作。
- 代码仓原公共远端已从 `origin` 改名为 `upstream`，地址仍为
  `https://github.com/zyronon/douyin`；项目 `origin` 尚未创建。
- 不向公共 `upstream` 推送，不在没有用户授权的情况下创建远端或 PR。
- 产品仓基线为本 ADR 所在产品仓 HEAD（运行 `git rev-parse HEAD` 获取）；代码仓基线为
  `57daf3b6cbb61ce49376f9bc4d84b55869befec3`。

## 后果

- 交接必须明确两个仓库和两个 commit SHA。
- 外部迁移前需要为代码仓建立项目 remote，或导出 bundle/patch。
- 若未来改成单仓，必须单独评审 subtree/history 迁移，不能直接删除 `.git`。
- 在父仓执行 `git add .` 不会纳入代码仓；所有代码提交、回滚和 diff 必须在 `refer/douyin/` 内执行。
