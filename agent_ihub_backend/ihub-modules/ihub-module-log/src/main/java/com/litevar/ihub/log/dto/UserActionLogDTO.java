package com.litevar.ihub.log.dto;

import com.litevar.ihub.common.translation.annotation.Translation;
import com.litevar.ihub.common.translation.service.IAgentTranslationService;
import com.litevar.ihub.common.translation.service.IUserTranslationService;
import com.litevar.ihub.log.enums.UserActionType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 *
 * @author Teoan
 * @since 2025/10/30 17:36
 */
@Data
@Schema(description = "操作日志DTO")
public class UserActionLogDTO {

    /**
     * 日志唯一标识
     */
    @Schema(description = "日志唯一标识")
    private String id;

    /**
     * 用户ID
     */
    @Schema(description = "用户ID")
    private String userId;

    /**
     * 用户ID
     */
    @Schema(description = "用户名称")
    @Translation(translationService = IUserTranslationService.class, mapper = "#userId", fieldName = "userName")
    private String userName;


    /**
     * 用户昵称
     */
    @Schema(description = "用户昵称")
    @Translation(translationService = IUserTranslationService.class, mapper = "#userId", fieldName = "nickName")
    private String nickName;

    /**
     * 操作类型
     */
    @Schema(description = "操作类型")
    private UserActionType actionType;



    /**
     * 操作目标 agent ID
     */
    @Schema(description = "操作目标 agent ID ")
    private String targetAgentId;


    /**
     * 操作目标 agent ID
     */
    @Schema(description = "操作目标 agent 名称 ")
    @Translation(translationService = IAgentTranslationService.class, mapper = "#targetAgentId", fieldName = "name")
    private String targetAgentName;

    /**
     * 操作目标 用户 ID
     */
    @Schema(description = "操作目标 用户 ID ")
    private String targetUserId;


    /**
     * 操作目标 用户 名称
     */
    @Schema(description = "操作目标 用户名称 ")
    @Translation(translationService = IUserTranslationService.class, mapper = "#targetUserId",fieldName = "userName")
    private String targetUserName;

    /**
     * 操作目标 用户 ID
     */
    @Schema(description = "操作目标 用户昵称 ")
    @Translation(translationService = IUserTranslationService.class, mapper = "#targetUserId",fieldName = "nickName")
    private String targetUserNickName;


    /**
     * 操作描述
     */
    @Schema(description = "操作描述")
    private String description;

    /**
     * 操作时间
     */
    @Schema(description = "操作时间")
    private LocalDateTime actionTime;

}
