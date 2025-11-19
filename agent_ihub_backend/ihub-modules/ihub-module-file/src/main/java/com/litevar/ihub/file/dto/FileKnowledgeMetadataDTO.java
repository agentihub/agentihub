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
public class FileKnowledgeMetadataDTO {

    /**
     * ID
     */
    private String id;

    /**
     * 名称
     */
    private String name;

    /**
     * 描述
     */
    private String description;

    /**
     * 嵌入模型ID
     */
    private String embeddingModelId;

    /**
     * TopK
     */
    private Integer topK = 10;

    /**
     * 分数阈值
     */
    private Double scoreThreshold = 0.5;
}