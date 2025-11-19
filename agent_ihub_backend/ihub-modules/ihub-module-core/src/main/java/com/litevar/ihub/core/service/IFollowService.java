package com.litevar.ihub.core.service;


import com.litevar.ihub.core.entity.Follow;
import com.litevar.ihub.core.entity.User;
import com.mongoplus.service.IService;

import java.util.List;

/**
 * @author Teoan
 * @since 2025/7/28 14:42
 */
public interface IFollowService extends IService<Follow> {


    /**
     * 创建关注关系
     */
    void createFollow(String followerId, User followingUser);


    /**
     * 取消关注
     */
     boolean unfollow(String followerId, User followingUser);



    /**
     * 检查是否关注
     */
     boolean isFollowing(String followerId, String followingId);



    /**
     * 统计关注者数量
     */
     long countFollowers(String userId);



    /**
     * 统计正在关注的数量
     */
     long countFollowing(String userId);



    /**
     * 获取关注者列表
     */
     List<String> getFollowers(String userId);


    /**
     * 获取正在关注的列表
     */
     List<String> getFollowing(String userId);
}
