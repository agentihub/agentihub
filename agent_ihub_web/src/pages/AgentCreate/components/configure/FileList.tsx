import React, { useState } from 'react';
import {
  FileOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons';
import type { FileListProps } from '@/types/agent';

/**
 * 圆形进度条组件
 */
const CircularProgress: React.FC<{ progress: number }> = ({ progress }) => {
  const size = 20;
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* 背景圆 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* 进度圆 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#eab308"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      {/* 进度数字 */}
      <span className="absolute text-[8px] font-medium text-yellow-700">
        {progress}
      </span>
    </div>
  );
};

/**
 * 文件列表组件 - 展示工具文档和知识库文档
 */
const FileList: React.FC<FileListProps> = ({
  toolFiles,
  docsFiles,
  maxFiles,
  onRemoveFile,
}) => {
  const [toolExpanded, setToolExpanded] = useState(false);
  const [docsExpanded, setDocsExpanded] = useState(false);
  const SHOW_TOGGLE_THRESHOLD = 3;

  // 过滤掉错误状态的文件，然后反转数组，让新上传的文档显示在前面
  const reversedToolFiles = [...toolFiles]
    .filter((f) => f.uploadStatus !== 'error')
    .reverse();
  const reversedDocsFiles = [...docsFiles]
    .filter((f) => f.uploadStatus !== 'error')
    .reverse();

  // 计算过滤后的总文件数
  const totalFiles = reversedToolFiles.length + reversedDocsFiles.length;

  if (totalFiles === 0) {
    return null;
  }

  return (
    <div className="px-4 py-2 border-t border-gray-200">
      {/* 工具文档 */}
      {reversedToolFiles.length > 0 && (
        <div className="mb-2 last:mb-0">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-gray-500">工具文档</div>
            {reversedToolFiles.length > SHOW_TOGGLE_THRESHOLD && (
              <button
                onClick={() => setToolExpanded(!toolExpanded)}
                className="transition-colors border-none bg-transparent text-gray-500 hover:text-gray-600 hover:bg-gray-100"
                title={toolExpanded ? '收起' : '展开'}
              >
                {toolExpanded ? (
                  <UpOutlined className="text-[10px]" />
                ) : (
                  <DownOutlined className="text-[10px]" />
                )}
              </button>
            )}
          </div>
          <div
            className="overflow-hidden transition-all duration-300"
            style={{
              maxHeight:
                reversedToolFiles.length <= SHOW_TOGGLE_THRESHOLD
                  ? 'none'
                  : toolExpanded
                    ? '300px'
                    : '46px',
            }}
          >
            <div className="flex flex-wrap gap-2">
              {reversedToolFiles.map((file) => (
                <div
                  key={file.id}
                  className="group relative flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                >
                  <FileOutlined className="text-blue-600" />
                  <span className="text-blue-800 max-w-[150px] truncate">
                    {file.fileName}
                  </span>
                  <button
                    onClick={() => onRemoveFile(file.id!, 'tool')}
                    className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="移除文件"
                  >
                    <CloseOutlined className="text-xs text-blue-600 hover:text-blue-800" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 知识库文档 */}
      {reversedDocsFiles.length > 0 && (
        <div className="mb-2 last:mb-0">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-gray-500">知识库文档</div>
            {reversedDocsFiles.length > SHOW_TOGGLE_THRESHOLD && (
              <button
                onClick={() => setDocsExpanded(!docsExpanded)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title={docsExpanded ? '收起' : '展开'}
              >
                {docsExpanded ? (
                  <UpOutlined className="text-[10px]" />
                ) : (
                  <DownOutlined className="text-[10px]" />
                )}
              </button>
            )}
          </div>
          <div
            className="overflow-hidden transition-all duration-300"
            style={{
              maxHeight:
                reversedDocsFiles.length <= SHOW_TOGGLE_THRESHOLD
                  ? 'none'
                  : docsExpanded
                    ? '300px'
                    : '46px',
            }}
          >
            <div className="flex flex-wrap gap-2">
              {reversedDocsFiles.map((file) => {
                const isUploading = file.uploadStatus === 'uploading';
                const isError = file.uploadStatus === 'error';
                const progress = file.uploadProgress || 0;
                const isComplete = progress >= 100;

                return (
                  <div
                    key={file.id}
                    className={`group relative flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm transition-colors ${
                      isError
                        ? 'bg-red-50 border-red-200 hover:bg-red-100'
                        : isUploading && !isComplete
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-green-50 border-green-200 hover:bg-green-100'
                    }`}
                  >
                    {/* 状态图标或进度圆圈 */}
                    {isError ? (
                      <ExclamationCircleOutlined className="text-red-600" />
                    ) : isUploading && !isComplete ? (
                      <CircularProgress progress={progress} />
                    ) : (
                      <CheckCircleOutlined className="text-green-600" />
                    )}

                    {/* 文件名 */}
                    <span
                      className={`max-w-[150px] truncate ${
                        isError
                          ? 'text-red-800'
                          : isUploading && !isComplete
                            ? 'text-yellow-800'
                            : 'text-green-800'
                      }`}
                      title={file.fileName}
                    >
                      {file.fileName}
                    </span>

                    {/* 删除按钮 */}
                    <button
                      onClick={() => onRemoveFile(file.id!, 'docs')}
                      className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="移除文件"
                      disabled={isUploading && !isComplete}
                    >
                      <CloseOutlined
                        className={`text-xs ${
                          isError
                            ? 'text-red-600 hover:text-red-800'
                            : isUploading && !isComplete
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-green-600 hover:text-green-800'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 底部统计信息 */}
      <div className="text-xs text-gray-400 mt-1">
        已上传 {totalFiles}/{maxFiles} 个文件
      </div>
    </div>
  );
};

export default FileList;
