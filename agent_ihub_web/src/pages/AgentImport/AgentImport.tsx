import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Upload, App } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useAuth } from '@/context';
import type { AgentDTO } from '@/api';
import { tokenManager } from '@/services/apiClient';
import MainLayout from '@/components/Layout/MainLayout';

const { Dragger } = Upload;

const AgentImport: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.agent',
    beforeUpload: (file) => {
      // 验证文件扩展名
      const isAgentFile = file.name.endsWith('.agent');
      if (!isAgentFile) {
        message.error('只能上传 .agent 文件');
        return Upload.LIST_IGNORE;
      }

      // 验证文件大小 (例如限制在 10MB)
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过 10MB');
        return Upload.LIST_IGNORE;
      }

      setSelectedFile(file);
      return false; // 阻止自动上传
    },
    onRemove: () => {
      setSelectedFile(null);
    },
    fileList: selectedFile
      ? [
          {
            uid: '-1',
            name: selectedFile.name,
            status: 'done',
            url: '',
          },
        ]
      : [],
  };

  const handleImport = async () => {
    if (!selectedFile) {
      message.warning('请先选择要导入的 .agent 文件');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = tokenManager.getToken();
      const response = await fetch('/api/v1/agents/import', {
        method: 'POST',
        body: formData,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // 不要手动设置 Content-Type，让浏览器自动设置 boundary
        },
      });

      const result = await response.json();
      if (result.code === 200 && result.data) {
        const agent = result.data as AgentDTO;
        message.success('Agent 导入成功！');
        navigate(`/${user?.userName}/${agent.name}`);
      } else {
        message.error(result.msg || 'Agent 导入失败');
      }
    } catch (error) {
      console.error('Import error:', error);
      message.error('Agent 导入失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  return (
    <MainLayout showFooter={false}>
      <div className="min-h-[calc(100vh-250px)] flex flex-col">
        {/* 主内容区 */}
        <div className="flex-1">
          <div className="max-w-[850px] mx-auto px-4 sm:px-6 lg:px-4 py-6">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold mb-2 text-gray-900">
                导入 Agent
              </h1>
              <p className="text-sm text-gray-600 mb-0">
                上传 .agent 文件来导入已有的 Agent 配置。
              </p>
              <p className="text-xs text-gray-500 mt-2">
                支持的文件格式：.agent（最大 10MB）
              </p>
            </div>

            <div className="bg-white">
              <div className="px-3">
                <div className="mt-4 mb-6">
                  <Dragger
                    {...uploadProps}
                    className="!border-gray-300 hover:!border-green-600"
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined className="text-green-600 text-5xl" />
                    </p>
                    <p className="ant-upload-text text-base font-medium">
                      点击或拖拽文件到此区域上传
                    </p>
                    <p className="ant-upload-hint text-gray-600">
                      支持上传 .agent 格式的文件，单个文件不超过 10MB
                    </p>
                  </Dragger>

                  {selectedFile && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            已选择文件
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {selectedFile.name} (
                            {(selectedFile.size / 1024).toFixed(2)} KB)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Button
              className="float-right mr-4 mt-4"
              type="primary"
              onClick={handleImport}
              loading={uploading}
            >
              导入 Agent
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AgentImport;
