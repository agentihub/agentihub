import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context';
import { MainLayout } from '../../components';
import { handleError, agentService, userService } from '../../services';
import type { AgentDTO, UserActionLogDTO } from '../../api/types.gen';
import {
  DashboardLeftSidebar,
  DashboardMainContent,
  DashboardRightSidebar,
} from './components';
import { formatRelativeTime } from '../../utils/date';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myAgents, setMyAgents] = useState<AgentDTO[]>([]);
  const [feedAgents, setFeedAgents] = useState<AgentDTO[]>([]);
  const [recentActions, setRecentActions] = useState<UserActionLogDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 分页加载相关状态
  const [displayedCount, setDisplayedCount] = useState(6); // 初始显示6条
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        return;
      }
      try {
        setLoading(true);
        setError(null);

        // Fetch user's agents
        const myAgentsResponse = await agentService.getUserAgents({
          userId: user?.id || '',
          userName: user?.userName || '',
          pageNum: 1,
          pageSize: 20,
        });
        if (myAgentsResponse.success && myAgentsResponse.data) {
          setMyAgents(myAgentsResponse.data.contentData || []);
        }

        // Fetch feed agents (使用热门接口)
        const feedResponse = await agentService.getTrendingAgents({
          pageNum: 1,
          pageSize: 20,
        });
        if (feedResponse.success && feedResponse.data) {
          const agents = feedResponse.data.contentData || [];
          setFeedAgents(agents);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        const errorResult = handleError(err);
        setError(errorResult.message || '获取数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  // 获取用户最近操作记录
  useEffect(() => {
    const fetchRecentActions = async () => {
      if (!user?.id) {
        return;
      }
      try {
        const response = await userService.getRecentUserActions(user.id, 5);
        if (response.success && response.data) {
          setRecentActions(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch recent actions:', err);
      }
    };

    fetchRecentActions();
  }, [user?.id]);

  const handleCreateAgent = () => {
    navigate('/new');
  };

  const handleAgentClick = useCallback(
    (agent: AgentDTO) => {
      navigate(`/${agent.authorName}/${agent.name}`);
    },
    [navigate]
  );

  // 处理"See More"按钮点击
  const handleSeeMore = () => {
    setLoadingMore(true);
    // 模拟加载延迟
    setTimeout(() => {
      setDisplayedCount((prev) => prev + 10);
      setLoadingMore(false);
    }, 500);
  };

  // 过滤agents
  const filteredAgents = myAgents.filter((agent) =>
    agent.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 获取当前要显示的agents
  const displayedAgents = filteredAgents.slice(0, displayedCount);
  const hasMore = displayedCount < filteredAgents.length;
  const actualDisplayedCount = Math.min(displayedCount, filteredAgents.length);

  // 搜索时重置显示数量
  useEffect(() => {
    setDisplayedCount(6);
  }, [searchQuery]);

  // 使用通用相对时间格式化函数

  return (
    <MainLayout>
      <div className="w-full max-w-full h-[calc(100vh-64px)] bg-white p-0 m-0 overflow-x-hidden">
        {error && (
          <Alert
            message="获取数据失败"
            description={error}
            type="error"
            showIcon
            closable
            className="m-6"
          />
        )}

        <div className="grid grid-cols-[22%_78%] gap-0 w-full max-w-full m-0 h-full relative overflow-x-hidden lg:grid-cols-[22%_78%] md:grid-cols-1">
          {/* 左侧栏 - Top Agents */}
          <DashboardLeftSidebar
            loading={loading}
            searchQuery={searchQuery}
            displayedAgents={displayedAgents}
            hasMore={hasMore}
            loadingMore={loadingMore}
            actualDisplayedCount={actualDisplayedCount}
            filteredAgentsLength={filteredAgents.length}
            onSearchChange={setSearchQuery}
            onAgentClick={handleAgentClick}
            onSeeMore={handleSeeMore}
          />

          {/* 右侧内容区 - 包含两个模块 */}
          <div className="grid grid-cols-[70%_30%] gap-0 min-w-0 w-full h-full overflow-x-hidden lg:grid-cols-[70%_30%] md:grid-cols-1">
            {/* 中间区域 - Home Feed */}
            <DashboardMainContent
              loading={loading}
              feedAgents={feedAgents}
              onCreateAgent={handleCreateAgent}
              onAgentClick={handleAgentClick}
            />

            {/* 右侧栏 - Latest Changes */}
            <DashboardRightSidebar
              recentActions={recentActions}
              formatRelativeTime={formatRelativeTime}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
