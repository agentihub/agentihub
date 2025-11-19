package com.litevar.ihub.core.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

/**
 * 用户统计数据DTO
 *
 * @author Teoan
 * @since 2025/7/25 18:05
 */
@Data
@Schema(description = "用户统计数据DTO")
@Builder
public class UserStatsDTO {
    /**
     * 用户ID
     */
    @Schema(description = "用户ID")
    private String userId;

    /**
     * 关注数
     */
    @Schema(description = "关注数")
    private Long followingCount;

    /**
     * 粉丝数
     */
    @Schema(description = "粉丝数")
    private Long followerCount;

    /**
     * 收藏数
     */
    @Schema(description = "收藏数")
    private Long starCount;

    /**
     * 分叉数
     */
    @Schema(description = "分叉数")
    private Long forkCount;

    /**
     * 创建的Agent数
     */
    @Schema(description = "创建的Agent数")
    private Long agentCount;

    /**
     * 总浏览数
     */
    @Schema(description = "总浏览数")
    private Long totalViews;
}