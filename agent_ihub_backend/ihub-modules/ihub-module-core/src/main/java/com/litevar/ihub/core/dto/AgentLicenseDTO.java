package com.litevar.ihub.core.dto;

import com.litevar.ihub.core.enums.LicenseType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * AgentLicense信息DTO
 *
 * @author Teoan
 * @since 2025/10/20
 */
@Data
@Schema(description = "AgentLicense信息DTO")
public class AgentLicenseDTO {

    /**
     * License唯一标识
     */
    @Schema(description = "License唯一标识,创建时不需要传，修改时必传")
    private String id;

    /**
     * Agent唯一标识
     */
    @Schema(description = "Agent唯一标识")
    private String agentId;


    /**
     * 协议类型
     */
    @Schema(description = "协议类型")
    private LicenseType type;

    /**
     * 官方协议或自定义协议链接
     */
    @Schema(description = "官方协议或自定义协议链接")
    private String url;

    /**
     * 若为自定义协议，可直接存放文本
     */
    @Schema(description = "若为自定义协议，可直接存放文本")
    private String text;

    /**
     * 是否允许 Fork，前端显示或限制逻辑可用
     */
    @Schema(description = "是否允许 Fork，前端显示或限制逻辑可用")
    private Boolean allowFork;

    /**
     * 创建时间
     */
    @Schema(description = "创建时间")
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @Schema(description = "更新时间")
    private LocalDateTime updateTime;
}