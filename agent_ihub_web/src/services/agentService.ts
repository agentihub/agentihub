/**
 * Agent服务 - 基于AgentDto和新的Agent接口
 */

import {
  createAgent,
  updateAgent,
  getAgentById,
  deleteAgent,
  starAgent,
  unStarAgent,
  forkAgent,
  getPublicAgents,
  getUserAgents,
  listStarredAgents,
  getTrendingAgents,
  searchAgentByKeyWord,
  publishAgent,
  importAgent,
  exportAgent,
  countForks,
  getAgentByUserNameAndAgentName,
  navigationChat,
  creationChat,
  cleanCreationChatSession,
} from '../api';
import type {
  CreateAgentDTO,
  UpdateAgentDTO,
  AgentDTO,
  ForkRequestDTO,
  PageResultAgentDTO,
} from '../api/types.gen';
import {
  apiCall,
  type ApiResponse,
  type PaginationParams,
  DEFAULT_PAGINATION,
} from './apiClient';

// Agent服务的扩展类型
export interface AgentSearchParams extends PaginationParams {
  search?: string;
  platform?: string;
  category?: string;
  sort?: string;
  tags?: string[];
}

export interface StarredAgentsParams extends PaginationParams {
  userId: string;
  search?: string;
  platform?: string;
  category?: string;
  sort?: string;
}

export interface TrendingAgentsParams extends PaginationParams {
  platform?: string;
}

export interface UserAgentsParams extends PaginationParams {
  userId: string;
  userName: string;
  sort?: string;
  search?: string;
  platform?: string;
}

