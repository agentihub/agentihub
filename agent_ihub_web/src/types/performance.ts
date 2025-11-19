// 性能监控相关类型定义

export interface WebVitalsMetrics {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

export interface PageLoadMetrics {
  dnsLookup: number;
  tcpConnect: number;
  sslConnect: number;
  requestResponse: number;
  domParse: number;
  resourceLoad: number;
  totalLoad: number;
  ttfb: number;
  domReady: number;
}

export interface ResourceMetric {
  name: string;
  duration: number;
  size: number;
  type: 'script' | 'stylesheet' | 'image' | 'font' | 'other';
  startTime: number;
}

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usedPercentage: number;
}

export interface PerformanceReport {
  timestamp: string;
  url: string;
  userAgent: string;
  pageLoad: PageLoadMetrics | null;
  resources: {
    total: number;
    totalSize: number;
    slowest: ResourceMetric[];
    byType: Record<
      string,
      {
        count: number;
        totalSize: number;
        totalDuration: number;
      }
    >;
  };
  memory: MemoryInfo | null;
  webVitals: WebVitalsMetrics;
  customMetrics: Record<string, PerformanceEntry[]>;
}

export type VitalStatus = 'success' | 'warning' | 'error' | 'default';

export interface VitalThreshold {
  good: number;
  poor: number;
}
