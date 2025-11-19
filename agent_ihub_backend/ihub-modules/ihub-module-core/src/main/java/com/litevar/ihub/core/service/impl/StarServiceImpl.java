package com.litevar.ihub.core.service.impl;

import com.litevar.ihub.core.entity.Star;
import com.litevar.ihub.core.service.IStarService;
import com.mongoplus.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author Teoan
 * @since 2025/7/28 14:33
 */
@Service
public class StarServiceImpl extends ServiceImpl<Star> implements IStarService {


    /**
     * 获取用户收藏的Agent数
     *
     * @param userId
     */
    @Override
    public Long getStarCountByUserId(String userId) {
       return count(lambdaQuery().eq(Star::getUserId, userId));
    }


    /**
     * 获取用户收藏的Agent列表
     * @param userId user id
     * @return List<String>
     */
    @Override
    public List<String> getStarAgentListByUserId(String userId) {
        return list(lambdaQuery().eq(Star::getUserId, userId)).stream().map(Star::getAgentId).toList();
    }
}
