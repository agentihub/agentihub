package com.litevar.ihub.file.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 *  文件上传进度DTO
 * @author Teoan
 * @since 2025/10/14 12:11
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ConversionProgressDTO {


    /**
     * 进度
     */
    @Schema(description = "进度")
    Double progress;

    /**
     * 状态
     */
    @Schema(description = "状态")
    String stage;


    /**
     * 详情
     */
    @Schema(description = "详情")
    String detail;

    @Schema(description = "文件信息,完成时返回")
    FileInfoDTO fileInfoDTO;
}
