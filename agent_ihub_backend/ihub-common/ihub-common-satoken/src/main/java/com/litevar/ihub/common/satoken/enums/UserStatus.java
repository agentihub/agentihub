package com.litevar.ihub.common.satoken.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @author Teoan
 * @since 2025/7/24 11:33
 */
@Getter
@AllArgsConstructor
public enum UserStatus {


    NORMAL(0, "正常"),

    LOCKED(1, "锁定"),

    DELETED(2, "已删除");



    private final Integer code;
    private final String description;

    public static UserStatus getByCode(Integer code) {
        for (UserStatus status : values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        return null;
    }

}
