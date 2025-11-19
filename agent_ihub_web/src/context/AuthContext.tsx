import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserDTO } from '../api';
import { userManager } from '../services/apiClient';

// 使用新的UserDto作为基础类型
export interface User extends UserDTO {
  // 可以在这里扩展额外的用户属性
  _placeholder?: never; // 防止空接口错误
}

interface AuthContextType {
  user: UserDTO | null;
  setUser: (user: UserDTO | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const user = userManager.getUser();
    setUser(user);
  }, []);

  const value: AuthContextType = {
    user,
    setUser: (user: User | null) => {
      userManager.setUser(user);
      if (user) {
        setUser(user as User);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
