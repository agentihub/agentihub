package com.litevar.ihub.log.aspect;

import cn.hutool.core.util.ObjUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.litevar.ihub.common.satoken.utils.LoginHelper;
import com.litevar.ihub.log.annotation.LogRecord;
import com.litevar.ihub.log.entity.UserActionLog;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.expression.EvaluationContext;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.time.LocalDateTime;

/**
 *
 * 日志切面处理
 * @author Teoan
 */
@Component
@Aspect
@Slf4j
@RequiredArgsConstructor
public class LogRecordAspect {
    private final ApplicationEventPublisher publisher;
    ExpressionParser parser;


    @PostConstruct
    void init(){
        parser = new SpelExpressionParser();
    }



    /**
     * 配置切入点
     */
    @Pointcut("@annotation(com.litevar.ihub.log.annotation.LogRecord)")
    public void logRecord() {
    }


    @Around("logRecord()")
    public Object doAround(ProceedingJoinPoint joinPoint) throws Throwable {
        Object proceed = joinPoint.proceed();

        MethodSignature methodSignature = (MethodSignature) joinPoint.getSignature();
        //获取接入点方法
        Method method = methodSignature.getMethod();
        LogRecord loggerAnnotation = method.getAnnotation(LogRecord.class);
        try {
            String userId = LoginHelper.getCurrentUserId();
            if (ObjUtil.isNotNull(userId)) {
                // 创建SpEL表达式解析器
                EvaluationContext context = new StandardEvaluationContext();
                
                // 将方法参数添加到表达式上下文中
                Object[] args = joinPoint.getArgs();
                String[] paramNames = methodSignature.getParameterNames();

                if (ObjUtil.isNotNull(paramNames)) {
                    for (int i = 0; i < paramNames.length; i++) {
                        if (i < args.length && ObjUtil.isNotNull(args[i])) {
                            context.setVariable(paramNames[i], args[i]);
                        }
                    }
                }

                // 解析targetId表达式
                String targetAgentId = parseExpression(parser, context, loggerAnnotation.targetAgentId());
                String targetUserId = parseExpression(parser, context, loggerAnnotation.targetUserId());


                UserActionLog actionLog = UserActionLog.builder()
                        .userId(userId)
                        .actionType(loggerAnnotation.actionType())
                        .targetAgentId(targetAgentId)
                        .targetUserId(targetUserId)
                        .actionTime(LocalDateTime.now())
                        .build();

                publisher.publishEvent(actionLog);
                log.debug("LogRecordAspect解析后的日志内容：{}", JSONUtil.toJsonStr(actionLog));
            }
        } catch (Exception e) {
            log.error("记录用户操作日志失败: 操作类型={}, 目标ID={}", loggerAnnotation.actionType(), loggerAnnotation.targetAgentId(), e);
        }
        return proceed;
    }

    /**
     * 解析SpEL表达式
     *
     * @param parser   表达式解析器
     * @param context  表达式上下文
     * @param expressionStr 表达式字符串
     * @return 解析后的值
     */
    private String parseExpression(ExpressionParser parser, EvaluationContext context, String expressionStr) {
        if (StrUtil.isBlank(expressionStr)) {
            return expressionStr;
        }
        try {
            return parser.parseExpression(expressionStr).getValue(context, String.class);
        } catch (Exception e) {
            log.warn("解析SpEL表达式失败: {}, 使用原始值", expressionStr, e);
            return expressionStr;
        }
    }
}