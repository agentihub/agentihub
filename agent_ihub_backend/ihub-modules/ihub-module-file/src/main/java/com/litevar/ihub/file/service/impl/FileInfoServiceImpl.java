package com.litevar.ihub.file.service.impl;

import cn.dev33.satoken.context.mock.SaTokenContextMockUtil;
import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.thread.ThreadUtil;
import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.ObjUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.core.util.URLUtil;
import cn.hutool.crypto.SecureUtil;
import com.litevar.ihub.common.core.config.IHubUploadFileProperties;
import com.litevar.ihub.common.satoken.utils.LoginHelper;
import com.litevar.ihub.common.web.exception.BusinessException;
import com.litevar.ihub.common.web.exception.ErrorCode;
import com.litevar.ihub.file.MarkdownConversionHandler;
import com.litevar.ihub.file.dto.ConversionProgressDTO;
import com.litevar.ihub.file.dto.FileDocMetadataDTO;
import com.litevar.ihub.file.dto.FileInfoDTO;
import com.litevar.ihub.file.entity.FileInfo;
import com.litevar.ihub.file.enums.FileUploadType;
import com.litevar.ihub.file.service.IFileInfoService;
import com.litevar.liteagent.markdown_conversion.core.ConversionResult;
import com.mongoplus.service.impl.ServiceImpl;
import io.github.linpeilie.Converter;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static com.litevar.ihub.file.constant.DirConstants.*;

