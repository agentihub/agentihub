import React, { Component } from 'react';
import type { ReactNode } from 'react';
import { ErrorFallback } from './ErrorFallback';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>;
  onError?: (error: Error, errorInfo: string) => void;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 更新状态以便下次渲染能够显示降级的 UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 记录错误信息
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // 调用可选的错误处理函数
    if (this.props.onError) {
      this.props.onError(error, errorInfo.componentStack || '');
    }

    this.setState({
      errorInfo: errorInfo.componentStack || '',
    });

    // 上报错误到监控服务
    this.reportError(error, errorInfo);
  }

  private reportError = (_error: Error, _errorInfo: React.ErrorInfo) => {
    // 在生产环境中，这里应该上报到错误监控服务
    if (import.meta.env.PROD) {
      // 例如：Sentry, LogRocket, Bugsnag 等
      // errorReportingService.captureException(error, { extra: errorInfo });
    }
  };

  private resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || ErrorFallback;

      return (
        <FallbackComponent error={this.state.error} reset={this.resetError} />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
