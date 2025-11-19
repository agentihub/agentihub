package com.litevar.ihub.core.service;

import com.litevar.ihub.core.entity.Star;
import com.mongoplus.service.IService;

import java.util.List;

/**
 * @author Teoan
 * @since 2025/7/28 14:33
 */
public interface IStarService extends IService<Star> {


    /**
     * 获取用户收藏的Agent数
     */
    Long getStarCountByUserId(String userId);


    /**
     * 获取用户收藏的Agent列表
     */
    List<String> getStarAgentListByUserId(String userId);

}
