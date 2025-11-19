/**
 * 服务层统一导出文件
 */

// 导出所有服务实例
export { authService } from './authService';
export { userService } from './userService';
export { agentService } from './agentService';
export { fileService } from './fileService';

// 导出类型定义
export type { LoginRequest, SignupRequest, AuthResult } from './authService';
export type {
  UserSearchParams,
  UserFollowParams,
  UserActionsParams,
} from './userService';
export type {
  AgentSearchParams,
  StarredAgentsParams,
  TrendingAgentsParams,
  UserAgentsParams,
} from './agentService';
export type {
  FileUploadProgress,
  BatchUploadResult,
  FileType,
} from './fileService';

// 导出API客户端工具
export {
  handleResponse,
  handleError,
  tokenManager,
  isAuthError,
  apiCall,
  healthCheck,
  DEFAULT_PAGINATION,
} from './apiClient';
export type {
  ApiResponse,
  ApiError,
  PaginationParams,
  PaginationResponse,
} from './apiClient';
