import { useState, useEffect, useCallback, useRef } from 'react';
import { useGlobalState } from './useGlobalState';

// 缓存配置接口
interface CacheConfig {
  key: string;
  ttl?: number; // 生存时间，默认 5 分钟
  staleWhileRevalidate?: boolean; // 在重新验证时返回旧数据
  maxRetries?: number; // 最大重试次数
  retryDelay?: number; // 重试延迟
}

// API 钩子返回类型
interface ApiHookResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  mutate: (newData: T) => void;
  clearCache: () => void;
}

// API 缓存钩子
export const useApiCache = <T>(
  apiCall: () => Promise<T>,
  config: CacheConfig
): ApiHookResult<T> => {
  const {
    setCache,
    getCache,
    clearCache,
    setLoading,
    setError,
    getLoading,
    getError,
  } = useGlobalState();
  const [data, setData] = useState<T | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<Error | null>(null);

  const mountedRef = useRef(true);
  const lastCallRef = useRef<number>(0);

  const {
    key,
    ttl = 5 * 60 * 1000, // 默认 5 分钟
    staleWhileRevalidate = true,
    maxRetries = 3,
    retryDelay = 1000,
  } = config;

  // 清理函数
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // 执行 API 调用的核心函数
  const executeApiCall = useCallback(
    async (retryCount = 0): Promise<T> => {
      try {
        const result = await apiCall();
        return result;
      } catch (error) {
        if (retryCount < maxRetries) {
          const delay = retryDelay * Math.pow(2, retryCount);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return executeApiCall(retryCount + 1);
        }
        throw error;
      }
    },
    [apiCall, maxRetries, retryDelay]
  );

  // 获取数据函数
  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!mountedRef.current) return;

      const now = Date.now();
      lastCallRef.current = now;

      // 检查缓存
      if (!forceRefresh) {
        const cachedData = getCache(key);
        if (cachedData) {
          setData(cachedData);
          setLocalError(null);

          // 如果启用了 staleWhileRevalidate，在后台更新数据
          if (staleWhileRevalidate) {
            // 异步更新，不阻塞当前渲染
            executeApiCall()
              .then((result) => {
                if (mountedRef.current && lastCallRef.current === now) {
                  setCache(key, result, ttl);
                  setData(result);
                }
              })
              .catch((error) => {
                console.warn('Background refresh failed:', error);
              });
          }
          return;
        }
      }

      // 设置加载状态
      setLocalLoading(true);
      setLoading(key, true);
      setLocalError(null);
      setError(key, null);

      try {
        const result = await executeApiCall();

        if (!mountedRef.current || lastCallRef.current !== now) {
          return; // 组件已卸载或有新的请求
        }

        // 更新缓存和状态
        setCache(key, result, ttl);
        setData(result);
        setLocalError(null);
        setError(key, null);
      } catch (error) {
        if (!mountedRef.current || lastCallRef.current !== now) {
          return;
        }

        const apiError =
          error instanceof Error ? error : new Error('API call failed');
        setLocalError(apiError);
        setError(key, apiError);

        // 如果有旧数据且启用了 staleWhileRevalidate，保持旧数据
        if (!staleWhileRevalidate || !data) {
          setData(null);
        }
      } finally {
        if (mountedRef.current && lastCallRef.current === now) {
          setLocalLoading(false);
          setLoading(key, false);
        }
      }
    },
    [
      key,
      ttl,
      staleWhileRevalidate,
      getCache,
      setCache,
      setLoading,
      setError,
      executeApiCall,
      data,
    ]
  );

  // 初始化时获取数据
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 刷新数据
  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // 手动更新数据（乐观更新）
  const mutate = useCallback(
    (newData: T) => {
      setData(newData);
      setCache(key, newData, ttl);
      setLocalError(null);
      setError(key, null);
    },
    [key, ttl, setCache, setError]
  );

  // 清除缓存
  const handleClearCache = useCallback(() => {
    clearCache(key);
    setData(null);
  }, [key, clearCache]);

  // 获取全局状态
  const globalLoading = getLoading(key);
  const globalError = getError(key);

  return {
    data,
    loading: localLoading || globalLoading,
    error: localError || globalError,
    refresh,
    mutate,
    clearCache: handleClearCache,
  };
};

