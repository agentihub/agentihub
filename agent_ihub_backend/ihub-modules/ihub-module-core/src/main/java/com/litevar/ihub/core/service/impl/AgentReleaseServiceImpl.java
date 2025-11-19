package com.litevar.ihub.core.service.impl;

import com.litevar.ihub.core.dto.AgentReleaseDTO;
import com.litevar.ihub.core.entity.AgentRelease;
import com.litevar.ihub.core.service.IAgentReleaseService;
import com.mongoplus.model.PageResult;
import com.mongoplus.service.impl.ServiceImpl;
import io.github.linpeilie.Converter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * @author Teoan
 * @since 2025/10/13
 */
@Service
@RequiredArgsConstructor
public class AgentReleaseServiceImpl extends ServiceImpl<AgentRelease> implements IAgentReleaseService {

    private final Converter converter;

    /**
     * 分页查询Agent发布历史
     *
     * @param agentId  Agent ID
     * @param pageNum  页码
     * @param pageSize 每页数量
     * @return 分页结果
     */
    @Override
    public PageResult<AgentReleaseDTO> getAgentReleaseHistory(String agentId, Integer pageNum, Integer pageSize) {
        return page(
                lambdaQuery().eq(AgentRelease::getAgentId, agentId)
                        .orderByDesc(AgentRelease::getCreateTime),
                pageNum, pageSize,AgentReleaseDTO.class);
    }
}