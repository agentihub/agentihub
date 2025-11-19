import React, { useCallback, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Layout, Typography, Card, Button, Space, Empty, App } from 'antd';
import { UserOutlined, DesktopOutlined } from '@ant-design/icons';
import Sidebar from './Sidebar';
import { userService } from '../../../services/userService';
import { DefaultAvatar } from '@/components';

const { Text } = Typography;
const { Content, Sider } = Layout;

interface UserSearchProps {
  searchQuery?: string;
  onTotalChange?: (total: number) => void;
  usersData?: any[];
  loading?: boolean;
}

const UserSearch: React.FC<UserSearchProps> = ({
  onTotalChange,
  usersData,
}) => {
  const { message } = App.useApp();
  // const navigate = useNavigate();
  const [followLoading, setFollowLoading] = useState<Set<string>>(new Set());

  // 仅使用真实数据
  const displayData = Array.isArray(usersData) ? usersData : [];

  const formatNumber = (value: unknown): string => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value.toLocaleString();
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed.toLocaleString() : '0';
  };

  // 通知父组件总数变化
  const totalCount = Array.isArray(displayData) ? displayData.length : 0;
  React.useEffect(() => {
    if (onTotalChange) {
      console.log('UserSearch: 通知父组件用户总数:', totalCount);
      onTotalChange(totalCount);
    }
  }, [onTotalChange, totalCount]);

  // // 用户点击处理
  // const handleUserClick = useCallback(
  //   (_id: string, userName: string) => {
  //     navigate(`/users/${userName}`);
  //   },
  //   [navigate]
  // );

  // Follow处理
  const handleFollow = useCallback(
    async (user: any) => {
      const userId = user.id;
      const isCurrentlyFollowing = user.following || false;

      // 防止重复点击
      if (followLoading.has(userId)) return;

      setFollowLoading((prev) => new Set(prev).add(userId));

      try {
        if (isCurrentlyFollowing) {
          // 取消关注
          await userService.unfollowUser(userId);
          // 更新本地数据状态
          user.following = false;
        } else {
          // 关注
          await userService.followUser(userId);
          // 更新本地数据状态
          user.following = true;
        }
      } catch (error) {
        console.error('Follow operation failed:', error);
        message.error(isCurrentlyFollowing ? '取消关注失败' : '关注失败');
      } finally {
        setFollowLoading((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    },
    [followLoading]
  );

  // Sponsor处理
  // const handleSponsor = useCallback((id: string) => {
  //   console.log('Sponsor user:', id);
  // }, []);

  // 自定义用户搜索结果卡片组件
  const UserResultCard: React.FC<{
    user: {
      id: string;
      name: string;
      userName: string;
      description: string;
      location: string;
      repositories: number;
      followers: number;
      avatar: string;
      following: boolean;
    };
  }> = ({ user }) => {
    return (
      <Card
        // hoverable
        className="mb-4 border border-gray-300 rounded-lg"
        bodyStyle={{ padding: '16px' }}
      >
        <div className="flex items-start gap-4">
          {/* 头像 */}
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.userName || 'user'}
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                objectFit: 'cover',
                backgroundColor: 'transparent',
                display: 'block',
              }}
              className="flex-shrink-0"
            />
          ) : (
            <DefaultAvatar
              size={48}
              alt={user.userName || 'user'}
              className="flex-shrink-0"
            />
          )}

          {/* 内容区域 */}
          <div className="flex-1 min-w-0">
            {/* 标题和操作按钮 */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <Text
                  strong
                  className="text-base text-blue-500 font-semibold block mb-0.5"
                >
                  {user.name}
                </Text>
                <a
                  href={`/${user.userName}`}
                  type="secondary"
                  className="text-sm block"
                >
                  {user.userName}
                </a>
              </div>
              <div className="flex gap-2 items-center">
                <Button
                  type="text"
                  size="small"
                  loading={followLoading.has(user.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFollow(user);
                  }}
                  className="border border-gray-300 rounded bg-gray-100"
                >
                  {user.following ? '取消关注' : '关注'}
                </Button>
                {/* <Button
                  type="text"
                  size="small"
                  icon={<HeartOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSponsor(user.id);
                  }}
                  className="border border-gray-300 rounded bg-gray-100 text-red-500 hover:text-red-400"
                >
                  Sponsor
                </Button> */}
              </div>
            </div>

            {/* 描述 */}
            <div className="mb-2">
              <Text
                type="secondary"
                className="text-sm text-gray-800 leading-relaxed"
              >
                {user.description}
              </Text>
            </div>

            {/* 位置 */}
            <div className="mb-3">
              <Text type="secondary" className="text-xs text-gray-600">
                {user.location}
              </Text>
            </div>

            {/* 统计信息 */}
            <div className="flex items-center">
              <Space size={16}>
                <Space size={4}>
                  <DesktopOutlined className="text-gray-500 text-sm" />
                  <Text type="secondary" className="text-xs text-gray-600">
                    {user.repositories}
                  </Text>
                </Space>
                <Space size={4}>
                  <UserOutlined className="text-gray-500 text-sm" />
                  <Text type="secondary" className="text-xs text-gray-600">
                    {formatNumber(user.followers)}
                  </Text>
                </Space>
              </Space>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="p-4 md:p-4 sm:p-3 lg:p-0">
      {/* 顶部结果统计 */}
      <div className="flex justify-between items-center mb-4 py-3 border-b border-gray-200">
        <div>
          <Text type="secondary" className="text-black text-xl font-bold">
            {totalCount} 个结果
          </Text>
        </div>
      </div>

      {/* 主内容区域 */}
      <Layout className="bg-transparent">
        <Content className="pr-6 md:pr-0 mr-3" style={{ flex: '0 0 65%' }}>
          {/* 用户列表 */}
          <div>
            {displayData.length === 0 ? (
              <div className="py-12">
                <Empty description="暂未搜到任何相关用户" />
              </div>
            ) : (
              (Array.isArray(displayData) ? displayData : []).map((user) => (
                <div
                  key={user.id}
                  // onClick={() => handleUserClick(user.id, user.userName)}
                  className="cursor-pointer"
                >
                  <UserResultCard user={user} />
                </div>
              ))
            )}
          </div>
        </Content>

        {/* 右侧边栏 */}
        <Sider
          width="35%"
          className="bg-transparent lg:block hidden"
          breakpoint="lg"
          collapsedWidth={0}
        >
          <Sidebar />
        </Sider>
      </Layout>
    </div>
  );
};

export default UserSearch;
