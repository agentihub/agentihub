# Agent iHub

[English](README.md) | [简体中文](README_CN.md)

---

### 概述

**Agent iHub** 是一个类似 GitHub 的 AI Agent 配置管理平台。正如 GitHub 管理代码一样，Agent iHub 管理 AI Agent 配置，让开发者能够跨多个平台创建、分享、Fork 和协作 AI 智能体。

### 核心功能

- **多平台支持**: 兼容 LiteAgent、Dify、Coze、钉钉等多个平台
- **配置管理**: 集中管理提示词、工具、知识库和子智能体
- **社交协作**: Star 收藏、Fork 复用，与社区共享智能体
- **版本控制**: 像管理代码一样追踪和管理智能体配置变更
- **智能集成**: 支持的平台可直接通过深度链接部署
- **公开与私有**: 通过公开/私有可见性选项控制访问权限

### 技术栈

- **前端框架**: React 19 + TypeScript + Vite
- **UI 框架**: Ant Design + Tailwind CSS
- **路由**: React Router DOM v7
- **状态管理**: React Context + Hooks
- **API 客户端**: @hey-api/openapi-ts + @hey-api/client-fetch
- **数据获取**: @tanstack/react-query
- **Markdown**: react-markdown + rehype-highlight + remark-gfm
- **代码质量**: ESLint + Prettier + Husky

### 快速开始

#### 环境要求

- Node.js 18+
- npm 或 yarn

#### 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/agent-ihub.git
cd agent-ihub

# 安装依赖
npm install

# 复制环境配置文件
cp .env.example .env

# 编辑 .env 并设置后端 API 地址
# VITE_API_BASE_URL=http://your-backend-url
```

#### 开发

```bash
# 启动开发服务器
npm run dev

# 应用将在 http://localhost:5173 运行
```

#### 生产构建

```bash
# 构建项目
npm run build

# 预览生产构建
npm run preview
```

### 可用命令

- `npm run dev` - 启动开发服务器（支持热更新）
- `npm run build` - 生产环境构建
- `npm run preview` - 预览生产构建
- `npm run type-check` - 运行 TypeScript 类型检查
- `npm run lint` - 运行 ESLint 检查
- `npm run lint:fix` - 自动修复 ESLint 问题
- `npm run format` - 使用 Prettier 格式化代码
- `npm run format:check` - 检查代码格式
- `npm run quality:check` - 运行类型检查 + 代码检查
- `npm run quality:fix` - 修复代码问题 + 格式化
- `npm run generate-api` - 从 OpenAPI 规范生成 API 客户端

### 项目结构

```
src/
├── api/              # 自动生成的 API 客户端（请勿手动编辑）
├── components/       # 可复用组件
├── pages/           # 页面组件
├── hooks/           # 自定义 React Hooks
├── services/        # API 服务层
├── context/         # 全局状态管理
├── types/           # TypeScript 类型定义
├── utils/           # 工具函数
└── styles/          # 全局样式
```

### 配置说明

#### 环境变量

基于 `.env.example` 创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:8080
```

#### API 客户端生成

API 客户端从后端的 OpenAPI 规范自动生成：

1. 在 `openapi-ts.config.ts` 中更新后端 API 地址
2. 运行 `npm run generate-api`
3. 生成的客户端代码位于 `src/api/`

**重要**: 请勿手动编辑 `src/api/` 中的文件 - 它们会被自动覆盖。

### 贡献指南

我们欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何开始贡献。

### 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

**Agent iHub** - 为 AI Agent 配置管理而生
