# Agent iHub

[English](README.md) | [简体中文](README_CN.md)

---

### Overview

**Agent iHub** is a GitHub-like platform for AI Agent configuration management. Just as GitHub manages code, Agent iHub manages AI Agent configurations, enabling developers to create, share, fork, and collaborate on AI agents across multiple platforms.

### Key Features

- **Multi-Platform Support**: Compatible with LiteAgent, Dify, Coze, DingTalk, and more
- **Configuration Management**: Centralized management of prompts, tools, knowledge bases, and sub-agents
- **Social Collaboration**: Star, fork, and share agents with the community
- **Version Control**: Track changes and manage agent configurations like code
- **Smart Integration**: Direct deployment to supported platforms with deep-linking
- **Public & Private**: Control access with public/private visibility options

### Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **UI Framework**: Ant Design + Tailwind CSS
- **Routing**: React Router DOM v7
- **State Management**: React Context + Hooks
- **API Client**: @hey-api/openapi-ts with @hey-api/client-fetch
- **Data Fetching**: @tanstack/react-query
- **Markdown**: react-markdown + rehype-highlight + remark-gfm
- **Code Quality**: ESLint + Prettier + Husky

### Getting Started

#### Prerequisites

- Node.js 18+
- npm or yarn

#### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/agent-ihub.git
cd agent-ihub

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env and set your backend API URL
# VITE_API_BASE_URL=http://your-backend-url
```

#### Development

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:5173
```

#### Build for Production

```bash
# Build the project
npm run build

# Preview production build
npm run preview
```

### Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run quality:check` - Run type-check + lint
- `npm run quality:fix` - Fix lint + format code
- `npm run generate-api` - Generate API client from OpenAPI spec

### Project Structure

```
src/
├── api/              # Auto-generated API client (DO NOT edit manually)
├── components/       # Reusable components
├── pages/           # Page components
├── hooks/           # Custom React hooks
├── services/        # API service layer
├── context/         # Global state management
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── styles/          # Global styles
```

### Configuration

#### Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

#### API Client Generation

The API client is auto-generated from your backend's OpenAPI specification:

1. Update `openapi-ts.config.ts` with your backend API URL
2. Run `npm run generate-api`
3. The generated client will be in `src/api/`

**Important**: Never manually edit files in `src/api/` - they will be overwritten.

### Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get started.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Agent iHub** - GitHub for AI Agents
