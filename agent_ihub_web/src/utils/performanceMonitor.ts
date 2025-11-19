// 性能监控工具类
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceEntry[]> = new Map();
  private observer: PerformanceObserver | null = null;
  private vitalsData: Record<string, number> = {};

  private constructor() {
    this.initializeObserver();
    this.trackWebVitals();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // 初始化性能观察器
  private initializeObserver() {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.addMetric(entry.name, entry);
        });
      });

      // 观察不同类型的性能指标
      try {
        this.observer.observe({
          entryTypes: [
            'measure',
            'navigation',
            'paint',
            'largest-contentful-paint',
          ],
        });
      } catch (error) {
        console.warn('PerformanceObserver not fully supported:', error);
      }
    }
  }

  // 跟踪 Web Vitals
  private trackWebVitals() {
    // FCP (First Contentful Paint)
    this.observePaintTimings();

    // LCP (Largest Contentful Paint)
    this.observeLCP();

    // CLS (Cumulative Layout Shift)
    this.observeCLS();

    // FID (First Input Delay) - 需要用户交互
    this.observeFID();
  }

  private observePaintTimings() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.vitalsData.FCP = entry.startTime;
            this.reportVital('FCP', entry.startTime);
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['paint'] });
      } catch (error) {
        console.warn('Paint timing observation failed:', error);
      }
    }
  }

  private observeLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.vitalsData.LCP = lastEntry.startTime;
          this.reportVital('LCP', lastEntry.startTime);
        }
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('LCP observation failed:', error);
      }
    }
  }

  private observeCLS() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.vitalsData.CLS = clsValue;
            this.reportVital('CLS', clsValue);
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('CLS observation failed:', error);
      }
    }
  }

  private observeFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          // Type assertion for first-input entries
          const fidEntry = entry as any;
          this.vitalsData.FID = fidEntry.processingStart - fidEntry.startTime;
          this.reportVital('FID', this.vitalsData.FID);
        });
      });

      try {
        observer.observe({ entryTypes: ['first-input'] });
      } catch (error) {
        console.warn('FID observation failed:', error);
      }
    }
  }

  // 添加性能指标
  private addMetric(name: string, entry: PerformanceEntry) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(entry);
  }

  // 报告 Web Vital
  private reportVital(name: string, value: number) {
    console.log(`📊 Web Vital - ${name}:`, value);

    // 在生产环境中，这里应该上报到分析服务
    if (process.env.NODE_ENV === 'production') {
      // 例如：Google Analytics, Adobe Analytics 等
      // gtag('event', 'web_vital', { name, value });
    }
  }

  // 手动测量性能
  public startMeasure(name: string): void {
    performance.mark(`${name}-start`);
  }

  public endMeasure(name: string): number {
    const endMark = `${name}-end`;
    const measureName = `${name}-measure`;

    performance.mark(endMark);
    performance.measure(measureName, `${name}-start`, endMark);

    const measure = performance.getEntriesByName(measureName)[0];
    return measure.duration;
  }

  // 测量函数执行时间
  public measureFunction<T>(name: string, fn: () => T): T {
    this.startMeasure(name);
    const result = fn();
    const duration = this.endMeasure(name);

    console.log(`⏱️ Function ${name} took ${duration.toFixed(2)}ms`);
    return result;
  }

  // 测量异步函数执行时间
  public async measureAsyncFunction<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    this.startMeasure(name);
    const result = await fn();
    const duration = this.endMeasure(name);

    console.log(`⏱️ Async function ${name} took ${duration.toFixed(2)}ms`);
    return result;
  }

  // 获取页面加载性能
  public getPageLoadMetrics() {
    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;

    if (!navigation) {
      return null;
    }

    return {
      // DNS 查询时间
      dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,

      // TCP 连接时间
      tcpConnect: navigation.connectEnd - navigation.connectStart,

      // SSL 握手时间
      sslConnect:
        navigation.secureConnectionStart > 0
          ? navigation.connectEnd - navigation.secureConnectionStart
          : 0,

      // 请求响应时间
      requestResponse: navigation.responseEnd - navigation.requestStart,

      // DOM 解析时间
      domParse: navigation.domContentLoadedEventEnd - navigation.responseEnd,

      // 资源加载时间
      resourceLoad:
        navigation.loadEventEnd - navigation.domContentLoadedEventEnd,

      // 总加载时间
      totalLoad: navigation.loadEventEnd - navigation.fetchStart,

      // Time to First Byte
      ttfb: navigation.responseStart - navigation.fetchStart,

      // DOM Ready 时间
      domReady: navigation.domContentLoadedEventEnd - navigation.fetchStart,
    };
  }

  // 获取资源加载性能
  public getResourceMetrics() {
    const resources = performance.getEntriesByType(
      'resource'
    ) as PerformanceResourceTiming[];

    return resources.map((resource) => ({
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize || 0,
      type: this.getResourceType(resource.name),
      startTime: resource.startTime,
    }));
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (
      url.includes('.png') ||
      url.includes('.jpg') ||
      url.includes('.gif') ||
      url.includes('.svg')
    )
      return 'image';
    if (url.includes('.woff') || url.includes('.ttf')) return 'font';
    return 'other';
  }

  // 获取内存使用情况
  public getMemoryInfo() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usedPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };
    }
    return null;
  }

  // 获取 Web Vitals 数据
  public getWebVitals() {
    return { ...this.vitalsData };
  }

  // 生成性能报告
  public generateReport() {
    const pageLoad = this.getPageLoadMetrics();
    const resources = this.getResourceMetrics();
    const memory = this.getMemoryInfo();
    const webVitals = this.getWebVitals();

    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      pageLoad,
      resources: {
        total: resources.length,
        totalSize: resources.reduce((sum, r) => sum + r.size, 0),
        slowest: resources.sort((a, b) => b.duration - a.duration).slice(0, 5),
        byType: this.groupResourcesByType(resources),
      },
      memory,
      webVitals,
      customMetrics: Object.fromEntries(this.metrics),
    };

    console.log('📊 Performance Report:', report);
    return report;
  }

  private groupResourcesByType(resources: any[]) {
    return resources.reduce(
      (groups, resource) => {
        const type = resource.type;
        if (!groups[type]) {
          groups[type] = { count: 0, totalSize: 0, totalDuration: 0 };
        }
        groups[type].count++;
        groups[type].totalSize += resource.size;
        groups[type].totalDuration += resource.duration;
        return groups;
      },
      {} as Record<string, any>
    );
  }

  // 清理性能数据
  public clearMetrics() {
    this.metrics.clear();
    performance.clearMarks();
    performance.clearMeasures();
  }
}

// 导出单例实例
export const performanceMonitor = PerformanceMonitor.getInstance();

// 便捷的性能测量 Hook
export const usePerformanceMonitor = () => {
  return {
    startMeasure: performanceMonitor.startMeasure.bind(performanceMonitor),
    endMeasure: performanceMonitor.endMeasure.bind(performanceMonitor),
    measureFunction:
      performanceMonitor.measureFunction.bind(performanceMonitor),
    measureAsyncFunction:
      performanceMonitor.measureAsyncFunction.bind(performanceMonitor),
    generateReport: performanceMonitor.generateReport.bind(performanceMonitor),
    getWebVitals: performanceMonitor.getWebVitals.bind(performanceMonitor),
  };
};

export default performanceMonitor;
