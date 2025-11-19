package com.litevar.ihub.common.satoken.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.constraints.NotBlank;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.*;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

/**
 * 用户名校验注解
 * 要求用户名6位及以上，仅英文、数字、"-"，并且不允许连续"-"
 */
@NotBlank
@Target({METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER, TYPE_USE})
@Retention(RUNTIME)
@Documented
@Constraint(validatedBy = UsernameValidator.class)
public @interface Username {
    String message() default "用户名格式不正确，要求6位及以上，仅允许英文、数字、'-'，且不能连续使用'-'";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}