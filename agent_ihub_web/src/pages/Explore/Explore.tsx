import React, { useState, useEffect } from 'react';
import { Spin, Alert, Empty, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { MainLayout, ExploreNav, DefaultAvatar } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { agentService } from '../../services';
import type { AgentDTO } from '../../api/types.gen';
import {
  FireOutlined,
  // UserOutlined,
  // FolderOutlined,
  RobotOutlined,
  StarOutlined,
} from '@ant-design/icons';
import './Explore.css';

// 热门开发者数据
// const trendingDevelopers = [
//   {
//     id: 1,
//     name: 'Alice Zhang',
//     avatar: 'A',
//     repo: 'ai-agent-toolkit',
//   },
//   {
//     id: 2,
//     name: 'Bob Chen',
//     avatar: 'B',
//     repo: 'multi-agent-framework',
//   },
//   {
//     id: 3,
//     name: 'Chris Wang',
//     avatar: 'C',
//     repo: 'langchain-agents',
//   },
// ];

const Explore: React.FC = () => {
  const { user } = useAuth();

  // 导航标签状态
  const [activeTab, setActiveTab] = useState('explore');

  // 热门 Agents 数据状态
  const [trendingAgentsData, setTrendingAgentsData] = useState<AgentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 右侧栏热门 Agents 数据状态
  const [rightSidebarTrendingAgents, setRightSidebarTrendingAgents] = useState<
    AgentDTO[]
  >([]);
  const [rightSidebarLoading, setRightSidebarLoading] = useState(true);
  const [rightSidebarError, setRightSidebarError] = useState<string | null>(
    null
  );

  // 用户收藏的 Agents 数量状态
  const [starredAgentsCount, setStarredAgentsCount] = useState<number>(0);

  // 导航功能
  const navigate = useNavigate();

  // 处理导航标签切换
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'trending') {
      navigate('/trending');
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

  // 获取热门 Agents 数据
  useEffect(() => {
    const fetchTrendingAgents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await agentService.getTrendingAgents({
          pageNum: 1,
          pageSize: 20,
        });
        if (response.success && response.data) {
          setTrendingAgentsData(response.data.contentData || []);
        } else {
          setError(response.message || '获取数据失败');
        }
      } catch (err) {
        console.error('Failed to fetch trending agents:', err);
        setError('获取热门 Agents 失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingAgents();
  }, []);

  // 获取右侧栏热门 Agents 数据
  useEffect(() => {
    const fetchRightSidebarTrendingAgents = async () => {
      try {
        setRightSidebarLoading(true);
        setRightSidebarError(null);
        const response = await agentService.getTrendingAgents({
          pageNum: 1,
          pageSize: 5,
        });
        if (response.success && response.data) {
          setRightSidebarTrendingAgents(response.data.contentData || []);
        } else {
          setRightSidebarError(response.message || '获取数据失败');
        }
      } catch (err) {
        console.error('Failed to fetch right sidebar trending agents:', err);
        setRightSidebarError('获取热门 Agents 失败，请稍后重试');
      } finally {
        setRightSidebarLoading(false);
      }
    };

    fetchRightSidebarTrendingAgents();
  }, []);

  // 获取用户收藏的 Agents 数量
  useEffect(() => {
    const fetchStarredAgentsCount = async () => {
      if (!user?.id) {
        return;
      }
      try {
        const response = await agentService.getStarredAgents({
          userId: user.id,
          pageNum: 1,
          pageSize: 1,
        });
        if (response.success && response.data) {
          setStarredAgentsCount(response.data.totalSize || 0);
        }
      } catch (err) {
        console.error('Failed to fetch starred agents count:', err);
        // 静默处理错误，保持默认值0
      }
    };

    fetchStarredAgentsCount();
  }, [user?.id]);

  // Agent 点击处理
  const handleAgentClick = (agent: AgentDTO) => {
    if (agent.authorName && agent.name) {
      navigate(`/${agent.authorName}/${agent.name}`);
    } else if (agent.id) {
      navigate(`/agent/${agent.id}`); // Fallback to old route
    }
  };

  // Platform字段到显示文本的映射函数
  const getPlatformDisplayText = (platform: string) => {
    switch (platform) {
      case 'LITE_AGENT':
        return 'LiteAgent';
      case 'DIFY':
        return 'Dify';
      case 'COZE':
        return 'Coze';
      default:
        return platform;
    }
  };

  return (
    <MainLayout>
      <div className="search-page">
        {/* 导航栏 */}
        <ExploreNav
          align="center"
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* 三栏内容布局 */}
        <div className="explore-content">
          {/* 左侧栏：用户信息区 */}
          <div className="e-left-sidebar">
            <div className="user-card">
              <div className="left-user-avatar">
                <div
                  className="avatar-circle"
                  style={
                    user?.avatar ? { background: 'transparent' } : undefined
                  }
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.userName || 'avatar'}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        backgroundColor: 'transparent',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <DefaultAvatar
                      size={100}
                      alt={user?.userName || 'avatar'}
                    />
                  )}
                </div>
              </div>
              <div className="user-name">{user?.userName || '游客'}</div>
              <div className="user-stats">
                {/* <div className="stat-item">
                  <a className="stat-label">0 个已收藏主题</a>
                </div> */}
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <a
                    href={`/${user?.userName}?tab=stars`}
                    className="stat-label"
                  >
                    已收藏 {starredAgentsCount} 个 Agent
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 中间区域：推荐内容 */}
          <div className="center-content">
            <p className="center-content-title">以下是根据你的兴趣找到的内容</p>

            {/* Loading 状态 */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" tip="加载中..." />
              </div>
            )}

            {/* Error 状态 */}
            {!loading && error && (
              <Alert
                message="加载失败"
                description={error}
                type="error"
                showIcon
                closable
                onClose={() => setError(null)}
                style={{ marginBottom: 16 }}
              />
            )}

            {/* Empty 状态 */}
            {!loading && !error && trendingAgentsData.length === 0 && (
              <Empty
                description="暂无热门 Agents"
                style={{ padding: '40px 0' }}
              />
            )}

            {/* Agent 列表 */}
            {!loading && !error && trendingAgentsData.length > 0 && (
              <>
                {trendingAgentsData.map((agent) => (
                  <div
                    key={agent.id}
                    className="content-card"
                    onClick={() => handleAgentClick(agent)}
                    style={{ cursor: 'pointer' }}
                  >
                    <h4 className="repo-name">{agent.name}</h4>
                    <p className="repo-desc">
                      {agent.description || '暂无描述'}
                    </p>
                    <div className="repo-tags">
                      {agent.platform && (
                        <Tag color="blue">{agent.platform}</Tag>
                      )}
                      {agent.tags?.slice(0, 3).map((tag, index) => (
                        <Tag key={index}>{tag}</Tag>
                      ))}
                      {agent.stars !== undefined && (
                        <span className="repo-stars">⭐ {agent.stars}</span>
                      )}
                      {agent.forks !== undefined && (
                        <span className="repo-stars" style={{ marginLeft: 8 }}>
                          🔀 {agent.forks}
                        </span>
                      )}
                    </div>
                    {agent.authorName && (
                      <p
                        className="repo-author"
                        style={{
                          marginTop: 8,
                          fontSize: 12,
                          color: '#666',
                        }}
                      >
                        作者：{agent.authorName}
                      </p>
                    )}
                  </div>
                ))}

                <p className="center-content-footer">
                  当前暂时为你找到这些内容。
                </p>
              </>
            )}
          </div>

          {/* 右侧栏：热门资源 */}
          <div className="e-right-sidebar">
            <div className="trending-card">
              <h3 className="trending-card-title">
                <FireOutlined /> 今日热门 Agent
              </h3>
              <div className="trending-list">
                {rightSidebarLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Spin size="small" tip="加载中..." />
                  </div>
                ) : rightSidebarError ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '20px 0',
                      color: '#999',
                    }}
                  >
                    {rightSidebarError}
                  </div>
                ) : rightSidebarTrendingAgents.length > 0 ? (
                  <>
                    {(rightSidebarTrendingAgents.length > 3
                      ? rightSidebarTrendingAgents.slice(0, 3)
                      : rightSidebarTrendingAgents
                    ).map((agent) => (
                      <div
                        key={agent.id}
                        className="trending-item"
                        onClick={() => handleAgentClick(agent)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="trending-name-container">
                          <RobotOutlined className="trending-agent-icon" />
                          <h4 className="trending-name-text">{agent.name}</h4>
                          <span className="trending-stars">
                            <StarOutlined /> {agent.stars || 0}
                          </span>
                        </div>
                        <p className="trending-desc">
                          {agent.description || '暂无描述'}
                        </p>
                        <span className="trending-lang">
                          {getPlatformDisplayText(agent.platform)}
                        </span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '20px 0',
                      color: '#999',
                    }}
                  >
                    暂无热门 Agents
                  </div>
                )}
                {/* See more trending agents 链接 - 不受接口影响，始终显示 */}
                <div className="trending-item">
                  <a href="/trending" className="trending-more-link">
                    查看更多热门 Agent →
                  </a>
                </div>
              </div>
            </div>

            {/* See more trending developers 链接 - 不受接口影响，始终显示 */}
            {/* <div className="trending-card">
              <h3 className="trending-card-title">
                <UserOutlined /> 热门开发者
              </h3>
              <div className="developer-list">
                {trendingDevelopers.map((developer) => (
                  <div key={developer.id} className="developer-item">
                    <div className="developer-avatar">
                      <div className="dev-avatar-circle">
                        {developer.avatar}
                      </div>
                    </div>
                    <div className="developer-info">
                      <h4 className="developer-name">{developer.name}</h4>
                      <p className="developer-repo">
                        <FolderOutlined className="repo-icon" />
                        {developer.repo}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="developer-item">
                  <a href="/trending/developers" className="trending-more-link">
                    查看更多热门开发者 →
                  </a>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Explore;
