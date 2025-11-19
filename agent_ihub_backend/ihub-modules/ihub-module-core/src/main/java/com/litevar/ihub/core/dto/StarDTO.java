package com.litevar.ihub.core.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 收藏信息DTO
 *
 * @author Teoan
 * @since 2025/7/24 17:30
 */
@Data
@Schema(description = "收藏信息DTO")
public class StarDTO {

    /**
     * 收藏记录唯一标识
     */
    @Schema(description = "收藏记录唯一标识")
    private String id;

    /**
     * 用户ID
     */
    @Schema(description = "用户ID")
    private String userId;

    /**
     * Agent ID
     */
    @Schema(description = "Agent ID")
    private String agentId;

    /**
     * 创建时间
     */
    @Schema(description = "创建时间")
    private LocalDateTime createTime;
}