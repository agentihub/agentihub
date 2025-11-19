package com.litevar.ihub.core.service;

import com.litevar.ihub.core.dto.AgentLicenseDTO;
import com.litevar.ihub.core.entity.AgentLicense;
import com.mongoplus.service.IService;

import java.util.List;
import java.util.Map;

/**
 * @author Teoan
 * @since 2025/10/20
 */
public interface IAgentLicenseService extends IService<AgentLicense> {


    /**
     * 根据AgentId获取license信息
     */
    AgentLicenseDTO getLicenseInfoByAgentId(String agentId);


    /**
     * 根据AgentId获取license信息
     */
    Map<String,AgentLicenseDTO> getLicenseInfoByAgentIdList(List<String> agentIdList);
}