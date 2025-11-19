import React from 'react';
import { Result, Button, Typography, Card } from 'antd';
import { ReloadOutlined, HomeOutlined, BugOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Paragraph, Text } = Typography;

interface ErrorFallbackProps {
  error?: Error;
  reset: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  reset,
}) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleRetry = () => {
    reset();
  };

  const isDevelopment = import.meta.env.DEV;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      <Card
        style={{
          maxWidth: 600,
          width: '90%',
          textAlign: 'center',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        <Result
          status="error"
          title="出了点问题"
          subTitle="应用程序遇到了意外错误，我们正在努力解决这个问题。"
          extra={[
            <Button
              key="retry"
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleRetry}
            >
              重试
            </Button>,
            <Button key="home" icon={<HomeOutlined />} onClick={handleGoHome}>
              返回首页
            </Button>,
            <Button
              key="reload"
              icon={<ReloadOutlined />}
              onClick={handleReload}
            >
              刷新页面
            </Button>,
          ]}
        />

        {isDevelopment && error && (
          <Card
            size="small"
            title={
              <span>
                <BugOutlined style={{ marginRight: 8 }} />
                开发调试信息
              </span>
            }
            style={{
              marginTop: 24,
              textAlign: 'left',
              background: '#fafafa',
            }}
          >
            <Paragraph>
              <Text strong>错误信息:</Text>
              <br />
              <Text code>{error.message}</Text>
            </Paragraph>

            {error.stack && (
              <Paragraph>
                <Text strong>错误堆栈:</Text>
                <br />
                <Text
                  code
                  style={{
                    fontSize: '12px',
                    whiteSpace: 'pre-wrap',
                    maxHeight: '200px',
                    overflow: 'auto',
                    display: 'block',
                    background: '#f5f5f5',
                    padding: '8px',
                    borderRadius: '4px',
                  }}
                >
                  {error.stack}
                </Text>
              </Paragraph>
            )}
          </Card>
        )}
      </Card>
    </div>
  );
};

export default ErrorFallback;
