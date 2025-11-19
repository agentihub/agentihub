import React from 'react';
import { App, Empty, Skeleton } from 'antd';
import { RepoForkedIcon, StarIcon, EyeIcon } from '@primer/octicons-react';
import { useOutletContext, Link } from 'react-router-dom';
import type { AgentDTO } from '@/api/types.gen';
import { listForkedAgents } from '@/api';

interface OutletContext {
  agentData: AgentDTO;
}

interface ForkListItemProps {
  agent: AgentDTO;
}

const timeUnits: Array<[number, Intl.RelativeTimeFormatUnit]> = [
  [60, 'second'],
  [60, 'minute'],
  [24, 'hour'],
  [7, 'day'],
  [4.34524, 'week'],
  [12, 'month'],
  [Infinity, 'year'],
];

const formatRelativeTime = (date?: Date) => {
  if (!date) return 'Unknown';
  const target = new Date(date);
  if (Number.isNaN(target.getTime())) return 'Unknown';

  const diffMs = target.getTime() - Date.now();
  let diff = diffMs / 1000;
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  for (const [amount, unit] of timeUnits) {
    if (Math.abs(diff) < amount) {
      return rtf.format(Math.round(diff), unit);
    }
    diff /= amount;
  }
  return rtf.format(Math.round(diff), 'year');
};

const ForkListItem: React.FC<ForkListItemProps> = ({ agent }) => {
  const owner =
    agent.authorName ?? agent.forkInfo?.originalAgentName ?? 'unknown';
  const repoName = agent.name ?? 'untitled-agent';
  const stars = agent.stars ?? 0;
  const forks = agent.forks ?? 0;
  const views = agent.views ?? 0;
  const createdText = agent.createTime
    ? `Created ${formatRelativeTime(agent.createTime)}`
    : 'Created –';
  const updatedText = agent.updateTime
    ? `Updated ${formatRelativeTime(agent.updateTime)}`
    : 'Updated –';
  const targetPath =
    agent.authorName && agent.name
      ? `/${agent.authorName}/${agent.name}`
      : undefined;

  return (
    <div className="p-5 border-b border-gray-200 last:border-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2 text-[#0969DA] text-xl font-semibold leading-tight mb-4">
            {targetPath ? (
              <Link to={targetPath} className="hover:underline truncate">
                {owner} / {repoName}
              </Link>
            ) : (
              <span className="truncate">
                {owner} / {repoName}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-6 text-base">
            <span className="inline-flex items-center gap-2">
              <StarIcon size={16} /> {stars}
            </span>
            <span className="inline-flex items-center gap-2">
              <RepoForkedIcon size={16} /> {forks}
            </span>
            <span className="inline-flex items-center gap-2">
              <EyeIcon size={16} /> {views}
            </span>
            <span>{createdText}</span>
            <span>{updatedText}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AgentForks: React.FC = () => {
  const { agentData } = useOutletContext<OutletContext>();
  const { message } = App.useApp();

  const [loading, setLoading] = React.useState(false);
  const [agents, setAgents] = React.useState<AgentDTO[]>([]);
  const [pageNum, setPageNum] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const pageSize = 20;

  const loadForks = React.useCallback(
    async (page: number, append = false) => {
      if (!agentData?.id) return;
      try {
        setLoading(true);
        const res = await listForkedAgents({
          query: {
            originalAgentId: agentData.id,
            pageNum: page,
            pageSize,
          },
        });

        const list = res.data?.data?.contentData ?? [];
        const totalSize = res.data?.data?.totalSize ?? 0;

        setAgents((prev) => (append ? [...prev, ...list] : list));
        setPageNum(page);
        setTotal(totalSize);
      } catch (error) {
        console.error(error);
        message.error('获取 Fork 列表失败');
      } finally {
        setLoading(false);
      }
    },
    [agentData?.id, message, pageSize]
  );

  React.useEffect(() => {
    loadForks(1, false);
  }, [loadForks]);

  const hasMore = agents.length < total;
  const originalAgentName = agentData?.name ?? '该项目';

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-gray-900">Forks</h1>
            <p className="text-base text-gray-600">
              {total > 0 ? (
                <>
                  {total} 人 Fork 了{' '}
                  <span className="font-semibold text-[#0969DA]">
                    {originalAgentName}
                  </span>
                </>
              ) : (
                '还没有人 Fork 这个项目'
              )}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {loading && agents.length === 0 ? (
            <div className="p-6">
              <Skeleton active title={false} paragraph={{ rows: 6 }} />
            </div>
          ) : agents.length === 0 ? (
            <Empty description="暂无 Fork 记录" className="my-12" />
          ) : (
            <div>
              {agents.map((agent) => (
                <ForkListItem
                  key={agent.id ?? `${agent.name}-${agent.authorName}`}
                  agent={agent}
                />
              ))}
            </div>
          )}
        </div>

        {hasMore && (
          <div className="mt-6 text-center">
            <button
              type="button"
              className="px-4 py-2 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-60"
              onClick={() => loadForks(pageNum + 1, true)}
              disabled={loading}
            >
              {loading ? '加载中…' : '加载更多'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentForks;
