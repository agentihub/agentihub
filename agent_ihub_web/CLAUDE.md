# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Agent iHub** is a GitHub-like platform for managing AI Agent configurations. It allows users to create, share, fork, and star AI agents across multiple platforms (LiteAgent, Dify, Coze, DingTalk, etc.).

**Core Value Proposition:** GitHub manages static code, Agent iHub manages AI Agent configurations.

## Development Commands

### Essential Commands

```bash
# Install dependencies
npm install

# Start development server (with HMR)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking (without emitting files)
npm run type-check
```

### Code Quality

```bash
# Run linter
npm run lint

# Fix lint issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting without modifying files
npm run format:check

# Run type-check + lint together
npm run quality:check

# Fix lint issues + format code together
npm run quality:fix
```

### API Client Generation

```bash
# Regenerate API client from OpenAPI specification
npm run generate-api
```

**Important:** The `src/api` directory contains auto-generated code from OpenAPI specs. Never manually modify files in this directory. If API changes are needed, update the OpenAPI specification and regenerate.

## Architecture Overview

### Technology Stack

- **Frontend Framework:** React 19 + TypeScript + Vite
- **UI Libraries:** Ant Design (primary components) + Tailwind CSS (styling)
- **Routing:** React Router DOM v7
- **State Management:** React Context + Hooks (no Redux/Zustand)
- **API Client:** @hey-api/openapi-ts with @hey-api/client-fetch
- **Data Fetching:** @tanstack/react-query (auto-generated hooks)
- **Markdown Rendering:** react-markdown + rehype-highlight + remark-gfm
- **Code Quality:** ESLint + Prettier + Husky + lint-staged

### Key Architectural Patterns

#### 1. Authentication Flow

- **Token Storage:** JWT tokens stored in `localStorage` via `tokenManager` (src/services/apiClient.ts:139-167)
- **User State:** Managed by `AuthContext` (src/context/AuthContext.tsx), uses `userManager` for persistence
- **Request Interceptor:** Automatically attaches Bearer token to all API requests (src/services/apiClient.ts:243-260)
- **401 Handling:** Automatic redirect to login page with return URL on authentication failure

#### 2. API Response Handling

All API responses follow a standardized format:

```typescript
{ code: number, msg: string, data: T }
```

Use the unified response handler:

- `handleResponse<T>()` - Normalizes API responses to `ApiResponse<T>`
- `handleError()` - Standardizes error handling
- `apiCall<T>()` - High-level wrapper with automatic notification handling
- Success: `code === 200 || code === 0`

See src/services/apiClient.ts:1-305 for the complete API client layer.

#### 3. Routing Structure

```
/ → /dashboard (redirect)
/explore - Browse public agents
/trending - Trending agents
/search - Search with filters
/:userName - User profile page
/:userName/:agentname - Agent detail page with nested routes:
  - (index) → CodeTab (default view)
  - /blob/* → CodeEditor (file viewer)
  - /tree/* → DirectoryViewer (folder viewer)
  - /settings → Agent settings
  - /fork → Fork agent
/new - Create new agent (AgentWizard)
/settings/profile, /settings/account - User settings
```

Routes are defined in src/App.tsx:1-163 using React Router v7's nested routing with Suspense-based code splitting.

#### 4. Component Organization

**Layout Components:**

- `MainLayout` - Main container with Header + Footer
- `RootLayout` - Root-level layout wrapper
- `Navs` - Reusable navigation component (abstracted from Profile and AgentDetail)

**Page Components:** Each major feature has its own page directory with co-located components

- Example: `src/pages/AgentDetail/` contains `AgentDetail.tsx` + `components/` subdirectory

**Shared Components:**

- `src/components/` for truly reusable components (ErrorBoundary, Loading, Layout, etc.)

#### 5. Styling Approach

**Critical Rule:** All components must use **Tailwind CSS** for styling (per .cursor/rules/ihub-rule.mdc:3)

- **Primary:** Tailwind utility classes
- **Ant Design:** Component functionality only (avoid custom Ant Design styling)
- **CSS Modules:** Avoid unless absolutely necessary
- **Theme Configuration:** Ant Design theme tokens configured in App.tsx:71-94 to match GitHub's green color scheme

#### 6. State Management Strategy

- **Global State:** React Context (`AuthContext` for user authentication)
- **Server State:** @tanstack/react-query for API data fetching and caching
- **Local State:** React `useState` and `useReducer`
- **Form State:** Direct component state management (no form libraries like react-hook-form)

