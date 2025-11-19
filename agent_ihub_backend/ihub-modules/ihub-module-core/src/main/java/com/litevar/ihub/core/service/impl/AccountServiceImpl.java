package com.litevar.ihub.core.service.impl;

import cn.hutool.captcha.CircleCaptcha;
import cn.hutool.core.util.*;
import cn.hutool.crypto.digest.BCrypt;
import com.litevar.ihub.common.core.utils.AliyunSmsUtil;
import com.litevar.ihub.common.core.utils.MailSendUtil;
import com.litevar.ihub.common.core.utils.RedisUtils;
import com.litevar.ihub.common.satoken.entity.LoginUser;
import com.litevar.ihub.common.satoken.utils.LoginHelper;
import com.litevar.ihub.common.web.R;
import com.litevar.ihub.common.web.exception.BusinessException;
import com.litevar.ihub.common.web.exception.ErrorCode;
import com.litevar.ihub.core.dto.ChangePasswordDTO;
import com.litevar.ihub.core.dto.VerifyCodeDTO;
import com.litevar.ihub.core.entity.User;
import com.litevar.ihub.core.service.IAccountService;
import com.litevar.ihub.core.service.IUserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;

import static com.litevar.ihub.common.core.constant.CacheConstants.*;

/**
 * 找回账号服务实现类
 *
 * @author Teoan
 * @since 2025/9/8
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements IAccountService {

    private final IUserService userService;
    private final MailSendUtil mailSendUtil;


    /**
     * 发送验证码到指定邮箱
     *
     * @param email 用户邮箱
     */
    @Override
    public void sendForgetPasswordCode(String email) {
        // 查找用户
        User user = userService.findUserByEmail(email);
        if (ObjUtil.isEmpty(user)) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        // 构造邮件内容
        String subject = "ihub 验证码";
        String content =
                """
                        您正在请求重置密码，验证码为：{}
                        
                        验证码有效期为3分钟，请尽快使用。
                        
                        如果您没有请求此操作，请忽略此邮件。
                        
                        谢谢！
                        Agent iHub 团队""";
        sendEmailVerifyCode(email, subject, content);
    }

    /**
     * 验证验证码是否正确
     *
     * @return 验证结果
     */
    @Override
    public R<Boolean> verifyCode(VerifyCodeDTO verifyCodeDTO) {
        String cachedKey = "";
        if (StrUtil.isNotEmpty(verifyCodeDTO.getEmail())) {
            // 从Redis中获取验证码
            cachedKey = StrUtil.format(IHUB_ACCOUNT_EMAIL_CODE_KEY, verifyCodeDTO.getEmail());
        } else if (StrUtil.isNotEmpty(verifyCodeDTO.getPhone())) {
            // 从Redis中获取验证码
            cachedKey = StrUtil.format(IHUB_ACCOUNT_PHONE_CODE_KEY, verifyCodeDTO.getPhone());
        }

        if(StrUtil.isBlank(cachedKey)){
            return R.fail("邮箱或手机号为空。", false);
        }

        String cachedCode = RedisUtils.get(cachedKey, String.class);

        if (ObjUtil.isEmpty(cachedCode)) {
            return R.fail("验证码已过期", false);
        }
        // 检查验证码是否存在且匹配 验证通过时移除code
        if (verifyCodeDTO.getCode().equals(cachedCode)) {
            RedisUtils.delete(cachedKey);
        }
        return R.ok(verifyCodeDTO.getCode().equals(cachedCode));
    }


    /**
     * 发送验证码到指定邮箱
     *
     * @param email 用户邮箱
     */
    @Override
    public void sendRegistrationCode(String email) {
        // 构造邮件内容
        String subject = "ihub 验证码";
        String content =
                """
                        您正在请求注册账号，验证码为：{}
                        
                        验证码有效期为3分钟，请尽快使用。
                        
                        如果您没有请求此操作，请忽略此邮件。
                        
                        谢谢！
                        Agent iHub 团队""";
        sendEmailVerifyCode(email, subject, content);
    }

    /**
     * 重置密码
     *
     * @param email       用户邮箱
     * @param newPassword 新密码
     * @return 重置结果
     */
    @Override
    public boolean resetPassword(String email, String newPassword) {
        // 查找用户
        User user = userService.findUserByEmail(email);
        if (ObjUtil.isEmpty(user)) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        // 更新密码
        user.setPasswordHash(BCrypt.hashpw(newPassword, BCrypt.gensalt()));
        return userService.updateById(user);
    }


    /**
     * 发送验证码到指定手机号
     *
     * @param phone 手机号
     */
    @Override
    public void sendPhoneCode(String phone) {
       if(!PhoneUtil.isPhone(phone)){
           throw new BusinessException(ErrorCode.PHONE_FORMAT_ERROR);
       }
       
       String cachedCode = RedisUtils.get(StrUtil.format(IHUB_ACCOUNT_PHONE_CODE_KEY, phone), String.class);
       if (StrUtil.isNotEmpty(cachedCode)) {
           throw new BusinessException(ErrorCode.VERIFICATION_CODE_SENT);
       }
       
       // 生成6位随机验证码
       String code = RandomUtil.randomNumbers(6);
       // 使用 RedisUtils 存储验证码，设置过期时间
       RedisUtils.set(StrUtil.format(IHUB_ACCOUNT_PHONE_CODE_KEY, phone), code, Duration.ofMinutes(IHUB_ACCOUNT_CODE_EXPIRE_MINUTES));
       
       // 发送短信
       try {
           AliyunSmsUtil.sendCode(phone,code);
           log.info("Verification code sent to phone: {}", phone);
       } catch (Exception e) {
           log.error("Failed to send verification code to phone: {}", phone, e);
           // 如果短信发送失败，安全地删除Redis中的验证码
           RedisUtils.delete(StrUtil.format(IHUB_ACCOUNT_PHONE_CODE_KEY, phone));
           throw new BusinessException(ErrorCode.SMS_SEND_FAILED);
       }
    }

    /**
     * 发送邮件验证码
     *
     * @param email   用户邮箱
     * @param subject 邮件主题
     * @param content 邮件内容
     */
    public void sendEmailVerifyCode(String email, String subject, String content) {

        String code = RedisUtils.get(StrUtil.format(IHUB_ACCOUNT_EMAIL_CODE_KEY, email), String.class);
        if (StrUtil.isNotEmpty(code)) {
            throw new BusinessException(ErrorCode.VERIFICATION_CODE_SENT);
        }
        // 生成6位随机验证码
        code = RandomUtil.randomNumbers(6);
        // 使用 RedisUtils 存储验证码，设置过期时间
        RedisUtils.set(StrUtil.format(IHUB_ACCOUNT_EMAIL_CODE_KEY, email), code, Duration.ofMinutes(IHUB_ACCOUNT_CODE_EXPIRE_MINUTES));

        content = StrUtil.format(content, code);
        // 发送邮件
        try {
            mailSendUtil.send(email, subject, content);
            log.info("Verification code sent to email: {}", email);
        } catch (Exception e) {
            log.error("Failed to send verification code to email: {}", email, e);
            // 如果邮件发送失败，安全地删除Redis中的验证码
            RedisUtils.delete(StrUtil.format(IHUB_ACCOUNT_EMAIL_CODE_KEY, email));
            throw new BusinessException(ErrorCode.EMAIL_SEND_FAILED);
        }
    }

    /**
     * 获取图片验证码
     *
     * @param response 响应
     */
    @Override
    @SneakyThrows
    public void getCaptcha(HttpServletResponse response) {
        // 生成图片验证码
        CircleCaptcha captcha = new CircleCaptcha (200, 100);
        captcha.createCode();

        // 生成验证码key
        String captchaKey = IdUtil.simpleUUID();

        // 将验证码存入Redis，5分钟过期
        RedisUtils.set(StrUtil.format(IHUB_ACCOUNT_CAPTCHA_KEY, captchaKey), captcha.getCode(), Duration.ofMinutes(IHUB_ACCOUNT_CODE_EXPIRE_MINUTES));

        // 设置响应头
        response.setContentType("image/png");
        response.setHeader("captcha-key", captchaKey);

        // 输出图片到浏览器
        captcha.write(response.getOutputStream());
    }

    /**
     * 验证图片验证码
     *
     * @param captchaKey   验证码key
     * @param captchaCode  用户输入的验证码
     * @return 验证结果
     */
    @Override
    public R<Boolean> verifyCaptcha(String captchaKey, String captchaCode) {
        // 从Redis获取验证码
        String cachedCode = RedisUtils.get(StrUtil.format(IHUB_ACCOUNT_CAPTCHA_KEY, captchaKey), String.class);
        if (StrUtil.isEmpty(cachedCode)) {
            return R.fail("验证码已过期或不存在", false);
        }
        // 验证码比较
        boolean result = cachedCode.equalsIgnoreCase(captchaCode);
        // 验证成功后删除验证码
        if (result) {
            RedisUtils.delete(StrUtil.format(IHUB_ACCOUNT_CAPTCHA_KEY, captchaKey));
        }
        return R.ok(result);
    }
    
    /**
     * 修改当前用户密码
     * @return 修改结果
     */
    @Override
    public R<Boolean> changePassword(ChangePasswordDTO request) {
        // 获取当前登录用户
        LoginUser loginUser = LoginHelper.getCurrentUser();
        User user = userService.getById(loginUser.getId());
        if (ObjUtil.isEmpty(user)) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        
        // 校验当前密码是否正确
        if (!BCrypt.checkpw(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.DATA_VERIFICATION_FAILED, "当前密码不正确。");
        }
        
        // 更新密码
        user.setPasswordHash(BCrypt.hashpw(request.getNewPassword(), BCrypt.gensalt()));
        return R.ok(userService.updateById(user));
    }
}