package com.litevar.ihub.file.entity;

import com.litevar.ihub.common.mongoplus.entity.BaseEntity;
import com.litevar.ihub.file.dto.FileDocMetadataDTO;
import com.litevar.ihub.file.dto.FileInfoDTO;
import com.litevar.ihub.file.enums.FileUploadType;
import com.mongoplus.annotation.ID;
import com.mongoplus.annotation.collection.CollectionName;
import com.mongoplus.annotation.index.MongoIndex;
import com.mongoplus.enums.IdTypeEnum;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 文件信息
 * @author Teoan
 * @since 2025/7/24 12:29
 */
@EqualsAndHashCode(callSuper = true)
@Data
@AllArgsConstructor
@NoArgsConstructor
@CollectionName("file_infos")
@AutoMapper(target = FileInfoDTO.class)
public class FileInfo extends BaseEntity {

    /**
     * 文件ID
     */
    @ID(type = IdTypeEnum.ASSIGN_ID)
    private String id;

    /**
     * 文件名
     */
    private String fileName;

    /**
     * 文件大小 (字节)
     */
    private Long fileSize;


    /**
     * 文件类型
     */
    private String fileType;

    /**
     * 文件Path
     */
    private String filePath;

    /**
     * 文件md5
     */
    private String md5;


    /**
     * 上传类型 (tools,knowledge)
     */
    private FileUploadType type;

    /**
     * 文档文件的元数据 从liteagent导入的需保留原数据，否则导出时生成
     */
    private FileDocMetadataDTO metadata;

    /**
     * 关联图片文件ID
     */
    private List<String> imagesFileIds;


    /**
     * 上传用户ID
     */
    @MongoIndex
    private String userId;


    /**
     * 上传时间
     */
    private LocalDateTime uploadTime;


}