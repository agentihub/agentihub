package com.litevar.ihub.file.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;

/**
 * Schema类型枚举
 *
 * @author Teoan
 * @since 2025/9/11
 */
@Getter
@AllArgsConstructor
public enum SchemaType {

    /**
     * OpenAPI 3.0
     */
    OPEN_API3( 1, "OPEN_API3"),

    /**
     * JSON-RPC
     */
    JSON_RPC( 2, "JSON_RPC"),

    /**
     * OpenTool
     */
    OpenTool( 6, "OpenTool"),

    /**
     * Open Tool(第三方)
     */
    OPEN_TOOL( 4, "OPEN_TOOL"),

    /**
     * MCP
     */
    MCP( 5, "MCP");

    private final Integer code;
    private final String description;

    public static SchemaType of(String str) {
        for (SchemaType type : values()) {
            if (type.getDescription().equals(str)) {
                return type;
            }
        }
        for (SchemaType type : values()) {
            if (type.name().equals(str)) {
                return type;
            }
        }
        return null;
    }

    public static SchemaType of(Integer code) {
        for (SchemaType type : values()) {
            if (type.getCode().equals(code)) {
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
        return String.join(",", Arrays.stream(values()).map(SchemaType::getDescription).toList());
    }

}