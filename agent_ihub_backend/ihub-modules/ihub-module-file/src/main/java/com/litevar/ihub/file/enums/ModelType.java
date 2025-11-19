package com.litevar.ihub.file.enums;

import com.mongoplus.annotation.comm.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;

/**
 * 模型类型枚举
 *
 * @author Teoan
 * @since 2025/9/28
 */
@Getter
@AllArgsConstructor
public enum ModelType {

    /**
     * 大语言模型
     */
    LLM("LLM", "大语言模型"),

    /**
     * 嵌入模型
     */
    EMBEDDING("embedding", "嵌入模型"),

    /**
     * 语音识别模型
     */
    ASR("asr", "语音识别"),

    /**
     * 文本转语音模型
     */
    TTS("tts", "文本转语音"),

    /**
     * 图像模型
     */
    IMAGE("image", "图像模型");

    @EnumValue
    private final String code;
    private final String description;

    @Override
    public String toString() {
        return code;
    }

    public static ModelType of(String str) {
        for (ModelType type : values()) {
            if (type.getDescription().equals(str)) {
                return type;
            }
        }
        for (ModelType type : values()) {
            if (type.getCode().equals(str)) {
                return type;
            }
        }
        for (ModelType type : values()) {
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
       return String.join(",", Arrays.stream(values()).map(ModelType::getCode).toList());
    }

}