package com.litevar.ihub.agent;

import com.litevar.ihub.agent.enums.AgentClientType;
import com.litevar.ihub.common.core.config.IHubAgentProperties;
import com.litevar.liteagent.client.LiteAgentClient;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;

/**
 *  liteAgent 客户端工厂类
 * @author Teoan
 * @since 2025/9/18 11:49
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class LiteAgentClientFactory {

    private final IHubAgentProperties iHubAgentProperties;

    private final HashMap<AgentClientType, LiteAgentClient> clientMap = new HashMap<>(3);


    @PostConstruct
    private void initClientMap(){
        log.debug("初始化 liteAgent 客户端,iHubAgentProperties:{}", iHubAgentProperties);
        clientMap.put(AgentClientType.NAVIGATION, new LiteAgentClient(iHubAgentProperties.getBaseUrl(), iHubAgentProperties.getNavigationAgentApiKey()));
        clientMap.put(AgentClientType.KEYWORDS, new LiteAgentClient(iHubAgentProperties.getBaseUrl(), iHubAgentProperties.getKeywordsAgentApiKey()));
        clientMap.put(AgentClientType.CREATION, new LiteAgentClient(iHubAgentProperties.getBaseUrl(), iHubAgentProperties.getCreationAgentApiKey()));
        clientMap.put(AgentClientType.ABSTRACTS, new LiteAgentClient(iHubAgentProperties.getBaseUrl(), iHubAgentProperties.getAbstractsAgentApiKey()));
    }



   public LiteAgentClient getLiteAgentClient(AgentClientType agentClientType){
        return clientMap.get(agentClientType);
   }
}