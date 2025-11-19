package com.litevar.ihub.core.entity;

import com.litevar.ihub.common.mongoplus.entity.BaseEntity;
import com.litevar.ihub.core.dto.AgentDTO;
import com.litevar.ihub.core.dto.CreateAgentDTO;
import com.litevar.ihub.core.dto.UpdateAgentDTO;
import com.litevar.ihub.core.enums.PlatformType;
import com.mongoplus.annotation.ID;
import com.mongoplus.annotation.collection.CollectionName;
import com.mongoplus.annotation.index.MongoIndex;
import com.mongoplus.enums.IdTypeEnum;
import io.github.linpeilie.annotations.AutoMapper;
import io.github.linpeilie.annotations.AutoMappers;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

/**
 * Agent实体类
 * @author Teoan
 * @since 2025/7/24 11:21
 */
@EqualsAndHashCode(callSuper = true)
@Data
@AllArgsConstructor
@NoArgsConstructor
@CollectionName("agents")
@AutoMappers({
        @AutoMapper(target = AgentDTO.class),
        @AutoMapper(target = CreateAgentDTO.class),
        @AutoMapper(target = UpdateAgentDTO.class)
})
public class Agent extends BaseEntity implements Serializable {

    /**
     * Agent唯一标识
     */
    @ID(type = IdTypeEnum.ASSIGN_ID)
    private String id;

    /**
     * Agent名称
     */
    @MongoIndex
    private String name;

    /**
     * Agent描述
     */
    private String description;

    /**
     * 平台类型 (LiteAgent、Dify、Coze等)
     */
    @MongoIndex
    private PlatformType platform;


    /**
     * 作者用户ID
     */
    @MongoIndex
    private String authorId;


    /**
     * 分类
     */
    @MongoIndex
    private String category;

    /**
     * 是否公开
     */
    @MongoIndex
    private Boolean isPublic = false;


    /**
     * md内容
     */
    @MongoIndex
    private String mdContent;


    /**
     * 工具文件id列表
     */
    private List<String> toolFileIdList;


    /**
     * 摘要文档id
     */
    private String documentId;

    /**
     * 知识库md文档id列表
     */
    private List<String> docsFileIdList;

    /**
     * 标签列表
     */
    @MongoIndex
    private List<String> tags;



    /**
     * 仓库地址
     */
    private String repository;

    /**
     * 最新的版本号
     */
    private String version;

    /**
     * 收藏数
     */
    private Integer stars = 0;

    /**
     * 分叉数
     */
    private Integer forks = 0;

    /**
     * 浏览数
     */
    private Integer views = 0;

    /**
     * 是否发布
     */
    @MongoIndex
    private Boolean isPublished = false;

}