package com.litevar.ihub.file.service;

import com.litevar.ihub.file.dto.ConversionProgressDTO;
import com.litevar.ihub.file.dto.FileDocMetadataDTO;
import com.litevar.ihub.file.dto.FileInfoDTO;
import com.litevar.ihub.file.entity.FileInfo;
import com.mongoplus.service.IService;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * @author Teoan
 * @since 2025/9/18
 */
public interface IFileInfoService extends IService<FileInfo> {

    /**
     * 上传工具描述文件
     *
     * @param file 文件
     * @return 文件信息
     */
    FileInfoDTO uploadToolFile(MultipartFile file);


    /**
     * 上传知识库md文件
     *
     * @param file 文件
     * @return 文件信息
     */
    FileInfoDTO uploadKnowledgeMdFile(MultipartFile file);

    /**
     * 上传知识库文件
     *
     * @param file 文件
     * @return 文件信息
     */
    String uploadKnowledgeFile(MultipartFile file);


    /**
     * 上传知识库图片文件
     *
     * @param file 文件
     * @return 文件信息
     */
    FileInfoDTO uploadImagesFile(MultipartFile file);

    /**
     * 根据ID列表批量删除文件信息
     *
     * @param ids ID列表
     * @return 是否删除成功
     */
    boolean removeByIds(List<String> ids);


    /**
     * 更新文件的文档元数据和图片文件信息
     */
    void updateFileDocMetaData(String id, FileDocMetadataDTO fileDocMetadataDTO, List<String> imagesFileIds);




    ConversionProgressDTO getConversionProgress(String fileId);
    
    /**
     * 根据ID列表获取文件信息
     *
     * @param ids ID列表
     * @return 文件信息列表
     */
    List<FileInfoDTO> getFileInfosByIds(List<String> ids);
    

    
    /**
     * 根据文件ID获取文件内容及媒体类型
     * 
     * @param fileId 文件ID
     * @return 包含文件资源和媒体类型的对象
     */
    ResponseEntity<Resource> getFileContent(String fileId);

    /**
     * 上传用户头像
     *
     * @param file 头像文件
     * @return 文件信息
     */
    String uploadAvatarFile(MultipartFile file);



    /**
     * 根据图片文件名称获取图片
     *
     * @param imagesFileName 文件名称
     * @return 包含文件资源和媒体类型的对象
     */
    ResponseEntity<Resource> getImageFile(String imagesFileName);


    /**
     * 复制文件 返回新的文件id
     * @param fileId 文件id
     * @return 新的文件id
     */
    String copyFile(String fileId);

    /**
     * 修改文件内容
     *
     * @param fileId 文件ID
     * @param content 新的文件内容
     * @return 是否修改成功
     */
    boolean updateFileContent(String fileId, String content);

}