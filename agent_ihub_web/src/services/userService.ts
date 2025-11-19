/**
 * 用户服务 - 基于UserDto和新的用户接口
 */

import {
  updateCurrentUserProfile,
  getUserStats,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  getUserProfile,
  getRecentUserActions,
  getUserActions,
  listUsers,
  getUserProfileByUsername,
} from '../api';
import type {
  UpdateUserDTO,
  UserDTO,
  UserStatsDTO,
  PageResultUserDTO,
  UserActionLog,
  PageResultUserActionLog,
} from '../api';
import { apiCall, DEFAULT_PAGINATION } from './apiClient';
import type { ApiResponse, PaginationParams } from './apiClient';

// 用户服务的扩展类型（如果需要扩展用户信息，可以在这里添加）

export interface UserSearchParams extends PaginationParams {
  content?: string;
  userRole?: 'ROLE_USER' | 'ROLE_ADMIN';
}

export interface UserFollowParams extends PaginationParams {
  userId: string;
}

export interface UserActionsParams {
  userId: string;
  pageNum?: number;
  pageSize?: number;
}

/**
 * 用户服务类
 */
class UserService {
  /**
   * 更新当前用户资料
   * @param data 要更新的用户数据
   * @returns 更新结果
   */
  async updateProfile(data: UpdateUserDTO): Promise<ApiResponse<boolean>> {
    return apiCall(() => updateCurrentUserProfile({ body: data }), {
      showSuccessNotification: true,
      successMessage: '个人概览更新成功！',
      showErrorNotification: true,
      errorTitle: '更新资料失败',
    });
  }

  /**
   * 获取用户统计信息
   * @param userId 用户ID
   * @returns 用户统计数据
   */
  async getUserStats(
    userId: string,
    allAgent?: boolean
  ): Promise<ApiResponse<UserStatsDTO>> {
    return apiCall(
      () => getUserStats({ query: { userId, allAgent: allAgent || false } }),
      {
        showSuccessNotification: false,
        showErrorNotification: false, // 获取统计信息失败不显示通知
      }
    );
  }

  /**
   * 关注用户
   * @param userId 要关注的用户ID
   * @returns 关注结果
   */
  async followUser(userId: string): Promise<ApiResponse<any>> {
    return apiCall(() => followUser({ query: { userId } }), {
      showSuccessNotification: true,
      successMessage: '关注成功！',
      showErrorNotification: true,
      errorTitle: '关注失败',
    });
  }

  /**
   * 取消关注用户
   * @param userId 要取消关注的用户ID
   * @returns 取消关注结果
   */
  async unfollowUser(userId: string): Promise<ApiResponse<any>> {
    return apiCall(() => unfollowUser({ query: { userId } }), {
      showSuccessNotification: true,
      successMessage: '已取消关注',
      showErrorNotification: true,
      errorTitle: '取消关注失败',
    });
  }

  /**
   * 获取用户关注者列表
   * @param params 查询参数
   * @returns 关注者列表
   */
  async getUserFollowers(
    params: UserFollowParams
  ): Promise<ApiResponse<PageResultUserDTO>> {
    const {
      userId,
      pageNum = DEFAULT_PAGINATION.pageNum,
      pageSize = DEFAULT_PAGINATION.pageSize,
    } = params;

    return apiCall(
      () =>
        getUserFollowers({
          query: {
            userId,
            pageNum,
            pageSize,
          },
        }),
      {
        showSuccessNotification: false,
        showErrorNotification: false,
      }
    );
  }

  /**
   * 获取用户关注列表
   * @param params 查询参数
   * @returns 关注列表
   */
  async getUserFollowing(
    params: UserFollowParams
  ): Promise<ApiResponse<PageResultUserDTO>> {
    const {
      userId,
      pageNum = DEFAULT_PAGINATION.pageNum,
      pageSize = DEFAULT_PAGINATION.pageSize,
    } = params;

    return apiCall(
      () =>
        getUserFollowing({
          query: {
            userId,
            pageNum,
            pageSize,
          },
        }),
      {
        showSuccessNotification: false,
        showErrorNotification: false,
      }
    );
  }

  /**
   * 根据ID获取用户资料
   * @param userId 用户ID
   * @returns 用户资料
   */
  async getUserProfile(userId: string): Promise<ApiResponse<UserDTO>> {
    return apiCall(() => getUserProfile({ query: { userId } }), {
      showSuccessNotification: false,
      showErrorNotification: false,
    });
  }

