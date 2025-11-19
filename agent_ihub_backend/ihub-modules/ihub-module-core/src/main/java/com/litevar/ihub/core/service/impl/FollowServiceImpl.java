package com.litevar.ihub.core.service.impl;


import com.litevar.ihub.common.web.exception.BusinessException;
import com.litevar.ihub.common.web.exception.ErrorCode;
import com.litevar.ihub.core.entity.Follow;
import com.litevar.ihub.core.entity.User;
import com.litevar.ihub.core.service.IFollowService;
import com.litevar.ihub.log.annotation.LogRecord;
import com.litevar.ihub.log.enums.UserActionType;
import com.mongoplus.service.impl.ServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author Teoan
 * @since 2025/7/28 14:43
 */
@Service
@RequiredArgsConstructor
public class FollowServiceImpl extends ServiceImpl<Follow> implements IFollowService {



    /**
     * 创建关注关系
     * @param followerId follower id
     * @param followingUser following user
     */
    @Override
    @LogRecord(actionType = UserActionType.FOLLOW_USER, targetUserId = "#followingUser.id")
    public void createFollow(String followerId, User followingUser) {
        if(this.isFollowing(followerId, followingUser.getId())){
            return;
        }
        if(followerId.equals(followingUser.getId())){
            throw new BusinessException(ErrorCode.CANNOT_FOLLOW_YOURSELF);
        }
        Follow follow = Follow.builder().followerId(followerId).followingId(followingUser.getId()).build();
        save(follow);

    }

    /**
     * 取消关注
     * @param followerId follower id
     * @param followingUser following user
     * @return boolean
     */
    @Override
    @LogRecord(actionType = UserActionType.UNFOLLOW_USER, targetUserId = "#followingUser.id")
    public boolean unfollow(String followerId, User followingUser) {
        return this.lambdaUpdate()
                .eq(Follow::getFollowerId, followerId)
                .eq(Follow::getFollowingId, followingUser.getId())
                .remove();
    }

    /**
     * 检查是否关注
     *
     * @param followerId
     * @param followingId
     */
    @Override
    public boolean isFollowing(String followerId, String followingId) {
        return this.lambdaQuery().eq(Follow::getFollowerId, followerId)
                .eq(Follow::getFollowingId, followingId).count() > 0;
    }

    /**
     * 统计关注者数量
     *
     * @param userId
     */
    @Override
    public long countFollowers(String userId) {
        return this.lambdaQuery().eq(Follow::getFollowingId, userId).count();
    }

    /**
     * 统计正在关注的数量
     *
     * @param userId
     */
    @Override
    public long countFollowing(String userId) {
        return this.lambdaQuery().eq(Follow::getFollowerId, userId).count();
    }

    /**
     * 获取关注者列表
     *
     * @param userId
     */
    @Override
    public List<String> getFollowers(String userId) {
        return this.lambdaQuery().eq(Follow::getFollowingId, userId).list().stream().map(Follow::getFollowerId).toList();
    }

    /**
     * 获取正在关注的列表
     *
     * @param userId
     */
    @Override
    public List<String> getFollowing(String userId) {
        return this.lambdaQuery().eq(Follow::getFollowerId, userId).list().stream().map(Follow::getFollowingId).toList();
    }
}