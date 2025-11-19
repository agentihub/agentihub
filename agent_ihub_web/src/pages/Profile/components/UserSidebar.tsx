import React from 'react';
import { DefaultAvatar } from '@/components';
import type { UserDTO, UserStatsDTO } from '../../../api/types.gen';
import { useNavigate } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import {
  followUserMutation,
  unfollowUserMutation,
} from '@/api/@tanstack/query.gen';

interface UserSidebarProps {
  profile: UserDTO;
  stats?: UserStatsDTO | null;
  isOwnProfile: boolean;
  refetchProfile: () => void;
}

const UserSidebar: React.FC<UserSidebarProps> = ({
  profile,
  stats,
  isOwnProfile,
  refetchProfile,
}) => {
  const { message } = App.useApp();
  const displayName = profile.nickName
    ? `${profile.nickName} (${profile.userName})`
    : profile.userName;
  const followerCount = stats?.followerCount || 0;
  const followingCount = stats?.followingCount || 0;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Follow mutation
  const followMutation = useMutation({
    ...followUserMutation,
    onSuccess: () => {
      message.success('关注成功');
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({
        queryKey: [{ scope: 'getUserFollowing' }],
      });
      queryClient.invalidateQueries({
        queryKey: [{ scope: 'getUserFollowers' }],
      });
      queryClient.invalidateQueries({
        queryKey: [{ scope: 'getUserProfileByUsername' }],
      });
      queryClient.invalidateQueries({
        queryKey: [{ scope: 'getUserStats' }],
      });
      refetchProfile();
    },
    onError: () => {
      message.error('关注失败，请稍后重试');
    },
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    ...unfollowUserMutation,
    onSuccess: () => {
      message.success('已取消关注');
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({
        queryKey: [{ scope: 'getUserFollowing' }],
      });
      queryClient.invalidateQueries({
        queryKey: [{ scope: 'getUserFollowers' }],
      });
      queryClient.invalidateQueries({
        queryKey: [{ scope: 'getUserProfileByUsername' }],
      });
      queryClient.invalidateQueries({
        queryKey: [{ scope: 'getUserStats' }],
      });
      refetchProfile();
    },
    onError: () => {
      message.error('取消关注失败，请稍后重试');
    },
  });

  const handleFollow = (userId: string, isFollowing: boolean) => {
    if (isFollowing) {
      unfollowMutation.mutate({
        query: { userId },
      });
    } else {
      followMutation.mutate({
        query: { userId },
      });
    }
  };

  const isLoading = followMutation.isPending || unfollowMutation.isPending;

  return (
    <div className="w-full flex flex-col gap-4 py-4">
      {/* 用户头像 */}
      <div className="relative">
        {profile.avatar ? (
          <img
            src={profile.avatar}
            alt={displayName}
            className="w-full max-w-[300px] aspect-square rounded-full border-[1px] border-white/15 shadow-[0_0_0_1px_rgba(255,255,255,0.15)] object-cover"
          />
        ) : (
          <DefaultAvatar
            alt={displayName}
            className="w-full aspect-square rounded-full"
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </div>

      {/* 用户名和基本信息 */}
      <div className="flex flex-col gap-0.5">
        <div className="flex flex-col">
          <h1 className="text-[24px] font-semibold leading-[1.25] text-[#1f2328]">
            {displayName}
          </h1>
        </div>
      </div>

      {!isOwnProfile && (
        <button
          className="w-full py-[5.73px] px-4 bg-[#f6f8fa] border-[1px] border-[#d1d9e0] rounded-md text-[13.78px] font-semibold text-[#1f2328] hover:bg-[#e6eaef] hover:border-[#d1d9e0] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => handleFollow(profile.id, profile.following!)}
          disabled={isLoading}
        >
          {isLoading ? '处理中...' : profile.following! ? 'Unfollow' : 'Follow'}
        </button>
      )}

      {/* 关注信息 */}
      <div className="flex items-center gap-1 text-sm">
        <div className="flex items-center gap-[3.84px]">
          <UserOutlined />
          <span
            className="font-semibold text-[13.89px] leading-[1.5118] text-[#1f2328] cursor-pointer hover:text-[#0969da]"
            onClick={() => navigate(`/${profile.userName}?tab=followers`)}
          >
            {followerCount} followers
          </span>
        </div>
        <span className="text-[14px] leading-[1.5] text-[#1f2328]">· </span>
        <span
          className="font-semibold text-[14px] leading-[1.5] text-[#1f2328] cursor-pointer hover:text-[#0969da]"
          onClick={() => navigate(`/${profile.userName}?tab=following`)}
        >
          {followingCount} following
        </span>
      </div>
    </div>
  );
};

export default UserSidebar;
