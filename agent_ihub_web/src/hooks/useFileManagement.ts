import { useState, useRef, useCallback, useEffect } from 'react';
import { App } from 'antd';
import { fileService } from '@/services';
import ResponseCode from '@/constants/ResponseCode';
import type { FileInfoWithProgress } from '@/types/agent';
import type { AgentDTO } from '@/api/types.gen';

const MAX_FILES = 20;

interface UseFileManagementProps {
  agentForEditor: AgentDTO | null;
  setAgentForEditor: (agent: AgentDTO) => void;
  mode?: 'create' | 'edit'; // 模式：创建 or 编辑
}

export const useFileManagement = ({
  agentForEditor,
  setAgentForEditor,
  mode = 'create',
}: UseFileManagementProps) => {
  const { modal, message } = App.useApp();
  const [toolFiles, setToolFiles] = useState<FileInfoWithProgress[]>([]);
  const [docsFiles, setDocsFiles] = useState<FileInfoWithProgress[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'tool' | 'docs'>('tool');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [initialized, setInitialized] = useState(false);

  // 计算总文件数
  const totalFiles = toolFiles.length + docsFiles.length;

  // 初始化文件列表（编辑模式下从 agentForEditor 加载）
  useEffect(() => {
    const initializeFiles = async () => {
      if (agentForEditor && !initialized) {
        try {
          const toolFileIds = agentForEditor.toolFileIdList || [];
          const docsFileIds = agentForEditor.docsFileIdList || [];

          // 获取工具文档详情
          if (toolFileIds.length > 0) {
            const toolFilesResponse =
              await fileService.getFileInfosByIds(toolFileIds);
            if (toolFilesResponse.success && toolFilesResponse.data) {
              setToolFiles(toolFilesResponse.data);
            }
          }

          // 获取知识库文档详情
          if (docsFileIds.length > 0) {
            const docsFilesResponse =
              await fileService.getFileInfosByIds(docsFileIds);
            if (docsFilesResponse.success && docsFilesResponse.data) {
              setDocsFiles(docsFilesResponse.data);
            }
          }

          setInitialized(true);
        } catch (error) {
          console.error('初始化文件列表失败:', error);
          message.error('加载文件列表失败');
          setInitialized(true);
        }
      } else if (mode === 'create') {
        // 创建模式下不需要初始化
        setInitialized(true);
      }
    };

    initializeFiles();
  }, [mode, agentForEditor, initialized, message]);

  // 文件上传处理
  const handleFileUpload = useCallback(
    async (file: File, type: 'tool' | 'docs') => {
      if (totalFiles >= MAX_FILES) {
        message.warning(`最多只能上传 ${MAX_FILES} 个文件`);
        return;
      }

      // 检查文件是否已存在（排除错误状态的文件）
      const fileName = file.name;
      if (type === 'tool') {
        const existingFile = toolFiles.find(
          (f) =>
            f.uploadStatus !== 'error' &&
            f.fileName?.toLowerCase() === fileName.toLowerCase()
        );
        if (existingFile) {
          message.warning(`工具文档《${fileName}》已存在，请勿重复上传`);
          return;
        }
      } else {
        const existingFile = docsFiles.find(
          (f) =>
            f.uploadStatus !== 'error' &&
            f.fileName?.toLowerCase() === fileName.toLowerCase()
        );
        if (existingFile) {
          message.warning(`知识库文档《${fileName}》已存在，请勿重复上传`);
          return;
        }
      }

      setUploading(true);
      try {
        if (type === 'tool') {
          // 工具文档上传 - 直接上传即可
          const response = await fileService.uploadToolFile(file);

          if (response.success && response.data) {
            const fileInfo = response.data;
            setToolFiles((prev) => [...prev, fileInfo]);
            setAgentForEditor({
              ...agentForEditor!,
              toolFileIdList: [
                ...(toolFiles.map((f) => f.id!).filter(Boolean) as string[]),
                fileInfo.id!,
              ],
            });
            message.success(`工具文档《${fileInfo.fileName}》上传成功`);
          } else {
            message.error(response.message || '工具文档上传失败');
          }
        } else {
          // 知识库文档上传 - 两步走：上传 + 轮询进度
          const uploadResponse = await fileService.uploadKnowledgeFile(file);

          if (uploadResponse.code === ResponseCode.S_OK) {
            const fileId = uploadResponse.data! as string;
            const fileName = file.name;

            // 创建临时文件信息对象，显示上传中状态
            const tempFileInfo: FileInfoWithProgress = {
              id: fileId,
              fileName: fileName,
              uploadProgress: 0,
              uploadStatus: 'uploading',
              uploadDetail: '正在处理...',
            };

            setDocsFiles((prev) => [...prev, tempFileInfo]);

            // 轮询获取上传进度
            const progressResponse =
              await fileService.pollKnowledgeFileProgress(
                fileId,
                (progress, stage, detail) => {
                  console.log(
                    `知识库文档上传进度: ${progress}%, stage: ${stage}, detail: ${detail}`
                  );
                  setDocsFiles((prev) =>
                    prev.map((f) =>
                      f.id === fileId
                        ? {
                            ...f,
                            uploadProgress: progress,
                            uploadStatus: 'uploading' as const,
                            uploadDetail: detail || stage || '处理中...',
                          }
                        : f
                    )
                  );
                }
              );

            // 处理失败：从列表中移除文件
            if (!progressResponse.success || !progressResponse.data) {
              // 从 docsFiles 中移除失败的文件
              setDocsFiles((prev) => prev.filter((f) => f.id !== fileId));
              message.error(
                progressResponse.message || '知识库文档处理失败，文件已移除'
              );
              return;
            }

            // 处理成功：更新文件信息
            const finalFileInfo: FileInfoWithProgress = {
              ...progressResponse.data,
              uploadProgress: 100,
              uploadStatus: 'success',
            };

            setDocsFiles((prev) => {
              const updated = prev.map((f) =>
                f.id === fileId ? finalFileInfo : f
              );
              // 更新 agentForEditor 中的文件ID列表
              setAgentForEditor({
                ...agentForEditor!,
                docsFileIdList: updated
                  .map((f) => f.id!)
                  .filter(Boolean) as string[],
              });
              return updated;
            });

            message.success(`知识库文档《${fileName}》上传成功`);
          } else {
            message.error(uploadResponse.message || '知识库文档上传失败');
          }
        }
      } catch (error) {
        console.error('文件上传失败:', error);
        message.error('文件上传异常');
      } finally {
        setUploading(false);
      }
    },
    [
      totalFiles,
      toolFiles,
      docsFiles,
      agentForEditor,
      setAgentForEditor,
      message,
    ]
  );

  // 删除文件
  const handleRemoveFile = useCallback(
    (fileId: string, type: 'tool' | 'docs') => {
      modal.confirm({
        centered: true,
        title: '确定删除文件吗？',
        content: '删除文件后将无法带入 Agent 中使用',
        onOk: () => {
          if (type === 'tool') {
            const newToolFiles = toolFiles.filter((f) => f.id !== fileId);
            setToolFiles(newToolFiles);
            setAgentForEditor({
              ...agentForEditor!,
              toolFileIdList: newToolFiles
                .map((f) => f.id!)
                .filter(Boolean) as string[],
            });
          } else {
            const newDocsFiles = docsFiles.filter((f) => f.id !== fileId);
            setDocsFiles(newDocsFiles);
            setAgentForEditor({
              ...agentForEditor!,
              docsFileIdList: newDocsFiles
                .map((f) => f.id!)
                .filter(Boolean) as string[],
            });
          }
        },
      });
    },
    [toolFiles, docsFiles, agentForEditor, setAgentForEditor, modal]
  );

  // 点击上传按钮
  const handleUploadClick = useCallback(
    (type: 'tool' | 'docs') => {
      if (totalFiles >= MAX_FILES) {
        message.warning(`最多只能上传 ${MAX_FILES} 个文件`);
        return;
      }
      setUploadType(type);
      if (fileInputRef.current) {
        fileInputRef.current.accept =
          type === 'tool'
            ? '.json,.yml,.yaml'
            : '.pdf,.doc,.docx,.ppt,.pptx,.txt,.md';
        fileInputRef.current.value = '';
        fileInputRef.current?.click();
      }
    },
    [totalFiles, message]
  );

  // 文件选择处理
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await handleFileUpload(file, uploadType);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [uploadType, handleFileUpload]
  );

  return {
    toolFiles,
    docsFiles,
    uploading,
    uploadType,
    fileInputRef,
    handleFileUpload,
    handleRemoveFile,
    handleUploadClick,
    handleFileChange,
  };
};
