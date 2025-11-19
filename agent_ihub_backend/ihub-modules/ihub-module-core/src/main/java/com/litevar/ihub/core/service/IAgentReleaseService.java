package com.litevar.ihub.core.service;

import com.litevar.ihub.core.dto.AgentReleaseDTO;
import com.litevar.ihub.core.entity.AgentRelease;
import com.mongoplus.model.PageResult;
import com.mongoplus.service.IService;

/**
 * @author Teoan
 * @since 2025/10/13
 */
public interface IAgentReleaseService extends IService<AgentRelease> {

    /**
     * 分页查询Agent发布历史
     *
     * @param agentId  Agent ID
     * @param pageNum  页码
     * @param pageSize 每页数量
     * @return 分页结果
     */
    PageResult<AgentReleaseDTO> getAgentReleaseHistory(String agentId, Integer pageNum, Integer pageSize);
}