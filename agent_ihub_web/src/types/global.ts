// 全局类型定义

import { ReactNode } from 'react';

// 全局状态类型
export interface GlobalState {
  loading: Record<string, boolean>;
  errors: Record<string, Error | null>;
  cache: Record<string, any>;
  ui: UIState;
  performance: PerformanceState;
}

export interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  language: 'en' | 'zh';
}

export interface PerformanceState {
  lastRenderTime: number;
  componentsRendered: number;
}

// 错误边界相关类型
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>;
  onError?: (error: Error, errorInfo: string) => void;
}

export interface ErrorFallbackProps {
  error?: Error;
  reset: () => void;
}

// 缓存相关类型
export interface CacheConfig {
  key: string;
  ttl?: number;
  staleWhileRevalidate?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export interface ApiHookResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  mutate: (newData: T) => void;
  clearCache: () => void;
}

// 状态更新器类型
export type StateUpdater<T> = (prevState: T) => T;

// 通用工具类型
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 事件类型
export interface CustomEvent<T = any> {
  type: string;
  data: T;
  timestamp: number;
}

// 组件通用属性
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}

// 异步操作状态
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// 分页状态
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  showQuickJumper?: boolean;
  showSizeChanger?: boolean;
}

// 搜索状态
export interface SearchState {
  query: string;
  filters: Record<string, any>;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// 表单验证规则
export interface ValidationRule {
  required?: boolean;
  pattern?: RegExp;
  min?: number;
  max?: number;
  validator?: (value: any) => boolean | string;
  message?: string;
}

// 环境变量类型
export interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_VERSION: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

export interface ImportMeta {
  readonly env: ImportMetaEnv;
}
