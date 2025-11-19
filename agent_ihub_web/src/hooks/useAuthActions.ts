/**
 * 认证操作 Hook - 处理所有认证相关的业务逻辑
 * 实现职责分离：将业务逻辑从 AuthContext 中分离出来
 */

import { useNavigate } from 'react-router-dom';
import {
  authService,
  type LoginRequest,
  type SignupRequest,
} from '../services/authService';
import { userService } from '../services/userService';
import type { UserDTO, UpdateUserDTO } from '../api';

// 用户类型定义（与 AuthContext 保持一致）
export interface User extends UserDTO {
  _placeholder?: never;
}

// 认证操作接口
export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (
    userName: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: UpdateUserDTO) => Promise<void>;
  refreshUser: () => Promise<void>;
}

/**
 * 认证操作 Hook
 * @param setUser - 设置用户状态的函数，来自 AuthContext
 * @returns 认证相关的操作方法
 */
export const useAuthActions = (
  setUser: (user: User | null) => void
): AuthActions => {
  const navigate = useNavigate();

  /**
   * 用户登录
   * @param email 邮箱
   * @param password 密码
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const loginRequest: LoginRequest = { email, password };
      const response = await authService.login(loginRequest);

      if (response.success && response.data) {
        const { user: userData } = response.data;
        setUser(userData as User);
        navigate('/dashboard');
      } else {
        throw new Error(response.message || '登录失败');
      }
    } catch (error: unknown) {
      console.error('登录失败:', error);
      throw error;
    }
  };

  /**
   * 用户注册
   * @param userName 用户名
   * @param email 邮箱
   * @param password 密码
   */
  const register = async (
    userName: string,
    email: string,
    password: string
  ): Promise<void> => {
    try {
      // 生成用户ID（简单的时间戳+随机数）
      // const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const signupRequest: SignupRequest = {
        // id: userId,
        userName,
        email,
        password,
      };

      const response = await authService.signup(signupRequest);

      if (response.success && response.data) {
        setUser(response.data as User);
        navigate('/dashboard');
      } else {
        throw new Error(response.message || '注册失败');
      }
    } catch (error: unknown) {
      console.error('注册失败:', error);
      throw error;
    }
  };

  /**
   * 用户登出
   */
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
      navigate('/login');
    } catch (error: unknown) {
      console.error('登出失败:', error);
      // 即使API调用失败，也要清除本地状态
      authService.clearAuth();
      setUser(null);
      navigate('/login');
    }
  };

  /**
   * 更新用户信息
   * @param data 要更新的用户数据
   */
  const updateUser = async (data: UpdateUserDTO): Promise<void> => {
    try {
      const response = await userService.updateProfile(data);

      if (response.success) {
        // 重新获取用户信息以确保状态同步
        await refreshUser();
      } else {
        throw new Error(response.message || '更新失败');
      }
    } catch (error: unknown) {
      console.error('更新用户信息失败:', error);
      throw error;
    }
  };

  /**
   * 刷新用户信息
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data as User);
      }
    } catch (error: unknown) {
      console.error('刷新用户信息失败:', error);
      // 刷新失败时不显示错误通知，因为这通常是后台操作
    }
  };

  return {
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };
};

export default useAuthActions;
