package com.litevar.ihub.core.entity;

import com.litevar.ihub.common.mongoplus.entity.BaseEntity;
import com.mongoplus.annotation.ID;
import com.mongoplus.annotation.collection.CollectionName;
import com.mongoplus.annotation.index.MongoIndex;
import com.mongoplus.enums.IdTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Agent发布信息实体类
 * @author Teoan
 * @since 2025/10/13
 */
@EqualsAndHashCode(callSuper = true)
@Data
@AllArgsConstructor
@NoArgsConstructor
@CollectionName("agent_releases")
public class AgentRelease extends BaseEntity implements Serializable {

    /**
     * 发布信息唯一标识
     */
    @ID(type = IdTypeEnum.ASSIGN_ID)
    private String id;

    /**
     * Agent ID
     */
    @MongoIndex
    private String agentId;

    /**
     * 版本号
     */
    @MongoIndex
    private String version;

    /**
     * 发布说明
     */
    private String releaseNotes;
}