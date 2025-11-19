import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import { userService } from '@/services';
import type { UserActionLogDTO } from '@/api/types.gen';
import { formatRelativeTime } from '@/utils/date';
import PopularAgentsSection from './PopularAgentsSection';
import EmptyState from './EmptyState';

interface OverviewTabProps {
  userId: string;
  isOwnProfile?: boolean;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  userId,
  isOwnProfile = false,
}) => {
  const [actionsLoading, setActionsLoading] = useState(false);
  const [recentActions, setRecentActions] = useState<UserActionLogDTO[]>([]);

  // 加载最近的操作
  const loadRecentActions = React.useCallback(async () => {
    if (!userId) return;

    setActionsLoading(true);
    try {
      const response = await userService.getRecentUserActions(userId, 4);
      if (response.success && response.data) {
        setRecentActions(response.data);
      }
    } catch (error) {
      console.error('加载最近操作失败:', error);
      setRecentActions([]);
    } finally {
      setActionsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadRecentActions();
  }, [loadRecentActions]);

  // 渲染操作标题
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
    <main className="flex-1 w-full">
      <div className="flex flex-col gap-8">
        {/* Agents 模块 */}
        <PopularAgentsSection userId={userId} isOwnProfile={isOwnProfile} />

        {/* 最近的操作 模块 */}
        <section>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#d0d7de]">
            <h2 className="text-[15.75px] leading-[1.5238] text-[#1f2328] font-semibold">
              最近的操作
            </h2>
          </div>
          <Spin spinning={actionsLoading}>
            {recentActions.length > 0 ? (
              <div className="bg-white border border-[#d0d7de] rounded-lg overflow-hidden">
                <div className="divide-y divide-[#d0d7de]">
                  {recentActions.map((action) => (
                    <div
                      key={action.id}
                      className="px-4 py-3 hover:bg-[#f6f8fa] transition-colors last:border-b-0"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#0969da] mt-2 flex-shrink-0" />
                          <p className="text-sm text-[#24292f] font-medium">
                            {renderActionTitle(action)}
                          </p>
                        </div>
                        {action.actionTime && (
                          <p className="text-xs text-[#656d76] whitespace-nowrap flex-shrink-0">
                            {formatRelativeTime(action.actionTime)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              !actionsLoading && (
                <EmptyState type="no-actions" isOwnProfile={isOwnProfile} />
              )
            )}
          </Spin>
        </section>
      </div>
    </main>
  );
};

export default OverviewTab;
