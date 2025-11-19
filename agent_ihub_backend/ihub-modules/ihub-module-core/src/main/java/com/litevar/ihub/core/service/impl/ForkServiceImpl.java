package com.litevar.ihub.core.service.impl;

import com.litevar.ihub.core.dto.ForkDTO;
import com.litevar.ihub.core.entity.Fork;
import com.litevar.ihub.core.service.IForkService;
import com.mongoplus.service.impl.ServiceImpl;
import io.github.linpeilie.Converter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @author Teoan
 * @since 2025/7/30 10:57
 */
@Service
@RequiredArgsConstructor
public class ForkServiceImpl extends ServiceImpl<Fork> implements IForkService {

    private final Converter converter;

    /**
     * 获取用户创建的Fork数
     *
     * @param userId
     */
    @Override
    public Long getForkCountByUserId(String userId) {
        return count(lambdaQuery().eq(Fork::getUserId, userId));
    }


    /**
     * 根据agent id获取fork信息
     * @param agentId agent id
     * @return ForkDTO
     */
    @Override
    public ForkDTO getForkInfoByAgentId(String agentId) {
       return converter.convert(lambdaQuery().eq(Fork::getForkedAgentId, agentId).one(), ForkDTO.class);
    }

    /**
     * 根据agent id列表获取fork信息
     * @param agentIdList agent id list
     * @return Map<String, ForkDTO>
     */
    @Override
    public Map<String, ForkDTO> getForkInfoByAgentIdList(List<String> agentIdList) {
        List<ForkDTO> forkDTOS = converter.convert(lambdaQuery().in(Fork::getForkedAgentId, agentIdList).list(), ForkDTO.class);
        return   forkDTOS.stream().collect(Collectors.toMap(ForkDTO::getForkedAgentId, fork -> fork));
    }
}
