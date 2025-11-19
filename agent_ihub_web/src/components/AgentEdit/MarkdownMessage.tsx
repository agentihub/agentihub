import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Button, Spin } from 'antd';
import { UpOutlined, LoadingOutlined } from '@ant-design/icons';
import type { MarkdownMessageProps } from '@/types/agent';

/**
 * Markdown 消息渲染组件
 */
const MarkdownMessage: React.FC<MarkdownMessageProps> = ({
  message,
  collapsed = false,
  onToggleCollapse,
  isStreaming = false,
}) => {
  // 生成预览文本
  const streamingPreviewLength = 250; // 流式输出时显示更多内容
  const collapsedPreviewLength = 200; // 折叠时显示的内容

  const previewLength = isStreaming
    ? streamingPreviewLength
    : collapsedPreviewLength;
  const previewText =
    message.length > previewLength
      ? message.slice(0, previewLength).trim() + '...'
      : message.trim();

  return (
    <div
      className="text-sm bg-transparent"
      style={{
        maxWidth: '100%',
        wordWrap: 'break-word',
        whiteSpace: 'normal', // 覆盖父级的 pre-wrap，避免保留多余空白
      }}
    >
      {collapsed ? (
        // 折叠状态：显示预览和展开按钮
        <div className="p-2">
          {/* 流式输出时的特殊提示 */}
          {isStreaming && (
            <div className="flex items-center gap-2 mb-2 text-green-600 font-medium">
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />}
                size="small"
              />
              <span className="text-xs">正在更新 Agent 文档</span>
            </div>
          )}

          {/* 预览内容 */}
          <div className="text-gray-600 text-xs line-clamp-3">
            {previewText}
          </div>

          {/* 展开按钮 - 流式输出时隐藏 */}
          {!isStreaming && (
            <Button
              type="link"
              size="small"
              onClick={onToggleCollapse}
              className="!p-0 !h-auto text-blue-400 mt-2"
            >
              查看详情
            </Button>
          )}
        </div>
      ) : (
        // 展开状态：显示完整内容
        <div>
          {/* 流式输出时的提示（展开状态） */}
          {isStreaming && (
            <div className="px-2 pt-2 flex items-center gap-2 text-green-600 font-medium">
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />}
                size="small"
              />
              <span className="text-xs">正在更新 ihub_agent.md</span>
            </div>
          )}

          <div className="markdown-body p-2 relative bg-[#f6f8fa]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                // 段落样式
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0">{children}</p>
                ),

                // 代码块处理
                pre: ({ children, ...props }) => {
                  return (
                    <pre className="my-2 overflow-x-auto" {...props}>
                      {children}
                    </pre>
                  );
                },

                // 行内代码样式
                code: ({ children, className }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">
                      {children}
                    </code>
                  ) : (
                    <code className={className}>{children}</code>
                  );
                },

                // 列表样式
                ul: ({ children }) => (
                  <ul className="mb-2 last:mb-0">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-2 last:mb-0">{children}</ol>
                ),
              }}
            >
              {message}
            </ReactMarkdown>

            {/* 流式输出时显示闪烁光标 */}
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-green-600 ml-1 animate-pulse" />
            )}
          </div>

          {/* 收起按钮 */}
          <div className="px-2 pb-2">
            <Button
              type="link"
              size="small"
              icon={<UpOutlined />}
              onClick={onToggleCollapse}
              className="!p-0 !h-auto text-gray-500"
            >
              {isStreaming ? '收起实时内容' : '收起内容'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkdownMessage;
