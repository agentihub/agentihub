import React, { useState, useMemo } from 'react';
import { Empty, Spin, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import EmptyState from './EmptyState';
import { useQuery } from '@tanstack/react-query';
import { getUserFollowersOptions } from '@/api/@tanstack/query.gen';
import type { UserDTO } from '@/api/types.gen';
import UserCard from './UserCard';

interface FollowersTabProps {
  userId: string;
  isOwnProfile?: boolean;
}

const FollowersTab: React.FC<FollowersTabProps> = ({
  userId,
  isOwnProfile = false,
}) => {
  const [pageNum] = useState(1);
  const pageSize = 20;
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: followersResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    ...getUserFollowersOptions({
      query: {
        userId,
        pageNum,
        pageSize,
      },
    }),
    enabled: !!userId,
  });

  const followers = useMemo(
    () => followersResponse?.data?.contentData || [],
    [followersResponse]
  );

  const filteredFollowers = useMemo(() => {
    if (!searchQuery.trim()) return followers;
    const q = searchQuery.toLowerCase();
    return followers.filter((user: UserDTO) => {
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
  }, [followers, searchQuery]);

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
          粉丝 ({followers.length})
        </div>
        <Input
          allowClear
          placeholder="搜索粉丝昵称/用户名..."
          prefix={<SearchOutlined />}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: 440, height: 32 }}
          size="middle"
        />
      </div>

      {filteredFollowers.length === 0 ? (
        searchQuery ? (
          <div className="py-20">
            <Empty description="未找到匹配的粉丝" />
          </div>
        ) : (
          <EmptyState type="no-followers" isOwnProfile={isOwnProfile} />
        )
      ) : (
        <div className="space-y-4">
          {filteredFollowers.map((user: UserDTO) => {
            return (
              <UserCard
                key={user.id}
                user={user}
                isFollowing={user.following!}
                onFollowChange={refetch}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FollowersTab;
