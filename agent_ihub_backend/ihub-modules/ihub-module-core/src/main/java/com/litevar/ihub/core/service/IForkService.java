package com.litevar.ihub.core.service;

import com.litevar.ihub.core.dto.ForkDTO;
import com.litevar.ihub.core.entity.Fork;
import com.mongoplus.service.IService;

import java.util.List;
import java.util.Map;

/**
 * @author Teoan
 * @since 2025/7/30 10:57
 */
public interface IForkService extends IService<Fork> {


    /**
     * 获取用户创建的Fork数
     */
    Long getForkCountByUserId(String userId);


    /**
     * 根据AgentId获取Fork信息
     */
    ForkDTO getForkInfoByAgentId(String agentId);


    /**
     * 根据AgentId获取Fork信息
     */
    Map<String,ForkDTO> getForkInfoByAgentIdList(List<String> agentIdList);

}
