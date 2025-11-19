package com.litevar.ihub.file.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * API密钥类型枚举
 *
 * @author Teoan
 * @since 2025/9/11
 */
@Getter
@AllArgsConstructor
public enum ApiKeyType {

    /**
     * Bearer认证类型
     */
    BEARER("Bearer", "Bearer认证"),

    /**
     * Basic认证类型
     */
    BASIC("Basic", "Basic认证");

    private final String code;
    private final String description;

    public static ApiKeyType of(String str) {
        for (ApiKeyType type : values()) {
            if (type.getDescription().equals(str)) {
                return type;
            }
        }
        for (ApiKeyType type : values()) {
            if (type.getCode().equals(str)) {
                return type;
            }
        }
        for (ApiKeyType type : values()) {
            if (type.name().equals(str)) {
                return type;
            }
        }
        return null;
    }
}