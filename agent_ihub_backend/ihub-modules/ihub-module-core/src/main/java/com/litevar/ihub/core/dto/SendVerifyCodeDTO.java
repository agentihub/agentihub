package com.litevar.ihub.core.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import lombok.Data;

/**
 * 发送验证码DTO
 *
 * @author Teoan
 * @since 2025/9/8
 */
@Data
@Schema(description = "发送验证码DTO")
public class SendVerifyCodeDTO {

    /**
     * 邮箱地址
     */
    @Email(message = "邮箱格式错误")
    @Schema(description = "邮箱地址", example = "user@example.com")
    private String email;


    /**
     * 手机号
     */
    @Schema(description = "手机号")
    private String phone;
}