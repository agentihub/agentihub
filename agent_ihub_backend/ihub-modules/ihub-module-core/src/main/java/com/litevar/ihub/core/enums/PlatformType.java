package com.litevar.ihub.core.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import com.mongoplus.annotation.comm.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;

/**
 * 平台类型枚举
 *
 * @author Teoan
 * @since 2025/7/24 11:25
 */

@Getter
@AllArgsConstructor
public enum PlatformType {

    /**
     * LiteAgent
     */
    LITE_AGENT("LITE_AGENT", "LiteAgent"),

    /**
     * Dify
     */
    DIFY("DIFY", "Dify"),

    /**
     * 已归档
     */
    COZE("COZE", "Coze");


    private final String code;
    @EnumValue
    private final String description;

    public static PlatformType of(String description) {
        return Arrays.stream(PlatformType.values()).filter(item -> item.getDescription().equals(description)).findFirst().orElseGet(() -> null);
    }

    @JsonValue
    public String getDescription() {
        return description;
    }
}