/**
 * @author Teoan
 * @since 2025/9/18
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileInfoServiceImpl extends ServiceImpl<FileInfo> implements IFileInfoService {

    private final IHubUploadFileProperties iHubUploadFileProperties;
    private final MarkdownConversionHandler markdownConversionHandler;
    private final Converter converter;


    private final List<String> toolsExtNameList = List.of("json", "yml", "yaml");
    private final List<String> knowledgeExtNameList = List.of("doc", "docx", "ppt", "txt", "word", "pdf", "md");
    private final List<String> imagesExtNameList = List.of("png", "jpeg", "jpg", "gif", "bmp");



    /**
     * 上传用户头像
     *
     * @param file 头像文件
     * @return 文件信息
     */
    @Override
    public String uploadAvatarFile(MultipartFile file) {
        // 限制头像文件大小为2MB
        if (file.getSize() > 2 * 1024 * 1024) {
            throw new BusinessException(ErrorCode.FILE_UPLOAD_ERROR, "头像文件大小不能超过2MB");
        }
        FileInfoDTO fileInfoDTO = uploadFile(file, FileUploadType.AVATARS, AVATAR_DIR, imagesExtNameList);
        return "/api/v1/file/content/" + fileInfoDTO.getId();
    }

    /**
     * 通用文件上传方法
     *
     * @param file         文件
     * @param uploadType   上传类型
     * @param subDirectory 子目录
     * @param extNameList  支持的扩展名列表
     * @return 文件信息
     */
    private FileInfoDTO uploadFile(MultipartFile file, FileUploadType uploadType, String subDirectory, List<String> extNameList) {
        Path uploadPath = Paths.get(iHubUploadFileProperties.getPath() + File.separator + subDirectory).toAbsolutePath().normalize();
        // 创建文件信息对象
        if (ObjUtil.isEmpty(file)) {
            throw new BusinessException(ErrorCode.FILE_UPLOAD_ERROR, "上传文件不能为空");
        }
        // 获取文件扩展名
        String extName = FileUtil.extName(file.getOriginalFilename());
        if (StrUtil.isNotBlank(extName) && !extNameList.contains(extName.toLowerCase())) {
            throw new BusinessException(ErrorCode.INVALID_FILE_FORMAT, StrUtil.format("只支持{}格式的文件", extNameList));
        }
        try {
            String md5 = SecureUtil.md5(file.getInputStream());
            FileInfo fileInfo = new FileInfo();
            fileInfo.setFileName(file.getOriginalFilename());
            fileInfo.setFileSize(file.getSize());
            if (StrUtil.isNotBlank(extName)) {
                fileInfo.setFileType(extName.toLowerCase());
            }
            fileInfo.setType(uploadType);
            fileInfo.setUserId(LoginHelper.getCurrentUserId());
            fileInfo.setUploadTime(LocalDateTime.now());


            // 确保上传目录存在
            File uploadDir = uploadPath.toFile();
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // 生成文件名
            String fileId = IdUtil.getSnowflakeNextIdStr();
            String newFileName = fileId + "." + extName;
            fileInfo.setId(fileId);

            // 保存文件到服务器
            String filePath = uploadPath + File.separator + newFileName;
            File destFile = new File(filePath);
            file.transferTo(destFile);

            // 设置文件Path
            fileInfo.setFilePath(filePath);
            fileInfo.setMd5(md5);
            // 保存文件信息到数据库
            save(fileInfo);

            return converter.convert(fileInfo, FileInfoDTO.class);
        } catch (IOException e) {
            log.error("文件上传失败", e);
            throw new BusinessException(ErrorCode.FILE_UPLOAD_ERROR, "文件上传失败: " + e.getMessage());
        }
    }


    /**
     * 保存文件信息
     *
     * @param file 文件
     */
    private FileInfoDTO saveFileInfo(File file, String fileId, String fileName, List<String> imagesFileIds) {
        // 计算md5 如果存在则直接返回
        String md5 = SecureUtil.md5(FileUtil.getInputStream(file));

        FileInfo fileInfo = new FileInfo();
        String extName = FileUtil.getSuffix(file.getName());

        fileInfo.setId(fileId);
        fileInfo.setFileName(fileName);
        fileInfo.setFileSize(file.length());
        fileInfo.setFileType(extName.toLowerCase());
        fileInfo.setFilePath(file.getPath());
        fileInfo.setType(FileUploadType.KNOWLEDGE);
        fileInfo.setUserId(LoginHelper.getCurrentUserId());
        fileInfo.setUploadTime(LocalDateTime.now());
        fileInfo.setMd5(md5);
        fileInfo.setImagesFileIds(imagesFileIds);
        save(fileInfo);

        return converter.convert(fileInfo, FileInfoDTO.class);
    }


    /**
     * 上传工具描述文件
     *
     * @param file 文件
     * @return 文件信息
     */
    @Override
    public FileInfoDTO uploadToolFile(MultipartFile file) {
        return uploadFile(file, FileUploadType.TOOLS, TOOLS_DIR, toolsExtNameList);
    }

    /**
     * 上传知识库md文件
     *
     * @param file 文件
     * @return 文件信息
     */
    @Override
    @SneakyThrows
    public FileInfoDTO uploadKnowledgeMdFile(MultipartFile file) {
        return uploadFile(file, FileUploadType.KNOWLEDGE, KNOWLEDGE_BASES_DIR, knowledgeExtNameList);
    }


    /**
     * 上传知识库文件 返回md文件id
     *
     * @param file 文件
     * @return 文件信息
     */
    @Override
    @SneakyThrows
    public String uploadKnowledgeFile(MultipartFile file) {

        // 获取文件扩展名
        String extName = FileUtil.extName(file.getOriginalFilename());
        if (StrUtil.isNotBlank(extName) && !knowledgeExtNameList.contains(extName.toLowerCase())) {
            throw new BusinessException(ErrorCode.INVALID_FILE_FORMAT, StrUtil.format("只支持{}格式的文件", knowledgeExtNameList));
        }

        String fileId = IdUtil.getSnowflakeNextIdStr();
        String tokenValue = StpUtil.getTokenValue();
        byte[] fileBytes = file.getBytes();
        // 异步执行
        ThreadUtil.execute(() -> SaTokenContextMockUtil.setMockContext(() -> {
            StpUtil.setTokenValueToStorage(tokenValue);
            File tempFile = FileUtil.createTempFile("knowledge", "." + extName, false);
            FileUtil.writeBytes(fileBytes, tempFile);
            // 转换为md和图片
            ConversionResult convert = markdownConversionHandler.convert(tempFile.toPath(), fileId,
                    Paths.get(iHubUploadFileProperties.getPath()
                            + File.separator + KNOWLEDGE_BASES_DIR).toAbsolutePath().normalize());
            List<String> imagesFileIds = new ArrayList<>();
            convert.getExportedResources().forEach(path -> {
                FileInfoDTO imageFileInfo = saveFileInfo(path.toFile(), null, path.toFile().getName(), new ArrayList<>());
                imagesFileIds.add(imageFileInfo.getId());
            });
            String mdFileName = FileUtil.getPrefix(file.getOriginalFilename()) + ".md";
            convert.getMarkdownFiles().forEach(path ->
                    saveFileInfo(path.toFile(), fileId, mdFileName, imagesFileIds));
            FileUtil.del(tempFile);
        }));
        return fileId;
    }


    /**
     * 上传知识库图片文件
     *
     * @param file 文件
     * @return 文件信息
     */
    @Override
    public FileInfoDTO uploadImagesFile(MultipartFile file) {
        return uploadFile(file, FileUploadType.KNOWLEDGE, KNOWLEDGE_BASES_DIR + File.separator +
                KNOWLEDGE_BASES_IMAGES_DIR, imagesExtNameList);
    }

    /**
     * 根据ID列表批量删除文件信息
     *
     * @param ids ID列表
     * @return 是否删除成功
     */
    @Override
    public boolean removeByIds(List<String> ids) {
        List<FileInfo> fileInfos = getByIds(ids);
        fileInfos.forEach(fileInfo -> {
            File file = new File(fileInfo.getFilePath());
            FileUtil.del(file);
            removeById(fileInfo.getId());
        });
        return true;
    }

    /**
     * 更新文件的文档元数据
     *
     * @param id
     * @param fileDocMetadataDTO
     */
    @Override
    public void updateFileDocMetaData(String id, FileDocMetadataDTO fileDocMetadataDTO, List<String> imagesFileIds) {
        lambdaUpdate()
                .eq(FileInfo::getId, id)
                .set(FileInfo::getMetadata, fileDocMetadataDTO)
                .set(FileInfo::getImagesFileIds, imagesFileIds)
                .update();
    }


    /**
     * @param fileId
     * @return
     */
    @Override
    public ConversionProgressDTO getConversionProgress(String fileId) {
        ConversionProgressDTO conversionProgress = markdownConversionHandler.getConversionProgress(fileId);
        // 完成时添加文件信息
        if (conversionProgress.getProgress().equals(100.0)) {
            FileInfo fileInfo = getById(fileId);
            conversionProgress.setFileInfoDTO(converter.convert(fileInfo, FileInfoDTO.class));
        }
        return conversionProgress;
    }

    /**
     * 根据ID列表获取文件信息
     *
     * @param ids ID列表
     * @return 文件信息列表
     */
    @Override
    public List<FileInfoDTO> getFileInfosByIds(List<String> ids) {
        List<FileInfo> fileInfos = getByIds(ids);
        return converter.convert(fileInfos, FileInfoDTO.class);
    }


    /**
     * 根据文件ID获取文件信息
     *
     * @param fileId 文件ID
     * @return 文件信息
     */
    private FileInfo getFileInfoById(String fileId) {
        FileInfo fileInfo = getById(fileId);
        if (fileInfo == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "文件不存在");
        }

        File file = new File(fileInfo.getFilePath());
        if (!FileUtil.exist(file)) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "文件不存在");
        }
        
        return fileInfo;
    }
    
    /**
     * 根据文件ID获取文件内容及媒体类型
     *
     * @param fileId 文件ID
     * @return 包含文件资源和媒体类型的对象
     */
    @Override
    public ResponseEntity<Resource> getFileContent(String fileId) {
        FileInfo fileInfo = getFileInfoById(fileId);

        File file = new File(fileInfo.getFilePath());

        Resource resource = new FileSystemResource(file);

        // 获取文件信息以确定内容类型
        String fileType = fileInfo.getFileType().toLowerCase();

        // 根据文件类型设置内容类型
        MediaType mediaType = getMediaType(fileType);

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + URLUtil.encode(fileInfo.getFileName()) + "\"")
                .body(resource);
    }


    /**
     * 根据图片文件名称获取图片
     *
     * @param imagesFileName 文件名称
     * @return 包含文件资源和媒体类型的对象
     */
    @Override
    public ResponseEntity<Resource> getImageFile(String imagesFileName) {
        Path uploadPath = Paths.get(iHubUploadFileProperties.getPath() +
                File.separator + KNOWLEDGE_BASES_DIR + File.separator + KNOWLEDGE_BASES_IMAGES_DIR + File.separator + imagesFileName);
        File file = uploadPath.toFile();
        if (!FileUtil.exist(file)) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "文件不存在");
        }

        Resource resource = new FileSystemResource(file);

        // 获取文件信息以确定内容类型
        String fileType = FileUtil.extName(imagesFileName);

        // 根据文件类型设置内容类型
        MediaType mediaType = getMediaType(fileType);

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + URLUtil.encode(imagesFileName) + "\"")
                .body(resource);
    }

    /**
     * 根据文件扩展名获取对应的MediaType
     *
     * @param fileType 文件扩展名
     * @return 对应的MediaType
     */
    private MediaType getMediaType(String fileType) {
        return switch (fileType) {
            case "jpg", "jpeg" -> MediaType.IMAGE_JPEG;
            case "png" -> MediaType.IMAGE_PNG;
            case "gif" -> MediaType.valueOf("image/gif");
            case "bmp" -> MediaType.valueOf("image/bmp");
            case "json" -> MediaType.APPLICATION_JSON;
            case "xml" -> MediaType.APPLICATION_XML;
            case "pdf" -> MediaType.APPLICATION_PDF;
            default -> MediaType.TEXT_PLAIN;
        };
    }

    /**
     * 复制文件 返回新的文件id
     *
     * @param fileId 文件id
     * @return 新的文件id
     */
    @Override
    public String copyFile(String fileId) {
        // 获取原始文件信息
        FileInfo originalFileInfo = getFileInfoById(fileId);
        File originalFile = new File(originalFileInfo.getFilePath());
        try {
            // 生成新的文件ID和文件名
            String newFileId = IdUtil.getSnowflakeNextIdStr();
            String extName = originalFileInfo.getFileType();
            String newFileName = newFileId + (StrUtil.isNotBlank(extName) ? "." + extName : "");
            
            // 确定子目录
            String subDirectory = "";
            switch (originalFileInfo.getType()) {
                case TOOLS -> subDirectory = TOOLS_DIR;
                case KNOWLEDGE -> subDirectory = KNOWLEDGE_BASES_DIR;
                case AVATARS -> subDirectory = AVATAR_DIR;
                default -> {
                }
            }
            
            // 构建新的文件路径
            Path uploadPath = Paths.get(iHubUploadFileProperties.getPath() + File.separator + subDirectory).toAbsolutePath().normalize();
            String newFilePath = uploadPath + File.separator + newFileName;
            
            // 确保上传目录存在
            File uploadDir = uploadPath.toFile();
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            
            // 复制文件到新位置
            FileUtil.copy(originalFile, new File(newFilePath), true);
            
            // 创建新的文件信息记录
            FileInfo newFileInfo = new FileInfo();
            newFileInfo.setId(newFileId);
            newFileInfo.setFileName(originalFileInfo.getFileName());
            newFileInfo.setFileSize(originalFileInfo.getFileSize());
            newFileInfo.setFileType(originalFileInfo.getFileType());
            newFileInfo.setFilePath(newFilePath);
            newFileInfo.setMd5(originalFileInfo.getMd5());
            newFileInfo.setType(originalFileInfo.getType());
            newFileInfo.setMetadata(originalFileInfo.getMetadata());
            newFileInfo.setImagesFileIds(originalFileInfo.getImagesFileIds());
            newFileInfo.setUserId(LoginHelper.getCurrentUserId());
            newFileInfo.setUploadTime(LocalDateTime.now());
            
            // 保存新的文件信息到数据库
            save(newFileInfo);
            
            return newFileId;
        } catch (Exception e) {
            log.error("文件复制失败", e);
            throw new BusinessException(ErrorCode.FILE_UPLOAD_ERROR, "文件复制失败: " + e.getMessage());
        }
    }
    
    /**
     * 修改文件内容
     *
     * @param fileId 文件ID
     * @param content 新的文件内容
     * @return 是否修改成功
     */
    @Override
    public boolean updateFileContent(String fileId, String content) {
        // 获取文件信息
        FileInfo fileInfo = getFileInfoById(fileId);

        // 检查文件是否存在
        File file = new File(fileInfo.getFilePath());

        try {
            // 写入新内容到文件
            FileUtil.writeString(content, file, StandardCharsets.UTF_8);
            
            // 更新文件大小
            fileInfo.setFileSize((long) content.getBytes(StandardCharsets.UTF_8).length);
            fileInfo.setMd5(SecureUtil.md5(content));
            updateById(fileInfo);
            
            return true;
        } catch (Exception e) {
            log.error("文件内容更新失败", e);
            throw new BusinessException(ErrorCode.FILE_UPLOAD_ERROR, "文件内容更新失败: " + e.getMessage());
        }
    }
}