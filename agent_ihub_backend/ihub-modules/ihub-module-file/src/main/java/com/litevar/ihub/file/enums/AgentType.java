package com.litevar.ihub.file.enums;

import com.mongoplus.annotation.comm.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;

/**
 * Agent类型枚举
 *
 * @author Teoan
 * @since 2025/9/26
 */
@Getter
@AllArgsConstructor
public enum AgentType {

    /**
     * 普通Agent
     */
    GENERAL("GENERAL", "普通"),

    /**
     * 分发Agent
     */
    DISTRIBUTE("DISTRIBUTE", "分发"),

    /**
     * 反思Agent
     */
    REFLECTION("REFLECTION", "反思");

    @EnumValue
    private final String code;
    private final String description;

    public static AgentType of(String str) {
        for (AgentType type : values()) {
            if (type.getDescription().equals(str)) {
                return type;
            }
        }
        for (AgentType type : values()) {
            if (type.getCode().equals(str)) {
                return type;
            }
        }
        for (AgentType type : values()) {
            if (type.name().equals(str)) {
                return type;
            }
        }
        return null;
    }

    /**
     * 获取可用值
     * @return 可用值
     */
    public static String getEnableValues() {
        return String.join(",", Arrays.stream(values()).map(AgentType::getDescription).toList());
    }

}