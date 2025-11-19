package com.litevar.ihub.core.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 关注关系DTO
 *
 * @author Teoan
 * @since 2025/7/24 17:30
 */
@Data
@Schema(description = "关注关系DTO")
public class FollowDTO {

    /**
     * 关注关系唯一标识
     */
    @Schema(description = "关注关系唯一标识")
    private String id;

    /**
     * 关注者ID
     */
    @Schema(description = "关注者ID")
    private String followerId;

    /**
     * 被关注者ID
     */
    @Schema(description = "被关注者ID")
    private String followingId;

    /**
     * 创建时间
     */
    @Schema(description = "创建时间")
    private LocalDateTime createTime;
}