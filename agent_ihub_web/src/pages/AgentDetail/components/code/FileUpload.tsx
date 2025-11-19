import React, { useState, useEffect } from 'react';
import { Modal, Upload, App, Progress } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { fileService } from '@/services';
import { updateAgent } from '@/api';
import type { AgentDTO, FileInfoDTO } from '@/api/types.gen';
import ResponseCode from '@/constants/ResponseCode';

const { Dragger } = Upload;

interface FileUploadProps {
  open: boolean;
  onClose: () => void;
  uploadType: 'tool' | 'docs';
  agentData: AgentDTO | null;
  onUploadSuccess?: () => void;
  existingKnowledgeNames?: string[];
}

const FileUpload: React.FC<FileUploadProps> = ({
  open,
  onClose,
  uploadType,
  agentData,
  onUploadSuccess,
  existingKnowledgeNames = [],
}) => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { userName, agentname } = useParams<{
    userName: string;
    agentname: string;
  }>();

  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'processing' | 'success' | 'error'
  >('idle');
  const [existingFiles, setExistingFiles] = useState<FileInfoDTO[]>([]);

  // 文件类型验证
  const getAcceptTypes = () => {
    return uploadType === 'tool'
      ? '.json,.yml,.yaml'
      : '.pdf,.doc,.docx,.ppt,.pptx,.txt,.md';
  };

  const getMaxFileSize = () => {
    return uploadType === 'tool' ? 10 : 50; // MB
  };

  // 加载已上传的文件列表
  useEffect(() => {
    const loadExistingFiles = async () => {
      if (!agentData || !open) return;

      const fileIds =
        uploadType === 'tool'
          ? agentData.toolFileIdList || []
          : agentData.docsFileIdList || [];

      if (fileIds.length === 0) {
        setExistingFiles([]);
        return;
      }

      try {
        const response = await fileService.getFileInfosByIds(fileIds);
        if (response.success && response.data) {
          setExistingFiles(response.data);
        }
      } catch (error) {
        console.error('加载已上传文件列表失败:', error);
        setExistingFiles([]);
      }
    };

    loadExistingFiles();
  }, [agentData, uploadType, open]);

  const existingFileNameSet = React.useMemo(() => {
    const set = new Set<string>();
    existingFiles.forEach((file) => {
      const name = file.fileName?.trim().toLowerCase();
      if (name) {
        set.add(name);
      }
    });

    if (uploadType === 'docs') {
      existingKnowledgeNames.forEach((name) => {
        const normalized = name?.trim().toLowerCase();
        if (normalized) {
          set.add(normalized);
        }
      });
    }

    return set;
  }, [existingFiles, existingKnowledgeNames, uploadType]);

  const existingKnowledgeBaseNameSet = React.useMemo(() => {
    if (uploadType !== 'docs') {
      return new Set<string>();
    }

    const baseSet = new Set<string>();
    existingFileNameSet.forEach((name) => {
      const base = name.replace(/\.[^/.]+$/, '');
      if (base) {
        baseSet.add(base);
      }
    });
    return baseSet;
  }, [existingFileNameSet, uploadType]);

  // 检查文件是否已存在（包含知识库 Markdown 转换后的名称）
  const checkFileExists = (fileName: string): boolean => {
    const normalized = fileName.trim().toLowerCase();
    if (!normalized) {
      return false;
    }

    if (existingFileNameSet.has(normalized)) {
      return true;
    }

    if (uploadType === 'docs') {
      const base = normalized.replace(/\.[^/.]+$/, '');
      if (base && existingKnowledgeBaseNameSet.has(base)) {
        return true;
      }
    }

    return false;
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: getAcceptTypes(),
    beforeUpload: (file) => {
      // 检查文件是否已存在
      if (checkFileExists(file.name)) {
        const duplicateMessage =
          uploadType === 'tool'
            ? `文件《${file.name}》已存在，请勿重复上传工具文档`
            : `文件《${file.name}》已存在，请勿重复上传知识库文档`;
        message.warning(duplicateMessage);
        return Upload.LIST_IGNORE;
      }

      // 验证文件类型
      const validation = fileService.validateFileType(
        file,
        uploadType === 'tool' ? 'TOOLS' : 'KNOWLEDGE'
      );

      if (!validation.valid) {
        message.error(validation.message || '文件类型不支持');
        return Upload.LIST_IGNORE;
      }

      // 验证文件大小
      const maxSize = getMaxFileSize();
      const isValidSize = file.size / 1024 / 1024 < maxSize;
      if (!isValidSize) {
        message.error(`文件大小不能超过 ${maxSize}MB`);
        return Upload.LIST_IGNORE;
      }

      setSelectedFile(file);
      return false; // 阻止自动上传
    },
    onRemove: () => {
      setSelectedFile(null);
      setUploadProgress(0);
      setUploadStatus('idle');
    },
    fileList: selectedFile
      ? [
          {
            uid: '-1',
            name: selectedFile.name,
            status: 'done',
            url: '',
          },
        ]
      : [],
  };

  const handleUpload = async () => {
    if (!selectedFile || !agentData) {
      message.warning('请先选择要上传的文件');
      return;
    }

    setUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      let uploadedFileInfo: FileInfoDTO | undefined;

      if (uploadType === 'tool') {
        // 工具文档上传 - 直接上传
        setUploadProgress(50);
        const response = await fileService.uploadToolFile(selectedFile);

        if (response.success && response.data) {
          uploadedFileInfo = response.data;
          setUploadProgress(100);
        } else {
          throw new Error(response.message || '文件上传失败');
        }
      } else {
        // 知识库文档上传 - 两步走：上传 + 轮询进度
        const uploadResponse =
          await fileService.uploadKnowledgeFile(selectedFile);

        if (uploadResponse.code === ResponseCode.S_OK) {
          const fileId = uploadResponse.data! as string;
          setUploadStatus('processing');

          // 轮询获取上传进度
          const progressResponse = await fileService.pollKnowledgeFileProgress(
            fileId,
            (progress, stage, detail) => {
              setUploadProgress(progress);
              console.log(
                `知识库文档上传进度: ${progress}%, stage: ${stage}, detail: ${detail}`
              );
            }
          );
          console.log('progressResponse', progressResponse);

          if (progressResponse.code === ResponseCode.S_OK) {
            uploadedFileInfo = progressResponse.data;
          } else {
            throw new Error(progressResponse.message || '知识库文档处理失败');
          }
        } else {
          throw new Error(uploadResponse.message || '知识库文档上传失败');
        }
      }

      if (!uploadedFileInfo || !uploadedFileInfo.id) {
        throw new Error('文件上传成功但未获取到文件ID');
      }

      // 更新Agent，添加新的文件ID
      const updatedAgent = {
        ...agentData,
        toolFileIdList:
          uploadType === 'tool'
            ? [...(agentData.toolFileIdList || []), uploadedFileInfo.id]
            : agentData.toolFileIdList,
        docsFileIdList:
          uploadType === 'docs'
            ? [...(agentData.docsFileIdList || []), uploadedFileInfo.id]
            : agentData.docsFileIdList,
      };

      const updateResponse = await updateAgent({
        body: updatedAgent,
      });

      if (updateResponse.data?.code === ResponseCode.S_OK) {
        setUploadStatus('success');
        message.success(
          `${uploadType === 'tool' ? '工具文档' : '知识库文档'}《${uploadedFileInfo.fileName}》上传成功`
        );

        // 更新已上传文件列表，避免重复上传
        setExistingFiles((prev) => [...prev, uploadedFileInfo]);

        // 提醒用户需要手动配置
        setTimeout(() => {
          message.info({
            content: `请记得在 hub_agent.md 中配置${uploadType === 'tool' ? '工具' : '知识库'}引用，以便 Agent 正确使用该文件`,
            duration: 5,
          });
        }, 1000);

        // 调用成功回调，刷新agent数据
        if (onUploadSuccess) {
          onUploadSuccess();
        }

        // 跳转到对应的目录页面
        const targetPath = uploadType === 'tool' ? 'tools' : 'knowledge';
        navigate(`/${userName}/${agentname}/tree/${targetPath}`);

        // 延迟关闭模态框，让用户看到成功提示
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        throw new Error(updateResponse.data?.msg || 'Agent更新失败');
      }
    } catch (error) {
      console.error('文件上传失败:', error);
      setUploadStatus('error');
      message.error(error instanceof Error ? error.message : '文件上传异常');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    onClose();
  };

  const getModalTitle = () => {
    return uploadType === 'tool' ? '上传工具文档' : '上传知识库文档';
  };

  const getFileTypeDescription = () => {
    return uploadType === 'tool'
      ? '支持 JSON、YML、YAML 格式（最大 10MB）'
      : '支持 PDF、DOC、DOCX、PPT、PPTX、TXT、MD 格式（最大 50MB）';
  };

  return (
    <Modal
      centered={true}
      title={getModalTitle()}
      open={open}
      onCancel={handleClose}
      onOk={handleUpload}
      okText="上传"
      cancelText="取消"
      confirmLoading={uploading}
      width={600}
      destroyOnClose
    >
      <div className="py-4">
        <p className="text-sm text-gray-600 mb-2">{getFileTypeDescription()}</p>

        {/* 配置提示 */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-800">
            <span className="font-medium">📝 温馨提示：</span>
            上传{uploadType === 'tool' ? '工具文档' : '知识库文档'}
            后，需要在{' '}
            <span className="font-mono bg-blue-100 px-1 rounded">
              hub_agent.md
            </span>{' '}
            中手动配置
            {uploadType === 'tool' ? '工具' : '知识库'}
            引用，Agent 才能正确使用该文件。
          </p>
        </div>

        <Dragger
          {...uploadProps}
          className="!border-gray-300 hover:!border-green-600"
          disabled={uploading}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined className="text-green-600 text-5xl" />
          </p>
          <p className="ant-upload-text text-base font-medium">
            点击或拖拽文件到此区域上传
          </p>
          <p className="ant-upload-hint text-gray-600">
            {getFileTypeDescription()}
          </p>
        </Dragger>

        {selectedFile && uploadStatus !== 'idle' && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {fileService.formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>

            {(uploadStatus === 'uploading' ||
              uploadStatus === 'processing' ||
              uploadStatus === 'success') && (
              <div className="mt-3">
                <Progress
                  percent={uploadProgress}
                  status={
                    uploadStatus === 'success'
                      ? 'success'
                      : uploadStatus === 'processing'
                        ? 'active'
                        : 'normal'
                  }
                  strokeColor={
                    uploadStatus === 'processing' ? '#faad14' : '#52c41a'
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  {uploadStatus === 'uploading' && '正在上传...'}
                  {uploadStatus === 'processing' && '正在处理文件...'}
                  {uploadStatus === 'success' && '上传成功！'}
                </p>
              </div>
            )}

            {uploadStatus === 'error' && (
              <div className="mt-3">
                <p className="text-sm text-red-600">上传失败，请重试</p>
              </div>
            )}

            {uploadStatus === 'success' && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs text-yellow-800">
                  <span className="font-medium">⚠️ 下一步操作：</span>
                  请前往{' '}
                  <span className="font-mono bg-yellow-100 px-1 rounded">
                    hub_agent.md
                  </span>{' '}
                  配置文件， 添加对此{uploadType === 'tool' ? '工具' : '知识库'}
                  的引用配置，以便 Agent 能够正确调用。
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default FileUpload;
