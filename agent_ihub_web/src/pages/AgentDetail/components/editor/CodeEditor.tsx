import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import FileTree from './FileTree';
import FileViewer from './FileViewer';
import type { AgentDTO, FileInfoDTO } from '@/api/types.gen';
import { App } from 'antd';
import { agentService } from '@/services/agentService';
import { getFileInfosByIds, getFileContent } from '@/api/services.gen';

interface OutletContext {
  isOwnAgent: boolean;
  agentData: AgentDTO;
  reFetchAgentData?: () => void;
  isStarred: boolean;
  handleStar: () => void;
  handleFork: () => void;
}

const CodeEditor: React.FC = () => {
  const { message } = App.useApp();
  const { agentData, reFetchAgentData, isOwnAgent } =
    useOutletContext<OutletContext>();
  const params = useParams();

  // 使用 * 通配符捕获的路径
  const filepath = params['*'] || 'hub_agent.md';
  const currentPath = filepath;

  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // 获取文件类型
  const getFileType = (
    filename: string
  ): 'json' | 'yaml' | 'yml' | 'md' | 'txt' | 'unknown' => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'json':
        return 'json';
      case 'yaml':
        return 'yaml';
      case 'yml':
        return 'yml';
      case 'md':
        return 'md';
      case 'txt':
        return 'txt';
      default:
        return 'unknown';
    }
  };

  // 根据文件路径获取文件 ID
  const getFileIdByPath = async (path: string): Promise<string | null> => {
    const pathParts = path.split('/');
    if (pathParts.length < 2) return null;

    const [folder, filename] = pathParts;
    let fileIds: string[] = [];

    if (folder === 'tools') {
      fileIds = agentData.toolFileIdList || [];
    } else if (folder === 'knowledge') {
      fileIds = agentData.docsFileIdList || [];
    } else {
      return null;
    }

    if (fileIds.length === 0) return null;

    try {
      const response = await getFileInfosByIds({
        body: fileIds,
      });

      const files = response.data?.data || [];
      const file = files.find((f: FileInfoDTO) => f.fileName === filename);

      return file?.id || null;
    } catch (error) {
      console.error('获取文件 ID 失败:', error);
      return null;
    }
  };

  // 加载文件内容
  useEffect(() => {
    const loadFileContent = async () => {
      if (currentPath === 'hub_agent.md') {
        setFileContent(
          agentData.mdContent || '# Agent 配置文档\n\n请编辑您的 agent 配置...'
        );
        return;
      }

      setLoading(true);
      try {
        const id = await getFileIdByPath(currentPath);
        if (!id) {
          setFileContent('# 文件未找到\n\n无法加载文件内容');
          return;
        }

        // 获取文件内容
        const response = await getFileContent({
          path: { id },
        });

        // 将 Blob 转换为文本
        if (response.data) {
          if (typeof response?.data === 'object') {
            setFileContent(JSON.stringify(response.data));
          } else {
            setFileContent(response?.data?.toString() || '');
          }
        } else {
          setFileContent('# 加载失败\n\n文件内容为空');
        }
      } catch (error) {
        console.error('加载文件内容失败:', error);
        message.error('加载文件内容失败');
        setFileContent('# 加载失败\n\n无法加载文件内容，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    loadFileContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath, agentData]);

  // 保存文件内容
  const handleSaveFile = async (content: string) => {
    if (!agentData.id) {
      message.error('Agent ID 不可用');
      return;
    }

    try {
      if (currentPath === 'hub_agent.md') {
        // 保存 hub_agent.md
        await agentService.updateAgent({
          id: agentData.id,
          ...agentData,
          mdContent: content,
        });

        // 刷新数据
        if (reFetchAgentData) {
          reFetchAgentData();
        }
      } else {
        // TODO: 保存其他文件（需要后端 API 支持）
        message.info('其他文件保存功能开发中...');
      }
    } catch (error) {
      console.error('保存文件失败:', error);
      throw error;
    }
  };

  // 获取文件名
  const getFilename = () => {
    const parts = currentPath.split('/');
    return parts[parts.length - 1];
  };

  // 渲染文件查看器
  const renderFileViewer = () => {
    if (loading) {
      return (
        <div
          className="border rounded flex items-center justify-center"
          style={{
            borderColor: '#D0D7DE',
            borderRadius: '6px',
            minHeight: '400px',
          }}
        >
          <span style={{ color: '#57606A' }}>加载中...</span>
        </div>
      );
    }

    const filename = getFilename();
    const fileType = getFileType(filename);

    // 统一使用 FileViewer 渲染所有文件
    return (
      <FileViewer
        filename={filename}
        initialContent={fileContent}
        fileType={fileType}
        onSave={handleSaveFile}
        readOnly={!isOwnAgent}
        agent={agentData}
      />
    );
  };

  return (
    <div className="flex flex-row gap-4 px-4 py-4">
      {/* 左侧文件树 */}
      <aside className="w-[280px] flex-shrink-0">
        <FileTree currentPath={currentPath} readOnly={!isOwnAgent} />
      </aside>

      {/* 右侧编辑器 */}
      <main className="flex-1 min-w-0">{renderFileViewer()}</main>
    </div>
  );
};

export default CodeEditor;
