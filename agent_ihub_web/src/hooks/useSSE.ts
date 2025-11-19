import { useState, useCallback, useRef, useEffect } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { MessageRole, MessageType, type Message } from '@/types/Message';
import { isJsonString } from '@/utils/isJsonString';
import { produce } from 'immer';

export interface SSEMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface UseSSEReturn {
  messages: SSEMessage[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (
    message: string,
    url: string,
    body: Record<string, string | string[]>
  ) => Promise<void>;
  clearMessages: () => void;
  abort: () => void;
}

/**
 * SSE Hook - 用于处理 Server-Sent Events 流式响应
 */
export const useSSE = (): UseSSEReturn => {
  const [messages, setMessages] = useState<SSEMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    abort();
    setMessages((prev) =>
      produce(prev, (draft) => {
        draft.length = 0;
      })
    );

    setError(null);
  }, [abort]);

  const sendMessage = useCallback(
    async (
      message: string,
      url: string,
      body: Record<string, string | string[]>
    ) => {
      const id = new Date().getTime();
      console.log('=== sendMessage 被调用 ===', {
        message,
        url,
        body,
        timestamp: new Date().toISOString(),
      });

      // 添加用户消息
      const userMessage: SSEMessage = {
        role: 'user',
        content: message,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // 重置状态
      setIsLoading(true);
      setError(null);

      // 如果有旧的连接，先中止
      if (abortControllerRef.current) {
        console.log('⚠️ 中止旧的 SSE 连接');
        abortControllerRef.current.abort();
      }

      // 创建新的 AbortController
      abortControllerRef.current = new AbortController();

      try {
        const token = localStorage.getItem('auth_token');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        console.log('🚀 开始 fetchEventSource', {
          url,
          body,
          timestamp: new Date().toISOString(),
        });
        await fetchEventSource(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal: abortControllerRef.current.signal,

          async onopen(response) {
            console.log('✅ SSE 连接已打开', { status: response.status, url });
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            // 连接成功，不需要额外操作
          },

          onmessage(event) {
            const rawData = event.data;
            try {
              const message: Message =
                typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
              const getIndex = (messages: SSEMessage[]) => {
                return messages.findIndex((msg) => msg.id === id);
              };

              // 处理任务状态消息
              if (message.type === MessageType.TaskStatus) {
                const taskContentStatus = message.content?.status;
                if (taskContentStatus === 'start') {
                  // todo handle start
                }

                if (taskContentStatus === 'exception') {
                  console.error('Task exception:');
                  // todo handle exception
                  setIsLoading(false);
                }

                if (taskContentStatus === 'done') {
                  // todo handle done
                  setIsLoading(false);
                }
              }

              // 处理思考
              if (message.type === MessageType.ReasoningContent) {
                if (!message.part?.trim()) return;
                // todo handle reasoningContent
              }

              // 处理文本消息

              if (
                message.type === MessageType.Text &&
                (message.role === MessageRole.Assistant ||
                  message.role === MessageRole.Subagent)
              ) {
                setMessages((prev) =>
                  produce(prev, (draft) => {
                    const index = getIndex(draft);
                    if (index > -1) {
                      draft[index].content += message.part || '';
                    } else {
                      draft.push({
                        id: id,
                        content: message.part || '',
                        role: MessageRole.Assistant,
                      });
                    }
                  })
                );
              }

              // 处理工具调用消息
              if (message.type === MessageType.ToolCalls) {
                console.log('ToolCalls message:', message);
                // todo handle toolCalls
              }

              // 处理工具返回消息
              if (message.type === MessageType.ToolReturn) {
                let parsedBody = {};
                const toolResult = message.content?.result;

                if (typeof toolResult === 'string') {
                  const bodyString = toolResult.startsWith('Result=')
                    ? toolResult.slice(7)
                    : toolResult;
                  if (isJsonString(bodyString)) {
                    parsedBody = JSON.parse(bodyString);
                  }
                } else {
                  parsedBody = toolResult;
                }
                // todo handle toolReturn
                console.log('ToolReturn parsedBody:', parsedBody);
              }
            } catch (_e) {
              console.error('Error in handleLiteagentMessage:', error);
              clearMessages();
            }
          },

          onerror(err) {
            console.log('❌ SSE 连接错误', err);
            // 如果是 AbortError，不抛出错误
            if (err instanceof Error && err.name === 'AbortError') {
              console.log('🛑 SSE 请求被中止');
              throw err; // 停止重连
            }

            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);

            console.log('⚠️ 抛出错误以停止 SSE 重连');
            // 抛出错误以停止重连
            throw error;
          },

          onclose() {
            console.log('🔒 SSE 连接已关闭');
            // 连接关闭，设置 loading 为 false 并触发完成回调
            setIsLoading(false);
          },
        });
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err);
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clearMessages]
  );

  // 组件卸载时清理连接
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        console.log('useSSE: 组件卸载，中止连接');
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    abort,
  };
};

export default useSSE;
