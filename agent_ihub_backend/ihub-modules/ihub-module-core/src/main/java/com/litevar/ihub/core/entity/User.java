package com.litevar.ihub.core.entity;


import com.litevar.ihub.common.mongoplus.entity.BaseEntity;
import com.litevar.ihub.common.satoken.entity.LoginUser;
import com.litevar.ihub.common.satoken.enums.UserRole;
import com.litevar.ihub.common.satoken.enums.UserStatus;
import com.litevar.ihub.core.dto.UpdateUserDTO;
import com.litevar.ihub.core.dto.UserDTO;
import com.mongoplus.annotation.ID;
import com.mongoplus.annotation.collection.CollectionName;
import com.mongoplus.annotation.index.MongoIndex;
import com.mongoplus.enums.IdTypeEnum;
import io.github.linpeilie.annotations.AutoMapper;
import io.github.linpeilie.annotations.AutoMappers;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * @author Teoan
 * @since 2025/7/24 11:46
 */
@EqualsAndHashCode(callSuper = true)
@Data
@CollectionName("users")
@AutoMappers({
        @AutoMapper(target = UserDTO.class),
        @AutoMapper(target = LoginUser.class),
        @AutoMapper(target = UpdateUserDTO.class)
})
public class User extends BaseEntity {

    /**
     * 用户唯一标识
     */
    @ID(type = IdTypeEnum.ASSIGN_ID)
    private String id;

    /**
     * 用户邮箱
     */
    @MongoIndex
    private String email;


    /**
     * 用户邮箱
     */
    @MongoIndex
    private String phone;

    /**
     * 用户名
     */
    @MongoIndex
    private String userName;

    /**
     * 昵称
     */
    private String nickName;

    /**
     * 密码
     */
    private String passwordHash;

    /**
     * 用户头像URL
     */
    private String avatar;

    /**
     * 用户简介
     */
    private String bio;

    /**
     * 用户位置
     */
    private String location;

    /**
     * 用户网站
     */
    private String website;

    /**
     * 用户角色
     *
     * @see UserRole
     */
    private UserRole role;

    /**
     * 用户状态
     *
     * @see UserStatus
     */
    private UserStatus status;


    /**
     * 最后登录时间
     */
    private LocalDateTime lastLoginTime;

}