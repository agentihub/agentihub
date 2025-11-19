package com.litevar.ihub.common.satoken.enums;

import com.mongoplus.annotation.comm.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @author Teoan
 * @since 2025/7/24 11:38
 */
@Getter
@AllArgsConstructor
public enum UserRole {

    ROLE_USER(0, "user","普通用户"),
    ROLE_ADMIN(1, "admin","管理员");

    private final Integer code;
    @EnumValue
    private final String value;
    private final String description;

    public static UserRole getByCode(Integer code) {
        for (UserRole role : values()) {
            if (role.getCode().equals(code)) {
                return role;
            }
        }
        return null;
    }

}