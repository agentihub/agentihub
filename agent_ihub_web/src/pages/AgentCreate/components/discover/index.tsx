import React, { useState, useEffect } from 'react';
import { Spin, Empty } from 'antd';
import { agentService } from '@/services';
import type { AgentDTO } from '@/api/types.gen';
import { AgentCard } from '@/components';
import StepActions from '../StepActions';

interface DiscoverSectionProps {
  keyword: string;
  onViewDetails: (agent: AgentDTO) => void;
  onContinue: () => void;
  onBack?: () => void;
}

const DiscoverSection: React.FC<DiscoverSectionProps> = ({
  keyword,
  onViewDetails,
  onContinue,
  onBack,
}) => {
  const [recommendedAgents, setRecommendedAgents] = useState<AgentDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      const res = await agentService.searchAgentByKeyWord(keyword);
      if (res.success && res.data) {
        setRecommendedAgents(res.data.slice(0, 10));
      }
      setLoading(false);
    };

    if (keyword) {
      fetchRecommendations();
    }
  }, [keyword]);

  return (
    <div className="min-h-[calc(100vh-250px)] flex flex-col">
      {/* 主内容区 */}
      <div className="flex-1">
        <div className="max-w-screen-xl mx-auto px-4 py-6">
          {/* 标题区域 */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              发现相似的 Agent
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-md px-4 py-3">
              <p className="text-sm text-gray-700 m-0">
                💡 我为你找到了 <strong>{recommendedAgents.length}</strong>{' '}
                个相似的 Agent，你可以直接使用它们。
              </p>
            </div>
          </div>

          {/* 内容区域 */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" tip="正在搜索相似的 Agent..." />
            </div>
          ) : recommendedAgents.length === 0 ? (
            <div className="py-12">
              <Empty
                description={
                  <div>
                    <p className="text-gray-600 mb-2">没有找到相似的 Agent</p>
                    <p className="text-sm text-gray-500">
                      让我们从头开始创建你的 Agent 吧！
                    </p>
                  </div>
                }
              />
            </div>
          ) : (
            <>
              {/* Agent 卡片网格 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {recommendedAgents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    id={agent.id!}
                    name={agent.name}
                    description={agent.description || ''}
                    author={agent.authorName || '未知作者'}
                    stars={agent.stars || 0}
                    forks={agent.forks || 0}
                    platform={agent.platform}
                    onClick={() => onViewDetails(agent)}
                  />
                ))}
              </div>

              {/* 提示信息 */}
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-md px-6 py-4 text-center">
                <p className="text-gray-700 text-sm m-0">
                  没有找到合适的 Agent？点击右下方按钮来创建属于你自己的 Agent
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 底部操作按钮 */}
      <StepActions
        showBack={!!onBack}
        onBack={onBack}
        nextText="继续创建我的 Agent"
        onNext={onContinue}
      />
    </div>
  );
};

export default DiscoverSection;
