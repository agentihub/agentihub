import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import SearchBar, { type FilterValues } from './SearchBar';
import AgentCard from '@/components/AgentCard/AgentCard';
import type { AgentDTO } from '@/api/types.gen';
import { agentService } from '@/services';
import EmptyState from './EmptyState';

interface StarsTabProps {
  userId: string;
  isOwnProfile?: boolean;
}

const StarsTab: React.FC<StarsTabProps> = ({
  userId,
  isOwnProfile = false,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [starredAgents, setStarredAgents] = useState<AgentDTO[]>([]);

  // 搜索和筛选状态
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<FilterValues>({
    sortBy: 'updateTime',
  });

  // 映射前端 sortBy 值到后端 sort 字段
  const getSortField = (sortBy: string): string => {
    const sortMap: Record<string, string> = {
      createTime: 'createTime',
      updateTime: 'updateTime',
      stars: 'stars',
      forks: 'forks',
    };
    return sortMap[sortBy] || 'updateTime';
  };

  // 当 userId、搜索词或筛选条件变化时，重新加载数据
  useEffect(() => {
    loadStarredAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, searchQuery, filterValues]);

  const loadStarredAgents = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await agentService.getStarredAgents({
        userId,
        pageNum: 1,
        pageSize: 100,
        search: searchQuery.trim(),
        platform: filterValues.platform,
        sort: getSortField(filterValues.sortBy || 'updateTime'),
      });

      if (response.success && response.data?.contentData) {
        setStarredAgents(response.data?.contentData);
      } else {
        setStarredAgents([]);
      }
    } catch (error) {
      console.error('加载收藏列表失败:', error);
      setStarredAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentClick = (id: string, name: string, author: string) => {
    if (author && author !== 'Unknown') {
      navigate(`/${author}/${name}`);
    } else {
      // Fallback to the old route if author is not available
      navigate(`/agent/${id}`);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filters: FilterValues) => {
    setFilterValues(filters);
  };

  const formatRelativeTime = (dateString: Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 天前';
    if (diffDays < 7) return `${diffDays} 天前`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} 周前`;
    return `${Math.ceil(diffDays / 30)} 月前`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full">
      {/* 搜索筛选栏 */}
      <div className="mb-6">
        <SearchBar
          placeholder="搜索收藏的 Agent 名称、描述、作者或标签..."
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          defaultSortBy={filterValues.sortBy}
        />
      </div>

      {/* Agent 列表 */}
      {starredAgents.length === 0 && !loading ? (
        searchQuery || filterValues.platform ? (
          <EmptyState type="no-search-results" isOwnProfile={isOwnProfile} />
        ) : (
          <EmptyState type="no-starred-agents" isOwnProfile={isOwnProfile} />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {starredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              id={agent.id}
              name={agent.name}
              description={agent.description}
              platform={agent.platform}
              author={agent.authorName || 'Unknown'}
              stars={agent.stars}
              forks={agent.forks}
              updateTime={
                agent.updateTime
                  ? formatRelativeTime(agent.updateTime)
                  : undefined
              }
              onClick={handleAgentClick}
              visibility={agent.isPublic ? 'public' : 'private'}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StarsTab;
