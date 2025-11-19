package com.litevar.ihub.core.service;

import com.litevar.ihub.common.web.R;
import com.litevar.ihub.core.dto.ChangePasswordDTO;
import com.litevar.ihub.core.dto.VerifyCodeDTO;
import jakarta.servlet.http.HttpServletResponse;

/**
 * 找回账号服务接口
 *
 * @author Teoan
 * @since 2025/9/8
 */
public interface IAccountService {



    /**
     * 发送验证码到指定邮箱
     *
     * @param email 用户邮箱
     */
    void sendForgetPasswordCode(String email);

    /**
     * 发送验证码到指定邮箱
     *
     * @param email 用户邮箱
     */
    void sendRegistrationCode(String email);



    /**
     * 发送验证码到指定邮箱
     *
     */
    void sendPhoneCode(String phone);





    /**
     * 验证验证码是否正确
     *
     * @return 验证结果
     */
    R<Boolean> verifyCode(VerifyCodeDTO verifyCodeDTO);

    /**
     * 重置密码
     *
     * @param email       用户邮箱
     * @param newPassword 新密码
     * @return 重置结果
     */
    boolean resetPassword(String email, String newPassword);


    /**
     * 获取图片验证码
     *
     * @param response 响应
     */
    void getCaptcha(HttpServletResponse response);

    /**
     * 验证图片验证码
     *
     * @param captchaKey   验证码key
     * @param captchaCode  用户输入的验证码
     * @return 验证结果
     */
    R<Boolean> verifyCaptcha(String captchaKey, String captchaCode);
    
    /**
     * 修改当前用户密码
     * @return 修改结果
     */
    R<Boolean> changePassword(ChangePasswordDTO request);
}