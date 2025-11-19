import React from 'react';
import { Typography, Steps } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import type { UserActionLogDTO } from '../../../api/types.gen';

const { Title, Text } = Typography;

interface DashboardRightSidebarProps {
  recentActions: UserActionLogDTO[];
  formatRelativeTime: (date: Date) => string;
}

const DashboardRightSidebar: React.FC<DashboardRightSidebarProps> = ({
  recentActions,
  formatRelativeTime,
}) => {
  const renderActionTitle = (action: UserActionLogDTO) => {
    const type = action.actionType;
    const agent = action.targetAgentName || action.targetAgentId || '';
    const targetUser = action.targetUserName || action.targetUserId || '';

    switch (type) {
      case 'STAR_AGENT':
        return `收藏了 Agent ${agent}`;
      case 'UNSTAR_AGENT':
        return `取消收藏了 Agent ${agent}`;
      case 'DELETE_AGENT':
        return `删除了 Agent ${agent}`;
      case 'FOLLOW_USER':
        return `关注了用户 ${targetUser}`;
      case 'UNFOLLOW_USER':
        return `取消关注了用户 ${targetUser}`;
      case 'EDIT_AGENT':
        return `更新了 Agent ${agent}`;
      case 'FORK_AGENT':
        return `Fork 了 Agent ${agent}`;
      case 'CREATE_AGENT':
        return `创建了 Agent ${agent}`;
      case 'PUBLISH_AGENT':
        return `发布了 Agent ${agent}`;
      default:
        return action.description || '未知操作';
    }
  };

  return (
    <aside className="p-8 flex flex-col items-start">
      <div className="w-[90%] border border-[#d0d7de] rounded-lg bg-white shadow-sm">
        <div className="p-2.5 border-b border-[#d0d7de] flex items-start gap-3 rounded-t-lg">
          <ClockCircleOutlined className="text-xl text-green-600 mt-0.5 ml-1.5" />
          <div>
            <Title level={5} className="!m-0 !mb-1 !text-sm">
              最新动态
            </Title>
          </div>
        </div>

        <div className="px-5 py-4">
          {recentActions.length === 0 ? (
            <Text type="secondary" className="text-sm">
              暂无最新动态
            </Text>
          ) : (
            <Steps
              direction="vertical"
              size="small"
              current={-1}
              items={recentActions.map((action) => ({
                title: (
                  <div className="flex flex-col gap-1 mb-0">
                    <p className="font-semibold mb-0 text-gray-900">
                      {renderActionTitle(action)}
                    </p>
                    {action.actionTime && (
                      <Text type="secondary" className="text-xs">
                        {formatRelativeTime(action.actionTime)}
                      </Text>
                    )}
                  </div>
                ),
                status: 'wait',
              }))}
              className="[&_.ant-steps-item]:pb-2.5 [&_.ant-steps-item:last-child]:pb-0 [&_.ant-steps-item-icon]:mr-3 [&_.ant-steps-item-icon]:mt-0 [&_.ant-steps-item-icon_.ant-steps-icon]:text-xs [&_.ant-steps-item-tail]:p-0 [&_.ant-steps-item-tail]:top-1 [&_.ant-steps-item-tail]:left-1 [&_.ant-steps-item-tail]:h-[calc(100%-5px)] [&_.ant-steps-item-content]:min-h-auto [&_.ant-steps-item-content]:pt-0 [&_.ant-steps-item-wait_.ant-steps-item-icon]:bg-[#d0d7de] [&_.ant-steps-item-wait_.ant-steps-item-icon]:border-[#d0d7de] [&_.ant-steps-item-wait_.ant-steps-item-icon]:w-2.5 [&_.ant-steps-item-wait_.ant-steps-item-icon]:h-2.5 [&_.ant-steps-item-wait_.ant-steps-item-icon]:mt-0.5 [&_.ant-steps-item-wait_.ant-steps-item-icon]:leading-2.5 [&_.ant-steps-item-wait_.ant-steps-item-icon_.ant-steps-icon]:hidden [&_.ant-steps-item-wait>_.ant-steps-item-container>_.ant-steps-item-tail::after]:bg-[#d0d7de] [&_.ant-steps-item-wait>_.ant-steps-item-container>_.ant-steps-item-tail::after]:w-px"
            />
          )}
        </div>
      </div>
    </aside>
  );
};

export default DashboardRightSidebar;
