package com.litevar.ihub.file.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author Teoan
 * @since 2025/10/9 14:19
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ImportKnowledgeDTO {

    /**
     * 知识库元数据
     */
    FileKnowledgeMetadataDTO metadata;

    /*
     * 文档信息
     */
    Map<String,ImportDocDTO> document = new HashMap<>();

    /**
     * 文档信息
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ImportDocDTO {

        FileDocMetadataDTO metadata;
        /**
         * md文件信息
         */
        FileInfoDTO mdFileInfo;

        /**
         * 关联图片文件ID
         */
         List<String> imagesFileIds = new ArrayList<>();
    }

}
