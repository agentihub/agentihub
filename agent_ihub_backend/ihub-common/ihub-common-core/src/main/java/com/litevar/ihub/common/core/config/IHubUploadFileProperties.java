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
@ConfigurationProperties(prefix = "agent-ihub.upload-file")
@Data
public class IHubUploadFileProperties {

    /**
     * 文件上传路径 默认为当前项目路径下的upload-file文件夹
     */
    private String path = "upload-file";
}
