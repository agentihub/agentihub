package com.litevar.ihub.file.enums;

import com.mongoplus.annotation.comm.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 文件上传类型
 * @author Teoan
 * @since 2025/9/19 09:37
 */
@Getter
@AllArgsConstructor
public enum FileUploadType {


    /**
     * 大语言模型 (Large Language Model)
     */
    TOOLS("tools", "工具"),

    /**
     * 头像
     */
    AVATARS("avatars", "头像"),

    /**
     * 嵌入模型 (Embedding Model)
     */
    KNOWLEDGE("knowledge", "知识库");

    @EnumValue
    private final String code;
    private final String description;


    public static FileUploadType of(String code) {
        for (FileUploadType type : values()) {
            if (type.getCode().equalsIgnoreCase(code)) {
                return type;
            }
        }
        return null;
    }

}
