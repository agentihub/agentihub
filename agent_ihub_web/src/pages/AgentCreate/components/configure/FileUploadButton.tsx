import React from 'react';
import { Button, Dropdown } from 'antd';
import { PlusOutlined, FileOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { FileUploadButtonProps } from '@/types/agent';

/**
 * 文件上传按钮组件
 */
const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  uploading,
  isLoading,
  onUploadClick,
}) => {
  const menuItems: MenuProps['items'] = [
    {
      key: 'tool',
      label: '工具文档',
      icon: <FileOutlined />,
      onClick: () => onUploadClick('tool'),
    },
    {
      key: 'docs',
      label: '知识库文档',
      icon: <FileOutlined />,
      onClick: () => onUploadClick('docs'),
    },
  ];

  return (
    <div className="absolute bottom-[24px] left-[25px] z-100">
      <Dropdown
        menu={{ items: menuItems }}
        trigger={['click']}
        disabled={uploading || isLoading}
        placement="topLeft"
      >
        <Button
          type="text"
          icon={<PlusOutlined />}
          size="large"
          loading={uploading}
          disabled={isLoading}
          className="hover:!bg-gray-100 !rounded-full flex items-center justify-center"
          title="上传文件"
        />
      </Dropdown>
    </div>
  );
};

export default FileUploadButton;
