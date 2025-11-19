import React from 'react';
import { Avatar, Button, Empty, Skeleton, App } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import type { AgentDTO, UserDTO } from '@/api/types.gen';
import { getAgentStarUsers } from '@/api';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/userService';

interface OutletContext {
  agentData: AgentDTO;
}

interface StargazerItemProps {
  user: UserDTO;
  isFollowing: boolean;
  isSelf: boolean;
  loading: boolean;
  onToggleFollow: () => void;
}

const formatJoinDate = (date?: Date) => {
  if (!date) return '';
  try {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (_error) {
    return '';
  }
};

const StargazerItem: React.FC<StargazerItemProps> = ({
  user,
  isFollowing,
  isSelf,
  loading,
  onToggleFollow,
}) => {
  const avatarUrl = user.avatar;
  const joinDate = formatJoinDate(user.createTime);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-5 border-b border-gray-200 gap-6 px-6">
      <div className="flex items-center gap-5 min-w-0">
        <Avatar size={76} src={avatarUrl}>
          {user.userName?.charAt(0)?.toUpperCase()}
        </Avatar>
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-3">
            <a
              className="text-xl font-semibold text-[#0969DA] truncate"
              href={`/${user.userName ?? ''}`}
              target="_blank"
              rel="noreferrer"
            >
              {user.userName || 'anonymous'}
            </a>
            {user.nickName && (
              <span className="text-base text-gray-500 truncate">
                {user.nickName}
              </span>
            )}
          </div>
          {joinDate && (
            <div className="text-base flex items-center gap-2">
              <ClockCircleOutlined />
              Joined on {joinDate}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {!isSelf && user.id && (
          <Button
            type={isFollowing ? 'default' : 'primary'}
            size="large"
            loading={loading}
            onClick={onToggleFollow}
          >
            {isFollowing ? '取消关注' : '关注'}
          </Button>
        )}
      </div>
    </div>
  );
};

const AgentStargazers: React.FC = () => {
  const { agentData } = useOutletContext<OutletContext>();
  const { message } = App.useApp();
  const { agentname } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [loading, setLoading] = React.useState(false);
  const [users, setUsers] = React.useState<UserDTO[]>([]);
  const [pageNum, setPageNum] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [togglingIds, setTogglingIds] = React.useState<Set<string>>(
    () => new Set()
  );
  const pageSize = 30;

  const loadUsers = React.useCallback(
    async (page: number, append = false) => {
      if (!agentData?.id) return;
      try {
        setLoading(true);
        const res = await getAgentStarUsers({
          query: {
            agentId: agentData.id,
            pageNum: page,
            pageSize,
          },
        });

        const list = res.data?.data?.contentData ?? [];
        const totalSize = res.data?.data?.totalSize;
        setUsers((prev) => (append ? [...prev, ...list] : list));
        setPageNum(page);
        setTotal((prev) => {
          if (typeof totalSize === 'number') return totalSize;
          return append ? prev + list.length : list.length;
        });
      } catch (error) {
        console.error(error);
        message.error('获取收藏用户列表失败');
      } finally {
        setLoading(false);
      }
    },
    [agentData?.id, pageSize, message]
  );

  React.useEffect(() => {
    loadUsers(1, false);
  }, [loadUsers]);

  const handleToggleFollow = React.useCallback(
    async (targetUser: UserDTO) => {
      const userId = targetUser.id;
      if (!userId) {
        return;
      }

      if (togglingIds.has(userId)) {
        return;
      }

      if (!currentUser) {
        message.warning('请先登录');
        navigate('/login');
        return;
      }

      if (currentUser.id === userId) {
        return;
      }

      const nextSet = new Set(togglingIds);
      nextSet.add(userId);
      setTogglingIds(nextSet);

      const isFollowing = Boolean(targetUser.following);

      try {
        if (isFollowing) {
          const res = await userService.unfollowUser(userId);
          if (res.success) {
            setUsers((prev) =>
              prev.map((item) =>
                item.id === userId ? { ...item, following: false } : item
              )
            );
          } else {
            message.error(res.message ?? '取消关注失败');
          }
        } else {
          const res = await userService.followUser(userId);
          if (res.success) {
            setUsers((prev) =>
              prev.map((item) =>
                item.id === userId ? { ...item, following: true } : item
              )
            );
          } else {
            message.error(res.message ?? '关注失败');
          }
        }
      } catch (error) {
        console.error(error);
        message.error('操作失败，请稍后重试');
      } finally {
        setTogglingIds((prev) => {
          const updated = new Set(prev);
          updated.delete(userId);
          return updated;
        });
      }
    },
    [currentUser, message, navigate, togglingIds]
  );

  const handleLoadMore = () => {
    if (users.length >= total) return;
    loadUsers(pageNum + 1, true);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Stargazers</h1>
            <p className="text-sm text-gray-500 mt-1">
              {total > 0 ? (
                <>
                  {total.toLocaleString()} 个人收藏了{' '}
                  <span className="text-[#0969DA] font-medium">
                    {agentname ?? 'this agent'}
                  </span>
                </>
              ) : (
                '暂无收藏用户'
              )}
            </p>
          </div>
          {/* <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1 rounded-full border border-gray-300 bg-white">
              All
            </span>
            <span className="px-3 py-1 rounded-full border border-gray-200 text-gray-400">
              You know
            </span>
          </div> */}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {loading && users.length === 0 ? (
            <div className="p-6">
              <Skeleton active title={false} paragraph={{ rows: 6 }} />
            </div>
          ) : users.length === 0 ? (
            <Empty className="my-10" description="暂无收藏用户" />
          ) : (
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <StargazerItem
                  key={user.id}
                  user={user}
                  isFollowing={Boolean(user.following)}
                  isSelf={currentUser?.id === user.id}
                  loading={togglingIds.has(user.id)}
                  onToggleFollow={() => {
                    void handleToggleFollow(user);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {users.length < total && (
          <div className="mt-6 text-center">
            <Button onClick={handleLoadMore} loading={loading}>
              加载更多
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentStargazers;
