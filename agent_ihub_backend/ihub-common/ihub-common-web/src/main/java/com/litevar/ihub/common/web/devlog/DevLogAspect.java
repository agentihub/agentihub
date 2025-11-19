package com.litevar.ihub.common.web.devlog;


import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONConfig;
import cn.hutool.json.JSONUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.context.annotation.Profile;
import org.springframework.core.DefaultParameterNameDiscoverer;
import org.springframework.core.ParameterNameDiscoverer;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.servlet.ModelAndView;

import java.lang.reflect.Method;
import java.util.StringJoiner;

@Aspect
@Component
@Profile({"dev", "test"})
@Slf4j
public class DevLogAspect {

    private static final ParameterNameDiscoverer PARAMETER_NAME_DISCOVERER = new DefaultParameterNameDiscoverer();

    @Pointcut("within(@org.springframework.web.bind.annotation.RestController *) || within(com.litevar.ihub..controller.*)")
    public void webLog() {
    }

    @Around("webLog()")
    public Object doAround(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes.getRequest();

        MethodSignature signature = (MethodSignature) proceedingJoinPoint.getSignature();
        Class<?> controllerClass = signature.getDeclaringType();
        Method method = signature.getMethod();

        String url = request.getRequestURL().toString();
        String param = JSONUtil.toJsonStr(proceedingJoinPoint.getArgs());


        long startTime = System.currentTimeMillis();
        Object result = null;
        try {
            result = proceedingJoinPoint.proceed();
        } finally {
            String logInfo = "\n" +
                    "+========================================= Start ==========================================\n" +
                    "| Request        : " + request.getMethod() + " " + url + "\n" +
                    "| Request Params : " + param + "\n" +
                    "| Request IP     : " + request.getRemoteAddr() + "\n" +
                    "| Controller     : " + signature.getDeclaringTypeName() + "." + "(" + controllerClass.getSimpleName() + ".java" + ")" + "\n" +
                    "| Method         : " + method.getName() + buildParamsString(method) + "\n" +
                    "| Response       : " + getResponseText(result) + "\n" +
                    "| Elapsed Time   : " + (System.currentTimeMillis() - startTime) + " ms" + "\n" +
                    "+========================================== End ===========================================\n";
            log.debug(logInfo);
        }
        return result;
    }

    private static String getResponseText(Object result) {
        if (result instanceof ModelAndView && ((ModelAndView) result).isReference()) {
            return ((ModelAndView) result).getViewName();
        }

        String originalText;
        if (result instanceof String) {
            originalText = (String) result;
        } else {
            originalText = JSONUtil.toJsonStr(result);
        }

        if (StrUtil.isBlank(originalText)) {
            return "";
        }

        originalText = originalText.replace("\n", "");

        if (originalText.length() > 100) {
            return originalText.substring(0, 100) + "...";
        }

        try {
            return JSONUtil.toJsonStr(result, JSONConfig.create().setIgnoreNullValue(false));
        } catch (Exception e) {
            return "[Serialization Error: " + e.getMessage() + "]";
        }
    }

    private String buildParamsString(Method method) {
        String[] parameterNames = PARAMETER_NAME_DISCOVERER.getParameterNames(method);
        if (parameterNames == null || parameterNames.length == 0) {
            return "()";
        }
        StringJoiner joiner = new StringJoiner(", ", "(", ")");
        Class<?>[] parameterTypes = method.getParameterTypes();
        for (int i = 0; i < parameterNames.length; i++) {
            joiner.add(parameterTypes[i].getSimpleName() + " " + parameterNames[i]);
        }
        return joiner.toString();
    }

}
