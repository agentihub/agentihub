import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Typography,
  Card,
  Button,
  Tag,
  Space,
  Empty,
  message,
} from 'antd';
import { StarOutlined, StarFilled } from '@ant-design/icons';
import Sidebar from './Sidebar';
import { agentService } from '../../../services/agentService';

const { Text } = Typography;
const { Content, Sider } = Layout;

interface AgentSearchProps {
  searchQuery?: string;
  onTotalChange?: (total: number) => void;
  agentsData?: any[];
  loading?: boolean;
}

interface Agent {
  authorName: string;
  id: string;
  name: string;
  description: string;
  platform: string;
  author: string;
  stars: number;
  forks: number;
  tags: string[];
  updateTime: string;
  avatar: string;
  avatarColor: string;
  isStarred?: boolean;
}

const AgentSearch: React.FC<AgentSearchProps> = ({
  onTotalChange,
  agentsData,
}) => {
  const navigate = useNavigate();
  const [starLoading, setStarLoading] = useState<Set<string>>(new Set());

  // 使用真实数据，若无则为空数组
  const displayData = Array.isArray(agentsData) ? agentsData : [];

  // 通知父组件总数变化
  const totalCount = Array.isArray(displayData) ? displayData.length : 0;
  React.useEffect(() => {
    if (onTotalChange) {
      console.log('AgentSearch: 通知父组件Agent总数:', totalCount);
      onTotalChange(totalCount);
    }
  }, [onTotalChange, totalCount]);

  // Agent点击处理
  const handleAgentClick = useCallback(
    (id: string, name: string, author: string) => {
      if (author && name) {
        navigate(`/${author}/${name}`);
      } else if (id) {
        navigate(`/agent/${id}`); // Fallback
      }
    },
    [navigate]
  );

  // Star处理
  const handleStar = useCallback(
    async (agent: Agent) => {
      const agentId = agent.id;
      const isCurrentlyStarred = agent.isStarred || false;

      // 防止重复点击
      if (starLoading.has(agentId)) return;

      setStarLoading((prev) => new Set(prev).add(agentId));

      try {
        if (isCurrentlyStarred) {
          // 取消收藏
          await agentService.unstarAgent(agentId);
          // 更新本地数据状态
          agent.isStarred = false;
        } else {
          // 收藏
          await agentService.starAgent(agentId);
          // 更新本地数据状态
          agent.isStarred = true;
        }
      } catch (error) {
        console.error('Star operation failed:', error);
        message.error(isCurrentlyStarred ? '取消收藏失败' : '收藏失败');
      } finally {
        setStarLoading((prev) => {
          const newSet = new Set(prev);
          newSet.delete(agentId);
          return newSet;
        });
      }
    },
    [starLoading]
  );

  // 计算显示的数据（现在直接使用state.agents）

  // 自定义搜索结果卡片组件
  const SearchResultCard: React.FC<{
    agent: Agent;
  }> = ({ agent }) => {
    const formatUpdateTime = (value: unknown): string => {
      if (value == null) return '';
      if (value instanceof Date) return value.toLocaleString();
      if (typeof value === 'number') return new Date(value).toLocaleString();
      return String(value);
    };
    const getPlatformColor = (platform: string) => {
      const colors: Record<string, string> = {
        LITE_AGENT: '#52c41a',
        DIFY: '#1890ff',
        COZE: '#722ed1',
        DINGTALK: '#fa8c16',
      };
      return colors[platform] || '#d9d9d9';
    };

    // const getPlatformIcon = (_platform: string) => {
    //   // 这里可以根据平台返回不同的图标
    //   return '🤖';
    // };

    return (
      <Card
        // hoverable
        className="mb-4 border border-gray-300 rounded-lg"
        bodyStyle={{ padding: '16px' }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* 标题和操作按钮 */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <a className="text-base text-blue-500 font-semibold">
                  {agent.authorName}/{agent.name}
                </a>
              </div>
              <div className="flex gap-2">
                <Button
                  type="text"
                  icon={agent.isStarred ? <StarFilled /> : <StarOutlined />}
                  size="small"
                  loading={starLoading.has(agent.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStar(agent);
                  }}
                  className={`border border-gray-300 rounded ${agent.isStarred ? 'text-yellow-500 border-yellow-500' : 'text-gray-500'}`}
                >
                  {agent.isStarred ? '取消收藏' : '收藏'}
                </Button>
              </div>
            </div>

            {/* 描述 */}
            <div className="mb-3">
              <Text type="secondary" className="text-sm text-gray-600">
                {agent.description}
              </Text>
            </div>

            {/* 标签 */}
            {Array.isArray(agent.tags) && agent.tags.length > 0 && (
              <div className="mb-3">
                <Space size={[0, 4]} wrap>
                  {agent.tags.slice(0, 5).map((tag) => (
                    <Tag key={tag} color="blue" className="text-xs">
                      {tag}
                    </Tag>
                  ))}
                  {Array.isArray(agent.tags) && agent.tags.length > 5 && (
                    <Tag className="text-xs">+{agent.tags.length - 5}</Tag>
                  )}
                </Space>
              </div>
            )}

            {/* 元数据 */}
            <div className="flex items-center gap-4 text-xs">
              <Tag color={getPlatformColor(agent.platform)} className="text-xs">
                {agent.platform}
              </Tag>
              <Space size={4}>
                <StarOutlined className="text-yellow-500" />
                <Text type="secondary">{agent.stars}</Text>
              </Space>
              <Text type="secondary" className="text-gray-500">
                更新于 {formatUpdateTime(agent.updateTime)}
              </Text>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="p-4 md:p-4 sm:p-3 lg:p-0">
      {/* 顶部结果统计 */}
      <div className="flex justify-between items-center mb-4 py-3 border-b border-gray-200">
        <div>
          <Text type="secondary" className="text-black text-xl font-bold">
            {totalCount} 个结果
          </Text>
        </div>
      </div>

      {/* 主内容区域 */}
      <Layout className="bg-transparent">
        <Content className="pr-6 md:pr-0 mr-3" style={{ flex: '0 0 65%' }}>
          {/* Agent列表 */}
          <div>
            {displayData.length === 0 ? (
              <div className="py-12">
                <Empty description="搜索内容没有返回任何数据" />
              </div>
            ) : (
              (Array.isArray(displayData) ? displayData : []).map((agent) => (
                <div
                  key={agent.id}
                  onClick={() =>
                    handleAgentClick(agent.id, agent.name, agent.authorName)
                  }
                  className="cursor-pointer"
                >
                  <SearchResultCard agent={agent} />
                </div>
              ))
            )}
          </div>
        </Content>

        {/* 右侧边栏 */}
        <Sider
          width="35%"
          className="bg-transparent lg:block hidden"
          breakpoint="lg"
          collapsedWidth={0}
        >
          <Sidebar />
        </Sider>
      </Layout>
    </div>
  );
};

export default AgentSearch;
