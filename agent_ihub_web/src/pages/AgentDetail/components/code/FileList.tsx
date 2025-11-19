import React from 'react';
import { FileIcon, ToolsIcon, DatabaseIcon } from '@primer/octicons-react';
import { useNavigate, useParams } from 'react-router-dom';

interface FileItem {
  name: string;
  fileCount: number;
  type: 'file' | 'directory';
  description?: string;
  updatedAt?: string;
}

interface FileListProps {
  files: FileItem[];
}

const FileList: React.FC<FileListProps> = ({ files }) => {
  const { userName, agentname } = useParams<{
    userName: string;
    agentname: string;
  }>();
  const navigate = useNavigate();
  const handleFileClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    file: FileItem
  ) => {
    e.preventDefault();

    if (file.name === 'hub_agent.md') {
      navigate(`/${userName}/${agentname}/blob/hub_agent.md`);
    } else {
      navigate(`/${userName}/${agentname}/tree/${file.name}`);
    }
  };
  return (
    <div
      className="border rounded overflow-hidden"
      style={{ borderColor: '#D0D7DE', borderRadius: '6px' }}
    >
      {files.map((file, index) => (
        <div
          key={index}
          className={`flex items-center px-4 py-3 ${
            index > 0 ? 'border-t' : ''
          } hover:bg-gray-50 transition-colors`}
          style={index > 0 ? { borderTopColor: '#D0D7DE' } : {}}
        >
          {/* 文件图标 */}
          <div
            className="w-4 flex-shrink-0 mr-3"
            style={{ color: file.type === 'directory' ? '#0969DA' : '#57606A' }}
          >
            {file.name === 'tools' ? (
              <ToolsIcon size={16} />
            ) : file.name === 'knowledge' ? (
              <DatabaseIcon size={16} />
            ) : (
              <FileIcon size={16} />
            )}
          </div>

          {/* 文件名 */}
          <div className="flex-1 min-w-0">
            <a
              onClick={(e) => handleFileClick(e, file)}
              className="text-sm font-semibold hover:underline no-underline"
              style={{ color: '#0969DA' }}
            >
              {file.name}
            </a>
          </div>

          {file.name !== 'hub_agent.md' && (
            <div className="flex-shrink-0 hidden sm:block mr-8">
              <span className="text-xs text-gray-500 block text-center">
                {file.fileCount} Files
              </span>
            </div>
          )}

          {/* 更新时间 */}
          {file.updatedAt && (
            <div className="flex-shrink-0 hidden sm:block">
              <span className="text-xs" style={{ color: '#57606A' }}>
                {file.updatedAt}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FileList;
