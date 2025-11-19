import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Spin, Alert } from 'antd';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '../../components/Layout/MainLayout';
import UserSidebar from './components/UserSidebar';
import { type NavItem } from '../../components/Layout/Navs';
import OverviewTab from './components/OverviewTab';
import AgentsTab from './components/AgentsTab';
import StarsTab from './components/StarsTab';
import FollowersTab from './components/FollowersTab';
import FollowingTab from './components/FollowingTab';
import { ProfileTabType } from '../../types/profile';
import { useAuth } from '../../context/AuthContext';
import {
  getUserProfileByUsernameOptions,
  getUserStatsOptions,
} from '@/api/@tanstack/query.gen';
import { PersonIcon, StarIcon } from '@primer/octicons-react';
import { RobotOutlined } from '@ant-design/icons';

const Profile: React.FC = () => {
  const { userName } = useParams<{ userName: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: currentUser } = useAuth();

  // 从 URL 读取 tab 参数，默认为 overview
  const tabParam = searchParams.get('tab') || ProfileTabType.OVERVIEW;
  const activeTab = Object.values(ProfileTabType).includes(
    tabParam as ProfileTabType
  )
    ? (tabParam as ProfileTabType)
    : ProfileTabType.OVERVIEW;

  const isOwnProfile = currentUser?.userName === userName;
  const {
    data: profileResponse,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    ...getUserProfileByUsernameOptions({
      query: { userName: userName || '' },
    }),
    enabled: !!userName,
  });
  const profile = profileResponse?.data;

  const { data: statsResponse, refetch: refetchStats } = useQuery({
    ...getUserStatsOptions({
      query: { userId: profile?.id || '', allAgent: isOwnProfile },
    }),
    enabled: !!profile?.id,
  });

  // 从响应包装器中提取实际的统计数据
  const stats = statsResponse?.data;
  const loading = profileLoading;
  const error = profileError
    ? '加载用户信息失败，请稍后重试'
    : !userName
      ? '用户名不能为空'
      : null;

  const refetch = () => {
    refetchProfile();
    refetchStats();
  };

  const navItems: NavItem[] = [
    { key: ProfileTabType.OVERVIEW, label: 'Overview', icon: PersonIcon },
    {
      key: ProfileTabType.AGENTS,
      label: 'Agents',
      icon: RobotOutlined,
      count: stats?.agentCount || 0,
    },
    {
      key: ProfileTabType.STARS,
      label: 'Stars',
      icon: StarIcon,
      count: stats?.starCount || 0,
    },
  ];

  // 处理 Tab 切换
  const handleTabChange = (tab: string) => {
    if (tab === ProfileTabType.OVERVIEW) {
      // overview 是默认 tab，不需要在 URL 中显示
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  // 加载中状态
  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Spin size="large" tip="加载中..." />
        </div>
      </MainLayout>
    );
  }

  // 错误状态
  if (error || !profile) {
    return (
      <MainLayout>
        <div className="max-w-[1280px] mx-auto px-4 py-8">
          <Alert
            message="加载失败"
            description={error || '未能加载用户信息'}
            type="error"
            showIcon
          />
        </div>
      </MainLayout>
    );
  }

  console.log(activeTab);
  return (
    <MainLayout
      localBar={{
        activeTab: activeTab,
        onTabChange: handleTabChange,
        navItems: navItems,
      }}
    >
      <div className="bg-[#ffffff] min-h-screen">
        {/* 主要内容区 */}
        <div className="max-w-[1280px] mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-6 relative">
            {/* 左侧边栏 */}
            <aside className="w-full lg:w-[296px] flex-shrink-0">
              <UserSidebar
                profile={profile}
                stats={stats}
                isOwnProfile={isOwnProfile}
                refetchProfile={refetch}
              />
            </aside>

            {/* Tab 内容区 */}
            {activeTab === ProfileTabType.OVERVIEW && (
              <OverviewTab userId={profile.id} isOwnProfile={isOwnProfile} />
            )}
            {activeTab === ProfileTabType.AGENTS && (
              <AgentsTab
                userId={profile.id}
                userName={profile.userName || ''}
                isOwnProfile={isOwnProfile}
              />
            )}
            {activeTab === ProfileTabType.STARS && (
              <StarsTab userId={profile.id} isOwnProfile={isOwnProfile} />
            )}
            {activeTab === ProfileTabType.FOLLOWERS && (
              <FollowersTab userId={profile.id} isOwnProfile={isOwnProfile} />
            )}
            {activeTab === ProfileTabType.FOLLOWING && (
              <FollowingTab userId={profile.id} isOwnProfile={isOwnProfile} />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
