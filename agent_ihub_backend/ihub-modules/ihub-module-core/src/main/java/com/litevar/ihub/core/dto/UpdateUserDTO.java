package com.litevar.ihub.core.dto;


import com.mongoplus.annotation.ID;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 用户信息DTO
 *
 * @author Teoan
 * @since 2025/7/24 17:00
 */
@Data
@Schema(description = "更新用户信息DTO")
public class UpdateUserDTO {

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

}