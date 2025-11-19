package com.litevar.ihub.core.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 *  agent创作编辑接口DTO
 * @author Teoan
 * @since 2025/9/18 11:08
 */
@Data
@Schema(description = "agent创作编辑接口DTO")
@NoArgsConstructor
@AllArgsConstructor
public class CreationChatDTO {

    /**
     * 用户指令
     */
    @NotBlank(message = "用户指令不能为空")
    @Schema(description = "用户指令")
    private String cmd;


    /**
     * 工具文件id列表
     */
    @Schema(description = "工具文件id列表")
    private List<String> toolFileIdList;



    /**
     * 知识库md文档id列表
     */
    @Schema(description = "知识库md文档id列表")
    private List<String> docsFileIdList;


}
