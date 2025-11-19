import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Spin, Alert, App } from 'antd';

import MainLayout from '@/components/Layout/MainLayout';
import { agentService } from '@/services/agentService';
import type { AgentDTO } from '@/api/types.gen';
import '@/styles/github-theme.css';
import { CodeIcon, GearIcon, CopilotIcon } from '@primer/octicons-react';
import type { NavItem } from '@/components/Layout/Navs';
import { useAuth } from '@/context/AuthContext';

const TABS = {
  CODE: 'code',
  COPILOT: 'copilot',
  SETTINGS: 'settings',
};

const AgentDetail: React.FC = () => {
  const { message } = App.useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { userName, agentname } = useParams<{
    userName: string;
    agentname: string;
  }>();
  const [loading, setLoading] = useState(true);
  const [agentData, setAgentData] = useState<AgentDTO | null>(null);
  const [isStarred, setIsStarred] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(TABS.CODE);
  const isOwnAgent = useMemo(() => {
    return agentData?.authorId === user?.id;
  }, [agentData, user]);

  useEffect(() => {
    const pathname = location.pathname;
    if (pathname.includes('/settings')) {
      setActiveTab(TABS.SETTINGS);
    } else if (pathname.includes('/copilot')) {
      setActiveTab(TABS.COPILOT);
    } else {
      setActiveTab(TABS.CODE);
    }
  }, [location.pathname]);

  // 清理文件树展开状态缓存
  useEffect(() => {
    return () => {
      // 组件卸载时清除缓存
      if (userName && agentname) {
        const storageKey = `fileTree-expanded-${userName}-${agentname}`;
        localStorage.removeItem(storageKey);
      }
    };
  }, [userName, agentname]);

  const navItems: NavItem[] = [
    { key: 'code', label: 'Agent', icon: CodeIcon },
    {
      key: 'copilot',
      label: 'Copilot',
      icon: CopilotIcon,
      disabled: !isOwnAgent,
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: GearIcon,
      disabled: !isOwnAgent,
    },
  ];

  // 加载 Agent 数据
  const loadAgentData = useCallback(async () => {
    if (!userName || !agentname) {
      setError('未提供用户名或 Agent 名');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const agent = await agentService.getAgentByNames(userName, agentname);
      setAgentData(agent.data!);
      setIsStarred(agent.data?.isStarred || false);
    } catch (error) {
      console.error('加载 Agent 失败:', error);
      setError(error instanceof Error ? error.message : '加载 Agent 失败');
      setAgentData(null);
    } finally {
      setLoading(false);
    }
  }, [userName, agentname]);

  useEffect(() => {
    loadAgentData();
  }, [loadAgentData]);

  // 处理 Star 操作
  const handleStar = async () => {
    if (!agentData) return;

    try {
      if (isStarred) {
        await agentService.unstarAgent(agentData.id!);
        setIsStarred(false);
        message.success('已取消收藏');
      } else {
        await agentService.starAgent(agentData.id!);
        setIsStarred(true);
        message.success('已收藏');
      }

      setAgentData({
        ...agentData,
        stars: (agentData.stars || 0) + (isStarred ? -1 : 1),
      });
    } catch (error) {
      console.error('Star 操作失败:', error);
      message.error('操作失败，请重试');
    }
  };

  // 处理 Fork 操作
  const handleFork = () => {
    navigate(`/${userName}/${agentname}/fork`);
  };

  const onTabChange = (tab: string) => {
    if (tab === 'code') {
      navigate(`/${userName}/${agentname}`);
    } else {
      navigate(`/${userName}/${agentname}/${tab}`);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  if (error || !agentData) {
    return (
      <MainLayout>
        <div className="p-4">
          <Alert type="error" message={error || '未找到 Agent'} showIcon />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      localBar={{
        activeTab: activeTab,
        onTabChange: onTabChange,
        navItems,
      }}
    >
      <Outlet
        context={{
          agentData,
          isOwnAgent,
          isStarred,
          handleStar,
          handleFork,
          reFetchAgentData: loadAgentData,
        }}
      />
    </MainLayout>
  );
};

export default AgentDetail;
