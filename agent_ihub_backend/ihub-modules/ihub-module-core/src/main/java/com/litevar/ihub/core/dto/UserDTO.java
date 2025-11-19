package com.litevar.ihub.core.dto;


import com.litevar.ihub.common.satoken.enums.UserRole;
import com.litevar.ihub.common.satoken.enums.UserStatus;
import com.mongoplus.annotation.ID;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户信息DTO
 *
 * @author Teoan
 * @since 2025/7/24 17:00
 */
@Data
@Schema(description = "用户信息DTO")
public class UserDTO {

    /**
     * 用户唯一标识
     */
    @Schema(description = "用户唯一标识")
    @ID
    @NotNull(message = "用户ID不能为空")
    private String id;

    /**
     * 用户邮箱
     */
    @Schema(description = "用户邮箱")
    private String email;

    /**
     * 用户名
     */
    @Schema(description = "用户名")
    private String userName;

    /**
     * 昵称
     */
    @Schema(description = "昵称")
    private String nickName;

    /**
     * 用户头像URL
     */
    @Schema(description = "用户头像URL")
    private String avatar;

    /**
     * 用户简介
     */
    @Schema(description = "用户简介")
    private String bio;

    /**
     * 用户位置
     */
    @Schema(description = "用户位置")
    private String location;

    /**
     * 用户网站
     */
    @Schema(description = "用户网站")
    private String website;

    /**
     * 用户角色
     *
     * @see UserRole
     */
    @Schema(description = "用户角色")
    private UserRole role;

    /**
     * 用户状态
     *
     * @see UserStatus
     */
    @Schema(description = "用户状态")
    private UserStatus status;

    /**
     * 是否被当前用户关注
     *
     */
    @Schema(description = "是否被当前用户关注")
    private Boolean following = false;


    /**
     * 创建时间
     */
    @Schema(description = "创建时间")
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @Schema(description = "更新时间")
    private LocalDateTime updateTime;

    /**
     * 最后登录时间
     */
    @Schema(description = "最后登录时间")
    private LocalDateTime lastLoginTime;
}