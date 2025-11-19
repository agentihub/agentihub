import React, { useState, useEffect, useMemo } from 'react';
import { Button, App } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { DownloadIcon, FileIcon, PencilIcon } from '@primer/octicons-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import 'github-markdown-css/github-markdown-light.css';
import type { AgentDTO } from '@/api';
import sanitizeContent from '@/utils/sanitizeContent';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

interface FileViewerProps {
  filename: string;
  initialContent?: string;
  fileType: 'json' | 'yaml' | 'yml' | 'md' | 'txt' | 'unknown';
  onSave?: (content: string) => Promise<void>;
  readOnly?: boolean;
  agent: AgentDTO;
}

const FileViewer: React.FC<FileViewerProps> = ({
  filename,
  initialContent = '',
  fileType,
  onSave,
  readOnly = false,
}) => {
  const { message } = App.useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(searchParams.has('edit'));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  // Detect unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return isEditing && content !== initialContent;
  }, [isEditing, content, initialContent]);

  // Use unsaved changes hook
  useUnsavedChanges({
    hasUnsavedChanges,
    message: '您有未保存的更改，确定要离开吗？',
    title: '离开此页面？',
  });

  const handleSave = async () => {
    if (!onSave) return;

    try {
      setIsSaving(true);
      await onSave(content);
      message.success('保存成功');
      setIsEditing(false);
      searchParams.delete('edit');
      setSearchParams(searchParams);
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setContent(initialContent);
    setIsEditing(false);
    searchParams.delete('edit');
    setSearchParams(searchParams);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 渲染 JSON 内容
  const renderJSON = () => {
    try {
      const parsed = JSON.parse(content);
      const formatted = JSON.stringify(parsed, null, 2);
      return (
        <pre
          className="p-6 overflow-auto text-sm"
          style={{
            color: '#24292F',
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          <code>{formatted}</code>
        </pre>
      );
    } catch (_error) {
      return (
        <div className="p-6">
          <div
            className="p-4 border rounded"
            style={{
              borderColor: '#FFA657',
              color: '#24292F',
            }}
          >
            <div className="font-semibold mb-2">JSON 格式错误</div>
            <div className="text-sm">无法解析 JSON 内容</div>
          </div>
          <pre
            className="mt-4 p-4 overflow-auto text-sm rounded"
            style={{
              color: '#24292F',
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            {content}
          </pre>
        </div>
      );
    }
  };

  // 渲染 YAML 内容
  const renderYAML = () => {
    return (
      <pre
        className="p-6 overflow-auto text-sm"
        style={{
          color: '#24292F',
          fontFamily: 'ui-monospace, monospace',
        }}
      >
        <code>{content}</code>
      </pre>
    );
  };

  // 渲染 Markdown 内容
  const renderMarkdown = () => {
    // 自定义图片组件，将相对路径转换为 API 路径
    const components = {
      img: ({
        src,
        alt,
        ...props
      }: React.ImgHTMLAttributes<HTMLImageElement>) => {
        let imageSrc = src || '';

        if (
          imageSrc &&
          !imageSrc.startsWith('http://') &&
          !imageSrc.startsWith('https://') &&
          !imageSrc.startsWith('/')
        ) {
          const filename = imageSrc.split('/').pop();
          if (filename) {
            imageSrc = `/api/v1/file/images/${filename}`;
          }
        }

        return <img src={imageSrc} alt={alt} {...props} />;
      },
    };

    return (
      <div className="p-6 markdown-body bg-white">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
          components={components}
        >
          {sanitizeContent(content)}
        </ReactMarkdown>
      </div>
    );
  };

  // 渲染纯文本内容
  const renderText = () => {
    return (
      <pre
        className="p-6 overflow-auto text-sm"
        style={{
          color: '#24292F',
          fontFamily: 'ui-monospace, monospace',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {content}
      </pre>
    );
  };

  // 渲染编辑模式
  const renderEditor = () => {
    return (
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-4 border-0 outline-none resize-none text-sm"
        style={{
          fontFamily: 'ui-monospace, monospace',
          minHeight: 'calc(100vh - 300px)',
          backgroundColor: '#FFFFFF',
        }}
        placeholder="请输入内容..."
      />
    );
  };

  // 根据文件类型选择渲染方式
  const renderContent = () => {
    if (isEditing) {
      return renderEditor();
    }

    switch (fileType) {
      case 'json':
        return renderJSON();
      case 'yaml':
      case 'yml':
        return renderYAML();
      case 'md':
        return renderMarkdown();
      case 'txt':
      case 'unknown':
      default:
        return renderText();
    }
  };

  return (
    <div
      className="border rounded overflow-hidden"
      style={{ borderColor: '#D0D7DE', borderRadius: '6px' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{
          backgroundColor: '#F6F8FA',
          borderBottomColor: '#D0D7DE',
        }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: '#57606A' }}>
            <FileIcon size={16} />
          </span>
          <span className="text-sm font-semibold" style={{ color: '#24292F' }}>
            {filename}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="cursor-pointer hover:bg-gray-200 rounded-md p-1 ml-1 group relative"
            onClick={handleDownloadFile}
          >
            <DownloadIcon size={16} />
            <span className="absolute z-10 left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap">
              下载
            </span>
          </span>
          {!readOnly && !isEditing && (
            <span
              className="cursor-pointer hover:bg-gray-200 rounded-md p-1 ml-1 group relative"
              onClick={() => {
                setIsEditing(true);
                searchParams.set('edit', 'true');
                setSearchParams(searchParams);
              }}
            >
              <PencilIcon size={16} />
              <span className="absolute z-10 left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap">
                编辑
              </span>
            </span>
          )}
          {isEditing && (
            <>
              <Button size="middle" onClick={handleCancel} disabled={isSaving}>
                取消
              </Button>
              <Button
                type="primary"
                size="middle"
                onClick={handleSave}
                loading={isSaving}
              >
                保存
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white">{renderContent()}</div>
    </div>
  );
};

export default FileViewer;
