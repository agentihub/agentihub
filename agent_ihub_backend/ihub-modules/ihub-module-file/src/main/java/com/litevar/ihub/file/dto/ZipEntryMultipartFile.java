package com.litevar.ihub.file.dto;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.ObjUtil;
import lombok.Data;
import org.jetbrains.annotations.NotNull;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;

/**
 * MultipartFile 包装类
 * @author Teoan
 * @since 2025/10/9 15:05
 */
@Data
public class ZipEntryMultipartFile implements MultipartFile {

    private final String name;
    private final String originalFilename;
    private final File tempFile;
    private String contentType;


    public ZipEntryMultipartFile(String entryName, InputStream contentStream) {
        this.name = entryName;
        this.originalFilename = entryName;

        // 创建临时文件并将流内容写入
        tempFile = FileUtil.createTempFile();
        FileUtil.writeFromStream(contentStream, tempFile);
        try {
            this.contentType = Files.probeContentType(this.tempFile.toPath());
        } catch (IOException e) {
            this.contentType = "application/octet-stream";
        }
    }


    /**
     * @param dest
     * @throws IllegalStateException
     */
    @Override
    public void transferTo(File dest) throws IllegalStateException {
            FileUtil.copyFile(tempFile, dest, StandardCopyOption.REPLACE_EXISTING);
    }

    /**
     * @return
     */
    @Override
    public @NotNull InputStream getInputStream() {
        return FileUtil.getInputStream(tempFile);
    }

    /**
     * @return
     * @throws IOException
     */
    @Override
    public byte @NotNull [] getBytes() throws IOException {
        return FileUtil.readBytes(tempFile);
    }

    /**
     * @return
     */
    @Override
    public long getSize() {
        return this.tempFile.length();
    }

    /**
     * @return
     */
    @Override
    public boolean isEmpty() {
        return ObjUtil.isEmpty(tempFile);
    }


}
