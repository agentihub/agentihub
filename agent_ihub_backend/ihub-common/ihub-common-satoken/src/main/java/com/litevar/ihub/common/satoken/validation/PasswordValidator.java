package com.litevar.ihub.common.satoken.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

/**
 * 密码校验器
 * 要求密码至少8位，允许大小写字母、数字和特殊字符
 */
public class PasswordValidator implements ConstraintValidator<Password, String> {

    // 密码格式正则表达式: 至少8位，包含大小写字母、数字和特殊字符
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^.{8,}$");

    @Override
    public void initialize(Password constraintAnnotation) {
        // 初始化逻辑（如果需要）
    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null) {
            return false;
        }

        // 检查长度是否符合要求（至少8位）
        if (password.length() < 8) {
            return false;
        }

        // 检查格式是否符合要求
        return PASSWORD_PATTERN.matcher(password).matches();
    }
}