package com.litevar.ihub.file.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Model Metadata信息DTO
 *
 * @author Teoan
 * @since 2025/9/28
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FileDocMetadataDTO {


    /**
     * 名称
     */
    private String name;


    /**
     * 切割文档的分隔符,默认"\n\n"
     */
    private String separator="\n\n";

}