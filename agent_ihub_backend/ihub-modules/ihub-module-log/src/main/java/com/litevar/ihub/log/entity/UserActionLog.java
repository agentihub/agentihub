package com.litevar.ihub.log.entity;

import com.litevar.ihub.log.dto.UserActionLogDTO;
import com.litevar.ihub.log.enums.UserActionType;
import com.mongoplus.annotation.ID;
import com.mongoplus.annotation.collection.CollectionName;
import com.mongoplus.annotation.index.MongoIndex;
import com.mongoplus.annotation.logice.IgnoreLogic;
import com.mongoplus.enums.IdTypeEnum;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 用户操作日志实体类
 * 用于记录用户的关键操作，如收藏、关注、编辑等
 *
 * @author Teoan
 * @since 2025/9/11
 */
@Data
@CollectionName("user_action_logs")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@AutoMapper(target = UserActionLogDTO.class)
@IgnoreLogic
public class UserActionLog  {

    /**
     * 日志唯一标识
     */
    @ID(type = IdTypeEnum.ASSIGN_ID)
    private String id;

    /**
     * 用户ID
     */
    @MongoIndex
    private String userId;

    /**
     * 操作类型
     */
    @MongoIndex
    private UserActionType actionType;

    /**
     * 操作目标 agent ID (如Agent ID, User ID等)
     */
    private String targetAgentId;

    /**
     * 操作目标 用户 ID (如Agent ID, User ID等)
     */
    private String targetUserId;


    /**
     * 操作目标 agent 版本号
     */
    private String targetAgentVersion;

    /**
     * 操作时间
     */
    private LocalDateTime actionTime;

}