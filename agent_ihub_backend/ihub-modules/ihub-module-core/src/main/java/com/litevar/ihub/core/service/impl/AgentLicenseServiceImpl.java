package com.litevar.ihub.core.service.impl;

import com.litevar.ihub.core.dto.AgentLicenseDTO;
import com.litevar.ihub.core.entity.AgentLicense;
import com.litevar.ihub.core.service.IAgentLicenseService;
import com.mongoplus.service.impl.ServiceImpl;
import io.github.linpeilie.Converter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @author Teoan
 * @since 2025/10/20
 */
@Service
@RequiredArgsConstructor
public class AgentLicenseServiceImpl extends ServiceImpl<AgentLicense> implements IAgentLicenseService {

    private final Converter converter;

    /**
     * 根据AgentId获取license信息
     *
     * @param agentId
     */
    @Override
    public AgentLicenseDTO getLicenseInfoByAgentId(String agentId) {
        return converter.convert(lambdaQuery().eq(AgentLicense::getAgentId, agentId).one(), AgentLicenseDTO.class);
    }

    /**
     * 根据AgentId获取license信息
     *
     * @param agentIdList
     */
    @Override
    public Map<String, AgentLicenseDTO> getLicenseInfoByAgentIdList(List<String> agentIdList) {
        List<AgentLicenseDTO> forkDTOS = converter.convert(lambdaQuery().in(AgentLicense::getAgentId, agentIdList).list(), AgentLicenseDTO.class);
        return   forkDTOS.stream().collect(Collectors.toMap(AgentLicenseDTO::getAgentId, license -> license));
    }

}