// SWR 风格的数据获取钩子
export const useSWR = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: Omit<CacheConfig, 'key'> = {}
): ApiHookResult<T> => {
  return useApiCache(fetcher, { key, ...options });
};

// 无限滚动数据钩子
export const useInfiniteQuery = <T>(
  baseKey: string,
  fetcher: (page: number) => Promise<T[]>,
  _options: Omit<CacheConfig, 'key'> = {}
) => {
  const [pages, setPages] = useState<T[][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const pageRef = useRef(1);

  const loadPage = useCallback(
    async (page: number) => {
      const _pageKey = `${baseKey}_page_${page}`;

      try {
        setLoading(true);
        setError(null);

        const pageData = await fetcher(page);

        if (pageData.length === 0) {
          setHasNextPage(false);
          return;
        }

        setPages((prev) => {
          const newPages = [...prev];
          newPages[page - 1] = pageData;
          return newPages;
        });
      } catch (err) {
        const apiError =
          err instanceof Error ? err : new Error('Failed to load page');
        setError(apiError);
      } finally {
        setLoading(false);
      }
    },
    [baseKey, fetcher]
  );

  const loadNextPage = useCallback(async () => {
    if (!hasNextPage || loading) return;

    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;
    await loadPage(nextPage);
  }, [hasNextPage, loading, loadPage]);

  const refresh = useCallback(async () => {
    setPages([]);
    setHasNextPage(true);
    pageRef.current = 1;
    await loadPage(1);
  }, [loadPage]);

  // 初始加载
  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  const flatData = pages.flat();

  return {
    data: flatData,
    pages,
    loading,
    error,
    hasNextPage,
    loadNextPage,
    refresh,
  };
};

// 预加载数据钩子
export const usePrefetch = () => {
  const { setCache } = useGlobalState();

  const prefetch = useCallback(
    async <T>(key: string, fetcher: () => Promise<T>, ttl = 5 * 60 * 1000) => {
      try {
        const data = await fetcher();
        setCache(key, data, ttl);
        return data;
      } catch (error) {
        console.warn(`Prefetch failed for key ${key}:`, error);
        return null;
      }
    },
    [setCache]
  );

  return { prefetch };
};

// 多个 API 调用的批处理钩子
export const useBatchApi = <T extends Record<string, any>>(
  apis: { [K in keyof T]: () => Promise<T[K]> },
  configs: { [K in keyof T]: Omit<CacheConfig, 'key'> } = {} as any
) => {
  const [data, setData] = useState<Partial<T>>({});
  const [loading, setLoading] = useState<{ [K in keyof T]?: boolean }>({});
  const [errors, setErrors] = useState<{ [K in keyof T]?: Error }>({});

  const results = Object.keys(apis).reduce(
    (acc, key) => {
      const apiKey = key as keyof T;
      const apiCall = apis[apiKey];
      const config = configs[apiKey] || {};

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const result = useApiCache(apiCall, { key: String(apiKey), ...config });

      acc[apiKey] = result;
      return acc;
    },
    {} as { [K in keyof T]: ApiHookResult<T[K]> }
  );

  useEffect(() => {
    const newData: Partial<T> = {};
    const newLoading: { [K in keyof T]?: boolean } = {};
    const newErrors: { [K in keyof T]?: Error } = {};

    Object.keys(results).forEach((key) => {
      const apiKey = key as keyof T;
      const result = results[apiKey];

      if (result.data) newData[apiKey] = result.data;
      newLoading[apiKey] = result.loading;
      if (result.error) newErrors[apiKey] = result.error;
    });

    setData(newData);
    setLoading(newLoading);
    setErrors(newErrors);
  }, [results]);

  const refresh = useCallback(async () => {
    await Promise.all(Object.values(results).map((result) => result.refresh()));
  }, [results]);

  return {
    data,
    loading,
    errors,
    refresh,
    results,
  };
};

export default useApiCache;
