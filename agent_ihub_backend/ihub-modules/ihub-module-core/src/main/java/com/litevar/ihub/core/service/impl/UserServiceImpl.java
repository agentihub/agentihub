package com.litevar.ihub.core.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.bean.copier.CopyOptions;
import cn.hutool.core.util.ObjUtil;
import cn.hutool.core.util.ReflectUtil;
import cn.hutool.core.util.StrUtil;
import com.litevar.ihub.common.core.utils.RedisUtils;
import com.litevar.ihub.common.satoken.enums.UserRole;
import com.litevar.ihub.common.satoken.utils.LoginHelper;
import com.litevar.ihub.common.translation.service.IUserTranslationService;
import com.litevar.ihub.common.web.exception.BusinessException;
import com.litevar.ihub.common.web.exception.ErrorCode;
import com.litevar.ihub.core.dto.UpdateUserDTO;
import com.litevar.ihub.core.dto.UserDTO;
import com.litevar.ihub.core.dto.UserStatsDTO;
import com.litevar.ihub.core.entity.User;
import com.litevar.ihub.core.service.*;
import com.mongoplus.manager.LogicManager;
import com.mongoplus.model.PageResult;
import com.mongoplus.service.impl.ServiceImpl;
import io.github.linpeilie.Converter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.Serializable;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

import static com.litevar.ihub.common.core.constant.CacheConstants.IHUB_TRANSLATION_CACHE_KEY;

/**
 * 用户服务实现类
 *
 * @author Teoan
 * @since 2025/7/24 11:46
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<User> implements IUserService, IUserTranslationService {

    private final IFollowService followService;
    private final IStarService starService;
    private final IForkService forkService;
    private final IAgentsService agentService;
    private final Converter converter;

    /**
     * 根据邮箱查询用户
     *
     * @param email 邮箱
     * @return 用户
     */
    @Override
    public User findUserByEmail(String email) {
        return this.one(this.lambdaQuery().eq(User::getEmail, email));
    }


    /**
     * 根据用户名查询用户
     *
     * @param userName 用户名
     * @return 用户
     */
    @Override
    public User findUserByUserName(String userName) {
        return this.one(this.lambdaQuery().eq(User::getUserName, userName));
    }

    /**
     * 获取用户关注者列表
     *
     * @param userId   用户ID
     * @param pageNum  页码
     * @param pageSize 每页数量
     * @return 用户关注者分页列表
     */
    @Override
    public PageResult<UserDTO> getUserFollowers(String userId, Integer pageNum, Integer pageSize) {

        List<String> followersUserIdList = followService.getFollowers(userId);
        return setUserInfo(page(this.lambdaQuery().in(User::getId, followersUserIdList), pageNum, pageSize, UserDTO.class)) ;
    }

    /**
     * 获取用户关注的人列表
     *
     * @param userId   用户ID
     * @param pageNum  页码
     * @param pageSize 每页数量
     * @return 用户关注的人分页列表
     */
    @Override
    public PageResult<UserDTO> getUserFollowing(String userId, Integer pageNum, Integer pageSize) {
        List<String> followingUserIdList = followService.getFollowing(userId);
        return setUserInfo(page(this.lambdaQuery().in(User::getId, followingUserIdList), pageNum, pageSize, UserDTO.class));
    }


    /**
     * 获取用户统计数据
     *
     * @param userId   用户ID
     * @param allAgent 是否统计所有代理
     * @return 用户统计数据
     */
    @Override
    public UserStatsDTO getUserStats(String userId,Boolean allAgent) {
        UserStatsDTO userStatsDTO = UserStatsDTO.builder()
                .userId(userId)
                .followingCount(followService.countFollowing(userId))
                .followerCount(followService.countFollowers(userId))
                .starCount(starService.getStarCountByUserId(userId))
                .agentCount(agentService.getAgentCountByUserId(userId,allAgent))
                .forkCount(forkService.getForkCountByUserId(userId))
                .totalViews(agentService.getAgentViewsByUserId(userId))
                .build();
        return userStatsDTO;
    }


    /**
     * 更新用户信息
     *
     * @param updateUserDTO 用户更新信息
     * @return 是否更新成功
     */
    @Override
    public Boolean updateUser(UpdateUserDTO updateUserDTO) {
        User user = getById(updateUserDTO.getId());
        if (ObjUtil.isNull(user)) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        User updateUser = converter.convert(updateUserDTO, User.class);
        BeanUtil.copyProperties(updateUser, user, CopyOptions.create().ignoreNullValue());
        // 删除翻译缓存
        RedisUtils.delete(StrUtil.format(IHUB_TRANSLATION_CACHE_KEY,user.getId()));
       return updateById(user);
    }


    /**
     * 获取当前用户信息
     *
     * @return 当前用户信息
     */
    @Override
    public UserDTO getCurrentUserProfile() {
        User user = getById(LoginHelper.getCurrentUserId());
        if (ObjUtil.isNull(user)) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        return converter.convert(user, UserDTO.class);
    }


    /**
     * 分页获取用户列表
     *
     * @param content  搜索内容
     * @param userRole 用户角色
     * @param pageNum  页码
     * @param pageSize 每页数量
     * @return 用户分页结果
     */
    @Override
    public PageResult<UserDTO> listUsers(String content, UserRole userRole, Integer pageNum, Integer pageSize) {
        var wrapper = this.lambdaQuery();

        wrapper.or(StrUtil.isNotBlank( content),wrapper1 -> wrapper1.like(User::getUserName, content)
                .or(wrapper2->wrapper2.like(User::getId, content))
                .or(wrapper3->wrapper3.like(User::getPhone, content))
                .or(wrapper4->wrapper4.like(User::getEmail, content)));

        wrapper.and(ObjUtil.isNotNull(userRole), wrapper1 -> wrapper1.eq(User::getRole, userRole.getValue()));


        wrapper.orderByDesc(User::getCreateTime);
        return setUserInfo(page(wrapper, pageNum, pageSize, UserDTO.class));
    }


    /**
     * 设置关注信息
     *
     * @param page PageResult<UserDTO>
     * @return PageResult<UserDTO> 处理后的结果
     */
    private PageResult<UserDTO> setUserInfo(PageResult<UserDTO> page) {
        List<String> followingUserIdList = followService.getFollowing(LoginHelper.getCurrentUserId());
        page.getContentData().forEach(userDTO -> userDTO.setFollowing(followingUserIdList.contains(userDTO.getId()))
        );
        return page;
    }


    /**
     * 获取用户字段值
     * @param userId 用户ID
     * @param fieldName 字段名
     * @return 字段值
     */
    @Override
    public Object getFieldValue(Object userId, String fieldName) {
        AtomicReference<Object> result = new AtomicReference<>();
        // 翻译时忽略逻辑删除
        LogicManager.withoutLogic(() -> {
            User user = getById((Serializable) userId);
            if (ObjUtil.isNotNull(user)) {
                result.set(ReflectUtil.getFieldValue(user, fieldName));
            }
        });
        return result.get();
    }

}