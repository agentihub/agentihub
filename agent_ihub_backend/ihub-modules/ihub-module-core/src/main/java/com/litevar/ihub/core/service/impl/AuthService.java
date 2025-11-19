package com.litevar.ihub.core.service.impl;

import cn.dev33.satoken.stp.SaTokenInfo;
import cn.dev33.satoken.stp.StpInterface;
import cn.hutool.core.util.ObjUtil;
import cn.hutool.crypto.digest.BCrypt;
import com.litevar.ihub.common.satoken.dto.LoginRequestDTO;
import com.litevar.ihub.common.satoken.dto.SignupRequestDTO;
import com.litevar.ihub.common.satoken.entity.LoginUser;
import com.litevar.ihub.common.satoken.enums.UserRole;
import com.litevar.ihub.common.satoken.enums.UserStatus;
import com.litevar.ihub.common.satoken.utils.LoginHelper;
import com.litevar.ihub.common.web.exception.BusinessException;
import com.litevar.ihub.common.web.exception.ErrorCode;
import com.litevar.ihub.core.dto.UserDTO;
import com.litevar.ihub.core.entity.User;
import com.litevar.ihub.core.service.IUserService;
import io.github.linpeilie.Converter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 认证服务层
 *
 * @author uncle
 * @since 2025/7/7
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService implements StpInterface {

    private final IUserService userService;

    private final Converter converter;


    /**
     * 用户登录
     */
    public SaTokenInfo login(LoginRequestDTO request) {
        // 查找用户
        User user = userService.findUserByEmail(request.getEmail());
        if (ObjUtil.isNull(user)) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        
        // 验证密码
        if (!BCrypt.checkpw(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        LoginUser loginUser = converter.convert(user, LoginUser.class);


        LoginHelper.login(loginUser);

        // 更新最后登录时间
        user.setLastLoginTime(LocalDateTime.now());
        userService.updateById(user);

        return LoginHelper.getTokenInfo();
    }

    /**
     * 用户注册
     */
    public UserDTO signup(SignupRequestDTO request) {

        // 检查邮箱是否已存在
        User existingUser = userService.findUserByEmail(request.getEmail());
        if (ObjUtil.isNotNull(existingUser)) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }


        // 检查用户名是否已存在
        existingUser = userService.findUserByUserName(request.getUserName());
        if (ObjUtil.isNotNull(existingUser)) {
            throw new BusinessException(ErrorCode.USER_ALREADY_EXISTS);
        }

        // 创建新用户
        User newUser = new User();
        newUser.setUserName(request.getUserName());
        newUser.setEmail(request.getEmail());
        newUser.setPhone(request.getPhone());
        newUser.setAvatar(request.getAvatar());
        newUser.setPasswordHash(BCrypt.hashpw(request.getPassword(), BCrypt.gensalt()));
        newUser.setRole(UserRole.ROLE_USER); // 默认普通用户
        newUser.setStatus(UserStatus.NORMAL); // 默认激活状态
        // 保存用户
        userService.save(newUser);
        return converter.convert(newUser, UserDTO.class);
    }

    /**
     * 刷新令牌
     */
    public void refreshToken() {
        LoginHelper.refreshToken();
    }

    /**
     * 用户登出
     */
    public void logout() {
        LoginHelper.logout();
    }

    /**
     * 返回指定账号id所拥有的权限码集合
     *
     * @param loginId   账号id
     * @param loginType 账号类型
     * @return 该账号id具有的权限码集合
     */
    @Override
    public List<String> getPermissionList(Object loginId, String loginType) {
        return List.of();
    }

    /**
     * 返回指定账号id所拥有的角色标识集合
     *
     * @param loginId   账号id
     * @param loginType 账号类型
     * @return 该账号id具有的角色标识集合
     */
    @Override
    public List<String> getRoleList(Object loginId, String loginType) {
        User user = userService.getById(String.valueOf(loginId));
        return List.of(user.getRole().getValue());
    }
}