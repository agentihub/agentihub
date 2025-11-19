import { notification } from 'antd';

// 错误类型定义
export interface ApiError {
  code: string;
  message: string;
  status?: number;
  details?: any;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp: number;
  userAgent: string;
  url: string;
}

// 错误严重级别
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// 错误报告接口
export interface ErrorReport {
  error: Error | ApiError;
  severity: ErrorSeverity;
  context: ErrorContext;
  stackTrace?: string;
}

// 错误处理类
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: ErrorReport[] = [];
  private maxQueueSize = 100;
  private reportingEnabled = process.env.NODE_ENV === 'production';

  private constructor() {
    // 绑定全局错误处理
    this.setupGlobalErrorHandlers();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private setupGlobalErrorHandlers() {
    // 处理未捕获的错误
    window.addEventListener('error', (event) => {
      this.handleError(new Error(event.message), ErrorSeverity.HIGH, {
        component: 'window',
        action: 'unhandled_error',
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    });

    // 处理未捕获的 Promise 拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(new Error(event.reason), ErrorSeverity.MEDIUM, {
        component: 'window',
        action: 'unhandled_promise_rejection',
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    });
  }

  // 主要错误处理方法
  public handleError(
    error: Error | ApiError,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context: Partial<ErrorContext> = {}
  ) {
    const errorReport: ErrorReport = {
      error,
      severity,
      context: {
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...context,
      },
      stackTrace: error instanceof Error ? error.stack : undefined,
    };

    // 添加到错误队列
    this.addToQueue(errorReport);

    // 显示用户友好的错误信息
    this.showUserNotification(error, severity);

    // 记录到控制台
    this.logError(errorReport);

    // 上报错误（生产环境）
    if (this.reportingEnabled) {
      this.reportError(errorReport);
    }
  }

  // API 错误专门处理
  public handleApiError(
    error: any,
    context: Partial<ErrorContext> = {}
  ): ApiError {
    let apiError: ApiError;

    if (error?.response) {
      // HTTP 响应错误
      const { status, data } = error.response;
      apiError = {
        code: data?.code || `HTTP_${status}`,
        message: data?.message || this.getDefaultErrorMessage(status),
        status,
        details: data,
      };
    } else if (error?.request) {
      // 网络错误
      apiError = {
        code: 'NETWORK_ERROR',
        message: '网络连接失败，请检查您的网络连接',
        details: error.request,
      };
    } else {
      // 其他错误
      apiError = {
        code: 'UNKNOWN_ERROR',
        message: error.message || '发生未知错误',
        details: error,
      };
    }

    this.handleError(apiError, this.getErrorSeverity(apiError.status), {
      component: 'api',
      action: context.action || 'api_call',
      ...context,
    });

    return apiError;
  }

  // 用户友好的错误消息
  private showUserNotification(
    error: Error | ApiError,
    severity: ErrorSeverity
  ) {
    const message = this.getUserFriendlyMessage(error);

    switch (severity) {
      case ErrorSeverity.LOW:
        // 不显示通知，只记录
        break;
      case ErrorSeverity.MEDIUM:
        message.warning(message);
        break;
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        notification.error({
          message: '错误',
          description: message,
          duration: severity === ErrorSeverity.CRITICAL ? 0 : 4.5,
        });
        break;
    }
  }

  // 获取用户友好的错误消息
  private getUserFriendlyMessage(error: Error | ApiError): string {
    if ('code' in error) {
      switch (error.code) {
        case 'NETWORK_ERROR':
          return '网络连接失败，请检查您的网络连接';
        case 'UNAUTHORIZED':
          return '您的登录已过期，请重新登录';
        case 'FORBIDDEN':
          return '您没有权限执行此操作';
        case 'NOT_FOUND':
          return '请求的资源不存在';
        case 'VALIDATION_ERROR':
          return '输入数据有误，请检查后重试';
        case 'SERVER_ERROR':
          return '服务器错误，请稍后重试';
        default:
          return error.message || '发生未知错误';
      }
    }

    return error.message || '发生未知错误';
  }

  // 根据 HTTP 状态码获取默认错误消息
  private getDefaultErrorMessage(status?: number): string {
    switch (status) {
      case 400:
        return '请求参数有误';
      case 401:
        return '认证失败，请重新登录';
      case 403:
        return '没有权限访问';
      case 404:
        return '资源不存在';
      case 422:
        return '数据验证失败';
      case 429:
        return '请求过于频繁，请稍后重试';
      case 500:
        return '服务器内部错误';
      case 502:
        return '网关错误';
      case 503:
        return '服务不可用';
      case 504:
        return '网关超时';
      default:
        return '发生未知错误';
    }
  }

  // 根据状态码确定错误严重级别
  private getErrorSeverity(status?: number): ErrorSeverity {
    if (!status) return ErrorSeverity.MEDIUM;

    if (status >= 500) return ErrorSeverity.HIGH;
    if (status >= 400) return ErrorSeverity.MEDIUM;
    return ErrorSeverity.LOW;
  }

  // 添加到错误队列
  private addToQueue(errorReport: ErrorReport) {
    this.errorQueue.push(errorReport);

    // 限制队列大小
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  // 记录错误到控制台
  private logError(errorReport: ErrorReport) {
    const { error, severity, context } = errorReport;

    console.group(`🔴 Error [${severity.toUpperCase()}]`);
    console.error('Error:', error);
    console.log('Context:', context);
    if (errorReport.stackTrace) {
      console.log('Stack Trace:', errorReport.stackTrace);
    }
    console.groupEnd();
  }

  // 上报错误到监控服务
  private async reportError(errorReport: ErrorReport) {
    try {
      // 这里应该调用实际的错误报告服务
      // 例如：Sentry, LogRocket, Bugsnag 等

      // 示例实现：
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport),
      // });

      console.log('Error reported:', errorReport);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  // 获取错误统计
  public getErrorStats() {
    const stats = {
      total: this.errorQueue.length,
      bySeVERITY: {} as Record<ErrorSeverity, number>,
      recent: this.errorQueue.slice(-10),
    };

    // 按严重级别统计
    this.errorQueue.forEach((report) => {
      stats.bySeVERITY[report.severity] =
        (stats.bySeVERITY[report.severity] || 0) + 1;
    });

    return stats;
  }

  // 清理错误队列
  public clearErrors() {
    this.errorQueue = [];
  }
}

// 导出单例实例
export const errorHandler = ErrorHandler.getInstance();

// 便捷的错误处理函数
export const handleError = (
  error: Error | ApiError,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  context: Partial<ErrorContext> = {}
) => {
  errorHandler.handleError(error, severity, context);
};

export const handleApiError = (
  error: any,
  context: Partial<ErrorContext> = {}
): ApiError => {
  return errorHandler.handleApiError(error, context);
};

export default errorHandler;
