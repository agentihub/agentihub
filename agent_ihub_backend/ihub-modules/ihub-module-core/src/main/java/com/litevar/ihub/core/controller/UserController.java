package com.litevar.ihub.core.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.hutool.core.util.ObjUtil;
import com.litevar.ihub.common.satoken.enums.UserRole;
import com.litevar.ihub.common.satoken.utils.LoginHelper;
import com.litevar.ihub.common.web.R;
import com.litevar.ihub.common.web.exception.BusinessException;
import com.litevar.ihub.common.web.exception.ErrorCode;
import com.litevar.ihub.core.dto.UpdateUserDTO;
import com.litevar.ihub.core.dto.UserDTO;
import com.litevar.ihub.core.dto.UserStatsDTO;
import com.litevar.ihub.core.entity.User;
import com.litevar.ihub.core.service.IFollowService;
import com.litevar.ihub.core.service.IUserService;
import com.litevar.ihub.log.dto.UserActionLogDTO;
import com.litevar.ihub.log.service.IUserActionLogService;
import com.mongoplus.model.PageResult;
import io.github.linpeilie.Converter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * @author Teoan
 * @since 2025/7/24 15:46
 */
@RestController
@RequestMapping("/api/v1/users")
@Slf4j
@RequiredArgsConstructor
@Tag(name = "用户管理", description = "用户相关操作接口")
public class UserController {

    private final IUserService userService;
    private final IFollowService followService;
    private final IUserActionLogService userActionLogService;

    private final Converter converter;

    /**
     * 获取当前用户资料
     */
    @GetMapping("/profile")
    @Operation(summary = "获取当前用户资料", description = "获取当前用户资料")
    @SaCheckLogin
    public R<UserDTO> getCurrentUserProfile() {
       return R.ok(userService.getCurrentUserProfile());
    }

    /**
     * 更新当前用户资料
     */
    @PutMapping("/profile")
    @Operation(summary = "更新当前用户资料", description = "更新当前用户资料")
    @SaCheckLogin
    public R<Boolean> updateCurrentUserProfile(@Validated @RequestBody UpdateUserDTO updateUserDTO) {
        return R.ok(userService.updateUser(updateUserDTO));
    }

    /**
     * 根据用户ID获取用户资料
     */
    @GetMapping("/profile-by-id")
    @Operation(summary = "获取用户资料", description = "根据用户ID获取指定用户的资料信息")
    @Parameter(name = "userId", description = "用户ID", required = true)
    @SaCheckLogin
    public R<UserDTO> getUserProfile(@NotBlank(message = "用户ID不能为空") @RequestParam("userId") String userId) {
        User user = userService.getById(userId);
        if (ObjUtil.isNull(user)) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        UserDTO userDTO = converter.convert(user, UserDTO.class);
        userDTO.setFollowing(followService.isFollowing(LoginHelper.getCurrentUserId(), user.getId()));
        return R.ok(userDTO);
    }

    /**
     * 根据用户名获取用户资料
     */
    @GetMapping("/profile-by-username")
    @Operation(summary = "获取用户资料", description = "根据用户名获取指定用户的资料信息")
    @Parameter(name = "userName", description = "用户名", required = true)
    @SaCheckLogin
    public R<UserDTO> getUserProfileByUsername(@NotBlank(message = "用户名不能为空") @RequestParam("userName") String userName) {
        User user = userService.findUserByUserName(userName);
        if (ObjUtil.isNull(user)) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        UserDTO userDTO = converter.convert(user, UserDTO.class);
        userDTO.setFollowing(followService.isFollowing(LoginHelper.getCurrentUserId(), user.getId()));
        return R.ok(userDTO);
    }

    /**
     * 获取用户统计信息
     */
    @GetMapping("/stats")
    @Operation(summary = "获取用户统计信息", description = "根据用户ID获取指定用户的统计数据")
    @Parameter(name = "userId", description = "用户ID", required = true)
    @Parameter(name = "allAgent", description = "是否统计所有agent，false时只统计公开的agent", required = true)
    @SaCheckLogin
    public R<UserStatsDTO> getUserStats(@NotBlank(message = "用户ID不能为空") @RequestParam("userId") String userId,
                                        @NotNull(message = "是否统计私有agent不能为空") @RequestParam("allAgent") Boolean allAgent) {
        return R.ok(userService.getUserStats(userId,allAgent));
    }

    /**
     * 关注用户
     */
    @PostMapping("/follow")
    @Operation(summary = "关注用户", description = "关注指定用户")
    @Parameter(name = "userId", description = "要关注的用户ID", required = true)
    @SaCheckLogin
    public R<?> followUser(@NotBlank(message = "用户ID不能为空") @RequestParam("userId") String userId) {
        User user = userService.getById(userId);
        Optional.ofNullable(user).orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        followService.createFollow(LoginHelper.getCurrentUserId(), user);
        return R.ok();
    }

