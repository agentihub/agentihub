package com.litevar.ihub.core.dto;

import com.litevar.ihub.common.satoken.validation.Password;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 修改密码请求DTO
 *
 * @author your-name
 * @since 2025/10/31
 */
@Data
@Schema(description = "修改密码请求DTO")
public class ChangePasswordDTO {

    /**
     * 当前密码
     */
    @NotBlank(message = "当前密码不能为空")
    @Schema(description = "当前密码")
    private String currentPassword;

    /**
     * 新密码
     */
    @Password
    @Schema(description = "新密码")
    private String newPassword;
}