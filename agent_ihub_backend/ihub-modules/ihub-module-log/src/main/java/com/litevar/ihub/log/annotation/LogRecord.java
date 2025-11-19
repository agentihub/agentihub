package com.litevar.ihub.log.annotation;

import com.litevar.ihub.log.enums.UserActionType;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 日志注解
 *
 * @author Teoan
 */
@Target({ElementType.METHOD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface LogRecord {

    /**
     * 操作类型
     */

    UserActionType actionType();

    /**
     * 操作目标 agentID
     */
    String targetAgentId() default "";


    /**
     * 操作目标 用户 ID
     */
    String targetUserId() default "";

}
