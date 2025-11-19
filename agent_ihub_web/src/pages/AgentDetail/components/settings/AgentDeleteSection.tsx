import React, { useState } from 'react';
import { Button, Divider, Input, Modal, App } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import type { AgentDTO } from '@/api/types.gen';
import { agentService } from '@/services/agentService';

interface AgentDeleteSectionProps {
  agentData: AgentDTO;
}

export const AgentDeleteSection: React.FC<AgentDeleteSectionProps> = ({
  agentData,
}) => {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { userName } = useParams<{ userName: string; agentname: string }>();

  // 打开删除确认弹窗
  const handleOpenDeleteModal = () => {
    setDeleteModalVisible(true);
    setDeleteConfirmName('');
  };

  // 关闭删除确认弹窗
  const handleCloseDeleteModal = () => {
    setDeleteModalVisible(false);
    setDeleteConfirmName('');
  };

  // 执行删除操作
  const handleDeleteAgent = async () => {
    if (!agentData.id || !userName) return;

    // 验证输入的名称是否匹配
    if (deleteConfirmName !== agentData.name) {
      message.error('输入的Agent名称不匹配');
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await agentService.deleteAgent(agentData.id);

      if (response.success) {
        message.success('Agent已成功删除');
        // 删除成功后跳转到用户的Agent列表
        navigate(`/${userName}`, { replace: true });
      } else {
        message.error(response.message || '删除失败，请重试');
      }
    } catch (error) {
      console.error('删除Agent失败:', error);
      message.error('删除失败，请重试');
    } finally {
      setDeleteLoading(false);
      setDeleteModalVisible(false);
    }
  };

  return (
    <>
      {/* Danger Zone - 危险区域 */}
      <Divider className="my-8" />

      <div className="flex items-start justify-between mt-12 p-4 bg-white border border-red-200 rounded-md">
        <div className="flex-1">
          <h5 className="font-medium text-gray-900 mb-1">删除此 Agent</h5>
          <p className="text-sm text-gray-600">
            一旦删除，此操作将无法撤销。该 Agent 的所有数据和配置将被永久删除。
          </p>
        </div>
        <Button
          danger
          size="large"
          onClick={handleOpenDeleteModal}
          className="ml-4 rounded-md"
        >
          删除 Agent
        </Button>
      </div>

      {/* 删除确认弹窗 */}
      <Modal
        centered
        title="确认删除 Agent"
        open={deleteModalVisible}
        onCancel={handleCloseDeleteModal}
        footer={[
          <Button key="cancel" size="large" onClick={handleCloseDeleteModal}>
            取消
          </Button>,
          <Button
            key="delete"
            danger
            type="primary"
            size="large"
            loading={deleteLoading}
            onClick={handleDeleteAgent}
            disabled={deleteConfirmName !== agentData.name}
          >
            确认删除
          </Button>,
        ]}
        width={480}
      >
        <div className="py-4">
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">
              此操作将永久删除 Agent 及其所有数据，且无法撤销。
            </p>
          </div>

          <div className="mb-2">
            <p className="text-sm text-gray-700 mb-2">
              请输入 <span className="font-semibold">{agentData.name}</span>{' '}
              以确认删除：
            </p>
            <Input
              placeholder={agentData.name}
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              size="large"
              className="rounded-md"
              status={
                deleteConfirmName && deleteConfirmName !== agentData.name
                  ? 'error'
                  : undefined
              }
            />
          </div>
        </div>
      </Modal>
    </>
  );
};
