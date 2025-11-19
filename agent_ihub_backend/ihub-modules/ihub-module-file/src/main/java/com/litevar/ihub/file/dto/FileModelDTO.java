package com.litevar.ihub.file.dto;


import com.litevar.ihub.file.enums.ModelType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Model信息DTO
 *
 * @author Teoan
 * @since 2025/9/28
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FileModelDTO {

    /**
     * 是否深度思考
     */
    private Boolean deepThink = false;

    /**
     * 基础URL
     */
    private String baseUrl;

    /**
     * 字段映射
     */
    private String fieldMapping;

    /**
     * API密钥
     */
    private String apiKey;

    /**
     * 提供商
     */
    private String provider;

    /**
     * 名称
     */
    private String name;

    /**
     * 别名
     */
    private String alias;

    /**
     * 类型
     */
    private ModelType type;

    /**
     * 自动代理
     */
    private Boolean autoAgent = false;

    /**
     * 工具调用
     */
    private Boolean toolInvoke = true;
}