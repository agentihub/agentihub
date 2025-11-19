import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import SearchBar, { type FilterValues } from './SearchBar';
import AgentCard from '@/components/AgentCard/AgentCard';
import type { AgentDTO } from '@/api/types.gen';
import { agentService } from '@/services';
import { formatRelativeTime } from '@/utils/date';
import EmptyState from './EmptyState';

interface AgentsTabProps {
  userId: string;
  userName: string;
  isOwnProfile: boolean;
}

const getSortField = (sortBy: string): string => {
  const sortMap: Record<string, string> = {
    createTime: 'createTime',
    updateTime: 'updateTime',
    stars: 'stars',
    forks: 'forks',
  };
  return sortMap[sortBy] || 'updateTime';
};

const AgentsTab: React.FC<AgentsTabProps> = ({
  userId,
  userName,
  isOwnProfile,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userAgents, setUserAgents] = useState<AgentDTO[]>([]);

  // 搜索和筛选状态
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<FilterValues>({
    sortBy: 'updateTime',
  });

  // 当 userId、userName、搜索词或筛选条件变化时，重新加载数据
  useEffect(() => {
    loadUserAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, userName, searchQuery, filterValues]);

  const loadUserAgents = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const agentsResponse = await agentService.getUserAgents({
        userId,
        userName: userName || '',
        pageNum: 1,
        pageSize: 100,
        search: searchQuery.trim(),
        platform: filterValues.platform,
        sort: getSortField(filterValues.sortBy || 'updateTime'),
      });

      if (agentsResponse.success && agentsResponse.data?.contentData) {
        // 根据 isOwnProfile 过滤公开/私有 Agent
        const filteredData = agentsResponse.data.contentData.filter(
          (agent: AgentDTO) => agent.isPublic || isOwnProfile
        );
        setUserAgents(filteredData);
      } else {
        setUserAgents([]);
      }
    } catch (error) {
      console.error('加载 Agents 失败:', error);
      setUserAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentClick = (_id: string, name: string, author: string) => {
    navigate(`/${author}/${name}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filters: FilterValues) => {
    setFilterValues(filters);
  };

  // 使用通用相对时间格式化函数

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
          placeholder="搜索 Agent 名称、描述或标签..."
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          defaultSortBy={filterValues.sortBy}
        />
      </div>

      {/* Agent 列表 */}
      {userAgents.length === 0 && !loading ? (
        searchQuery || filterValues.platform ? (
          <EmptyState type="no-search-results" isOwnProfile={isOwnProfile} />
        ) : (
          <EmptyState type="no-agents" isOwnProfile={isOwnProfile} />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              id={agent.id}
              name={agent.name}
              description={agent.description}
              platform={agent.platform}
              author={userName}
              stars={agent.stars}
              forks={agent.forks}
              updateTime={
                agent.updateTime
                  ? formatRelativeTime(agent.updateTime as Date)
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

export default AgentsTab;
