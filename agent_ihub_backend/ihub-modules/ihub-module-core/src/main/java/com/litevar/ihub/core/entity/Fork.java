package com.litevar.ihub.core.entity;


import com.litevar.ihub.common.mongoplus.entity.BaseEntity;
import com.litevar.ihub.core.dto.ForkDTO;
import com.mongoplus.annotation.ID;
import com.mongoplus.annotation.collection.CollectionName;
import com.mongoplus.annotation.index.MongoIndex;
import com.mongoplus.enums.IdTypeEnum;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.*;

/**
 * fork 实体类
 * @author Teoan
 * @since 2025/7/24 12:21
 */
@EqualsAndHashCode(callSuper = true)
@Data
@AllArgsConstructor
@NoArgsConstructor
@CollectionName("forks")
@AutoMapper(target = ForkDTO.class)
@Builder
public class Fork extends BaseEntity {
    /**
     * Fork记录唯一标识
     */
    @ID(type = IdTypeEnum.ASSIGN_ID)
    private String id;

    /**
     * Fork用户ID
     */
    @MongoIndex
    private String userId;

    /**
     * 原始Agent ID
     */
    @MongoIndex
    private String originalAgentId;


    /**
     * 原始Agent 作者id
     */
    @MongoIndex
    private String originalAgentAuthorId;

    /**
     * Fork后的新Agent ID
     */
    @MongoIndex
    private String forkedAgentId;


}