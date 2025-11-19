import React, { useState, useEffect } from 'react';
import {
  useNavigate,
  useParams,
  useOutletContext,
  useLocation,
} from 'react-router-dom';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileIcon,
  FileDirectoryIcon,
  PlusIcon,
} from '@primer/octicons-react';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { getFileInfosByIds } from '@/api/services.gen';
import type { AgentDTO, FileInfoDTO } from '@/api/types.gen';
import FileUpload from '../code/FileUpload';

interface FileNode {
  id?: string;
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileNode[];
}

interface FileTreeProps {
  currentPath?: string;
  readOnly?: boolean;
}

interface AgentDetailContext {
  agentData: AgentDTO;
  isStarred: boolean;
  handleStar: () => void;
  handleFork: () => void;
  reFetchAgentData: () => void;
}

const FileTree: React.FC<FileTreeProps> = ({
  currentPath,
  readOnly = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userName, agentname } = useParams<{
    userName: string;
    agentname: string;
  }>();
  const { agentData, reFetchAgentData } =
    useOutletContext<AgentDetailContext>();

  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFileId, setSelectedFileId] = useState<string | undefined>(
    undefined
  );
  const [knowledgeFileNames, setKnowledgeFileNames] = useState<string[]>([]);

  // 文件上传相关状态
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'tool' | 'docs'>('tool');

  // 从 localStorage 读取展开状态，默认展开 tools 和 knowledge 文件夹
  const getInitialExpanded = () => {
    const storageKey = `fileTree-expanded-${userName}-${agentname}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return new Set<string>(JSON.parse(saved));
      } catch {
        return new Set(['tools', 'knowledge']);
      }
    }
    return new Set(['tools', 'knowledge']);
  };

  const [expanded, setExpanded] = useState<Set<string>>(getInitialExpanded);

  // 保存展开状态到 localStorage
  useEffect(() => {
    const storageKey = `fileTree-expanded-${userName}-${agentname}`;
    localStorage.setItem(storageKey, JSON.stringify(Array.from(expanded)));
  }, [expanded, userName, agentname]);

  // 加载文件树数据
  useEffect(() => {
    const loadFileTree = async () => {
      if (!agentData) return;

      setLoading(true);
      try {
        const tree: FileNode[] = [];

        // 加载 tools 目录（始终显示，即使为空）
        const toolFileIds = agentData.toolFileIdList || [];
        let toolChildren: FileNode[] = [];

        if (toolFileIds.length > 0) {
          try {
            const toolFilesResponse = await getFileInfosByIds({
              body: toolFileIds,
            });
            const toolFiles = toolFilesResponse.data?.data || [];
            toolChildren = toolFiles.map((file: FileInfoDTO) => ({
              id: file.id,
              name: file.fileName || '未知文件',
              type: 'file' as const,
              path: `tools/${file.fileName}`,
            }));
          } catch (error) {
            console.error('加载 tools 文件失败:', error);
          }
        }

        tree.push({
          name: 'tools',
          type: 'directory',
          path: 'tools',
          children: toolChildren,
        });

        // 加载 knowledge 目录（始终显示，即使为空）
        const docsFileIds = agentData.docsFileIdList || [];
        let knowledgeChildren: FileNode[] = [];
        let knowledgeNames: string[] = [];

        if (docsFileIds.length > 0) {
          try {
            const docsFilesResponse = await getFileInfosByIds({
              body: docsFileIds,
            });
            const docsFiles = docsFilesResponse.data?.data || [];
            knowledgeChildren = docsFiles.map((file: FileInfoDTO) => ({
              id: file.id,
              name: file.fileName || '未知文件',
              type: 'file' as const,
              path: `knowledge/${file.fileName}`,
            }));
            knowledgeNames = docsFiles
              .map((file: FileInfoDTO) => file.fileName)
              .filter((name): name is string => Boolean(name));
          } catch (error) {
            console.error('加载 knowledge 文件失败:', error);
          }
        }

        if (knowledgeChildren.length === 0) {
          setKnowledgeFileNames([]);
        } else {
          setKnowledgeFileNames(knowledgeNames);
        }

        tree.push({
          name: 'knowledge',
          type: 'directory',
          path: 'knowledge',
          children: knowledgeChildren,
        });

        // 添加 hub_agent.md 文件
        tree.push({
          name: 'hub_agent.md',
          type: 'file',
          path: 'hub_agent.md',
        });

        setFileTree(tree);
      } catch (error) {
        console.error('加载文件树失败:', error);
        // 出错时显示基本结构
        setFileTree([
          {
            name: 'hub_agent.md',
            type: 'file',
            path: 'hub_agent.md',
          },
          {
            name: 'tools',
            type: 'directory',
            path: 'tools',
            children: [],
          },
          {
            name: 'knowledge',
            type: 'directory',
            path: 'knowledge',
            children: [],
          },
        ]);
        setKnowledgeFileNames([]);
      } finally {
        setLoading(false);
      }
    };

    loadFileTree();
  }, [agentData]);

  // 文件上传菜单项
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

  const handleUploadSuccess = () => {
    // 刷新 agent 数据，useEffect 会自动重新加载文件树
    if (reFetchAgentData) {
      reFetchAgentData();
    }
  };

  const toggleExpand = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expanded);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpanded(newExpanded);
  };

  const handleFileClick = (node: FileNode) => {
    if (node.type === 'file') {
      // 记录选中的文件 id，避免同名文件同时高亮
      setSelectedFileId(node.id);
      navigate(`/${userName}/${agentname}/blob/${node.path}` as const, {
        state: { fileId: node.id },
      });
    } else {
      // 点击文件夹时展开并导航
      const newExpanded = new Set(expanded);
      if (!newExpanded.has(node.path)) {
        newExpanded.add(node.path);
        setExpanded(newExpanded);
      }
      // 清除文件选中，防止目录与文件同时高亮
      setSelectedFileId(undefined);
      navigate(`/${userName}/${agentname}/tree/${node.path}` as const, {
        state: {},
      });
    }
  };

  const renderNode = (node: FileNode, level: number = 0) => {
    const isExpanded = expanded.has(node.path);
    // 文件：优先按路由 state 携带的 fileId 判断高亮；
    // 若无 state，则回退到本地选中的文件 id；再回退到路径比较
    const routeState = (location.state as { fileId?: string } | null) || null;
    // 目录：仅在没有选中文件时按路径高亮，避免一级与二级同时高亮
    const isActive =
      node.type === 'file'
        ? routeState?.fileId
          ? node.id === routeState.fileId
          : selectedFileId
            ? node.id === selectedFileId
            : currentPath === node.path
        : !selectedFileId && currentPath === node.path;
    const renderKey = node.id || node.path;
    return (
      <div key={renderKey}>
        <div
          className={`flex items-center gap-1 pr-2 py-1.5 cursor-pointer hover:bg-gray-100 transition-colors ${
            isActive
              ? 'bg-blue-50 border-l-2 border-blue-600 font-semibold'
              : ''
          }`}
          style={{
            paddingLeft: `${10 + level * 12}px`,
            color: isActive ? '#0969da' : '#24292F',
          }}
          onClick={() => handleFileClick(node)}
        >
          {node.type === 'directory' && (
            <span
              className="flex items-center"
              onClick={(e) => toggleExpand(node.path, e)}
            >
              {isExpanded ? (
                <ChevronDownIcon size={12} />
              ) : (
                <ChevronRightIcon size={12} />
              )}
            </span>
          )}
          <span className="flex items-center" style={{ color: '#57606A' }}>
            {node.type === 'directory' ? (
              <FileDirectoryIcon size={16} fill="#54aeff" />
            ) : (
              <FileIcon size={16} />
            )}
          </span>
          <span className="text-sm truncate flex-1">{node.name}</span>
        </div>

        {node.type === 'directory' && isExpanded && (
          <div>
            {node.children && node.children.length > 0 ? (
              node.children.map((child) => renderNode(child, level + 1))
            ) : (
              <div
                className="flex items-center pr-2 py-1.5 text-gray-400 text-xs italic"
                style={{
                  paddingLeft: `${10 + (level + 1) * 12}px`,
                }}
              >
                暂无文件
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 font-semibold text-gray-900 flex items-center justify-between">
        <span>Files</span>
        {!readOnly && (
          <Dropdown menu={{ items: addFileMenuItems }} trigger={['click']}>
            <button
              className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 transition-colors"
              title="新增文件"
            >
              <PlusIcon size={16} />
            </button>
          </Dropdown>
        )}
      </div>

      {/* File Tree */}
      <div className="bg-white">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <span className="text-gray-500">加载中...</span>
          </div>
        ) : (
          fileTree.map((node) => renderNode(node))
        )}
      </div>

      {/* 文件上传模态框 */}
      <FileUpload
        open={uploadModalOpen}
        onClose={handleUploadClose}
        uploadType={uploadType}
        agentData={agentData}
        onUploadSuccess={handleUploadSuccess}
        existingKnowledgeNames={knowledgeFileNames}
      />
    </div>
  );
};

export default FileTree;
