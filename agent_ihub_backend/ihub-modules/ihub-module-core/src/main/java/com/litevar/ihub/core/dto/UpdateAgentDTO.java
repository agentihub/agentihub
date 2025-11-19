package com.litevar.ihub.core.dto;

import com.litevar.ihub.core.enums.PlatformType;
import com.mongoplus.annotation.ID;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * Agent更新信息DTO
 *
 * @author Teoan
 * @since 2025/7/24 17:30
 */
@Data
@Schema(description = "Agent更新信息DTO")
public class UpdateAgentDTO {

    /**
     * Agent唯一标识
     */
    @Schema(description = "Agent唯一标识")
    @ID
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
     * 分类
     */
    @Schema(description = "分类")
    private String category;

    /**
     * 是否公开
     */
    @Schema(description = "是否公开")
    private Boolean isPublic;


    /**
     * 标签列表
     */
    @Schema(description = "标签列表")
    private List<String> tags;

    /**
     * license
     */
    @Schema(description = "license信息")
    private AgentLicenseDTO license;

}