package com.litevar.ihub.common.satoken.utils;

import cn.dev33.satoken.stp.SaTokenInfo;
import cn.dev33.satoken.stp.StpUtil;
import cn.dev33.satoken.stp.parameter.SaLoginParameter;
import cn.hutool.core.convert.Convert;
import cn.hutool.core.util.ObjectUtil;
import com.litevar.ihub.common.satoken.entity.LoginUser;
import com.litevar.ihub.common.satoken.enums.UserRole;
import lombok.extern.slf4j.Slf4j;

/**
 * 登录工具类
 *
 * @author Teoan
 * @since 2025/7/25 17:09
 */
@Slf4j
public class LoginHelper {

    public static final String LOGIN_USER_KEY = "loginUser";
    public static final String ROLE_KEY = "role";
    public static final String USER_KEY = "userId";


    /**
     * 用户登录
     *
     * @param user 登录用户信息
     */
    public static void login(LoginUser user) {
        StpUtil.login(user.getId(), new SaLoginParameter()
                .setExtra(LOGIN_USER_KEY, user)
                .setExtra(USER_KEY, user.getId())
                .setExtra(ROLE_KEY, user.getRole()));
    }

    /**
     * 获取当前登录用户的ID
     *
     * @return 用户ID
     */
    public static String getCurrentUserId() {
        try {
            return Convert.toStr(StpUtil.getExtra(USER_KEY));
        } catch (Exception e) {
            log.error("获取用户id失败", e);
            return "";
        }
    }


    /**
     * 获取当前登录用户信息
     *
     * @return 登录用户信息
     */
    public static LoginUser getCurrentUser() {
        return Convert.convert(LoginUser.class, StpUtil.getExtra(LOGIN_USER_KEY));
    }


    /**
     * 判断当前用户是否是管理员
     *
     * @return 是否为管理员
     */
    public static boolean isAdmin() {
        return ObjectUtil.equal(StpUtil.getExtra(ROLE_KEY), UserRole.ROLE_ADMIN);
    }


    /**
     * 用户登出
     */
    public static void logout() {
        StpUtil.logout();
    }


    /**
     * 获取当前用户名
     *
     * @return 用户名
     */
    public static String getUserName() {
        return getCurrentUser().getUserName();
    }

    /**
     * 刷新令牌
     */
    public static void refreshToken() {
        StpUtil.checkLogin();

        StpUtil.updateLastActiveToNow();
    }


    /**
     * 获取Token信息
     *
     * @return Token信息
     */
    public static SaTokenInfo getTokenInfo() {
        return StpUtil.getTokenInfo();
    }

    /**
     * 检验当前会话是否已经登录，如未登录，则抛出异常
     */
    public static void checkLogin(){
        StpUtil.checkLogin();
    }

}