  /**
   * 根据用户名获取用户资料
   * @param userName 用户名
   * @returns 用户资料
   */
  async getUserProfileByUsername(
    userName: string
  ): Promise<ApiResponse<UserDTO>> {
    return apiCall(() => getUserProfileByUsername({ query: { userName } }), {
      showSuccessNotification: false,
      showErrorNotification: false,
    });
  }
  /**
   * 获取用户最近操作记录
   * @param userId 用户ID
   * @param limit 返回记录数限制，默认10条
   * @returns 最近操作记录
   */
  async getRecentUserActions(
    userId: string,
    limit: number = 10
  ): Promise<ApiResponse<UserActionLog[]>> {
    return apiCall(
      () =>
        getRecentUserActions({
          query: {
            userId,
            limit,
          },
        }),
      {
        showSuccessNotification: false,
        showErrorNotification: false,
      }
    );
  }

  /**
   * 分页获取用户操作记录
   * @param params 查询参数
   * @returns 操作记录分页数据
   */
  async getUserActions(
    params: UserActionsParams
  ): Promise<ApiResponse<PageResultUserActionLog>> {
    const {
      userId,
      pageNum = DEFAULT_PAGINATION.pageNum,
      pageSize = DEFAULT_PAGINATION.pageSize,
    } = params;

    return apiCall(
      () =>
        getUserActions({
          query: {
            userId,
            pageNum,
            pageSize,
          },
        }),
      {
        showSuccessNotification: false,
        showErrorNotification: false,
      }
    );
  }

  /**
   * 分页获取用户列表（管理员功能）
   * @param params 查询参数
   * @returns 用户列表分页数据
   */
  async listUsers(
    params: UserSearchParams = {
      pageNum: DEFAULT_PAGINATION.pageNum,
      pageSize: DEFAULT_PAGINATION.pageSize,
    }
  ): Promise<ApiResponse<PageResultUserDTO>> {
    const {
      pageNum = DEFAULT_PAGINATION.pageNum,
      pageSize = DEFAULT_PAGINATION.pageSize,
      content,
      userRole,
    } = params;

    return apiCall(
      () =>
        listUsers({
          query: {
            pageNum,
            pageSize,
            content,
            userRole,
          },
        }),
      {
        showSuccessNotification: false,
        showErrorNotification: false,
      }
    );
  }

  /**
   * 检查是否关注了某个用户
   * @param userId 当前用户ID
   * @param targetUserId 目标用户ID
   * @returns 是否已关注
   */
  async isFollowing(userId: string, targetUserId: string): Promise<boolean> {
    try {
      const response = await this.getUserFollowing({
        userId,
        pageNum: 1,
        pageSize: 100, // 获取更多数据来检查
      });

      if (response.success && response.data?.contentData) {
        return response.data.contentData.some(
          (user) => user.id === targetUserId
        );
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * 获取用户的关注者数量
   * @param userId 用户ID
   * @returns 关注者数量
   */
  async getFollowerCount(userId: string): Promise<number> {
    try {
      const response = await this.getUserStats(userId);
      return response.data?.followerCount || 0;
    } catch {
      return 0;
    }
  }

  /**
   * 获取用户的关注数量
   * @param userId 用户ID
   * @returns 关注数量
   */
  async getFollowingCount(userId: string): Promise<number> {
    try {
      const response = await this.getUserStats(userId);
      return response.data?.followingCount || 0;
    } catch {
      return 0;
    }
  }

  /**
   * 搜索用户
   * @param query 搜索关键词
   * @param params 搜索参数
   * @returns 搜索结果
   */
  async searchUsers(
    query: string,
    params: Partial<UserSearchParams> = {}
  ): Promise<ApiResponse<PageResultUserDTO>> {
    return this.listUsers({
      pageNum: DEFAULT_PAGINATION.pageNum,
      pageSize: DEFAULT_PAGINATION.pageSize,
      ...params,
      content: query,
    });
  }

  /**
   * 批量获取用户信息
   * @param userIds 用户ID列表
   * @returns 用户信息列表
   */
  async getBatchUserProfiles(
    userIds: string[]
  ): Promise<ApiResponse<UserDTO[]>> {
    try {
      const promises = userIds.map((id) => this.getUserProfile(id));
      const responses = await Promise.all(promises);

      const users: UserDTO[] = [];
      let hasError = false;

      responses.forEach((response, index) => {
        if (response.success && response.data) {
          users.push(response.data);
        } else {
          hasError = true;
          console.warn(
            `获取用户 ${userIds[index]} 信息失败:`,
            response.message
          );
        }
      });

      return {
        success: !hasError || users.length > 0,
        data: users,
        message: hasError ? '部分用户信息获取失败' : '获取成功',
      };
    } catch (_error) {
      return {
        success: false,
        message: '批量获取用户信息失败',
        code: -1,
      };
    }
  }
}

// 导出单例实例
export const userService = new UserService();

// 兼容性导出
export default userService;
