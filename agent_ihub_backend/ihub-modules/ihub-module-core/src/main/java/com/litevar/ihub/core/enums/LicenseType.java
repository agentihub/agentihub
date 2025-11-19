package com.litevar.ihub.core.enums;

import com.mongoplus.annotation.comm.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * License类型枚举
 *
 * @author Teoan
 * @since 2025/10/20
 */
@Getter
@AllArgsConstructor
public enum LicenseType {

    /**
     * MIT许可证
     */
    MIT("MIT", "MIT"),

    /**
     * Apache许可证 2.0版本
     */
    APACHE_2_0("Apache-2.0", "Apache AgentLicense 2.0"),

    /**
     * GPL许可证 3.0版本
     */
    GPL_3_0("GPL-3.0", "GNU General Public AgentLicense 3.0"),

    /**
     * BSD 3-Clause许可证
     */
    BSD_3_CLAUSE("BSD-3-Clause", "BSD 3-Clause AgentLicense"),

    /**
     * AGPL许可证 3.0版本
     */
    AGPL_3_0("AGPL-3.0", "GNU Affero General Public AgentLicense 3.0"),

    /**
     * 专有许可证
     */
    PROPRIETARY("Proprietary", "Proprietary AgentLicense"),

    /**
     * 自定义许可证
     */
    CUSTOM("Custom", "Custom AgentLicense");

    @EnumValue
    private final String code;
    private final String description;

    public static LicenseType of(String code) {
        for (LicenseType type : values()) {
            if (type.getCode().equals(code)) {
                return type;
            }
        }
        return null;
    }
}