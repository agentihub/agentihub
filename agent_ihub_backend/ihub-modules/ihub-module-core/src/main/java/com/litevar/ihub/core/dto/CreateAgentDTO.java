package com.litevar.ihub.core.dto;

import com.litevar.ihub.core.enums.PlatformType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 *
 * @author Teoan
 * @since 2025/9/23 14:26
 */
@Data
@Schema(description = "创建Agent信息DTO")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateAgentDTO {


    /**
     * Agent id
     */
    @Schema(description = "AgentId")
    private String id;


    /**
     * Agent名称
     */
    @Schema(description = "Agent名称")
    @NotNull(message = "Agent名称不能为空")
    private String name;

    /**
     * Agent描述
     */
    @Schema(description = "Agent描述")
    private String description;

    /**
     * 平台类型 (LiteAgent、Dify、Coze等)
     */
    @Schema(description = "平台类型 (LiteAgent、Dify、Coze等)")
    @NotNull(message = "平台类型不能为空")
    private PlatformType platform;


    /**
     * md内容
     */
    @Schema(description = "md内容")
    @NotNull(message = "md内容不能为空")
    private String mdContent;

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


    /**
     * license
     */
    @Schema(description = "license信息")
    private AgentLicenseDTO license;


    /**
     * 是否公开
     */
    @Schema(description = "是否公开")
    private Boolean isPublic = false;
}
