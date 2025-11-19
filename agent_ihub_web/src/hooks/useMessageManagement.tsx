import { useState, useMemo, useCallback, useEffect } from 'react';
import { App } from 'antd';
import { Message } from '@chatscope/chat-ui-kit-react';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import CodeBlock from '@/components/AgentEdit/CodeBlock';
import MarkdownMessage from '@/components/AgentEdit/MarkdownMessage';
import type { ChatMessageData } from '@/types/agent';
import type { SSEMessage } from '@/hooks/useSSE';
import copyToClipboard from '@/utils/clipboard';

interface UseMessageManagementProps {
  messages: SSEMessage[];
  isLoading: boolean;
  onApplyMarkdown: (code: string) => void;
}

export const useMessageManagement = ({
  messages,
  isLoading,
  onApplyMarkdown,
}: UseMessageManagementProps) => {
  const { message } = App.useApp();

  // 状态管理
  const [copiedCode, setCopiedCode] = useState<string>('');
  const [copiedMessage, setCopiedMessage] = useState<number | null>(null);
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState<number | null>(
    null
  );
  const [collapsedMessages, setCollapsedMessages] = useState<Set<number>>(
    new Set()
  );

  // 初始化所有 AI 消息为折叠状态
  useEffect(() => {
    if (messages.length === 0) {
      setCollapsedMessages(new Set());
      return;
    }

    const assistantIndices: number[] = [];
    messages.forEach((msg, index) => {
      if (msg.role === 'assistant') {
        assistantIndices.push(index);
      }
    });

    if (assistantIndices.length > 0) {
      setCollapsedMessages((prev) => {
        const newIndices = assistantIndices.filter((idx) => !prev.has(idx));
        if (newIndices.length > 0) {
          return new Set([...prev, ...newIndices]);
        }
        return prev;
      });
    }
  }, [messages]);

  // 切换消息折叠状态
  const handleToggleCollapse = useCallback((index: number) => {
    setCollapsedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  // 复制代码到剪贴板
  const handleCopyCode = useCallback(
    async (code: string, codeId: string) => {
      const success = await copyToClipboard(code);
      if (!success) {
        message.error('复制失败');
        return;
      }
      setCopiedCode(codeId);
      message.success('代码已复制');
      setTimeout(() => setCopiedCode(''), 2000);
    },
    [message]
  );

  // 复制消息内容
  const handleCopyMessage = useCallback(
    async (content: string, messageIndex: number) => {
      const success = await copyToClipboard(content);
      if (!success) {
        message.error('复制失败');
        return;
      }
      setCopiedMessage(messageIndex);
      message.success('已复制');
      setTimeout(() => setCopiedMessage(null), 2000);
    },
    [message]
  );

  // 转换消息格式
  const chatMessages = useMemo(() => {
    return messages.map((msg, index) => ({
      message: msg.content,
      sender: msg.role === 'user' ? 'User' : 'AI',
      direction: (msg.role === 'user' ? 'outgoing' : 'incoming') as
        | 'outgoing'
        | 'incoming',
      position: 'single' as const,
      isAssistant: msg.role === 'assistant',
      collapsed: collapsedMessages.has(index),
    }));
  }, [messages, collapsedMessages]);

  // 自定义消息渲染器
  const renderMessage = useCallback(
    (msg: ChatMessageData, index: number) => {
      if (msg.isAssistant) {
        const messageCodeId = `message-${index}`;

        // 找到所有 assistant 消息的索引
        const assistantIndices = chatMessages
          .map((m, i) => (m.isAssistant ? i : -1))
          .filter((i) => i !== -1);

        // 判断是否是最新的 assistant 消息
        const isLatest =
          assistantIndices.length > 0 &&
          index === assistantIndices[assistantIndices.length - 1];

        // 判断是否处于 hover 状态
        const isHovered = hoveredMessageIndex === index;

        // 获取折叠状态
        const isCollapsed = msg.collapsed || false;

        // 判断是否正在流式输出（最新消息且正在加载）
        const isStreaming = isLatest && isLoading;

        return (
          <div
            key={index}
            className="relative"
            onMouseEnter={() => setHoveredMessageIndex(index)}
            onMouseLeave={() => setHoveredMessageIndex(null)}
          >
            {/* 只有展开且非流式输出时才显示 CodeBlock */}
            {!isCollapsed && !isStreaming && (
              <CodeBlock
                code={msg.message}
                codeId={messageCodeId}
                onCopy={handleCopyCode}
                onApply={onApplyMarkdown}
                copiedCode={copiedCode}
                isLatest={isLatest}
                isHovered={isHovered}
              />
            )}

            {/* 消息内容 */}
            <Message model={msg} type="custom">
              <Message.CustomContent>
                <MarkdownMessage
                  message={msg.message}
                  index={index}
                  copiedCode={copiedCode}
                  onCopyCode={handleCopyCode}
                  onApplyMarkdown={onApplyMarkdown}
                  collapsed={isCollapsed}
                  onToggleCollapse={() => handleToggleCollapse(index)}
                  isStreaming={isStreaming}
                />
              </Message.CustomContent>
            </Message>
          </div>
        );
      }
      // 用户消息 - 添加复制功能
      const isHovered = hoveredMessageIndex === index;
      const isCopied = copiedMessage === index;

      return (
        <div
          key={index}
          className="relative"
          onMouseEnter={() => setHoveredMessageIndex(index)}
          onMouseLeave={() => setHoveredMessageIndex(null)}
        >
          <Message model={msg} />

          {/* 复制按钮 - 悬停时显示在消息底部右侧 */}
          {isHovered && (
            <button
              onClick={() => handleCopyMessage(msg.message, index)}
              className="absolute bottom-2 right-0 bg-transparent border-none"
              title="复制消息"
            >
              {isCopied ? (
                <CheckOutlined className="text-green-600 text-sm" />
              ) : (
                <CopyOutlined className="text-gray-600 text-sm" />
              )}
            </button>
          )}
        </div>
      );
    },
    [
      copiedCode,
      copiedMessage,
      onApplyMarkdown,
      handleCopyCode,
      handleCopyMessage,
      chatMessages,
      hoveredMessageIndex,
      handleToggleCollapse,
      isLoading,
    ]
  );

  return {
    chatMessages,
    renderMessage,
  };
};
