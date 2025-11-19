package com.litevar.ihub.common.core.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 *
 * @author Teoan
 * @since 2025/10/13 17:49
 */
@Configuration
@ConfigurationProperties(prefix = "dolphin")
@Data
public class IHubDolphinPdfMdProperties {

    private String baseUrl;

    private String token;



    private Duration pollInterval = Duration.ofSeconds(3);


    private Duration pollTimeout = Duration.ofMinutes(5);


    private Duration downloadTimeout = Duration.ofMinutes(2);


    private Duration requestTimeout = Duration.ofSeconds(60);

}
