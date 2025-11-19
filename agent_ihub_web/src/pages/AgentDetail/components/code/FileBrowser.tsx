import React, { useState } from 'react';
import { Button, Dropdown, App } from 'antd';
import type { MenuProps } from 'antd';
import {
  ChevronDownIcon,
  DownloadIcon,
  PlusIcon,
} from '@primer/octicons-react';
import type { AgentDTO } from '@/api/types.gen';
import { exportAgent } from '@/api';
import FileUpload from './FileUpload';

interface FileBrowserProps {
  agentData: AgentDTO | null;
  readOnly: boolean;
  onUploadSuccess?: () => void;
}

const FileBrowser: React.FC<FileBrowserProps> = ({
  agentData,
  readOnly,
  onUploadSuccess,
}) => {
  const { message } = App.useApp();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'tool' | 'docs'>('tool');
  // 添加文件菜单项
  const addFileMenuItems: MenuProps['items'] = [
    {
      key: 'tool',
      label: '工具文档',
      onClick: () => handleAddFileClick('tool'),
    },
    {
      key: 'docs',
      label: '知识库文档',
      onClick: () => handleAddFileClick('docs'),
    },
  ];

  const handleAddFileClick = (type: 'tool' | 'docs') => {
    setUploadType(type);
    setUploadModalOpen(true);
  };

  const handleUploadClose = () => {
    setUploadModalOpen(false);
  };

  const handleDownload = async () => {
    if (!agentData?.id) {
      message.error('Agent ID 不可用');
      return;
    }

    try {
      const response = await exportAgent({ query: { id: agentData.id } });
      if (response.error) {
        message.error(response.error.msg || 'Agent 导出失败');
      }
      if (!response.data) return;
      // Assuming response is a fetch Response object
      const blob = (await response.data) as Blob;

      if (blob && blob.size > 0) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${agentData.name || 'agent'}.agent`; // Assuming zip format
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        message.success('Agent 导出成功');
      } else {
        throw new Error('未收到文件内容');
      }
    } catch (error) {
      console.error('Failed to download agent:', error);
      message.error('Agent 下载失败');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-none">
          {!readOnly && (
            <Dropdown menu={{ items: addFileMenuItems }} trigger={['click']}>
              <Button
                size="small"
                icon={<PlusIcon size={16} />}
                style={{ borderColor: '#D0D7DE', borderRadius: '6px' }}
              >
                新增文件
                <ChevronDownIcon size={16} className="ml-1" />
              </Button>
            </Dropdown>
          )}

          <Button
            type="primary"
            size="small"
            onClick={handleDownload}
            icon={<DownloadIcon size={16} />}
            style={{ borderRadius: '6px' }}
          >
            导出 Agent
          </Button>
        </div>
      </div>

      {/* 文件上传模态框 */}
      <FileUpload
        open={uploadModalOpen}
        onClose={handleUploadClose}
        uploadType={uploadType}
        agentData={agentData}
        onUploadSuccess={onUploadSuccess}
      />
    </div>
  );
};

export default FileBrowser;
