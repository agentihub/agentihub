package com.litevar.ihub.common.translation.handler;

import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.ReflectUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.extra.spring.SpringUtil;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.BeanProperty;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.ContextualSerializer;
import com.litevar.ihub.common.translation.annotation.Translation;
import com.litevar.ihub.common.translation.service.ITranslationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.expression.EvaluationContext;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;

import java.io.IOException;
import java.util.Arrays;
import java.util.Objects;

/**
 * 翻译处理器
 *
 * @author Teoan
 */
@Slf4j
public class TranslationHandler extends JsonSerializer<Object> implements ContextualSerializer {


    private static final ExpressionParser parser = new SpelExpressionParser();

    /**
     * 全局翻译实现类映射器
     */
    private Translation translation;

    /**
     * 序列化方法，用于将对象序列化为JSON时进行翻译处理
     *
     * @param value       需要序列化的值
     * @param gen         JSON生成器
     * @param serializers 序列化提供者
     * @throws IOException IO异常
     */
    @Override
    public void serialize(Object value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        Class<? extends ITranslationService> aClass = translation.translationService();
        ITranslationService translationService = SpringUtil.getBean(aClass);
        if (ObjectUtil.isNotNull(translationService)) {
            // 如果映射字段不为空 则取映射字段的值
            if (StrUtil.isNotBlank(translation.mapper())) {
                value = getMappingValue(gen.currentValue(), translation.mapper());
            }
            // 如果为 null 直接写出
            if (ObjectUtil.isNull(value) || StrUtil.isBlankIfStr(value)) {
                gen.writeNull();
                return;
            }
            try {
                Object result = translationService.cacheTranslation(value, translation.fieldName());
                gen.writeObject(result);
            } catch (Exception e) {
                log.error("翻译处理异常，class: {}, value: {}", translation.translationService(), value, e);
                // 出现异常时输出原始值而不是中断序列化
                gen.writeObject(value);
            }
        } else {
            log.debug("未找到翻译处理实现类,输出原始值,translationService:{}", aClass);
            gen.writeObject(value);
        }
    }

    /**
     * 创建上下文序列化器
     *
     * @param prov     序列化提供者
     * @param property Bean属性
     * @return 序列化器
     * @throws JsonMappingException JSON映射异常
     */
    @Override
    public JsonSerializer<?> createContextual(SerializerProvider prov, BeanProperty property) throws JsonMappingException {
        Translation translation = property.getAnnotation(Translation.class);
        if (Objects.nonNull(translation)) {
            this.translation = translation;
            return this;
        }
        return prov.findValueSerializer(property.getType(), property);
    }



    Object getMappingValue(Object object, String expressionStr) {
        // 创建SpEL表达式解析器
        EvaluationContext context = new StandardEvaluationContext();

        // 将方法参数添加到表达式上下文中
        Arrays.asList(ReflectUtil.getFields(object.getClass())) .forEach(field ->
                context.setVariable(field.getName(), ReflectUtil.getFieldValue(object, field)));

        if (StrUtil.isBlank(expressionStr)) {
            return expressionStr;
        }
        try {
            return parser.parseExpression(expressionStr).getValue(context, Object.class);
        } catch (Exception e) {
            log.warn("解析SpEL表达式失败: {}, 返回空值", expressionStr, e);
            return null;
        }
    }
}