package com.litevar.ihub.common.core.config;

import com.aliyun.dysmsapi20170525.Client;
import com.aliyun.teaopenapi.models.Config;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 阿里云短信服务配置类
 *
 * @author your-name
 * @since 2025/9/10
 */
@Data
@Slf4j
@Configuration
@ConfigurationProperties(prefix = "aliyun.sms")
public class AliyunSmsConfigure {

    /**
     * 阿里云AccessKey ID
     */
    private String accessKeyId;

    /**
     * 阿里云AccessKey Secret
     */
    private String accessKeySecret;

    /**
     * 短信签名
     */
    private String signName;

    /**
     * 短信模板ID
     */
    private String templateCode;

    /**
     * 地域ID
     */
    private String endpoint = "dysmsapi.aliyuncs.com";

    /**
     * 创建阿里云短信客户端
     *
     * @return Client
     * @throws Exception 异常
     */
    @Bean
    public Client createClient() throws Exception {
        Config config = new Config()
                .setAccessKeyId(accessKeyId)
                .setAccessKeySecret(accessKeySecret)
                .setEndpoint(endpoint);
        return new Client(config);
    }
}