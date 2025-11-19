import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, App } from 'antd';
import { DefaultAvatar } from '@/components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserDTO } from '@/api/types.gen';
import {
  followUserMutation,
  unfollowUserMutation,
} from '@/api/@tanstack/query.gen';
import { useAuth } from '@/context/AuthContext';

interface UserCardProps {
  user: UserDTO;
  isFollowing: boolean;
  onFollowChange?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  isFollowing,
  onFollowChange,
}) => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  // Follow mutation
  const followMutation = useMutation({
    ...followUserMutation,
    onSuccess: () => {
      message.success('关注成功');
      queryClient.invalidateQueries({
        queryKey: [{ scope: 'getUserStats' }],
      });
      onFollowChange?.();
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
      queryClient.invalidateQueries({
        queryKey: [{ scope: 'getUserStats' }],
      });
      onFollowChange?.();
    },
    onError: () => {
      message.error('取消关注失败，请稍后重试');
    },
  });

  const handleUserClick = () => {
    if (user.userName) {
      navigate(`/${user.userName}`);
    }
  };

  const handleFollowToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (!currentUser) {
        message.warning('请先登录');
        navigate('/login');
        return;
      }

      if (isFollowing) {
        unfollowMutation.mutate({
          query: { userId: user.id },
        });
      } else {
        followMutation.mutate({
          query: { userId: user.id },
        });
      }
    },
    [
      currentUser,
      isFollowing,
      user.id,
      navigate,
      message,
      followMutation,
      unfollowMutation,
    ]
  );

  const isLoading = followMutation.isPending || unfollowMutation.isPending;

  return (
    <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
      {/* Avatar */}
      <div className="cursor-pointer" onClick={handleUserClick}>
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.userName || 'User'}
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              objectFit: 'cover',
              backgroundColor: 'transparent',
              display: 'block',
            }}
          />
        ) : (
          <DefaultAvatar size={48} alt={user.userName || 'User'} />
        )}
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer"
            onClick={handleUserClick}
          >
            {user.userName || 'Unknown'}
          </span>
        </div>
        {user.bio && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{user.bio}</p>
        )}
        {user.location && (
          <p className="text-xs text-gray-500">
            <span className="mr-1">📍</span>
            {user.location}
          </p>
        )}
      </div>

      {/* Follow/Unfollow Button - show when logged in and not viewing self */}
      {currentUser && user.id !== currentUser.id && (
        <div className="flex-shrink-0">
          <Button
            size="small"
            type={isFollowing ? 'default' : 'primary'}
            onClick={handleFollowToggle}
            loading={isLoading}
          >
            {isFollowing ? '取消关注' : '关注'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserCard;
