# 财经推演室 Feed 原型｜Codex 续作包

本压缩包包含抖音竖屏 Feed 原型的完整可复现代码、已验证构建产物和产品文档，可直接交给 Codex 继续开发。

## 目录

- `source/`：完整前端工程源码、锁定依赖、测试与 Sites 配置
- `outputs/dist/`：已通过验证的可部署构建产物
- `docs/`：PRD、核心流程、MVP 清单、Demo 脚本和官方规则映射
- `MANIFEST.txt`：压缩包文件清单

## 环境要求

- Node.js 22.13.0 或更高版本
- npm
- Linux 环境可直接使用工程自带的构建脚本；macOS 建议在 Codex/Linux 环境运行

## 从源码复现

```bash
cd source
npm ci
npm run dev
```

本地开发地址以终端输出为准。

## 验证与构建

```bash
cd source
npm test
```

该命令会执行生产构建、部署产物校验和页面测试。新的构建产物会生成在 `source/dist/`。

## 交给 Codex 的建议提示词

```text
请先阅读根目录 PACKAGE_README.md、docs/财经推演室_PRD_V1.0.md、docs/财经推演室_MVP功能清单.md，
再检查 source/app/page.tsx 与 source/app/globals.css。保持当前抖音竖屏 Feed UI 和已有交互闭环，
在 source 工程中继续开发。每次修改后运行 npm test，不要删除已有的概念预检、预测、因果拼图、
变量推演、反例挑战、主动复述和视频掌握报告流程。
```

## 当前验证状态

- 生产构建：通过
- 部署产物校验：通过
- 页面自动化测试：通过
- 主要交互：Feed → AI 帮练 → 概念 → 预测 → 因果 → 沙盘 → 反例 → 复述 → 掌握报告

## 说明

- `source/.openai/hosting.json` 保留了当前 Sites 项目的关联信息，便于在原项目上继续。
- 若要创建完全独立的新站点，请让 Codex 新建 Sites 项目并更新该配置，不要手动复用原项目身份。
- 当前 Demo 使用前端内置内容与规则，未接入真实视频解析、实时大模型或投资数据接口。
