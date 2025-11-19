package com.litevar.ihub.core.dto;

import com.litevar.ihub.common.translation.annotation.Translation;
import com.litevar.ihub.common.translation.service.IUserTranslationService;
import com.litevar.ihub.core.enums.PlatformType;
import com.mongoplus.annotation.ID;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Agent信息DTO
 *
 * @author Teoan
 * @since 2025/7/24 17:30
 */
@Data
@Schema(description = "Agent信息DTO")
public class AgentDTO {

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
     * 摘要文档id
     */
    @Schema(description = "摘要文档id")
    private String documentId;


    /**
     * 作者用户ID
     */
    @Schema(description = "作者用户ID")
    private String authorId;

    /**
     * 作者用户名
     */
    @Schema(description = "作者用户名")
    @Translation(translationService = IUserTranslationService.class,
            mapper = "#authorId", fieldName = "userName")
    private String authorName;


    /**
     * 作者昵称
     */
    @Schema(description = "作者昵称")
    @Translation(translationService = IUserTranslationService.class,
            mapper = "#authorId", fieldName = "nickName")
    private String authorNickName;

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
     * 最新的版本号
     */
    @Schema(description = "版本号")
    private String version;

    /**
     * 收藏数
     */
    @Schema(description = "收藏数")
    private Integer stars;

    /**
     * 分叉数
     */
    @Schema(description = "分叉数")
    private Integer forks;

    /**
     * 浏览数
     */
    @Schema(description = "浏览数")
    private Integer views;

    /**
     * 是否发布
     */
    @Schema(description = "是否发布")
    private Boolean isPublished;

    /**
     * 创建时间
     */
    @Schema(description = "创建时间")
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @Schema(description = "更新时间")
    private LocalDateTime updateTime;

    /**
     * 是否已star
     */
    @Schema(description = "是否已star")
    private Boolean isStarred = false;


    /**
     * fork 信息
     */
    @Schema(description = "fork 信息")
    private ForkDTO forkInfo;


    /**
     * license 信息
     */
    @Schema(description = "license信息")
    private AgentLicenseDTO license;

}