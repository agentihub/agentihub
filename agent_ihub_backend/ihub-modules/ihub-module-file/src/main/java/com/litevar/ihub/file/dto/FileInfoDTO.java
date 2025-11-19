package com.litevar.ihub.file.dto;


import com.litevar.ihub.file.enums.FileUploadType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 文件信息DTO
 *
 * @author Teoan
 * @since 2025/7/24 17:30
 */
@Data
@Schema(description = "文件信息DTO")
public class FileInfoDTO {

    /**
     * 文件ID
     */
    @Schema(description = "文件ID")
    private String id;

    /**
     * 文件名
     */
    @Schema(description = "完整文件名")
    private String fileName;

    /**
     * 文件大小 (字节)
     */
    @Schema(description = "文件大小 (字节)")
    private Long fileSize;

    /**
     * 文件类型
     */
    @Schema(description = "文件类型")
    private String fileType;


    /**
     * 上传类型 (tools,knowledge)
     */
    @Schema(description = "上传类型")
    private FileUploadType type;


    /**
     * 文件的md5
     */
    @Schema(description = "md5")
    private String md5;

    /**
     * 文档文件的元数据 从liteagent导入的需保留原数据，否则导出时生成
     */
    @Schema(description = "文档文件的元数据 从liteagent导入的需保留原数据，否则导出时生成")
    private FileDocMetadataDTO metadata;


    /**
     * 关联图片文件ID
     */
    @Schema(description = "关联图片文件ID")
    private List<String> imagesFileIds;

    /**
     * 上传用户ID
     */
    @Schema(description = "上传用户ID")
    private String userId;

    /**
     * 上传时间
     */
    @Schema(description = "上传时间")
    private LocalDateTime uploadTime;

}