package com.litevar.ihub.common.translation.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.litevar.ihub.common.translation.handler.TranslationBeanSerializerModifier;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.AutoConfiguration;

/**
 * 翻译模块配置类
 *
 * @author Teoan
 */
@Slf4j
@AutoConfiguration
@RequiredArgsConstructor
public class TranslationConfig {

    private final ObjectMapper objectMapper;

    @PostConstruct
    public void init() {
        // 设置 Bean 序列化修改器
        objectMapper.setSerializerFactory(
            objectMapper.getSerializerFactory()
                .withSerializerModifier(new TranslationBeanSerializerModifier()));
    }

}
