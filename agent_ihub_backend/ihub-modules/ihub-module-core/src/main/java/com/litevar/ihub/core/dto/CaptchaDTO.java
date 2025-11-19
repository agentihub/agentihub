package com.litevar.ihub.core.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 图片验证码DTO
 *
 * @author Teoan
 * @since 2025/10/10
 */
@Data
@Schema(description = "图片验证码DTO")
public class CaptchaDTO {

    /**
     * 验证码key
     */
    @NotBlank(message = "验证码key不能为空")
    @Schema(description = "验证码key")
    private String captchaKey;

    /**
     * 用户输入的验证码
     */
    @NotBlank(message = "验证码不能为空")
    @Schema(description = "用户输入的验证码")
    private String captchaCode;
}