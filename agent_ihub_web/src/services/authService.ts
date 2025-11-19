/**
 * Authentication Service - Login, signup, and token management based on new API
 */

import {
  login as apiLogin,
  signup as apiSignup,
  logout as apiLogout,
  refreshToken as apiRefreshToken,
  getCurrentUserProfile,
} from '../api';
import type {
  LoginRequestDTO,
  SignupRequestDTO,
  UserDTO,
  SaTokenInfo,
} from '../api';
import {
  type ApiResponse,
  tokenManager,
  apiCall,
  userManager,
} from './apiClient';

// Authentication service request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  // id: string;
  userName: string;
  email: string;
  password: string;
}

// Authentication service response types
export interface AuthResult {
  user: UserDTO;
  token: string;
}

/**
 * Authentication Service Class
 */
class AuthService {
  /**
   * User login
   * @param request Login request parameters
   * @returns Login result containing user info and token
   */
  async login(request: LoginRequest): Promise<ApiResponse<AuthResult>> {
    const loginData: LoginRequestDTO = {
      email: request.email,
      password: request.password,
    };

    return apiCall(() => apiLogin({ body: loginData }), {
      showSuccessNotification: true,
      successMessage: '登录成功！',
      showErrorNotification: true,
      errorTitle: '登录失败',
    }).then(async (response) => {
      if (response.success && response.data) {
        const tokenInfo = response.data as SaTokenInfo;

        if (tokenInfo.tokenValue) {
          // Save token
          tokenManager.setToken(tokenInfo.tokenValue);

          // Get user information
          try {
            const userResponse = await this.getCurrentUser();
            if (userResponse.success && userResponse.data) {
              userManager.setUser(userResponse.data);
              return {
                success: true,
                data: {
                  user: userResponse.data,
                  token: tokenInfo.tokenValue,
                },
                message: response.message,
                code: response.code,
              };
            }
          } catch (error) {
            console.error('Failed to fetch user info:', error);
          }
        }
      }

      return response as ApiResponse<AuthResult>;
    });
  }

  /**
   * User signup
   * @param request Signup request parameters
   * @returns Signup result
   */
  async signup(request: SignupRequest): Promise<ApiResponse<UserDTO>> {
    const signupData: SignupRequestDTO = {
      userName: request.userName,
      email: request.email,
      password: request.password,
    };

    return apiCall(() => apiSignup({ body: signupData }), {
      showSuccessNotification: true,
      successMessage: '注册成功！',
      showErrorNotification: true,
      errorTitle: '注册失败',
    });
  }

  /**
   * User logout
   * @returns Logout result
   */
  async logout(): Promise<ApiResponse<void>> {
    return apiCall(() => apiLogout(), {
      showSuccessNotification: true,
      successMessage: '已安全退出登录',
      showErrorNotification: false, // Don't show error notification on logout failure
    }).then((response) => {
      // Clear local token regardless of API call success
      tokenManager.removeToken();
      userManager.removeUser();
      return response as ApiResponse<void>;
    });
  }

  /**
   * Refresh token
   * @returns Refresh result
   */
  async refreshToken(): Promise<ApiResponse<void>> {
    return apiCall(() => apiRefreshToken(), {
      showSuccessNotification: false,
      showErrorNotification: false, // Don't show notification on token refresh failure
    });
  }

  /**
   * Get current user information
   * @returns User information
   */
  async getCurrentUser(): Promise<ApiResponse<UserDTO>> {
    return apiCall(() => getCurrentUserProfile(), {
      showSuccessNotification: false,
      showErrorNotification: false, // Don't show notification on get user info failure
    });
  }

  /**
   * Check if user is logged in
   * @returns Whether user is logged in
   */
  isAuthenticated(): boolean {
    return tokenManager.hasToken();
  }

  /**
   * Get stored token
   * @returns Token string
   */
  getToken(): string | null {
    return tokenManager.getToken();
  }

  /**
   * Manually set token (for external token management)
   * @param token JWT token
   */
  setToken(token: string): void {
    tokenManager.setToken(token);
  }

  /**
   * Clear authentication information
   */
  clearAuth(): void {
    tokenManager.removeToken();
  }

  /**
   * Validate token validity (by fetching user info)
   * @returns Whether token is valid
   */
  async validateToken(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      const response = await this.getCurrentUser();
      return response.success;
    } catch {
      return false;
    }
  }

  /**
   * Auto-login check (called on app startup)
   * @returns User information (if auto-login succeeds)
   */
  async autoLogin(): Promise<ApiResponse<UserDTO>> {
    if (!this.isAuthenticated()) {
      return {
        success: false,
        message: '未找到登录信息',
        code: -1,
      };
    }

    const response = await this.getCurrentUser();
    if (!response.success) {
      // Clear local storage if token is invalid
      this.clearAuth();
    }

    return response;
  }
}

// Export singleton instance
export const authService = new AuthService();

// Compatibility export
export default authService;
