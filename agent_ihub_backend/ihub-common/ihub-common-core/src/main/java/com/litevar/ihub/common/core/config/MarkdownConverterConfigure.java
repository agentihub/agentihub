package com.litevar.ihub.common.core.config;

import cn.hutool.core.bean.BeanUtil;
import com.litevar.liteagent.markdown_conversion.detector.PdfScanDetector;
import com.litevar.liteagent.markdown_conversion.dolphin.DolphinPdfMarkdownClient;
import com.litevar.liteagent.markdown_conversion.dolphin.DolphinPdfMdProperties;
import com.litevar.liteagent.markdown_conversion.service.MarkdownConversionService;
import jakarta.annotation.Resource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 *
 * @author Teoan
 * @since 2025/10/13 17:31
 */
@Configuration
public class MarkdownConverterConfigure {


    @Resource
    IHubDolphinPdfMdProperties iHubDolphinPdfMdProperties;


    @Bean
    public MarkdownConversionService initMarkdownConversionService(){
        DolphinPdfMdProperties properties = new DolphinPdfMdProperties();
        BeanUtil.copyProperties(iHubDolphinPdfMdProperties,properties);
        return new MarkdownConversionService(new PdfScanDetector(),
                DolphinPdfMarkdownClient.createDefault(properties));
    }



}