    /**
     * 取消关注用户
     */
    @DeleteMapping("/follow")
    @Operation(summary = "取消关注用户", description = "取消对指定用户的关注")
    @Parameter(name = "userId", description = "要取消关注的用户ID", required = true)
    @SaCheckLogin
    public R<?> unfollowUser(@NotBlank(message = "用户ID不能为空")@RequestParam("userId") String userId) {
        User user = userService.getById(userId);
        Optional.ofNullable(user).orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        followService.unfollow(LoginHelper.getCurrentUserId(), user);
        return R.ok();
    }

    /**
     * 获取用户关注者列表
     */
    @GetMapping("/followers")
    @Operation(summary = "获取用户关注者列表", description = "获取指定用户的关注者列表")
    @Parameter(name = "userId", description = "用户ID", required = true)
    @Parameter(name = "pageSize", description = "每页数量，最大100", example = "10")
    @Parameter(name = "pageNum", description = "当前页", example = "1")
    @SaCheckLogin
    public R<PageResult<UserDTO>> getUserFollowers(@NotBlank(message = "用户ID不能为空")@RequestParam("userId") String userId,
                                                   @NotNull(message = "当前页不能为空")@RequestParam(value = "pageNum", defaultValue = "1") Integer pageNum,
                                                   @NotNull(message = "每页数量不能为空")@RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize) {

        return R.ok(userService.getUserFollowers(userId, pageNum, pageSize));
    }

    /**
     * 获取用户关注的人列表
     */
    @GetMapping("/following")
    @Operation(summary = "获取用户关注列表", description = "获取指定用户关注的人列表")
    @Parameter(name = "userId", description = "用户ID", required = true)
    @Parameter(name = "pageSize", description = "每页数量，最大100", example = "10")
    @Parameter(name = "pageNum", description = "当前页", example = "1")
    @SaCheckLogin
    public R<PageResult<UserDTO>> getUserFollowing(@NotBlank(message = "用户ID不能为空")@RequestParam("userId") String userId,
                                 @NotNull(message = "当前页不能为空")@RequestParam(value = "pageNum", defaultValue = "1") Integer pageNum,
                                 @NotNull(message = "每页数量不能为空")@RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize) {
        return R.ok(userService.getUserFollowing(userId, pageNum, pageSize));
    }


    /**
     * 获取用户最近的操作日志
     */
    @GetMapping("/recent-actions")
    @Operation(summary = "获取用户最近的操作日志", description = "获取指定用户的最近操作日志")
    @Parameter(name = "userId", description = "用户ID", required = true)
    @Parameter(name = "limit", description = "返回日志条数限制，默认为10", example = "10")
    @SaCheckLogin
    public R<List<UserActionLogDTO>> getRecentUserActions(@NotBlank(message = "用户ID不能为空") @RequestParam("userId") String userId,
                                                          @RequestParam(value = "limit",defaultValue = "10") int limit) {
        List<UserActionLogDTO> logs = userActionLogService.getRecentLogsByUserId(userId, limit);
        return R.ok(logs);
    }

    /**
     * 分页获取用户操作日志
     */
    @GetMapping("/actions")
    @Operation(summary = "分页获取用户操作日志", description = "分页获取指定用户操作日志")
    @Parameter(name = "userId", description = "用户ID", required = true)
    @Parameter(name = "pageSize", description = "每页数量，最大100", example = "10")
    @Parameter(name = "pageNum", description = "当前页", example = "1")
    @SaCheckLogin
    public R<PageResult<UserActionLogDTO>> getUserActions(@NotBlank(message = "用户ID不能为空") @RequestParam("userId") String userId,
                                                       @RequestParam(value = "pageNum", defaultValue = "1") Integer pageNum,
                                                       @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize) {
        PageResult<UserActionLogDTO> logs = userActionLogService.getLogsByUserId(userId, pageNum, pageSize);
        return R.ok(logs);
    }
    
    /**
     * 分页获取用户列表
     */
    @GetMapping
    @Operation(summary = "分页获取用户列表", description = "分页获取用户列表")
    @Parameters({
            @Parameter(name = "pageNum", description = "页码", example = "1"),
            @Parameter(name = "content", description = "搜索内容"),
            @Parameter(name = "userRole", description = "用户角色"),
            @Parameter(name = "pageSize", description = "每页数量", example = "10")
    })
    @SaCheckLogin
    public R<PageResult<UserDTO>> listUsers(@RequestParam(value = "pageNum", defaultValue = "1") Integer pageNum,
                                            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize,
                                            @RequestParam(value = "content",required = false) String content,
                                            @RequestParam(value = "userRole",required = false) UserRole userRole) {
        PageResult<UserDTO> pageResult = userService.listUsers(content,userRole,pageNum, pageSize);
        return R.ok(pageResult);
    }

}