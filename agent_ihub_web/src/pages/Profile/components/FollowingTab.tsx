import React, { useState, useMemo } from 'react';
import { Empty, Spin, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getUserFollowingOptions } from '@/api/@tanstack/query.gen';
import type { UserDTO } from '@/api/types.gen';
import UserCard from './UserCard';
import EmptyState from './EmptyState';

interface FollowingTabProps {
  userId: string;
  isOwnProfile?: boolean;
}

const FollowingTab: React.FC<FollowingTabProps> = ({
  userId,
  isOwnProfile = false,
}) => {
  const [pageNum] = useState(1);
  const pageSize = 20;
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: followingResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    ...getUserFollowingOptions({
      query: {
        userId,
        pageNum,
        pageSize,
      },
    }),
    enabled: !!userId,
  });

  const following = useMemo(
    () => followingResponse?.data?.contentData || [],
    [followingResponse]
  );

  const filteredFollowing = useMemo(() => {
    if (!searchQuery.trim()) return following;
    const q = searchQuery.toLowerCase();
    return following.filter((user: UserDTO) => {
      const u: any = user as any;
      const userName = (u.userName || '').toLowerCase();
      const nickname = (
        u.nickname ||
        u.name ||
        u.displayName ||
        ''
      ).toLowerCase();
      return userName.includes(q) || nickname.includes(q);
    });
  }, [following, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 w-full">
        <Empty description="加载失败，请稍后重试" />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full">
      {/* Header: title + count + search */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-[#1f2328] text-[15.75px] font-semibold">
          关注 ({following.length})
        </div>
        <Input
          allowClear
          placeholder="搜索关注用户昵称/用户名..."
          prefix={<SearchOutlined />}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: 440, height: 32 }}
          size="middle"
        />
      </div>

      {filteredFollowing.length === 0 ? (
        searchQuery ? (
          <div className="py-20">
            <Empty description="未找到匹配的用户" />
          </div>
        ) : (
          <EmptyState type="no-following" isOwnProfile={isOwnProfile} />
        )
      ) : (
        <div className="space-y-4">
          {filteredFollowing.map((user: UserDTO) => (
            <UserCard
              key={user.id}
              user={user}
              isFollowing={user.following!}
              onFollowChange={refetch}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowingTab;
