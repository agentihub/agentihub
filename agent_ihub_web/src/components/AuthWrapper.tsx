import React, { useEffect } from 'react';
import { tokenManager, userManager } from '../services/apiClient';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const whiteList = [
    '/login',
    '/register',
    '/forgot-password',
    '/privacy-content',
  ];

  useEffect(() => {
    // 白名单路径直接放行，无需认证检查
    if (whiteList.includes(location.pathname)) {
      return;
    }

    // 非白名单路径需要检查认证状态
    const token = tokenManager.getToken();
    const user = userManager.getUser();

    if (!token || !user) {
      navigate('/login?redirect=' + location.pathname);
    }
  }, [location.pathname]);

  return <>{children}</>;
};

export default AuthWrapper;
