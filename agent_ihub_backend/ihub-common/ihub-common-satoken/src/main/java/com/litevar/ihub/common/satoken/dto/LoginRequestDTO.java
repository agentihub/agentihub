package com.litevar.ihub.common.satoken.dto;

import com.litevar.ihub.common.satoken.validation.Password;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 登录请求DTO
 *
 * @author uncle
 * @since 2025/7/7
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "登录请求DTO")
public class LoginRequestDTO {
    /**
     * 邮箱地址
     */
    @Email(message = "邮箱格式错误")
    @Schema(description = "邮箱地址", example = "user@example.com")
    private String email;

    /**
     * 密码
     */
    @NotBlank(message = "密码不能为空")
    @Password
    @Schema(description = "密码", example = "password123")
    private String password;

    @Override
    public String toString() {
        return "LoginRequestDTO{" +
                "email='" + email + '\'' +
                ", password='[PROTECTED]'" +
                '}';
    }
}