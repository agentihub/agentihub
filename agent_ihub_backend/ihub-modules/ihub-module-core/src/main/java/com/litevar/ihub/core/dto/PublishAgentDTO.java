package com.litevar.ihub.core.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 发布Agent DTO
 *
 * @author Lingma
 * @since 2025/10/13
 */
@Data
@Schema(description = "发布Agent信息DTO")
public class PublishAgentDTO {

    /**
     * Agent ID
     */
    @Schema(description = "Agent ID")
    @NotBlank(message = "Agent ID不能为空")
    private String id;


    /**
     * 版本号
     */
    @Schema(description = "版本号")
    @NotNull(message = "版本号不能为空")
    private String version;

    /**
     * 发布说明
     */
    @Schema(description = "发布说明")
    private String releaseNotes;
}