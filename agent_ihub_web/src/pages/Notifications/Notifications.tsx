import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Tabs, Empty, Spin, App } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import MainLayout from '../../components/Layout/MainLayout';
import './Notifications.css';

const { Title, Text, Paragraph } = Typography;

const Notifications: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // TODO: 通知功能需要实现专门的通知 API
  // 目前展示空状态，等待后端 API 完成

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // TODO: 这里将来会调用真实的通知 API
      // await notificationService.getUserNotifications();
      // 目前返回空数据
    } catch (_error) {
      message.error('加载通知失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="notifications-loading">
          <Spin size="large" />
          <div>加载中...</div>
        </div>
      </MainLayout>
    );
  }

  const tabItems = [
    {
      key: 'all',
      label: '全部',
    },
    {
      key: 'unread',
      label: '未读',
    },
    {
      key: 'system',
      label: '系统',
    },
    {
      key: 'interaction',
      label: '互动',
    },
  ];

  return (
    <MainLayout>
      <div className="notifications-page">
        <div className="notifications-header">
          <div className="header-left">
            <Title level={2}>消息通知</Title>
            <Paragraph>查看和管理您的所有通知</Paragraph>
          </div>

          <div className="header-actions">
            <Button
              icon={<SettingOutlined />}
              onClick={() => navigate('/settings')}
            >
              通知设置
            </Button>
          </div>
        </div>

        <Card className="notifications-card">
          <Tabs defaultActiveKey="all" items={tabItems} />

          <div className="notifications-content">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div style={{ textAlign: 'center' }}>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: '16px',
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    通知功能正在开发中
                  </Text>
                  <Text type="secondary">
                    我们正在构建完整的通知系统，将在后续版本中推出
                  </Text>
                </div>
              }
              style={{ marginTop: '50px' }}
            >
              <Button type="primary" onClick={() => navigate('/')}>
                返回首页
              </Button>
            </Empty>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Notifications;
