package com.litevar.ihub.agent.enums;

import com.mongoplus.annotation.comm.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Agent客户端类型枚举
 *
 * @author Lingma
 * @since 2025/10/11
 */
@Getter
@AllArgsConstructor
public enum AgentClientType {

    /**
     * 导航客户端
     */
    NAVIGATION("navigation", "导航"),

    /**
     * 关键词客户端
     */
    KEYWORDS("keywords", "关键词"),

    /**
     * 创建客户端
     */
    CREATION("creation", "创建"),

    /**
     * 摘要客户端
     */
    ABSTRACTS("abstracts", "摘要");

    @EnumValue
    private final String code;
    private final String description;

    public static AgentClientType of(String str) {
        for (AgentClientType type : values()) {
            if (type.getDescription().equals(str)) {
                return type;
            }
        }
        for (AgentClientType type : values()) {
            if (type.getCode().equals(str)) {
                return type;
            }
        }
        for (AgentClientType type : values()) {
            if (type.name().equals(str)) {
                return type;
            }
        }
        return null;
    }
}