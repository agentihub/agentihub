import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import type { MarkdownEditorProps } from '@/types/agent';
import {
  getCommands,
  getExtraCommands,
} from '@uiw/react-md-editor/commands-cn';

/**
 * Markdown 编辑器组件
 * 使用官方中文命令包 (commands-cn)
 */
const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  agentName = 'ihub_agent.md',
  mdContent,
  onChange,
}) => {
  return (
    <div className="flex-1 flex flex-col border border-gray-200 rounded-lg bg-white overflow-hidden">
      <div className="px-4 py-2 font-semibold border-b border-gray-200 bg-gray-50">
        {agentName}
      </div>
      <div className="flex-1 overflow-auto">
        <MDEditor
          value={mdContent}
          onChange={(value) => onChange(value || '')}
          height="100%"
          preview="edit"
          className="!rounded-none"
          commands={getCommands()}
          extraCommands={getExtraCommands()}
        />
      </div>
    </div>
  );
};

export default MarkdownEditor;
