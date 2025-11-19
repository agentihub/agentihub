package com.litevar.ihub.core.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.dev33.satoken.annotation.SaIgnore;
import cn.dev33.satoken.stp.SaTokenInfo;
import com.litevar.ihub.common.satoken.dto.LoginRequestDTO;
import com.litevar.ihub.common.satoken.dto.SignupRequestDTO;
import com.litevar.ihub.common.web.R;
import com.litevar.ihub.core.dto.UserDTO;
import com.litevar.ihub.core.service.impl.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 登录认证控制器
 * @author Teoan
 * @since 2025/7/25 10:55
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
@Tag(name = "用户登录", description = "用户登录操作接口")
public class AuthController {

    private final AuthService authService;
    /**
     * 用户登录
     */
    @PostMapping("/login")
    @Operation(summary = "用户登录", description = "用户使用邮箱和密码进行登录")
    @SaIgnore
    public R<SaTokenInfo> login(@Validated @RequestBody LoginRequestDTO request) {
            return R.ok(authService.login(request));
    }

    /**
     * 用户注册
     */
    @PostMapping("/signup")
    @Operation(summary = "用户注册", description = "新用户注册账户")
    @SaIgnore
    public R<UserDTO> signup(@Validated @RequestBody SignupRequestDTO request) {
        return R.ok(authService.signup(request));
    }

    /**
     * 刷新令牌
     */
    @PostMapping("/refresh")
    @Operation(summary = "刷新令牌", description = "使用刷新令牌获取新的访问令牌")
    @SaCheckLogin
    public R<?> refreshToken() {
        authService.refreshToken();
        return R.ok();
    }

    /**
     * 用户登出
     */
    @PostMapping("/logout")
    @Operation(summary = "用户登出", description = "用户登出系统")
    @SaCheckLogin
    public R<?> logout() {
        authService.logout();
        return R.ok();
    }


}