export interface DraftData {
  id?: string;
  userId: string;
  name?: string;
  description?: string;
  platform?: string;
  model?: string;
  category?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  isPublic?: boolean;
  tags?: string[];
  tools?: any[];
  knowledgeBase?: any[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Agent服务类
 */
class AgentService {
  /**
   * 创建Agent
   * @param data Agent创建数据
   * @returns 创建结果
   */
  async createAgent(data: CreateAgentDTO): Promise<ApiResponse<any>> {
    return apiCall(() => createAgent({ body: data }), {
      showSuccessNotification: true,
      successMessage: 'Agent创建成功！',
      showErrorNotification: true,
      errorTitle: '创建Agent失败',
    });
  }

  /**
   * 更新Agent
   * @param data Agent更新数据
   * @returns 更新结果
   */
  async updateAgent(data: UpdateAgentDTO): Promise<ApiResponse<any>> {
    return apiCall(() => updateAgent({ body: data }), {
      showSuccessNotification: true,
      successMessage: 'Agent更新成功！',
      showErrorNotification: true,
      errorTitle: '更新Agent失败',
    });
  }

  /**
   * 根据ID获取Agent详情
   * @param id Agent ID
   * @returns Agent详情
   */
  async getAgentById(id: string): Promise<ApiResponse<AgentDTO>> {
    return apiCall(() => getAgentById({ query: { id } }), {
      showSuccessNotification: false,
      showErrorNotification: false, // 获取详情失败不显示通知
    });
  }

  /**
   * 根据用户名和Agent名获取Agent详情
   * @param userName 用户名
   * @param agentName Agent名
   * @returns Agent详情
   */
  async getAgentByNames(
    userName: string,
    agentName: string
  ): Promise<ApiResponse<AgentDTO>> {
    return apiCall(
      () =>
        getAgentByUserNameAndAgentName({
          query: { userName: userName, agentName: agentName },
        }),
      {
        showSuccessNotification: false,
        showErrorNotification: false, // 获取详情失败不显示通知
      }
    );
  }

  /**
   * 删除Agent
   * @param id Agent ID
   * @returns 删除结果
   */
  async deleteAgent(id: string): Promise<ApiResponse<any>> {
    return apiCall(() => deleteAgent({ query: { id } }), {
      showSuccessNotification: true,
      successMessage: 'Agent删除成功！',
      showErrorNotification: true,
      errorTitle: '删除Agent失败',
    });
  }

  /**
   * 收藏Agent
   * @param agentId Agent ID
   * @returns 收藏结果
   */
  async starAgent(agentId: string): Promise<ApiResponse<boolean>> {
    return apiCall(() => starAgent({ query: { agentId } }), {
      showSuccessNotification: true,
      successMessage: '收藏成功！',
      showErrorNotification: true,
      errorTitle: '收藏失败',
    });
  }

  /**
   * 取消收藏Agent
   * @param agentId Agent ID
   * @returns 取消收藏结果
   */
  async unstarAgent(agentId: string): Promise<ApiResponse<boolean>> {
    return apiCall(() => unStarAgent({ query: { agentId } }), {
      showSuccessNotification: true,
      successMessage: '已取消收藏',
      showErrorNotification: true,
      errorTitle: '取消收藏失败',
    });
  }

  /**
   * Fork Agent
   * @param agentId Agent ID
   * @param data Fork请求数据
   * @returns Fork结果
   */
  async forkAgent(
    agentId: string,
    data?: ForkRequestDTO
  ): Promise<ApiResponse<AgentDTO>> {
    return apiCall(
      () =>
        forkAgent({
          query: { agentId },
          body: data || {},
        }),
      {
        showSuccessNotification: true,
        successMessage: 'Fork成功！',
        showErrorNotification: true,
        errorTitle: 'Fork失败',
      }
    );
  }

  /**
   * 获取公共Agent列表
   * @param params 查询参数
   * @returns Agent列表
   */
  async getPublicAgents(
    params: AgentSearchParams = {
      pageNum: DEFAULT_PAGINATION.pageNum,
      pageSize: DEFAULT_PAGINATION.pageSize,
    }
  ): Promise<ApiResponse<PageResultAgentDTO>> {
    const {
      pageNum = DEFAULT_PAGINATION.pageNum,
      pageSize = DEFAULT_PAGINATION.pageSize,
      search = '',
      platform = '',
      category = '',
      sort = '',
      tags = [],
    } = params;

    return apiCall(
      () =>
        getPublicAgents({
          query: {
            pageNum,
            pageSize,
            search,
            platform,
            category,
            sort,
            tags,
          },
        }),
      {
        showSuccessNotification: false,
        showErrorNotification: false,
      }
    );
  }

  /**
   * 获取用户的Agent列表
   * @param params 查询参数
   * @returns Agent列表
   */
  async getUserAgents(
    params: UserAgentsParams
  ): Promise<ApiResponse<PageResultAgentDTO>> {
    const {
      userId,
      userName,
      pageNum = DEFAULT_PAGINATION.pageNum,
      pageSize = DEFAULT_PAGINATION.pageSize,
      sort = '',
      search = '',
      platform = '',
    } = params;

    return apiCall(
      () =>
        getUserAgents({
          query: {
            userId,
            userName,
            pageNum,
            pageSize,
            sort,
            search,
            platform,
          },
        }),
      {
        showSuccessNotification: false,
        showErrorNotification: false,
      }
    );
  }

  /**
   * 获取用户收藏的Agent列表
   * @param params 查询参数
   * @returns 收藏的Agent列表
   */
  async getStarredAgents(
    params: StarredAgentsParams
  ): Promise<ApiResponse<PageResultAgentDTO>> {
    const {
      userId,
      pageNum = DEFAULT_PAGINATION.pageNum,
      pageSize = DEFAULT_PAGINATION.pageSize,
      search = '',
      platform = '',
      category = '',
      sort = '',
    } = params;

    return apiCall(
      () =>
        listStarredAgents({
          query: {
            userId,
            pageNum,
            pageSize,
            search,
            platform,
            category,
            sort,
          },
        }),
      {
        showSuccessNotification: false,
        showErrorNotification: false,
      }
    );
  }

  /**
   * 获取热门Agent列表
   * @param params 查询参数
   * @returns 热门Agent列表
   */
  async getTrendingAgents(
    params: TrendingAgentsParams = {
      pageNum: DEFAULT_PAGINATION.pageNum,
      pageSize: DEFAULT_PAGINATION.pageSize,
    }
  ): Promise<ApiResponse<PageResultAgentDTO>> {
    const {
      pageNum = DEFAULT_PAGINATION.pageNum,
      pageSize = DEFAULT_PAGINATION.pageSize,
      platform = '',
    } = params;

    return apiCall(
      () =>
        getTrendingAgents({
          query: {
            pageNum,
            pageSize,
            platform,
          },
        }),
      {
        showSuccessNotification: false,
        showErrorNotification: false,
      }
    );
  }

  /**
   * 根据关键字搜索Agent
   * @param keyWord 搜索关键字
   * @returns 搜索结果
   */
  async searchAgentByKeyWord(
    keyWord: string
  ): Promise<ApiResponse<AgentDTO[]>> {
    return apiCall(
      () =>
        searchAgentByKeyWord({
          query: { keyWord },
        }),
      {
        showSuccessNotification: false,
        showErrorNotification: false,
      }
    );
  }

  /**
   * 发布/取消发布Agent
   * @param agentId Agent ID
   * @param published 发布状态
   * @returns 发布结果
   */
  async publishAgent(
    agentId: string,
    published: boolean
  ): Promise<ApiResponse<boolean>> {
    return apiCall(
      () =>
        publishAgent({
          query: {
            agentId,
            published,
          },
        }),
      {
        showSuccessNotification: true,
        successMessage: published ? 'Agent发布成功！' : 'Agent已取消发布',
        showErrorNotification: true,
        errorTitle: published ? '发布失败' : '取消发布失败',
      }
    );
  }

  /**
   * 导入Agent
   * @param file Agent配置文件
   * @returns 导入结果
   */
  async importAgent(file: File): Promise<ApiResponse<any>> {
    return apiCall(
      () =>
        importAgent({
          body: { file },
        }),
      {
        showSuccessNotification: true,
        successMessage: 'Agent导入成功！',
        showErrorNotification: true,
        errorTitle: '导入Agent失败',
      }
    );
  }

  /**
   * 导出Agent
   * @param id Agent ID
   * @returns 导出文件
   */
  async exportAgent(id: string): Promise<ApiResponse<any>> {
    return apiCall(
      () =>
        exportAgent({
          query: { id },
        }),
      {
        showSuccessNotification: true,
        successMessage: 'Agent导出成功！',
        showErrorNotification: true,
        errorTitle: '导出Agent失败',
      }
    );
  }

  /**
   * 获取Agent的Fork数量
   * @param agentId Agent ID
   * @returns Fork数量
   */
  async getAgentForkCount(agentId: string): Promise<ApiResponse<number>> {
    return apiCall(
      () =>
        countForks({
          query: { agentId },
        }),
      {
        showSuccessNotification: false,
        showErrorNotification: false,
      }
    );
  }

  /**
   * 搜索Agent（综合搜索）
   * @param query 搜索关键词
   * @param params 其他搜索参数
   * @returns 搜索结果
   */
  async searchAgents(
    query: string,
    params: Partial<AgentSearchParams> = {}
  ): Promise<ApiResponse<PageResultAgentDTO>> {
    // 优先使用分页搜索
    return this.getPublicAgents({
      pageNum: DEFAULT_PAGINATION.pageNum,
      pageSize: DEFAULT_PAGINATION.pageSize,
      ...params,
      search: query,
    });
  }

  /**
   * 批量获取Agent信息
   * @param agentIds Agent ID列表
   * @returns Agent信息列表
   */
  async getBatchAgentDetails(
    agentIds: string[]
  ): Promise<ApiResponse<AgentDTO[]>> {
    try {
      const promises = agentIds.map((id) => this.getAgentById(id));
      const responses = await Promise.all(promises);

      const agents: AgentDTO[] = [];
      let hasError = false;

      responses.forEach((response, index) => {
        if (response.success && response.data) {
          agents.push(response.data);
        } else {
          hasError = true;
          console.warn(
            `获取Agent ${agentIds[index]} 信息失败:`,
            response.message
          );
        }
      });

      return {
        success: !hasError || agents.length > 0,
        data: agents,
        message: hasError ? '部分Agent信息获取失败' : '获取成功',
      };
    } catch (_error) {
      return {
        success: false,
        message: '批量获取Agent信息失败',
        code: -1,
      };
    }
  }

  /**
   * 检查用户是否已收藏某个Agent
   * @param userId 用户ID
   * @param agentId Agent ID
   * @returns 是否已收藏
   */
  async isAgentStarred(userId: string, agentId: string): Promise<boolean> {
    try {
      const response = await this.getStarredAgents({
        userId,
        pageNum: 1,
        pageSize: 100, // 获取更多数据来检查
      });

      if (response.success && response.data?.contentData) {
        return response.data.contentData.some((agent) => agent.id === agentId);
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * 获取Agent统计信息
   * @param agentId Agent ID
   * @returns 统计信息
   */
  async getAgentStats(
    agentId: string
  ): Promise<{ stars: number; forks: number; views: number }> {
    try {
      const [agentResponse, forkCountResponse] = await Promise.all([
        this.getAgentById(agentId),
        this.getAgentForkCount(agentId),
      ]);

      const agent = agentResponse.data;
      const forkCount = forkCountResponse.data || 0;

      return {
        stars: agent?.stars || 0,
        forks: forkCount,
        views: agent?.views || 0,
      };
    } catch {
      return {
        stars: 0,
        forks: 0,
        views: 0,
      };
    }
  }

  async saveDraft(draftData: Partial<DraftData>): Promise<DraftData> {
    try {
      // In a real implementation, this would call a draft API endpoint
      // For now, we'll simulate the API call
      const draft: DraftData = {
        id: `draft-${Date.now()}`,
        userId: draftData.userId || 'current-user',
        ...draftData,
        updatedAt: new Date().toISOString(),
        createdAt: draftData.createdAt || new Date().toISOString(),
      };

      // Store in localStorage as fallback
      const drafts = this.getDraftsFromStorage();
      const existingIndex = drafts.findIndex((d) => d.userId === draft.userId);

      if (existingIndex >= 0) {
        drafts[existingIndex] = draft;
      } else {
        drafts.push(draft);
      }

      localStorage.setItem('agent_drafts', JSON.stringify(drafts));

      return draft;
    } catch (error) {
      console.error('Failed to save draft:', error);
      throw new Error('Failed to save draft');
    }
  }

  /**
   * Get user's draft data
   */
  async getDrafts(userId: string): Promise<DraftData[]> {
    try {
      // Get from localStorage as fallback
      const drafts = this.getDraftsFromStorage();
      return drafts.filter((draft) => draft.userId === userId);
    } catch (error) {
      console.error('Failed to get drafts:', error);
      throw new Error('Failed to load drafts');
    }
  }

  /**
   * Delete user's draft
   */
  async deleteDraft(userId: string, draftId?: string): Promise<void> {
    try {
      // Remove from localStorage
      const drafts = this.getDraftsFromStorage();
      const filteredDrafts = draftId
        ? drafts.filter((draft) => draft.id !== draftId)
        : drafts.filter((draft) => draft.userId !== userId);

      localStorage.setItem('agent_drafts', JSON.stringify(filteredDrafts));
    } catch (error) {
      console.error('Failed to delete draft:', error);
      throw new Error('Failed to delete draft');
    }
  }

  /**
   * Get drafts from localStorage
   */
  getDraftsFromStorage(): DraftData[] {
    try {
      const stored = localStorage.getItem('agent_drafts');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to parse drafts from storage:', error);
      return [];
    }
  }

  /**
   * Calls the navigation chat API to decide the next step in agent creation.
   * @param requirement The user's input requirement.
   * @returns A promise that resolves to 'recommendation' or 'editor'.
   */
  async getNavigationDecision(requirement: string): Promise<any> {
    return apiCall(() => navigationChat({ body: { content: requirement } }), {
      showSuccessNotification: false,
      showErrorNotification: false,
    });
  }

  async createChatSession(
    requirement: string,
    toolFileIdList?: string[],
    docsFileIdList?: string[]
  ): Promise<any> {
    return apiCall(
      () =>
        creationChat({
          body: { cmd: requirement, toolFileIdList, docsFileIdList },
        }),
      {
        showSuccessNotification: false,
        showErrorNotification: false,
      }
    );
  }

  async cleanCreationChatSession(): Promise<any> {
    return apiCall(() => cleanCreationChatSession({}), {
      showSuccessNotification: false,
      showErrorNotification: false,
    });
  }
}

// 导出单例实例
export const agentService = new AgentService();

// 兼容性导出
export default agentService;
