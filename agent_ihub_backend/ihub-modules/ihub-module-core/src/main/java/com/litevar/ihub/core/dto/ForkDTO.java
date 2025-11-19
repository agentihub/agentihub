package com.litevar.ihub.core.dto;

import com.litevar.ihub.common.translation.annotation.Translation;
import com.litevar.ihub.common.translation.service.IAgentTranslationService;
import com.litevar.ihub.common.translation.service.IUserTranslationService;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Fork信息DTO
 *
 * @author Teoan
 * @since 2025/7/24 17:30
 */
@Data
@Schema(description = "Fork信息DTO")
public class ForkDTO {

    /**
     * Fork记录唯一标识
     */
    @Schema(description = "Fork记录唯一标识")
    private String id;

    /**
     * Fork用户ID
     */
    @Schema(description = "Fork用户ID")
    private String userId;

    /**
     * 原始Agent ID
     */
    @Schema(description = "原始Agent ID")
    private String originalAgentId;

    /**
     * Fork后的新Agent ID
     */
    @Schema(description = "Fork后的新Agent ID")
    private String forkedAgentId;


    /**
     * 原始Agent名称
     */
    @Schema(description = "原始Agent名称")
    @Translation(translationService = IAgentTranslationService.class,mapper = "#originalAgentId",fieldName = "name")
    private String originalAgentName;


    /**
     * 原始Agent 作者名称
     */
    @Schema(description = "原始Agent 作者id")
    private String originalAgentAuthorId;


    /**
     * 原始Agent 作者名称
     */
    @Schema(description = "原始Agent 作者名称")
    @Translation(translationService = IUserTranslationService.class, mapper = "#originalAgentAuthorId",fieldName = "userName")
    private String originalAgentAuthorName;

    /**
     * 原始Agent 作者昵称
     */
    @Schema(description = "原始Agent 作者昵称")
    @Translation(translationService = IUserTranslationService.class, mapper = "#originalAgentAuthorId",fieldName = "nickName")
    private String originalAgentAuthorNickName;

    /**
     * 创建时间
     */
    @Schema(description = "创建时间")
    private LocalDateTime createTime;
}