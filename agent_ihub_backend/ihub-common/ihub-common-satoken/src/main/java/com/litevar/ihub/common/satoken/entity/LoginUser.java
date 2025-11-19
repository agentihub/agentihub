package com.litevar.ihub.common.satoken.entity;

import com.litevar.ihub.common.satoken.enums.UserRole;
import com.litevar.ihub.common.satoken.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author Teoan
 * @since 2025/7/30 18:25
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginUser {


    /**
     * 用户唯一标识
     */
    private String id;

    /**
     * 用户邮箱
     */

    private String email;

    /**
     * 用户名
     */
    private String userName;

    /**
     * 密码
     */
    private String passwordHash;

    /**
     * 用户头像URL
     */
    private String avatar;

    /**
     * 用户简介
     */
    private String bio;

    /**
     * 用户位置
     */
    private String location;

    /**
     * 用户网站
     */
    private String website;

    /**
     * 用户角色
     *
     * @see UserRole
     */
    private UserRole role;

    /**
     * 用户状态
     *
     * @see UserStatus
     */
    private UserStatus status;



}
