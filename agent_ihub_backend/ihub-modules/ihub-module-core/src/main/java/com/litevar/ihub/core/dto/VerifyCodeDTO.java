package com.litevar.ihub.core.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 验证码验证请求DTO
 *
 * @author Teoan
 * @since 2025/9/8
 */
@Data
@Schema(description = "验证码验证请求DTO")
public class VerifyCodeDTO {

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


    /**
     * 验证码
     */
    @NotBlank(message = "验证码不能为空")
    @Schema(description = "验证码", example = "123456")
    private String code;
}