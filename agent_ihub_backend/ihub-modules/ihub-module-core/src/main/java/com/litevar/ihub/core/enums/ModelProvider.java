package com.litevar.ihub.core.enums;

import com.mongoplus.annotation.comm.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 模型提供商枚举
 *
 * @author Teoan
 * @since 2025/9/11
 */
@Getter
@AllArgsConstructor
public enum ModelProvider {

    /**
     * OpenAI
     */
    OPENAI("openai", "OpenAI"),

    /**
     * 阿里云百炼(DashScope)
     */
    DASHSCOPE("dashscope", "阿里云百炼"),

    /**
     * DeepSeek
     */
    DEEPSEEK("deepseek", "DeepSeek"),

    /**
     * PingCode Model
     */
    PRM("prm", "PingCode Model"),

    /**
     * 其他
     */
    OTHERS("others", "其他");

    @EnumValue
    private final String code;
    private final String description;

    /**
     * 获取默认模型提供商
     *
     * @return 默认模型提供商 (OpenAI)
     */
    public static ModelProvider defaultProvider() {
        return OPENAI;
    }

    /**
     * 根据代码获取模型提供商枚举
     *
     * @param code 模型提供商代码
     * @return 模型提供商枚举，如果未找到则返回null
     */
    public static ModelProvider of(String code) {
        for (ModelProvider provider : values()) {
            if (provider.getCode().equals(code)) {
                return provider;
            }
        }
        return null;
    }
}