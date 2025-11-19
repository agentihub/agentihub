import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Button, Spin, App } from 'antd';
import type { AgentDTO } from '@/api/types.gen';
import ConfigurePanel from '@/pages/AgentCreate/components/configure';
import { agentService } from '@/services';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

interface AgentDetailContext {
  agentData: AgentDTO;
  isOwnAgent: boolean;
  reFetchAgentData: () => Promise<void>;
}

const AgentCopilot: React.FC = () => {
  const { message } = App.useApp();
  const { agentData, isOwnAgent, reFetchAgentData } =
    useOutletContext<AgentDetailContext>();
  const navigate = useNavigate();
  const [agentForEditor, setAgentForEditor] = useState<AgentDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const hasUnsavedChanges = useMemo(() => {
    if (!agentForEditor || !agentData) return false;

    return (
      agentForEditor.mdContent !== agentData.mdContent ||
      JSON.stringify(agentForEditor.toolFileIdList) !==
        JSON.stringify(agentData.toolFileIdList) ||
      JSON.stringify(agentForEditor.docsFileIdList) !==
        JSON.stringify(agentData.docsFileIdList)
    );
  }, [agentForEditor, agentData]);

  // Use unsaved changes hook
  useUnsavedChanges({
    hasUnsavedChanges,
    message: '您有未保存的更改，确定要离开吗？',
    title: '离开此页面？',
  });

  // 初始化 agent 数据
  useEffect(() => {
    const initializeAgent = async () => {
      try {
        setLoading(true);
        // 直接使用 agentData 作为编辑器的初始数据
        setAgentForEditor({ ...agentData });
      } catch (error) {
        console.error('初始化 Agent 失败:', error);
        message.error('初始化 Agent 失败');
      } finally {
        setLoading(false);
      }
    };

    if (agentData) {
      initializeAgent();
      agentService.cleanCreationChatSession();
    }
  }, [agentData]);

  // 更新 Agent
  const handleUpdate = async () => {
    if (!agentForEditor) {
      message.warning('没有可更新的内容');
      return;
    }

    try {
      setUpdating(true);

      // 调用更新 API
      const result = await agentService.updateAgent({
        id: agentData.id!,
        ...agentForEditor,
      });

      if (result.success) {
        message.success('Agent 更新成功');
        // 重新获取 Agent 数据
        await reFetchAgentData();
        // 返回到 Agent 详情页
        navigate(`/${agentData.authorName}/${agentData.name}`);
      } else {
        message.error(result.message || 'Agent 更新失败');
      }
    } catch (error) {
      console.error('更新 Agent 失败:', error);
      message.error('更新 Agent 失败');
    } finally {
      setUpdating(false);
    }
  };

  // 如果不是自己的 Agent，不允许编辑
  if (!isOwnAgent) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-500">您没有权限编辑此 Agent</div>
      </div>
    );
  }

  if (loading || !agentForEditor) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" tip="正在加载 Agent..." />
      </div>
    );
  }

  return (
    <div className="relative pt-4">
      {/* ConfigurePanel 组件 */}
      <ConfigurePanel
        firstQuestion=""
        agentForEditor={agentForEditor}
        setAgentForEditor={setAgentForEditor}
        mode="edit"
      />

      {/* 更新按钮 */}
      <div className="flex justify-end gap-3 mt-6 px-4 py-4">
        <Button
          onClick={() => navigate(`/${agentData.authorName}/${agentData.name}`)}
          disabled={updating}
        >
          取消
        </Button>
        <Button
          type="primary"
          loading={updating}
          onClick={handleUpdate}
          disabled={updating || !hasUnsavedChanges}
          className="bg-[#2da44e] hover:bg-[#2c974b]"
        >
          更新 Agent
        </Button>
      </div>
    </div>
  );
};

export default AgentCopilot;
