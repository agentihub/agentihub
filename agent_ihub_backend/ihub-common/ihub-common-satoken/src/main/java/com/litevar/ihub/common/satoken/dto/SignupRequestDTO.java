package com.litevar.ihub.common.satoken.dto;

import com.litevar.ihub.common.satoken.validation.Password;
import com.litevar.ihub.common.satoken.validation.Username;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 注册请求DTO
 *
 * @since 2025/7/7
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "注册请求DTO")
public class SignupRequestDTO {


    /**
     * 用户名
     */
    @Username
    @Schema(description = "用户名", example = "john-doe")
    private String userName;

    /**
     * 邮箱地址
     */
    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式错误")
    @Schema(description = "邮箱地址", example = "user@example.com")
    private String email;


    /**
     * 手机号
     */
    @Schema(description = "手机号")
    private String phone;


    /**
     * 头像地址
     */
    @Schema(description = "头像地址")
    private String avatar;

    /**
     * 密码
     */
    @Password
    @Schema(description = "密码", example = "Password123!")
    private String password;
}