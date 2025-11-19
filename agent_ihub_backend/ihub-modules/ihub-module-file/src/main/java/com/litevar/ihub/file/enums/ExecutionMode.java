package com.litevar.ihub.file.enums;

import com.mongoplus.annotation.comm.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;

/**
 * Agent执行模式枚举
 *
 * @author Teoan
 * @since 2025/9/26
 */
@Getter
@AllArgsConstructor
public enum ExecutionMode {

    /**
     * 并行执行模式
     */
    PARALLEL("PARALLEL", "并行"),

    /**
     * 串行执行模式
     */
    SERIAL("SERIAL", "串行"),

    /**
     * 拒绝执行模式
     */
    REJECT("REJECT", "拒绝");

    @EnumValue
    private final String code;
    private final String description;

    public static ExecutionMode of(String str) {
        for (ExecutionMode type : values()) {
            if (type.getDescription().equals(str)) {
                return type;
            }
        }
        for (ExecutionMode type : values()) {
            if (type.getCode().equals(str)) {
                return type;
            }
        }
        for (ExecutionMode type : values()) {
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
        return String.join(",", Arrays.stream(values()).map(ExecutionMode::getDescription).toList());
    }
}