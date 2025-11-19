package com.litevar.ihub.core.entity;

import com.litevar.ihub.common.mongoplus.entity.BaseEntity;
import com.litevar.ihub.core.dto.AgentLicenseDTO;
import com.litevar.ihub.core.enums.LicenseType;
import com.mongoplus.annotation.ID;
import com.mongoplus.annotation.collection.CollectionName;
import com.mongoplus.annotation.index.MongoIndex;
import com.mongoplus.enums.IdTypeEnum;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * AgentLicense实体类
 * @author Teoan
 * @since 2025/10/20
 */
@EqualsAndHashCode(callSuper = true)
@Data
@AllArgsConstructor
@NoArgsConstructor
@CollectionName("agent_licenses")
@AutoMapper(target = AgentLicenseDTO.class)
public class AgentLicense extends BaseEntity implements Serializable {

    /**
     * License唯一标识
     */
    @ID(type = IdTypeEnum.ASSIGN_ID)
    private String id;

    /**
     * Agent唯一标识
     */
    @MongoIndex
    private String agentId;


    /**
     * 协议类型
     */
    private LicenseType type;

    /**
     * 官方协议或自定义协议链接
     */
    private String url;

    /**
     * 若为自定义协议，可直接存放文本
     */
    private String text;

    /**
     * 是否允许 Fork，前端显示或限制逻辑可用
     */
    private Boolean allowFork;
}