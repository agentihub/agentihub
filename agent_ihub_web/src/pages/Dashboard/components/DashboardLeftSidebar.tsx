import React from 'react';
import { Input, Button, Typography, Empty, Spin } from 'antd';
import { RobotOutlined, SearchOutlined } from '@ant-design/icons';
import type { AgentDTO } from '../../../api/types.gen';

const { Title, Text } = Typography;

interface DashboardLeftSidebarProps {
  loading: boolean;
  searchQuery: string;
  displayedAgents: AgentDTO[];
  hasMore: boolean;
  loadingMore: boolean;
  actualDisplayedCount: number;
  filteredAgentsLength: number;
  onSearchChange: (value: string) => void;
  onAgentClick: (agent: AgentDTO) => void;
  onSeeMore: () => void;
}

const DashboardLeftSidebar: React.FC<DashboardLeftSidebarProps> = ({
  loading,
  searchQuery,
  displayedAgents,
  hasMore,
  loadingMore,
  actualDisplayedCount,
  filteredAgentsLength,
  onSearchChange,
  onAgentClick,
  onSeeMore,
}) => {
  return (
    <aside className="border-r border-[#d0d7de] min-h-full flex flex-col p-6 min-w-[250px] max-w-full">
      {/* 侧边栏标题 */}
      <div className="pb-1">
        <Title
          level={4}
          className="!m-0 !mb-2 !text-lg !font-semibold !text-gray-900 flex items-center gap-2"
        >
          <RobotOutlined />
          你的 Agents
        </Title>
      </div>

      {/* 搜索框 */}
      <div className="pb-2">
        <Input
          placeholder="查找 Agent..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          allowClear
          size="middle"
          className="rounded-md border-[#d0d7de] h-10"
        />
      </div>

      {/* Agents 列表 */}
      <Spin spinning={loading}>
        <div className="overflow-y-auto mb-auto max-h-[calc(100vh-64px-120px)] pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {displayedAgents.length > 0 ? (
            <>
              {displayedAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="p-2 cursor-pointer transition-all duration-200 rounded-md hover:bg-[#f6f8fa]"
                  onClick={() => onAgentClick(agent)}
                >
                  <div className="flex flex-col gap-1">
                    <Text strong className="text-sm text-blue-600 block">
                      {agent.name}
                    </Text>
                    {agent.description && (
                      <Text
                        type="secondary"
                        className="text-xs leading-6 block overflow-hidden text-ellipsis whitespace-nowrap"
                        title={agent.description}
                      >
                        {agent.description}
                      </Text>
                    )}
                  </div>
                </div>
              ))}

              {/* See More 按钮 */}
              {hasMore && (
                <div className="p-4 text-center border-t border-[#d0d7de]">
                  <Button
                    type="link"
                    onClick={onSeeMore}
                    loading={loadingMore}
                    className="text-blue-600 font-medium px-4 py-2"
                  >
                    {loadingMore
                      ? '加载中...'
                      : `查看更多（剩余 ${filteredAgentsLength - actualDisplayedCount} 个）`}
                  </Button>
                </div>
              )}

              {/* 数据统计 */}
              <div className="px-4 py-3 text-center text-gray-500 text-xs border-t border-[#d0d7de] bg-[#f6f8fa]">
                显示 {actualDisplayedCount} / {filteredAgentsLength} 个 Agent
                {searchQuery && ` (搜索: "${searchQuery}")`}
              </div>
            </>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无Agent"
              className="py-5"
            />
          )}
        </div>
      </Spin>
    </aside>
  );
};

export default DashboardLeftSidebar;
