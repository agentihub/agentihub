package com.litevar.ihub.core.entity;


import com.litevar.ihub.common.mongoplus.entity.BaseEntity;
import com.litevar.ihub.core.dto.StarDTO;
import com.mongoplus.annotation.ID;
import com.mongoplus.annotation.collection.CollectionName;
import com.mongoplus.annotation.index.MongoIndex;
import com.mongoplus.enums.IdTypeEnum;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.*;

/**
 * 用户收藏Agent实体
 * @author Teoan
 * @since 2025/7/24 12:15
 */
@EqualsAndHashCode(callSuper = true)
@Data
@CollectionName("stars")
@AutoMapper(target = StarDTO.class)
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Star extends BaseEntity {

    /**
     * 收藏记录唯一标识
     */
    @ID(type = IdTypeEnum.ASSIGN_ID)
    private String id;

    /**
     * 用户ID
     */
    @MongoIndex
    private String userId;

    /**
     * Agent ID
     */
    @MongoIndex
    private String agentId;


}