package com.litevar.ihub.file.dto;


import com.litevar.ihub.file.enums.ApiKeyType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 工具信息DTO
 *
 * @author Teoan
 * @since 2025/7/24 17:30
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FileToolDTO {


    /**
     * 工具名称
     */
    private String name;

    /**
     * 工具类型
     */
    private Integer schemaType;

    /**
     * 工具描述
     */
    private String description;

    /**
     * schema文稿
     */
    private String schemaStr;

    /**
     * API密钥类型，定义API认证方式
     */
    private ApiKeyType apiKeyType;

    /**
     * API密钥值，用于API认证
     */
    private String apiKey;

    /**
     * 是否启用
     */
    private Boolean autoAgent;

}