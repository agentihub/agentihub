package com.litevar.ihub.core.service;


import com.litevar.ihub.common.satoken.enums.UserRole;
import com.litevar.ihub.core.dto.UpdateUserDTO;
import com.litevar.ihub.core.dto.UserDTO;
import com.litevar.ihub.core.dto.UserStatsDTO;
import com.litevar.ihub.core.entity.User;
import com.mongoplus.model.PageResult;
import com.mongoplus.service.IService;

/**
 * @author Teoan
 * @since 2025/7/28 14:33
 */
public interface IUserService extends IService<User> {

    /**
     * 根据邮箱查询用户
     *
     * @param email 邮箱
     * @return 用户
     */
    User findUserByEmail(String email);


    /**
     * 根据用户名查询用户
     *
     * @return 用户
     */
    User findUserByUserName(String userName);


    /**
     * 更新用户信息
     *
     * @param updateUserDTO
     * @return
     */
    Boolean updateUser(UpdateUserDTO updateUserDTO);


    /**
     * 获取当前用户信息
     *
     * @return
     */
    UserDTO getCurrentUserProfile();

    /**
     * 获取用户关注者列表
     */
    PageResult<UserDTO> getUserFollowers(String userId,
                                         Integer pageNum,
                                         Integer pageSize);

    /**
     * 获取用户关注的人列表
     */
    PageResult<UserDTO> getUserFollowing(String userId,
                                         Integer pageNum,
                                         Integer pageSize);


    /**
     * 获取用户统计信息
     */
    UserStatsDTO getUserStats(String userId,Boolean allAgent);




    /**
     * 分页获取用户列表
     *
     * @param pageNum  页码
     * @param pageSize 每页数量
     * @return 用户分页结果
     */
    PageResult<UserDTO> listUsers(String content, UserRole userRole, Integer pageNum, Integer pageSize);

}