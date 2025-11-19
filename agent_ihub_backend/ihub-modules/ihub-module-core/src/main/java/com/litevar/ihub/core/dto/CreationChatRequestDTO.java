package com.litevar.ihub.core.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 传递给大模型的对话结构
 * @author Teoan
 * @since 2025/9/23 10:17
 */
@Data
@Schema(description = "传递给大模型的对话结构")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreationChatRequestDTO {

    /**
     * 用户指令
     */
    @NotBlank(message = "用户指令不能为空")
    @Schema(description = "用户指令")
    private String cmd;


    /**
     * 工具文件id列表
     */
    @Schema(description = "工具文件名称")
    private List<String> tools;



    /**
     * 知识库md文档id列表
     */
    @Schema(description = "知识库md文档列表")
    private List<String> docs;







}
