package com.litevar.ihub.common.translation.annotation;

import com.fasterxml.jackson.annotation.JacksonAnnotationsInside;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.litevar.ihub.common.translation.handler.TranslationHandler;
import com.litevar.ihub.common.translation.service.ITranslationService;

import java.lang.annotation.*;

/**
 * 通用翻译注解
 *
 * @author Teoan
 */
@Inherited
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.METHOD})
@Documented
@JacksonAnnotationsInside
@JsonSerialize(using = TranslationHandler.class)
public @interface Translation {


    /**
     * 翻译处理类
     */
    Class<? extends ITranslationService> translationService();

    /**
     * 映射字段 (如果不为空则取此字段的值)
     */
    String mapper() default "";

    /**
     * 字段名 需要翻译的字段名称
     */
    String fieldName() default "";

}