### API Integration Patterns

#### Generating API Client

The API client is auto-generated from OpenAPI specs hosted at the backend:

```typescript
// openapi-ts.config.ts
input: 'http://localhost:8080/v3/api-docs/agent-ihub';
output: {
  path: './src/api';
}
```

After backend API changes, run:

```bash
npm run generate-api
```

#### Using Generated API

```typescript
import { agentControllerCreate } from '../api';
import { apiCall } from '../services/apiClient';

const result = await apiCall(() => agentControllerCreate({ body: agentData }));

if (result.success) {
  // Handle success
} else {
  // Handle error - notification shown automatically
}
```

#### API Proxy Configuration

In development, `/api` requests are proxied to the backend (vite.config.ts:39-64):

```typescript
proxy: {
  '/api': {
    target: env.VITE_API_BASE_URL || 'http://localhost:8080',
    changeOrigin: true,
  }
}
```

### Performance Considerations

#### Code Splitting

All routes use React.lazy() for automatic code splitting (src/App.tsx:17-50):

```typescript
const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard'));
```

#### Performance Monitoring

Production builds include automatic performance monitoring:

- Initialized on page load (src/App.tsx:52-64)
- Performance reports generated after 1s delay
- See src/utils/performanceMonitor.ts for implementation

#### Optimization

- Pre-bundled dependencies configured in vite.config.ts:19-32
- HMR enabled for fast development iteration
- Environment-based configuration via .env files

## File Structure Conventions

### Auto-Generated Code

**Never modify:** `src/api/` - Regenerate using `npm run generate-api`

### Component File Naming

- Pages: PascalCase directory + matching component (e.g., `Dashboard/Dashboard.tsx`)
- Components: PascalCase (e.g., `AgentCard.tsx`)
- Utilities: camelCase (e.g., `performanceMonitor.ts`)
- Types: Match the domain (e.g., `agent.ts`, `profile.ts`)

### Import Aliases

Vite alias configured for cleaner imports:

```typescript
import { Something } from '@/components/Something';
// Resolves to: src/components/Something
```

## Agent Configuration Model

Agents support multiple platforms with standardized configuration:

- **Platforms:** LiteAgent, Dify, Coze, DingTalk
- **Configuration Elements:**
  - Prompts (system instructions)
  - Tools (function calls)
  - Knowledge bases (file uploads + links)
  - Sub-agents (references to other iHub agents)

**Smart Jump Logic:**

- LiteAgent: Direct deep-link import (`liteagent://import?config=...`)
- Other platforms: Navigate to platform with manual copy-paste

## Important Development Notes

### Styling Rules

- **Use Tailwind CSS exclusively** for all new components
- Figma designs may show dark theme, but **only implement light theme**
- Ant Design components are allowed for functionality but avoid Ant Design-specific styling

### Git Workflow

- Main branch: `master`
- Husky pre-commit hooks run lint-staged (auto-fix + format)
- Commit hooks configured in .husky/

### Environment Variables

Check `.env.example` for required environment variables:

- `VITE_API_BASE_URL` - Backend API URL
- `VITE_APP_VERSION` - Application version

### Type Safety

- Strict TypeScript configuration
- Use generated types from `src/api/types.gen.ts`
- Run `npm run type-check` before committing

## Common Tasks

### Adding a New Page

1. Create page directory: `src/pages/NewPage/`
2. Create component: `NewPage.tsx`
3. Add lazy import in `App.tsx`
4. Add route to `<Routes>` in `App.tsx`
5. Use Tailwind CSS for styling

### Adding API Integration

1. Ensure backend OpenAPI spec is updated
2. Run `npm run generate-api`
3. Import generated functions from `src/api`
4. Use `apiCall()` wrapper for consistent error handling
5. Types are automatically generated in `src/api/types.gen.ts`

### Modifying Authentication

- Token management: src/services/apiClient.ts (tokenManager)
- User context: src/context/AuthContext.tsx
- Request interceptors: src/services/apiClient.ts:243-260
- Auto-redirect on 401: Already configured

### Working with Agent Details

The Agent Detail page (/:userName/:agentname) uses nested routing:

- Default view shows README (CodeTab)
- File browsing via /blob/_ and /tree/_ routes
- Settings accessible via /settings subroute
- Fork functionality via /fork subroute

Reference: src/App.tsx:136-148
