package com.litevar.ihub.common.core.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 *
 * @author Teoan
 * @since 2025/8/25 10:12
 */
@Configuration
@ConfigurationProperties(prefix = "agent-ihub.lite-agent")
@Data
public class IHubAgentProperties {

    private String baseUrl;

    /**
     * 导航agent api key
     */
    private String navigationAgentApiKey;


    /**
     * 关键词agent api key
     */
    private String keywordsAgentApiKey;

    /**
     * 创建agent api key
     */
    private String creationAgentApiKey;


    /**
     * 摘要agent api key
     */
    private String abstractsAgentApiKey;

}
