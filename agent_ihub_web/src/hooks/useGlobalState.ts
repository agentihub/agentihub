import { useState, useCallback, useRef, useEffect } from 'react';

// 全局状态管理类型定义
export interface GlobalState {
  loading: Record<string, boolean>;
  errors: Record<string, Error | null>;
  cache: Record<string, any>;
  ui: {
    sidebarCollapsed: boolean;
    theme: 'light' | 'dark';
    language: 'en' | 'zh';
  };
  performance: {
    lastRenderTime: number;
    componentsRendered: number;
  };
}

// 初始状态
const initialState: GlobalState = {
  loading: {},
  errors: {},
  cache: {},
  ui: {
    sidebarCollapsed: false,
    theme: 'light',
    language: 'zh',
  },
  performance: {
    lastRenderTime: 0,
    componentsRendered: 0,
  },
};

// 状态更新操作类型
export type StateUpdater<T> = (prevState: T) => T;

// 全局状态 Hook
export const useGlobalState = () => {
  const [state, setState] = useState<GlobalState>(() => {
    // 从 localStorage 恢复 UI 设置
    try {
      const savedUI = localStorage.getItem('agentihub_ui_settings');
      if (savedUI) {
        const parsedUI = JSON.parse(savedUI);
        return {
          ...initialState,
          ui: { ...initialState.ui, ...parsedUI },
        };
      }
    } catch (error) {
      console.warn('Failed to load UI settings from localStorage:', error);
    }
    return initialState;
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // 保存 UI 设置到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem('agentihub_ui_settings', JSON.stringify(state.ui));
    } catch (error) {
      console.warn('Failed to save UI settings to localStorage:', error);
    }
  }, [state.ui]);

  // 加载状态管理
  const setLoading = useCallback((key: string, loading: boolean) => {
    setState((prev) => ({
      ...prev,
      loading: {
        ...prev.loading,
        [key]: loading,
      },
    }));
  }, []);

  const getLoading = useCallback((key: string): boolean => {
    return stateRef.current.loading[key] || false;
  }, []);

  // 错误状态管理
  const setError = useCallback((key: string, error: Error | null) => {
    setState((prev) => ({
      ...prev,
      errors: {
        ...prev.errors,
        [key]: error,
      },
    }));
  }, []);

  const getError = useCallback((key: string): Error | null => {
    return stateRef.current.errors[key] || null;
  }, []);

  const clearError = useCallback((key: string) => {
    setState((prev) => ({
      ...prev,
      errors: {
        ...prev.errors,
        [key]: null,
      },
    }));
  }, []);

  // 缓存管理
  const setCache = useCallback((key: string, value: any, ttl?: number) => {
    const cacheItem = {
      value,
      timestamp: Date.now(),
      ttl: ttl || 5 * 60 * 1000, // 默认 5 分钟
    };

    setState((prev) => ({
      ...prev,
      cache: {
        ...prev.cache,
        [key]: cacheItem,
      },
    }));
  }, []);

  const getCache = useCallback((key: string): any => {
    const cacheItem = stateRef.current.cache[key];
    if (!cacheItem) return null;

    const now = Date.now();
    if (now - cacheItem.timestamp > cacheItem.ttl) {
      // 缓存已过期，清除它
      setState((prev) => ({
        ...prev,
        cache: {
          ...prev.cache,
          [key]: null,
        },
      }));
      return null;
    }

    return cacheItem.value;
  }, []);

  const clearCache = useCallback((key?: string) => {
    if (key) {
      setState((prev) => ({
        ...prev,
        cache: {
          ...prev.cache,
          [key]: null,
        },
      }));
    } else {
      setState((prev) => ({
        ...prev,
        cache: {},
      }));
    }
  }, []);

  // UI 状态管理
  const toggleSidebar = useCallback(() => {
    setState((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        sidebarCollapsed: !prev.ui.sidebarCollapsed,
      },
    }));
  }, []);

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setState((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        theme,
      },
    }));
  }, []);

  const setLanguage = useCallback((language: 'en' | 'zh') => {
    setState((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        language,
      },
    }));
  }, []);

  // 性能监控
  const updatePerformance = useCallback((renderTime: number) => {
    setState((prev) => ({
      ...prev,
      performance: {
        lastRenderTime: renderTime,
        componentsRendered: prev.performance.componentsRendered + 1,
      },
    }));
  }, []);

  // 重置状态
  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    // 状态
    state,

    // 加载状态
    setLoading,
    getLoading,

    // 错误状态
    setError,
    getError,
    clearError,

    // 缓存
    setCache,
    getCache,
    clearCache,

    // UI 状态
    toggleSidebar,
    setTheme,
    setLanguage,

    // 性能监控
    updatePerformance,

    // 工具函数
    resetState,
  };
};

export default useGlobalState;
