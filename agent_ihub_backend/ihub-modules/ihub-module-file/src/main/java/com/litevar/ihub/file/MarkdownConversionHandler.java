package com.litevar.ihub.file;

import cn.hutool.core.util.ObjUtil;
import cn.hutool.core.util.StrUtil;
import com.litevar.ihub.common.core.utils.RedisUtils;
import com.litevar.ihub.file.dto.ConversionProgressDTO;
import com.litevar.liteagent.markdown_conversion.core.ConversionResult;
import com.litevar.liteagent.markdown_conversion.service.MarkdownConversionService;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.time.Duration;

import static com.litevar.ihub.common.core.constant.CacheConstants.IHUB_CONVERSION_PROGRESS_KEY;

/**
 *
 * @author Teoan
 * @since 2025/10/13 18:01
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MarkdownConversionHandler {

    private final MarkdownConversionService markdownConversionService;

    @SneakyThrows
    public ConversionResult convert(Path path, String fileId, Path outputPath) {
        return markdownConversionService.convert(path, MarkdownConversionService.Settings.builder()
                .outputDir(outputPath)
                .detectScannedPdf(true)
                .progressListener((progress, stage, detail) ->
                        RedisUtils.set(StrUtil.format(IHUB_CONVERSION_PROGRESS_KEY, fileId), ConversionProgressDTO.builder()
                        .detail(detail).progress(progress * 100).stage(stage)
                        .build(), Duration.ofMinutes(30)))
                .build());

    }


    /**
     * 查询转换进度
     */
    public ConversionProgressDTO getConversionProgress(String fileId) {
        ConversionProgressDTO conversionProgressDTO = RedisUtils.get(StrUtil.format(IHUB_CONVERSION_PROGRESS_KEY, fileId), ConversionProgressDTO.class);
        if(ObjUtil.isEmpty(conversionProgressDTO)){
            // 由于是异步执行转换，这里有可能会找不到对应记录，返回0进度
            return ConversionProgressDTO.builder().detail("转换中请稍等。。。").progress(0.0).stage("PARSING").build();
        }
        return conversionProgressDTO;
    }


}
