package com.litevar.ihub.core.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 重置密码请求DTO
 *
 * @author Teoan
 * @since 2025/9/8
 */
@Data
@Schema(description = "重置密码请求DTO")
public class ResetPasswordDTO {

    /**
     * 邮箱地址
     */
    @NotBlank(message = "邮箱不能为空")
    @Schema(description = "邮箱地址", example = "user@example.com")
    private String email;


    /**
     * 新密码
     */
    @NotBlank(message = "新密码不能为空")
    @Schema(description = "新密码", example = "newPassword123")
    private String newPassword;
}