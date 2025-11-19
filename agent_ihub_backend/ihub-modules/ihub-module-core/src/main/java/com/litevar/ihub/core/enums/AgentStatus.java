package com.litevar.ihub.core.enums;

import com.mongoplus.annotation.comm.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @author Teoan
 * @since 2025/7/24 11:25
 */

@Getter
@AllArgsConstructor
public enum AgentStatus {

    /**
     * 草稿状态
     */
    DRAFT(0, "草稿"),

    /**
     * 激活状态
     */
    ACTIVE(1, "激活"),

    /**
     * 已归档
     */
    ARCHIVED(2, "已归档"),

    /**
     * 已删除
     */
    DELETED(3, "已删除");

    @EnumValue
    private final Integer code;
    private final String description;

    public static AgentStatus getByCode(Integer code) {
        for (AgentStatus status : values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        return null;
    }

}
