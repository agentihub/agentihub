import React, { useEffect, useRef, useCallback } from 'react';
import { App } from 'antd';
import { agentService } from '@/services';
import { useSSE } from '@/hooks/useSSE';
import MarkdownEditor from './MarkdownEditor';
import ChatAssistant from './ChatAssistant';
import type { ConfigurePanelProps } from '@/types/agent';
import type { AgentDTO } from '@/api/types.gen';
import { useFileManagement } from '@/hooks/useFileManagement';
import { useMessageManagement } from '@/hooks/useMessageManagement';

const MAX_FILES = 20;
const EMPTY_MD_CONTENT = `请提供更多详细内容`;

/**
 * 配置面板主组件
 * 包含 Markdown 编辑器和 AI 聊天助手
 */
const ConfigurePanel: React.FC<ConfigurePanelProps> = ({
  firstQuestion,
  agentForEditor,
  setAgentForEditor,
  mode = 'create',
}) => {
  const { message } = App.useApp();
  const hadSentFirstQuestion = useRef(false);
  const mdContent = agentForEditor?.mdContent || '';

  const { messages, isLoading, sendMessage, clearMessages, abort } = useSSE();

  // 文件管理 hook
  const {
    toolFiles,
    docsFiles,
    uploading,
    uploadType,
    fileInputRef,
    handleRemoveFile,
    handleUploadClick,
    handleFileChange,
  } = useFileManagement({ agentForEditor, setAgentForEditor, mode });

  // 应用 Markdown 代码到编辑器
  const handleApplyMarkdown = useCallback(
    (code: string) => {
      setAgentForEditor({ ...agentForEditor!, mdContent: code });
    },
    [setAgentForEditor, agentForEditor]
  );

  // 消息管理 hook
  const { chatMessages, renderMessage } = useMessageManagement({
    messages,
    isLoading,
    onApplyMarkdown: handleApplyMarkdown,
  });

  // 组件卸载时中止 SSE 连接
  useEffect(() => {
    return () => {
      abort();
    };
  }, [abort]);

  // 自动应用最新的 AI 消息到编辑器（实时更新）
  useEffect(() => {
    if (!messages.length) return;

    // 找到最后一条 assistant 消息
    const lastAssistantMessage = [...messages]
      .reverse()
      .find((msg) => msg.role === 'assistant');

    if (lastAssistantMessage && lastAssistantMessage.content) {
      const mdContent = lastAssistantMessage.content?.trim() || '';

      if (mdContent.length < EMPTY_MD_CONTENT.length) return;
      if (mdContent.includes(EMPTY_MD_CONTENT)) return;

      setAgentForEditor((prev: AgentDTO | null) => {
        if (!prev) return prev;
        return {
          ...prev,
          mdContent: lastAssistantMessage.content?.trim() || '',
        };
      });
    }
  }, [messages, setAgentForEditor]);

  // 发送首次问题
  useEffect(() => {
    if (firstQuestion && !hadSentFirstQuestion.current) {
      hadSentFirstQuestion.current = true;
      setTimeout(() => {
        sendMessage(firstQuestion, '/api/v1/liteAgent/creation/chat', {
          cmd: firstQuestion,
          toolFileIdList: [],
          docsFileIdList: [],
        });
      }, 100);
    }
  }, [firstQuestion, sendMessage]);

  // 发送消息
  const handleSendMessage = useCallback(
    async (msg: string) => {
      const apiUrl = '/api/v1/liteAgent/creation/chat';
      const toolFileIdList = toolFiles
        .map((f) => f.id)
        .filter(Boolean) as string[];
      const docsFileIdList = docsFiles
        .map((f) => f.id)
        .filter(Boolean) as string[];
      await sendMessage(msg, apiUrl, {
        cmd: msg,
        toolFileIdList,
        docsFileIdList,
      });
    },
    [sendMessage, toolFiles, docsFiles]
  );

  // 清空会话
  const handleCleanSession = useCallback(async () => {
    try {
      await agentService.cleanCreationChatSession();
      clearMessages();
      message.success('会话已清空');
    } catch {
      message.error('清空会话失败');
    }
  }, [clearMessages, message]);

  return (
    <div
      className="flex h-[calc(100vh-250px)] gap-4 p-4 py-0"
      data-color-mode="light"
    >
      {/* Markdown 编辑器 */}
      <MarkdownEditor
        agentName={agentForEditor?.name || 'ihub_agent.md'}
        mdContent={mdContent}
        onChange={handleApplyMarkdown}
      />

      {/* 聊天助手 */}
      <ChatAssistant
        messages={chatMessages}
        isLoading={isLoading}
        toolFiles={toolFiles}
        docsFiles={docsFiles}
        uploading={uploading}
        maxFiles={MAX_FILES}
        onSendMessage={handleSendMessage}
        onCleanSession={handleCleanSession}
        onRemoveFile={handleRemoveFile}
        onUploadClick={handleUploadClick}
        onFileChange={handleFileChange}
        fileInputRef={fileInputRef}
        uploadType={uploadType}
        renderMessage={renderMessage}
        mode={mode}
        mdContent={mdContent}
      />
    </div>
  );
};

export default ConfigurePanel;
