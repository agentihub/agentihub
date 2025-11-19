package com.litevar.ihub.core.dto;

import com.mongoplus.annotation.ID;
import com.mongoplus.enums.IdTypeEnum;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Agent发布历史记录DTO
 *
 * @author Lingma
 * @since 2025/10/13
 */
@Data
@Schema(description = "Agent发布历史记录DTO")
public class AgentReleaseDTO {

    /**
     * 发布信息唯一标识
     */
    @Schema(description = "发布信息唯一标识")
    @ID(type = IdTypeEnum.ASSIGN_ID)
    private String id;

    /**
     * Agent ID
     */
    @Schema(description = "Agent ID")
    private String agentId;

    /**
     * 版本号
     */
    @Schema(description = "版本号")
    private String version;

    /**
     * 发布说明
     */
    @Schema(description = "发布说明")
    private String releaseNotes;

    /**
     * 创建时间
     */
    @Schema(description = "创建时间")
    private LocalDateTime createTime;
}