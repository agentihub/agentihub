import React from 'react';
import { Button } from 'antd';
import {
  CopyOutlined,
  CheckOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import type { CodeBlockProps } from '../../pages/AgentCreate/components/configure/types';

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  codeId,
  onCopy,
  onApply,
  copiedCode,
  isLatest,
  isHovered,
}) => {
  // 最新的消息始终显示，其他消息需要 hover 才显示
  const shouldShow = isLatest || isHovered;

  return (
    <div className="sticky top-10 z-30 flex justify-end pointer-events-none mr-4 -mb-10">
      <div className="pointer-events-auto">
        <div
          className={`flex gap-2 transition-opacity duration-200 ${
            shouldShow ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Button
            type="primary"
            size="small"
            icon={<ArrowLeftOutlined />}
            onClick={() => onApply?.(code)}
            className="!bg-green-600 hover:!bg-green-700 !text-white"
            title="应用到编辑器"
          >
            应用
          </Button>
          <Button
            type="default"
            size="small"
            icon={copiedCode === codeId ? <CheckOutlined /> : <CopyOutlined />}
            onClick={() => onCopy(code, codeId)}
            className={
              copiedCode === codeId
                ? '!bg-green-50 !text-green-600 !border-green-600'
                : ''
            }
            title="复制内容"
          >
            {copiedCode === codeId ? '已复制' : '复制'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CodeBlock;
