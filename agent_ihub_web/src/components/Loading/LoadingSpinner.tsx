import React from 'react';
import { Spin, type SpinProps } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

// 扩展的加载组件属性
interface LoadingSpinnerProps extends SpinProps {
  text?: string;
  overlay?: boolean;
  minHeight?: number | string;
  variant?: 'default' | 'page' | 'inline' | 'button';
}

// 自定义加载图标
const LoadingIcon: React.FC<{ variant?: string }> = ({ variant }) => {
  return (
    <LoadingOutlined
      style={{
        fontSize: variant === 'button' ? 14 : variant === 'inline' ? 16 : 24,
        color: '#44AAFE',
      }}
      spin
    />
  );
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = '加载中...',
  overlay: _overlay = false,
  minHeight = 200,
  variant = 'default',
  size = 'default',
  ...props
}) => {
  // 根据变体设置样式
  const getContainerStyle = () => {
    const baseStyle: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      gap: '12px',
    };

    switch (variant) {
      case 'page':
        return {
          ...baseStyle,
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        };
      case 'inline':
        return {
          ...baseStyle,
          minHeight: 'auto',
          padding: '8px',
          flexDirection: 'row' as const,
          gap: '8px',
        };
      case 'button':
        return {
          ...baseStyle,
          minHeight: 'auto',
          padding: '4px',
          flexDirection: 'row' as const,
          gap: '6px',
        };
      default:
        return {
          ...baseStyle,
          minHeight:
            typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
          padding: '24px',
        };
    }
  };

  // 根据变体设置 Spin 大小
  const getSpinSize = () => {
    switch (variant) {
      case 'page':
        return 'large';
      case 'button':
        return 'small';
      case 'inline':
        return 'small';
      default:
        return size;
    }
  };

  // 根据变体设置文本样式
  const getTextStyle = () => {
    const baseStyle: React.CSSProperties = {
      color: '#666',
      fontSize: '14px',
    };

    switch (variant) {
      case 'page':
        return {
          ...baseStyle,
          fontSize: '16px',
          fontWeight: 500,
        };
      case 'button':
        return {
          ...baseStyle,
          fontSize: '12px',
        };
      case 'inline':
        return {
          ...baseStyle,
          fontSize: '12px',
        };
      default:
        return baseStyle;
    }
  };

  const spinElement = (
    <Spin
      indicator={<LoadingIcon variant={variant} />}
      size={getSpinSize()}
      {...props}
    />
  );

  // 如果是按钮或内联变体，只显示图标
  if (variant === 'button') {
    return spinElement;
  }

  return (
    <div style={getContainerStyle()}>
      {spinElement}
      {text && <div style={getTextStyle()}>{text}</div>}
    </div>
  );
};

// 特定用途的加载组件
export const PageLoading: React.FC<{ text?: string }> = ({ text }) => (
  <LoadingSpinner variant="page" text={text} />
);

export const InlineLoading: React.FC<{ text?: string }> = ({ text }) => (
  <LoadingSpinner variant="inline" text={text} />
);

export const ButtonLoading: React.FC = () => (
  <LoadingSpinner variant="button" />
);

// 覆盖层加载组件
export const OverlayLoading: React.FC<LoadingSpinnerProps> = (props) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255, 255, 255, 0.8)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: 'blur(2px)',
      }}
    >
      <LoadingSpinner {...props} />
    </div>
  );
};

export default LoadingSpinner;
