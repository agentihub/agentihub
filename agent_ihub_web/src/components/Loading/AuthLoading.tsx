import React from 'react';
import { Spin } from 'antd';
import './AuthLoading.css';

const AuthLoading: React.FC = () => {
  return (
    <div className="auth-loading-container">
      <div className="auth-loading-content">
        <Spin size="large" />
        <div className="auth-loading-text">验证登录状态中...</div>
      </div>
    </div>
  );
};

export default AuthLoading;
