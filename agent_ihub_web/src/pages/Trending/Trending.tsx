import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout, ExploreNav } from '../../components';
import TrendingHeader from './TrendingHeader';
import { DownOutlined, FireOutlined, StarOutlined } from '@ant-design/icons';
import { agentService } from '../../services';
import type { AgentDTO } from '../../api/types.gen';
import './Trending.css';

// 平台颜色映射
const platformColors: Record<string, string> = {
  LITE_AGENT: '#3178C6',
  DIFY: '#DA5B0B',
  COZE: '#28A745',
};

// 数据转换函数
const transformAgentToRepository = (agent: AgentDTO) => ({
  id: agent.id || '',
  name: agent.name,
  authorName: agent.authorName || '未知作者',
  description: agent.description || '',
  language: agent.platform,
  languageColor: platformColors[agent.platform] || '#6B7280',
  stars: agent.stars || 0,
  forks: agent.forks || 0,
  starsToday: Math.floor(Math.random() * 100) + 10, // 临时数据，后续可以从API获取
  isStarred: agent.isStarred || false,
  builtBy: [
    { name: 'user1', avatar: 'U1' },
    { name: 'user2', avatar: 'U2' },
    { name: 'user3', avatar: 'U3' },
  ],
});

const Trending: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('trending');
  // const [contentType, setContentType] = useState('repositories');
  // const [spokenLanguage, setSpokenLanguage] = useState('any');
  const [programmingLanguage] = useState('any');
  // const [dateRange, setDateRange] = useState('today');

  // API相关状态
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    pageNum: 1,
    pageSize: 10,
    total: 0,
  });
  const [starLoading, setStarLoading] = useState<Set<string>>(new Set());

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'explore') {
      navigate('/explore');
    } else if (tab === 'topics') {
      // 可以添加topics页面路由
      console.log('Navigate to topics');
    } else if (tab === 'collections') {
      // 可以添加collections页面路由
      console.log('Navigate to collections');
    } else if (tab === 'events') {
      // 可以添加events页面路由
      console.log('Navigate to events');
    } else if (tab === 'sponsors') {
      // 可以添加sponsors页面路由
      console.log('Navigate to sponsors');
    }
  };

  // const handleContentTypeChange = (type: string) => {
  //   setContentType(type);
  //   if (type === 'developers') {
  //     navigate('/trending/developers');
  //   }
  // };

  // 获取热门Agent数据
  const fetchTrendingAgents = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await agentService.getTrendingAgents({
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        platform: programmingLanguage === 'any' ? '' : programmingLanguage,
      });

      if (response.success && response.data) {
        const transformedAgents =
          response.data.contentData?.map(transformAgentToRepository) || [];
        setAgents(transformedAgents);
        setPagination((prev) => ({
          ...prev,
          total: response.data?.totalSize || 0,
        }));
      } else {
        setError('获取热门Agent失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('获取热门Agent失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchTrendingAgents();
  }, [pagination.pageNum, programmingLanguage]);

  // // 平台变化时重新获取数据
  // const handlePlatformChange = (platform: string) => {
  //   setProgrammingLanguage(platform);
  //   setPagination(prev => ({ ...prev, pageNum: 1 }));
  // };

  // 处理Star按钮点击
  const handleStarClick = async (agentId: string, isStarred: boolean) => {
    if (starLoading.has(agentId)) return; // 防止重复点击

    setStarLoading((prev) => new Set(prev).add(agentId));

    try {
      let response;
      if (isStarred) {
        response = await agentService.unstarAgent(agentId);
      } else {
        response = await agentService.starAgent(agentId);
      }

      if (response.success) {
        // 更新本地状态
        setAgents((prev) =>
          prev.map((agent) =>
            agent.id === agentId
              ? {
                  ...agent,
                  isStarred: !isStarred,
                  stars: isStarred ? agent.stars - 1 : agent.stars + 1,
                }
              : agent
          )
        );
      }
    } catch (err) {
      console.error('Star操作失败:', err);
    } finally {
      setStarLoading((prev) => {
        const newSet = new Set(prev);
        newSet.delete(agentId);
        return newSet;
      });
    }
  };

  // 处理Agent卡片点击
  const handleAgentClick = (agent: any) => {
    if (agent.authorName && agent.name) {
      navigate(`/${agent.authorName}/${agent.name}`);
    } else if (agent.id) {
      navigate(`/agent/${agent.id}`); // Fallback
    }
  };

  return (
    <MainLayout>
      <div className="trending-page">
        {/* 导航栏 */}
        <ExploreNav
          align="left"
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* 页面标题和描述 */}
        <TrendingHeader type="repositories" />

        {/* 内容卡片容器 */}
        <div className="repositories-content-card">
          {/* 过滤器区域 */}
          <div className="repositories-filters">
            <div className="content-type-tabs">
              {/* <button
                className={`content-type-tab ${contentType === 'repositories' ? 'active' : ''}`}
                onClick={() => handleContentTypeChange('repositories')}
              >
                Agents
              </button> */}
              {/* <button
                className={`content-type-tab ${contentType === 'developers' ? 'active' : ''}`}
                onClick={() => handleContentTypeChange('developers')}
              >
                Developers
              </button> */}
              <p
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: 0,
                }}
              >
                <FireOutlined style={{ marginRight: 8 }} />
                今日热门 Agent
              </p>
            </div>

            {/* <div className="filter-dropdowns">
              <div className="filter-dropdown">
                <span className="filter-label">语音语言：</span>
                <select
                  value={spokenLanguage}
                  onChange={(e) => setSpokenLanguage(e.target.value)}
                  className="filter-select"
                >
                  <option value="any">全部</option>
                  <option value="english">English</option>
                  <option value="chinese">Chinese</option>
                  <option value="spanish">Spanish</option>
                </select>
                <DownOutlined className="dropdown-icon" />
              </div>

              <div className="filter-dropdown">
                <span className="filter-label">平台：</span>
                <select
                  value={programmingLanguage}
                  onChange={(e) => handlePlatformChange(e.target.value)}
                  className="filter-select"
                >
                  <option value="any">全部</option>
                  <option value="LITE_AGENT">LiteAgent</option>
                  <option value="DIFY">Dify</option>
                  <option value="COZE">Coze</option>
                </select>
                <DownOutlined className="dropdown-icon" />
              </div>

              <div className="filter-dropdown">
                <span className="filter-label">时间范围：</span>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="filter-select"
                >
                  <option value="today">今天</option>
                  <option value="week">本周</option>
                  <option value="month">本月</option>
                </select>
                <DownOutlined className="dropdown-icon" />
              </div>
            </div> */}
          </div>

          {/* 仓库列表 */}
          <div className="repositories-list">
            {loading ? (
              <div className="p-6 text-center text-gray-500">加载中...</div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">
                {error}
                <button
                  onClick={fetchTrendingAgents}
                  className="ml-2 text-blue-600 hover:underline"
                >
                  重试
                </button>
              </div>
            ) : agents.length === 0 ? (
              <div className="p-6 text-center text-gray-500">暂无热门Agent</div>
            ) : (
              agents.map((repo) => (
                <div
                  key={repo.id}
                  className="repository-card cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  onClick={() => handleAgentClick(repo)}
                >
                  <div className="repository-main">
                    <div className="repository-info">
                      <h3 className="repository-name">
                        {repo.authorName + '/' + repo.name}
                      </h3>
                      <p className="repository-description">
                        {repo.description}
                      </p>
                      <div className="repository-meta">
                        <div className="language-info">
                          <span
                            className="language-dot"
                            style={{ backgroundColor: repo.languageColor }}
                          ></span>
                          <span className="language-name">{repo.language}</span>
                        </div>
                        <div className="stats">
                          <span className="stat-item">
                            <StarOutlined className="stat-icon" />
                            {repo.stars.toLocaleString()}
                          </span>
                          <span className="stat-item">
                            <svg
                              className="stat-icon"
                              viewBox="0 0 16 16"
                              width="16"
                              height="16"
                            >
                              <path
                                fill="currentColor"
                                d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"
                              />
                            </svg>
                            {repo.forks.toLocaleString()}
                          </span>
                        </div>
                        <div className="built-by">
                          {/* <span className="built-by-label">贡献者</span>
                          <div className="contributors">
                            {repo.builtBy.map(
                              (contributor: any, index: number) => (
                                <div key={index} className="contributor-avatar">
                                  {contributor.avatar}
                                </div>
                              )
                            )}
                          </div> */}
                        </div>
                      </div>
                    </div>
                    <div className="repository-actions">
                      <button
                        className={`star-button ${repo.isStarred ? 'starred' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStarClick(repo.id, repo.isStarred);
                        }}
                        disabled={starLoading.has(repo.id)}
                      >
                        <StarOutlined
                          className={repo.isStarred ? 'text-yellow-500' : ''}
                        />
                        {starLoading.has(repo.id)
                          ? '处理中'
                          : repo.isStarred
                            ? '已收藏'
                            : '收藏'}
                        <DownOutlined className="star-dropdown-icon" />
                      </button>
                      {/* <div className="stars-today">
                        {repo.starsToday} stars today
                      </div> */}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Trending;
