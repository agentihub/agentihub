package com.litevar.ihub.log.enums;

import com.mongoplus.annotation.comm.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;

/**
 * 用户操作类型枚举
 *
 * @author Teoan
 * @since 2025/9/11
 */
@Getter
@AllArgsConstructor
public enum UserActionType {

    /**
     * 收藏Agent
     */
    STAR_AGENT("star_agent", "收藏Agent"),

    /**
     * 取消收藏Agent
     */
    UNSTAR_AGENT("unstar_agent", "取消收藏Agent"),

    /**
     * 关注用户
     */
    FOLLOW_USER("follow_user", "关注用户"),

    /**
     * 取消关注用户
     */
    UNFOLLOW_USER("unfollow_user", "取消关注用户"),

    /**
     * 编辑Agent
     */
    EDIT_AGENT("edit_agent", "编辑Agent"),

    /**
     * Fork Agent
     */
    FORK_AGENT("fork_agent", "Fork Agent"),

    /**
     * 创建Agent
     */
    CREATE_AGENT("create_agent", "创建Agent"),


    /**
     * 删除Agent
     */
    DELETE_AGENT("delete_agent", "删除Agent"),

    /**
     * 发布Agent
     */
    PUBLISH_AGENT("publish_agent", "发布Agent");

    @EnumValue
    private final String code;
    private final String description;

    public static UserActionType of(String code) {
        return Arrays.stream(UserActionType.values()).filter(item -> item.getCode().equals(code)).findFirst().orElseGet(() -> null);
    }

}