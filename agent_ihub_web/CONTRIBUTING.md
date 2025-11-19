# Contributing to Agent iHub

[English](#english) | [中文](#中文)

---

## English

Thank you for your interest in contributing to Agent iHub! We welcome contributions from the community.

### Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

### How to Contribute

#### Reporting Bugs

Before creating a bug report, please check if the issue already exists. When creating a bug report, include:

- Clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Your environment (OS, browser, Node.js version)

#### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- Clear and descriptive title
- Detailed description of the proposed feature
- Use cases and benefits
- Any relevant examples or mockups

#### Pull Requests

1. **Fork the repository** and create your branch from `master`

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Write clear, commented code
   - Add tests if applicable
   - Update documentation as needed

3. **Commit your changes**
   - Use clear and meaningful commit messages
   - Follow conventional commits format:
     ```
     feat: add new feature
     fix: fix bug
     docs: update documentation
     style: format code
     refactor: refactor code
     test: add tests
     chore: update dependencies
     ```

4. **Run quality checks**

   ```bash
   npm run quality:check
   npm run type-check
   ```

5. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Provide a clear description of your changes
   - Reference any related issues
   - Ensure all CI checks pass

### Development Setup

1. **Clone your fork**

   ```bash
   git clone https://github.com/your-username/agent-ihub.git
   cd agent-ihub
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

### Project Structure Guidelines

- **Components**: Place reusable components in `src/components/`
- **Pages**: Place page components in `src/pages/`
- **Hooks**: Place custom hooks in `src/hooks/`
- **Services**: Place API services in `src/services/`
- **Types**: Place TypeScript types in `src/types/`
- **Utils**: Place utility functions in `src/utils/`

### Coding Standards

#### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid using `any` type
- Use type inference when obvious

#### React

- Use functional components with hooks
- Follow React best practices
- Use meaningful component and prop names
- Keep components focused and small

#### Styling

- Use Tailwind CSS for styling
- Follow the existing design system
- Ensure responsive design
- Test on different screen sizes

#### Code Quality

- Run `npm run lint` before committing
- Run `npm run format` to format code
- Run `npm run type-check` to check types
- Write self-documenting code with clear names

### API Client

**Important**: Never manually edit files in `src/api/` directory. These files are auto-generated.

To update the API client:

```bash
npm run generate-api
```

### Testing

- Write tests for new features
- Ensure existing tests pass
- Test edge cases and error scenarios

### Documentation

- Update README.md if needed
- Add JSDoc comments for functions
- Update CLAUDE.md for architectural changes
- Keep comments concise and relevant

### Questions?

Feel free to ask questions by opening an issue with the "question" label.

Thank you for contributing! 🎉

---

## 中文

感谢您对 Agent iHub 项目的关注！我们欢迎社区贡献。

### 行为准则

参与本项目，即表示您同意为所有人维护一个尊重和包容的环境。

### 如何贡献

#### 报告 Bug

在创建 bug 报告之前，请先检查问题是否已存在。创建 bug 报告时，请包含：

- 清晰描述性的标题
- 重现问题的步骤
- 预期行为
- 实际行为
- 截图（如适用）
- 您的环境（操作系统、浏览器、Node.js 版本）

#### 功能建议

我们欢迎功能改进建议！请提供：

- 清晰描述性的标题
- 详细的功能描述
- 使用场景和优势
- 相关示例或原型

#### Pull Request

1. **Fork 仓库**并从 `master` 创建您的分支

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **进行修改**
   - 遵循现有代码风格
   - 编写清晰、有注释的代码
   - 如适用，添加测试
   - 根据需要更新文档

3. **提交更改**
   - 使用清晰有意义的提交信息
   - 遵循约定式提交格式：
     ```
     feat: 添加新功能
     fix: 修复bug
     docs: 更新文档
     style: 格式化代码
     refactor: 重构代码
     test: 添加测试
     chore: 更新依赖
     ```

4. **运行质量检查**

   ```bash
   npm run quality:check
   npm run type-check
   ```

5. **推送到您的 fork**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **创建 Pull Request**
   - 提供清晰的更改描述
   - 引用相关 issue
   - 确保所有 CI 检查通过

### 开发环境设置

1. **克隆您的 fork**

   ```bash
   git clone https://github.com/your-username/agent-ihub.git
   cd agent-ihub
   ```

2. **安装依赖**

   ```bash
   npm install
   ```

3. **设置环境**

   ```bash
   cp .env.example .env
   # 使用您的配置编辑 .env
   ```

4. **启动开发服务器**

   ```bash
   npm run dev
   ```

### 项目结构指南

- **组件**: 将可复用组件放在 `src/components/`
- **页面**: 将页面组件放在 `src/pages/`
- **Hooks**: 将自定义 hooks 放在 `src/hooks/`
- **服务**: 将 API 服务放在 `src/services/`
- **类型**: 将 TypeScript 类型放在 `src/types/`
- **工具**: 将工具函数放在 `src/utils/`

### 编码规范

#### TypeScript

- 所有新代码使用 TypeScript
- 定义适当的类型和接口
- 避免使用 `any` 类型
- 在显而易见时使用类型推断

#### React

- 使用函数组件和 hooks
- 遵循 React 最佳实践
- 使用有意义的组件和属性名称
- 保持组件专注和简洁

#### 样式

- 使用 Tailwind CSS 进行样式设计
- 遵循现有设计系统
- 确保响应式设计
- 在不同屏幕尺寸上测试

#### 代码质量

- 提交前运行 `npm run lint`
- 运行 `npm run format` 格式化代码
- 运行 `npm run type-check` 检查类型
- 编写自文档化代码，使用清晰的命名

### API 客户端

**重要**: 请勿手动编辑 `src/api/` 目录中的文件。这些文件是自动生成的。

更新 API 客户端：

```bash
npm run generate-api
```

### 测试

- 为新功能编写测试
- 确保现有测试通过
- 测试边界情况和错误场景

### 文档

- 根据需要更新 README.md
- 为函数添加 JSDoc 注释
- 为架构更改更新 CLAUDE.md
- 保持注释简洁相关

### 有问题？

欢迎通过创建带有"question"标签的 issue 来提问。

感谢您的贡献！🎉
