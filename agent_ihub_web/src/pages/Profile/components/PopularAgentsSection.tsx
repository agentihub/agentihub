import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import { AgentCard } from '@/components/AgentCard';
import { agentService } from '@/services';
import type { AgentDTO } from '@/api/types.gen';
import EmptyState from './EmptyState';

interface PopularAgentsSectionProps {
  userId: string;
  isOwnProfile?: boolean;
}

interface AgentData {
  id: string;
  name: string;
  description: string;
  platform: string;
  stars: number;
  forks: number;
  tags: string[];
  author: string;
  isPublic: boolean;
}

const PopularAgentsSection: React.FC<PopularAgentsSectionProps> = ({
  userId,
  isOwnProfile = false,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [displayAgents, setDisplayAgents] = useState<AgentData[]>([]);
  const [title, setTitle] = useState('最近的 Agents');

  const loadAgents = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // 获取更多数据以便排序
      const response = await agentService.getUserAgents({
        userId,
        userName: '',
        pageNum: 1,
        pageSize: 20,
      });

      if (response.success && response.data?.contentData) {
        const agents = response.data.contentData.map((agent: AgentDTO) => ({
          id: agent.id || '',
          name: agent.name || '',
          description: agent.description || '',
          platform: agent.platform || 'Custom',
          stars: agent.stars || 0,
          forks: agent.forks || 0,
          tags: agent.tags || [],
          author: agent.authorName || '',
          isPublic: agent.isPublic ?? false,
        }));

        // 检查是否有非0的star值
        const hasStars = agents.some((agent) => (agent.stars || 0) > 0);

        let finalAgents: AgentData[];
        if (hasStars) {
          // 按star降序排序，取前4条
          finalAgents = [...agents]
            .sort((a, b) => (b.stars || 0) - (a.stars || 0))
            .slice(0, 4);
          setTitle('受欢迎的 Agents');
        } else {
          // 按原始顺序取前4条
          finalAgents = agents.slice(0, 4);
          setTitle('最近的 Agents');
        }

        setDisplayAgents(finalAgents);
      } else {
        setDisplayAgents([]);
        setTitle('最近的 Agents');
      }
    } catch (error) {
      console.error('加载 agents 失败:', error);
      setDisplayAgents([]);
      setTitle('最近的 Agents');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const handleAgentClick = useCallback(
    (id: string, name: string, author: string) => {
      if (author && name) {
        navigate(`/${author}/${name}`);
        return;
      }
      if (id) {
        navigate(`/agent/${id}`);
      }
    },
    [navigate]
  );

  return (
    <section>
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#d0d7de]">
        <h2 className="text-[15.75px] leading-[1.5238] text-[#1f2328] font-semibold">
          {title}
        </h2>
      </div>
      <Spin spinning={loading}>
        {displayAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                {...agent}
                visibility={agent.isPublic ? 'public' : 'private'}
                onClick={handleAgentClick}
              />
            ))}
          </div>
        ) : (
          !loading && (
            <EmptyState type="no-agents" isOwnProfile={isOwnProfile} />
          )
        )}
      </Spin>
    </section>
  );
};

export default PopularAgentsSection;
