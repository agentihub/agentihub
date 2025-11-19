package com.litevar.ihub.file.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Metadata信息DTO
 *
 * @author Teoan
 * @since 2025/9/28
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FileAgentMetadataDTO {

    /**
     * Agent名称
     */

    private String agent;

    /**
     * 版本号
     */
    private String version;

    /**
     * 作者
     */
    private String author;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;
}