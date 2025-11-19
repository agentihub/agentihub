/**
 * API Client Wrapper - Unified response and error handling
 * Based on new API response format { code, msg, data }
 */

import { client } from '../api';
import type { UserDTO } from '../api/types.gen';
// Unified API response wrapper type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: number;
}

// API error type
export interface ApiError {
  message: string;
  code?: number;
  details?: any;
}

/**
 * Unified method for handling API responses
 * @param response Raw response from SDK
 * @returns Standardized ApiResponse
 */
export function handleResponse<T>(response: {
  data?: { code?: number; msg?: string; data?: T };
  error?: any;
}): ApiResponse<T> {
  const { data: responseBody } = response;

  if (response?.error) {
    return {
      success: false,
      message: response?.error?.msg,
      code: response?.error?.code,
    };
  }

  if (!responseBody) {
    return {
      success: false,
      message: '服务器响应为空',
      code: -1,
    };
  }

  const { code, msg, data } = responseBody;

  // Usually code === 200 or code === 0 indicates success
  const isSuccess = code === 200 || code === 0;

  return {
    success: isSuccess,
    data: data,
    message: msg || (isSuccess ? '操作成功' : '操作失败'),
    code: code,
  };
}

/**
 * Unified method for handling API errors
 * @param error Caught error object
 * @returns Standardized ApiResponse
 */
export function handleError(error: any): ApiResponse<never> {
  console.error('API call failed:', error);

  let message = 'Network error, please try again later';
  let code = -1;

  // Parse different types of errors
  if (error?.response?.data) {
    const errorData = error.response.data;
    message = errorData.msg || errorData.message || message;
    code = errorData.code || error.response.status || code;
  } else if (error?.message) {
    message = error.message;
  }

  return {
    success: false,
    message,
    code,
  };
}
/**
 * Token management utility
 */
export const tokenManager = {
  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  /**
   * Set token and sync to API client
   */
  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  },

  /**
   * Clear token and remove from API client
   */
  removeToken(): void {
    localStorage.removeItem('auth_token');
  },

  /**
   * Check if token exists
   */
  hasToken(): boolean {
    return !!this.getToken();
  },
};

export const userManager = {
  getUser(): UserDTO | null {
    const user = localStorage.getItem('ihub_user');
    if (user) {
      return JSON.parse(user);
    }
    return null;
  },
  setUser(user: UserDTO | null): void {
    if (user) {
      localStorage.setItem('ihub_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ihub_user');
    }
  },
  removeUser(): void {
    localStorage.removeItem('ihub_user');
  },
};

/**
 * Check if it's an authentication error
 * @param response API response
 * @returns Whether it's an authentication error
 */
export function isAuthError(response: ApiResponse): boolean {
  return response.code === 401 || response.code === 403;
}

/**
 * High-level API call wrapper
 * Automatically handles common error scenarios
 */
export async function apiCall<T>(
  apiFunction: () => Promise<any>,
  options: {
    showSuccessNotification?: boolean;
    successMessage?: string;
    showErrorNotification?: boolean;
    errorTitle?: string;
    handleAuth?: boolean;
  } = {}
): Promise<ApiResponse<T>> {
  const {
    showSuccessNotification: _showSuccessNotification = false,
    successMessage: _successMessage,
    showErrorNotification: _showErrorNotification = true,
    errorTitle: _errorTitle,
  } = options;

  // TODO: Implement notification handling
  // The notification parameters are preserved for future implementation

  try {
    const response = await apiFunction();
    const result = handleResponse<T>(response);

    return result;
  } catch (error) {
    const result = handleError(error);
    return result;
  }
}

export const initClient = () => {
  client.interceptors.request.use((request) => {
    const token = tokenManager.getToken();
    if (token) {
      request.headers.set('Authorization', 'Bearer ' + token);
    }
    return request;
  });

  client.interceptors.response.use((response) => {
    if (response.status === 401) {
      tokenManager.removeToken();
      userManager.removeUser();
      window.location.href = '/login?redirect=' + window.location.pathname;
    }
    return response;
  });
};

/**
 * Standardized pagination parameters
 */
export interface PaginationParams {
  pageNum: number;
  pageSize: number;
}

/**
 * Standardized pagination response
 */
export interface PaginationResponse<T> {
  pageNum: number;
  pageSize: number;
  totalSize: number;
  totalPages: number;
  contentData: T[];
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  firstPage: boolean;
  lastPage: boolean;
}

/**
 * Default pagination parameters
 */
export const DEFAULT_PAGINATION: PaginationParams = {
  pageNum: 1,
  pageSize: 20,
};

/**
 * API client health check
 */
export const healthCheck = async (): Promise<boolean> => {
  try {
    // Can call actual health check endpoint here
    return true;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};
