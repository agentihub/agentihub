import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import FileTree from './FileTree';
import { FileIcon, FileDirectoryIcon } from '@primer/octicons-react';
import { App, Button, Popconfirm } from 'antd';
import { getFileInfosByIds, deleteAgentFile } from '@/api/services.gen';
import type { AgentDTO, FileInfoDTO } from '@/api/types.gen';
import ResponseCode from '@/constants/ResponseCode';

interface FileItem {
  id?: string;
  name: string;
  type: 'file' | 'directory';
  path: string;
  description?: string;
  size?: number;
}

interface AgentDetailContext {
  agentData: AgentDTO;
  isOwnAgent: boolean;
  isStarred: boolean;
  handleStar: () => void;
  handleFork: () => void;
  reFetchAgentData: () => void;
}

const DirectoryViewer: React.FC = () => {
  const { userName, agentname } = useParams<{
    userName: string;
    agentname: string;
  }>();
  const params = useParams();
  const navigate = useNavigate();
  const { agentData, isOwnAgent, reFetchAgentData } =
    useOutletContext<AgentDetailContext>();
  const { message } = App.useApp();

  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // 使用 * 通配符捕获的路径
  const dirpath = params['*'] || '';
  const currentPath = dirpath;
  const deleteTitlePrefix =
    currentPath === 'tools'
      ? '工具'
      : currentPath === 'knowledge'
        ? '知识库'
        : '文件';

  // 格式化文件大小
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 加载目录文件列表
  useEffect(() => {
    const loadDirectoryFiles = async () => {
      if (!agentData) return;

      setLoading(true);
      try {
        let fileIds: string[] = [];

        // 根据当前路径确定要加载的文件ID列表
        if (currentPath === 'tools') {
          fileIds = agentData.toolFileIdList || [];
        } else if (currentPath === 'knowledge') {
          fileIds = agentData.docsFileIdList || [];
        }

        if (fileIds.length === 0) {
          setFiles([]);
          return;
        }

        // 获取文件信息
        const response = await getFileInfosByIds({
          body: fileIds,
        });

        const fileInfos = response.data?.data || [];

        // 转换为 FileItem 格式
        const fileItems: FileItem[] = fileInfos.map((file: FileInfoDTO) => ({
          id: file.id,
          name: file.fileName || '未知文件',
          type: 'file' as const,
          path: `${currentPath}/${file.fileName}`,
          description: formatFileSize(file.fileSize),
          size: file.fileSize,
        }));

        setFiles(fileItems);
      } catch (error) {
        console.error('加载目录文件失败:', error);
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };

    loadDirectoryFiles();
  }, [agentData, currentPath]);

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'file') {
      navigate(`/${userName}/${agentname}/blob/${file.path}`);
    } else {
      navigate(`/${userName}/${agentname}/tree/${file.path}`);
    }
  };

  const handleDelete = async (file: FileItem) => {
    const fileId = file.id;
    if (!fileId) {
      message.error('文件信息缺失，无法删除');
      return;
    }

    const agentId = agentData?.id;
    if (!agentId) {
      message.error('Agent 信息缺失，无法删除');
      return;
    }

    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.add(fileId);
      return next;
    });

    try {
      const response = await deleteAgentFile({
        query: {
          agentId,
          fileId,
        },
      });

      const result = response.data;
      if (result?.code === ResponseCode.S_OK && result?.data) {
        setFiles((prev) => prev.filter((item) => item.id !== fileId));
        reFetchAgentData?.();
        message.success('删除成功');
      } else {
        message.error(result?.msg || '删除失败');
      }
    } catch (error) {
      console.error('删除文件失败:', error);
      message.error('删除失败，请稍后重试');
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(fileId);
        return next;
      });
    }
  };

  return (
    <div className="flex flex-row gap-4 p-4">
      {/* 左侧文件树 */}
      <aside className="w-[280px] flex-shrink-0">
        <FileTree currentPath={currentPath} readOnly={!isOwnAgent} />
      </aside>

      {/* 右侧目录内容 */}
      <main className="flex-1 min-w-0">
        <div
          className="border rounded overflow-hidden"
          style={{ borderColor: '#D0D7DE', borderRadius: '6px' }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 border-b"
            style={{
              backgroundColor: '#F6F8FA',
              borderBottomColor: '#D0D7DE',
            }}
          >
            <span
              className="text-sm font-semibold"
              style={{ color: '#24292F' }}
            >
              {currentPath || '根目录'}
            </span>
          </div>

          {/* File List */}
          <div className="bg-white">
            {loading ? (
              <div className="p-8 text-center" style={{ color: '#57606A' }}>
                <p>加载中...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="p-8 text-center" style={{ color: '#57606A' }}>
                <p>此目录为空</p>
              </div>
            ) : (
              <div>
                {files.map((file, index) => {
                  const key = file.id || file.path;
                  const isDeleting = file.id ? deletingIds.has(file.id) : false;
                  return (
                    <div
                      key={key}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        index !== files.length - 1 ? 'border-b' : ''
                      }`}
                      style={{
                        borderBottomColor: '#D0D7DE',
                      }}
                      onClick={() => handleFileClick(file)}
                    >
                      <span style={{ color: '#57606A' }}>
                        {file.type === 'directory' ? (
                          <FileDirectoryIcon size={16} fill="#54aeff" />
                        ) : (
                          <FileIcon size={16} />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm font-semibold truncate"
                          style={{ color: '#0969da' }}
                        >
                          {file.name}
                        </div>
                        {file.description && (
                          <div
                            className="text-xs truncate mt-0.5"
                            style={{ color: '#57606A' }}
                          >
                            {file.description}
                          </div>
                        )}
                      </div>
                      {isOwnAgent && (
                        <Popconfirm
                          title={`确认删除${deleteTitlePrefix} ${file.name} 吗？`}
                          okText="删除"
                          cancelText="取消"
                          okButtonProps={{ danger: true, loading: isDeleting }}
                          onConfirm={(e) => {
                            e?.stopPropagation?.();
                            handleDelete(file);
                          }}
                          onCancel={(e) => e?.stopPropagation?.()}
                          overlayInnerStyle={{ marginRight: '60px' }}
                        >
                          <Button
                            type="text"
                            danger
                            size="small"
                            loading={isDeleting}
                            disabled={isDeleting}
                            onClick={(event) => {
                              event.stopPropagation();
                            }}
                            style={{ marginRight: '60px' }}
                          >
                            删除
                          </Button>
                        </Popconfirm>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DirectoryViewer;
