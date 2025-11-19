import React, { useEffect, useRef, useCallback } from 'react';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  MessageInput,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import FileList from './FileList';
import FileUploadButton from './FileUploadButton';
import type { ChatAssistantProps } from '@/types/agent';
import '@/assets/css/chat-ui-kit.css';

const TAG_SPAN_ID = 'ihub-context-tag';
const TAG_TEXT = '@ihub_agent.md';

/**
 * 聊天助手组件
 */
const ChatAssistant: React.FC<ChatAssistantProps> = ({
  messages,
  isLoading,
  toolFiles,
  docsFiles,
  uploading,
  maxFiles,
  onSendMessage,
  onCleanSession,
  onRemoveFile,
  onUploadClick,
  onFileChange,
  fileInputRef,
  uploadType,
  renderMessage,
  mode = 'create',
  mdContent,
}) => {
  const inputContainerRef = useRef<HTMLDivElement>(null);

  // 获取 contenteditable div（通过 ref 限制查询范围）
  const getEditorDiv = useCallback((): HTMLDivElement | null => {
    return (
      inputContainerRef.current?.querySelector(
        '.cs-message-input__content-editor'
      ) || null
    );
  }, []);

  // 在输入框中插入标签
  const insertTagInInput = useCallback(() => {
    const editorDiv = getEditorDiv();

    if (editorDiv && !editorDiv.querySelector(`#${TAG_SPAN_ID}`)) {
      // 创建标签 span
      const tagSpan = document.createElement('span');
      tagSpan.id = TAG_SPAN_ID;
      tagSpan.contentEditable = 'false';
      tagSpan.textContent = TAG_TEXT;

      // 插入到输入框开头
      editorDiv.insertBefore(tagSpan, editorDiv.firstChild);

      // 添加空格并设置光标位置
      const space = document.createTextNode(' ');
      editorDiv.insertBefore(space, tagSpan.nextSibling);

      // 设置光标位置到标签后面
      const range = document.createRange();
      const sel = window.getSelection();
      if (sel && editorDiv.childNodes.length > 1) {
        range.setStart(editorDiv.childNodes[1], 1);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }, [getEditorDiv]);

  // 检查输入框中是否存在标签
  const hasTagInInput = useCallback((): boolean => {
    const editorDiv = getEditorDiv();
    return !!editorDiv?.querySelector(`#${TAG_SPAN_ID}`);
  }, [getEditorDiv]);

  // 从输入框中移除标签
  const removeTagFromInput = useCallback(() => {
    const editorDiv = getEditorDiv();
    const tagSpan = editorDiv?.querySelector(`#${TAG_SPAN_ID}`);
    tagSpan?.remove();
  }, [getEditorDiv]);

  // 编辑模式下，插入上下文标签
  useEffect(() => {
    if (mode === 'edit') {
      // 延迟执行，确保 DOM 已渲染
      const timer = setTimeout(() => {
        insertTagInInput();
      }, 300);

      // 清理函数：组件卸载时移除标签
      return () => {
        clearTimeout(timer);
        removeTagFromInput();
      };
    }
  }, [mode, insertTagInInput, removeTagFromInput]);

  const handleSend = async (
    _innerHtml: string,
    textContent: string,
    innerText: string
  ) => {
    // 从 textContent 中移除标签文本
    const message = (textContent || innerText).replace(TAG_TEXT, '').trim();
    if (!message) return;

    const hasTag = hasTagInInput();
    const finalMessage =
      hasTag && mdContent ? `${mdContent}\n\n---\n\n${message}` : message;

    await onSendMessage(finalMessage);

    if (hasTag) {
      removeTagFromInput();
    }
  };

  return (
    <div className="w-1/2 flex-shrink-0 flex flex-col border border-gray-200 rounded-lg bg-white overflow-hidden">
      {/* 标题栏 */}
      <div className="px-4 py-2 font-semibold border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <span>Copilot</span>
        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          onClick={onCleanSession}
          disabled={messages.length === 0}
          className="text-gray-500 hover:!text-red-600 hover:!bg-red-50"
          title="清空会话"
        >
          清空
        </Button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={onFileChange}
          accept={
            uploadType === 'tool'
              ? '.json,.yml,.yaml'
              : '.pdf,.doc,.docx,.ppt,.pptx,.txt,.md'
          }
        />

        {/* 聊天消息区域 */}
        <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
          <MainContainer className="h-full">
            <ChatContainer className="h-full">
              <MessageList
                typingIndicator={
                  isLoading ? (
                    <TypingIndicator content="AI 正在输入..." />
                  ) : null
                }
              >
                {messages.map((msg, i) => renderMessage(msg, i))}
              </MessageList>
            </ChatContainer>
          </MainContainer>
        </div>

        {/* 文件列表区域 */}
        <FileList
          toolFiles={toolFiles}
          docsFiles={docsFiles}
          maxFiles={maxFiles}
          onRemoveFile={onRemoveFile}
        />

        {/* 输入框区域 */}
        <div style={{ position: 'relative' }} ref={inputContainerRef}>
          <FileUploadButton
            uploading={uploading}
            isLoading={isLoading}
            onUploadClick={onUploadClick}
          />

          <MessageInput
            placeholder="输入消息..."
            onSend={handleSend}
            attachButton={false}
            disabled={isLoading || uploading}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
