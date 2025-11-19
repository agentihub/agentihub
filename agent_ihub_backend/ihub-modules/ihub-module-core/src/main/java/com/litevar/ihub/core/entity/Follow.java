package com.litevar.ihub.core.entity;


import com.litevar.ihub.common.mongoplus.entity.BaseEntity;
import com.litevar.ihub.core.dto.FollowDTO;
import com.mongoplus.annotation.ID;
import com.mongoplus.annotation.collection.CollectionName;
import com.mongoplus.annotation.index.MongoIndex;
import com.mongoplus.enums.IdTypeEnum;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.*;

/**
 * follow
 * @author Teoan
 * @since 2025/7/24 12:25
 */
@EqualsAndHashCode(callSuper = true)
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@CollectionName("follows")
@AutoMapper(target = FollowDTO.class)
public class Follow extends BaseEntity {


    /**
     * 关注关系唯一标识
     */
    @ID(type = IdTypeEnum.ASSIGN_ID)
    private String id;

    /**
     * 关注者ID
     */
    @MongoIndex
    private String followerId;

    /**
     * 被关注者ID
     */
    @MongoIndex
    private String followingId;



}