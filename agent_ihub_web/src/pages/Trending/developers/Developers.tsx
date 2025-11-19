import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout, ExploreNav } from '../../../components';
import TrendingHeader from '../TrendingHeader';
import { FireOutlined } from '@ant-design/icons';
import './Developers.css';

interface Developer {
  id: number;
  rank: number;
  name: string;
  userName: string;
  avatar: string;
  popularRepo: {
    name: string;
    description: string;
    icon: string;
  };
}

// 开发者假数据数组 - 匹配图片内容
const trendingDevelopers: Developer[] = [
  {
    id: 1,
    rank: 1,
    name: 'Graham Steffaniak',
    userName: 'gtsteffaniak',
    avatar: 'GS',
    popularRepo: {
      name: 'filebrowser',
      description: 'Web File Browser',
      icon: '📁',
    },
  },
  {
    id: 2,
    rank: 2,
    name: 'Luis Novo',
    userName: 'lfnovo',
    avatar: 'LN',
    popularRepo: {
      name: 'open-notebook',
      description:
        'An Open Source implementation of Notebook LM with more flexibility and features',
      icon: '📁',
    },
  },
  {
    id: 3,
    rank: 3,
    name: 'Ido Salomon',
    userName: 'idosalomon',
    avatar: 'IS',
    popularRepo: {
      name: 'awesome-ai-agents',
      description: 'A curated list of AI agents and tools',
      icon: '📁',
    },
  },
  {
    id: 4,
    rank: 4,
    name: 'Sarah Chen',
    userName: 'sarahchen',
    avatar: 'SC',
    popularRepo: {
      name: 'react-ai-components',
      description: 'AI-powered React components library',
      icon: '📁',
    },
  },
  {
    id: 5,
    rank: 5,
    name: 'Mike Johnson',
    userName: 'mikejohnson',
    avatar: 'MJ',
    popularRepo: {
      name: 'ml-pipeline',
      description: 'Machine learning pipeline automation',
      icon: '📁',
    },
  },
];

// 开发者卡片组件
interface DeveloperCardProps {
  developer: Developer;
  onFollow: (developerId: number) => void;
}

const DeveloperCard: React.FC<DeveloperCardProps> = ({
  developer,
  onFollow,
}) => {
  return (
    <div className="developer-card">
      <div className="developer-rank">{developer.rank}</div>

      <div className="developer-info">
        <div className="developer-avatar">
          <div className="avatar-circle">{developer.avatar}</div>
        </div>

        <div className="developer-details">
          <div className="developer-name">
            <a
              href={`https://github.com/${developer.userName}`}
              className="name-link"
            >
              {developer.name}
            </a>
          </div>
          <div className="developer-userName">
            <a
              href={`https://github.com/${developer.userName}`}
              className="userName-link"
            >
              {developer.userName}
            </a>
          </div>
        </div>
      </div>

      <div className="popular-repo">
        <div className="repo-label">
          <FireOutlined className="flame-icon" />
          POPULAR REPO
        </div>
        <div className="repo-info">
          <a
            href={`https://github.com/${developer.userName}/${developer.popularRepo.name}`}
            className="repo-name"
          >
            {developer.popularRepo.name}
          </a>
          <div className="repo-description">
            <span className="repo-icon">{developer.popularRepo.icon}</span>
            {developer.popularRepo.description}
          </div>
        </div>
      </div>

      <div className="developer-actions">
        <button
          className="follow-button"
          onClick={() => onFollow(developer.id)}
        >
          关注
        </button>
      </div>
    </div>
  );
};

const Developers: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('trending');
  const [contentType, setContentType] = useState('developers');
  // const [language, setLanguage] = useState('any');
  // const [dateRange, setDateRange] = useState('today');
  // const [sponsorable, setSponsorable] = useState('all');

  // 开发者数据 - 使用数组存储

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'explore') {
      navigate('/explore');
    } else if (tab === 'topics') {
      console.log('Navigate to topics');
    } else if (tab === 'collections') {
      console.log('Navigate to collections');
    }
  };

  const handleContentTypeChange = (type: string) => {
    setContentType(type);
    if (type === 'repositories') {
      navigate('/trending');
    }
  };

  const handleFollow = (developerId: number) => {
    console.log(`Follow developer ${developerId}`);
    // 这里可以添加关注逻辑
  };

  // 根据过滤器过滤开发者数组
  const filteredDevelopers = trendingDevelopers.filter((_developer) => {
    // 这里可以根据language、dateRange、sponsorable等条件进行过滤
    return true; // 目前返回所有开发者
  });

  return (
    <MainLayout>
      <div className="developers-page">
        {/* 导航栏 */}
        <ExploreNav
          align="left"
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* 页面标题和描述 */}
        <TrendingHeader type="developers" />

        {/* 内容卡片容器 */}
        <div className="developers-content-card">
          {/* 过滤器区域 */}
          <div className="developers-filters">
            <div className="content-type-tabs">
              <button
                className={`content-type-tab ${contentType === 'repositories' ? 'active' : ''}`}
                onClick={() => handleContentTypeChange('repositories')}
              >
                Agents
              </button>
              <button
                className={`content-type-tab ${contentType === 'developers' ? 'active' : ''}`}
                onClick={() => handleContentTypeChange('developers')}
              >
                Developers
              </button>
            </div>

            {/* <div className="filter-dropdowns">
              <div className="filter-dropdown">
                <span className="filter-label">语言：</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="filter-select"
                >
                  <option value="any">全部</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
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

              <div className="filter-dropdown">
                <span className="filter-label">可赞助：</span>
                <select
                  value={sponsorable}
                  onChange={(e) => setSponsorable(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">全部</option>
                  <option value="sponsorable">可赞助</option>
              </select>
                <DownOutlined className="dropdown-icon" />
              </div>
            </div> */}
          </div>

          {/* 开发者列表 - 使用数组map遍历渲染开发者卡片 */}
          <div className="developers-list">
            {filteredDevelopers.map((developer: Developer) => (
              <DeveloperCard
                key={developer.id}
                developer={developer}
                onFollow={handleFollow}
              />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Developers;
