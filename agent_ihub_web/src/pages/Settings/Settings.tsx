import React, { useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { App } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { getCurrentUserProfile } from '../../api';
import MainLayout from '../../components/Layout/MainLayout';
import {
  SettingsSidebar,
  PublicProfileForm,
  AccountPasswordForm,
  type SettingSection,
} from './components';

const Settings: React.FC = () => {
  const { message } = App.useApp();
  const { user, setUser } = useAuth();
  const location = useLocation();

  // 从路由路径确定当前激活的部分
  const activeSection: SettingSection = useMemo(() => {
    if (location.pathname.includes('/settings/account')) {
      return 'account';
    }
    return 'profile'; // 默认为 profile
  }, [location.pathname]);

  // 获取最新的用户信息
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getCurrentUserProfile();

        if (response.data?.data) {
          // 更新用户信息到 AuthContext
          setUser(response.data.data);
        } else {
          message.warning('获取用户信息失败，显示缓存数据');
        }
      } catch (error) {
        console.error('获取用户信息出错:', error);
        // 静默失败，继续使用缓存的用户数据
        message.error('无法获取最新用户信息，请检查网络连接');
      }
    };

    fetchUserProfile();
  }, []); // setUser 来自 context，是稳定的函数引用

  return (
    <MainLayout>
      <div className="flex min-h-screen bg-white max-w-[1280px] mx-auto px-4 py-8">
        <SettingsSidebar activeSection={activeSection} />
        {activeSection === 'profile' && (
          <PublicProfileForm user={user} onUserUpdate={setUser} />
        )}
        {activeSection === 'account' && <AccountPasswordForm />}
      </div>
    </MainLayout>
  );
};

export default Settings;
