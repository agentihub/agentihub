package com.litevar.ihub.common.satoken.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

/**
 * 用户名校验器
 * 要求用户名6位及以上，仅英文、数字、"-"，并且不允许连续"-"
 */
public class UsernameValidator implements ConstraintValidator<Username, String> {

    // 用户名格式正则表达式: 6-20位，仅允许字母、数字、单个连字符(不能在开头或结尾，也不能连续)
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^(?!-)[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$");

    @Override
    public void initialize(Username constraintAnnotation) {
        // 初始化逻辑（如果需要）
    }

    @Override
    public boolean isValid(String username, ConstraintValidatorContext context) {
        if (username == null) {
            return false;
        }

        // 检查长度是否符合要求（至少6位）
        if (username.length() < 6) {
            return false;
        }

        // 检查格式是否符合要求
        return USERNAME_PATTERN.matcher(username).matches();
    }
}