package com.litevar.ihub.core.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import com.litevar.ihub.common.web.R;
import com.litevar.ihub.core.dto.*;
import com.litevar.ihub.core.service.IAccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 账号信息管理
 *
 * @author Teoan
 * @since 2025/9/8
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/account")
@Tag(name = "账号信息管理", description = "账号信息管理")
public class AccountController {

    private final IAccountService accountService;

    /**
     * 发送忘记密码验证码
     */
    @PostMapping("/send-forget-password-code")
    @Operation(summary = "发送忘记密码验证码", description = "向指定邮箱发送忘记密码验证码")
    @SaIgnore
    public R<Void> sendForgetPasswordCode(@Validated @RequestBody SendVerifyCodeDTO request) {
        accountService.sendForgetPasswordCode(request.getEmail());
        return R.ok();
    }


    /**
     * 发送注册验证码
     */
    @PostMapping("/send-registration-code")
    @Operation(summary = "发送注册验证码", description = "向指定邮箱发送注册验证码")
    @SaIgnore
    public R<Void> sendRegistrationCode(@Validated @RequestBody SendVerifyCodeDTO request) {
        accountService.sendRegistrationCode(request.getEmail());
        return R.ok();
    }

    /**
     * 发送手机验证码
     */
    @PostMapping("/send-phone-code")
    @Operation(summary = "发送手机验证码", description = "向指定手机发送注册验证码")
    @SaIgnore
    public R<Void> sendPhoneCode(@Validated @RequestBody SendVerifyCodeDTO request) {
        accountService.sendPhoneCode(request.getPhone());
        return R.ok();
    }

    /**
     * 验证验证码
     */
    @PostMapping("/verify-code")
    @Operation(summary = "验证验证码", description = "验证邮箱验证码是否正确")
    @SaIgnore
    public R<Boolean> verifyCode(@Validated @RequestBody VerifyCodeDTO request) {
        return accountService.verifyCode(request);
    }

    /**
     * 重置密码
     */
    @PostMapping("/reset")
    @Operation(summary = "重置密码", description = "重置密码")
    @SaIgnore
    public R<Void> resetPassword(@Validated @RequestBody ResetPasswordDTO request) {
        accountService.resetPassword(request.getEmail(), request.getNewPassword());
        return R.ok("密码重置成功");
    }

    /**
     * 获取图片验证码
     */
    @PostMapping("/captcha")
    @Operation(summary = "获取图片验证码", description = "生成并获取图片验证码")
    @SaIgnore
    public void getCaptcha(HttpServletResponse response) {
        accountService.getCaptcha(response);
    }


    /**
     * 验证图片验证码
     */
    @PostMapping("/verify-captcha")
    @Operation(summary = "验证图片验证码", description = "验证图片验证码是否正确")
    @SaIgnore
    public R<Boolean> verifyCaptcha(@Validated @RequestBody CaptchaDTO request) {
        // 验证图片验证码
        return accountService.verifyCaptcha(request.getCaptchaKey(), request.getCaptchaCode());
    }
    
    /**
     * 修改当前用户密码
     */
    @PostMapping("/change-password")
    @Operation(summary = "修改当前用户密码", description = "修改当前用户密码")
    public R<Boolean> changePassword(@Validated @RequestBody ChangePasswordDTO request) {
        return accountService.changePassword(request);
    }
}