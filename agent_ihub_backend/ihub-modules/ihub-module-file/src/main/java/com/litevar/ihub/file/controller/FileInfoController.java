package com.litevar.ihub.file.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.dev33.satoken.annotation.SaIgnore;
import com.litevar.ihub.common.web.R;
import com.litevar.ihub.file.dto.ConversionProgressDTO;
import com.litevar.ihub.file.dto.FileInfoDTO;
import com.litevar.ihub.file.dto.UpdateFileContentDTO;
import com.litevar.ihub.file.service.IFileInfoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * @author Teoan
 * @since 2025/9/18
 */
@RestController
@RequestMapping("/api/v1/file")
@Slf4j
@RequiredArgsConstructor
@Tag(name = "文件管理", description = "文件上传和管理接口")
public class FileInfoController {

    private final IFileInfoService fileInfoService;
    
    /**
     * 修改文件内容
     */
    @PutMapping("/content")
    @Operation(summary = "修改文件内容", description = "根据文件ID修改文件内容")
    @SaCheckLogin
    public R<Boolean> updateFileContent(
            @Validated @RequestBody UpdateFileContentDTO updateFileContentDTO) {
        return R.ok(fileInfoService.updateFileContent(updateFileContentDTO.getId(), updateFileContentDTO.getContent()));
    }
    
    /**
     * 上传工具描述文件
     */
    @PostMapping("/tool")
    @Operation(summary = "上传工具描述文件", description = "上传JSON或YML格式的工具描述文件")
    @SaCheckLogin
    public R<FileInfoDTO> uploadToolFile(@RequestParam("file") MultipartFile file) {
        FileInfoDTO fileInfo = fileInfoService.uploadToolFile(file);
        return R.ok(fileInfo);
    }


    /**
     * 上传知识库文件
     */
    @PostMapping("/knowledge")
    @Operation(summary = "上传知识库文件", description = "上传doc,ppt,pdf,txt文件,返回文件id,可查询文件上传进度")
    @SaCheckLogin
    public R<String> uploadKnowledgeFile(@RequestParam("file") MultipartFile file) {
        return R.ok("", fileInfoService.uploadKnowledgeFile(file));
    }

    /**
     * 获取知识库上传进度
     */
    @GetMapping("/knowledge/progress")
    @Operation(summary = "获取知识库上传进度", description = "获取知识库上传进度")
    @SaCheckLogin
    public R<ConversionProgressDTO> uploadKnowledgeFile(@RequestParam("fileId") String fileId) {
        return R.ok(fileInfoService.getConversionProgress(fileId));
    }

    /**
     * 删除文件信息
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除文件信息", description = "根据ID删除指定的文件信息")
    @Parameter(name = "id", description = "文件ID", required = true)
    @SaCheckLogin
    public R<Boolean> deleteFile(@NotBlank(message = "文件ID不能为空") @PathVariable("id") String id) {
        return R.ok(fileInfoService.removeById(id));
    }

    /**
     * 批量删除文件信息
     */
    @DeleteMapping("/batch")
    @Operation(summary = "批量删除文件信息", description = "根据ID列表批量删除文件信息")
    @SaCheckLogin
    public R<Boolean> deleteFiles(@RequestBody String[] ids) {
        return R.ok(fileInfoService.removeByIds(java.util.Arrays.asList(ids)));
    }

    /**
     * 根据ID列表获取文件信息
     */
    @PostMapping("/list")
    @Operation(summary = "根据ID列表获取文件信息", description = "根据ID列表获取文件信息")
    @SaCheckLogin
    public R<List<FileInfoDTO>> getFileInfosByIds(@RequestBody String[] ids) {
        List<FileInfoDTO> fileInfos = fileInfoService.getFileInfosByIds(java.util.Arrays.asList(ids));
        return R.ok(fileInfos);
    }

    /**
     * 根据文件ID获取文件内容
     */
    @GetMapping("/content/{id}")
    @Operation(summary = "获取文件内容", description = "根据文件ID获取文件内容，支持文本和图片")
    @SaIgnore
    public ResponseEntity<Resource> getFileContent(@PathVariable("id") String id) {
        return fileInfoService.getFileContent(id);
    }

    /**
     * 上传用户头像
     */
    @PostMapping("/avatar")
    @Operation(summary = "上传用户头像", description = "上传用户头像文件，支持png,jpeg,jpg,gif,bmp格式")
    @SaCheckLogin
    public R<String> uploadAvatarFile(@RequestParam("file") MultipartFile file) {
        return R.ok("", fileInfoService.uploadAvatarFile(file));
    }


    /**
     * 获取图片文件
     */
    @GetMapping("/images/{imagesFileName}")
    @Operation(summary = "获取图片文件", description = "获取图片文件")
    @Parameter(name = "imagesFileName", description = "图片文件名称", required = true)
    @SaIgnore
    public ResponseEntity<Resource> getImageFile(@NotBlank(message = "图片文件名称") @PathVariable("imagesFileName") String imagesFileName) {
        return fileInfoService.getImageFile(imagesFileName);
    }



}