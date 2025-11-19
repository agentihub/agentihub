import React from 'react';
import { FileIcon, PencilIcon } from '@primer/octicons-react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github.css';
import 'github-markdown-css/github-markdown-light.css';
import sanitizeContent from '@/utils/sanitizeContent';

interface ReadmeViewerProps {
  content: string;
  filename?: string;
  readOnly?: boolean;
}

const ReadmeViewer: React.FC<ReadmeViewerProps> = ({
  content,
  readOnly = false,
  filename = 'ihub_agent.md',
}) => {
  const navigate = useNavigate();
  const { userName, agentname } = useParams<{
    userName: string;
    agentname: string;
  }>();

  const handleEdit = () => {
    navigate(`/${userName}/${agentname}/blob/hub_agent.md?edit=true`);
  };

  return (
    <div
      className="border rounded overflow-hidden mt-4"
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
        {!readOnly && (
          <span className="flex items-center gap-2">
            <span
              className="cursor-pointer hover:bg-gray-200 rounded-md p-1"
              onClick={handleEdit}
            >
              <PencilIcon size={16} />
            </span>
          </span>
        )}
      </div>

      {/* Markdown Content */}
      <div className="p-6 markdown-body bg-white">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
        >
          {sanitizeContent(content)}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default ReadmeViewer;
