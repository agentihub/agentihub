import type { AgentDTO, FileInfoDTO } from '@/api/types.gen';

export interface ConfigurePanelProps {
  firstQuestion: string;
  agentForEditor: AgentDTO | null;
  setAgentForEditor: React.Dispatch<React.SetStateAction<AgentDTO | null>>;
  mode?: 'create' | 'edit'; // 模式：创建 or 编辑
}

export interface ChatMessageData {
  message: string;
  sender: string;
  direction: 'outgoing' | 'incoming';
  position: 'single';
  isAssistant?: boolean;
  collapsed?: boolean; // 是否折叠
}

export interface CodeBlockProps {
  code: string;
  codeId: string;
  onCopy: (code: string, codeId: string) => Promise<void>;
  onApply?: (code: string) => void;
  copiedCode: string;
  isLatest?: boolean; // 是否是最新的消息
  isHovered?: boolean; // 是否处于 hover 状态
}

export interface MarkdownMessageProps {
  message: string;
  index: number;
  copiedCode: string;
  onCopyCode: (code: string, codeId: string) => Promise<void>;
  onApplyMarkdown: (code: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isStreaming?: boolean; // 是否正在流式输出
}

/**
 * 扩展的文件信息，包含上传进度
 */
export interface FileInfoWithProgress extends FileInfoDTO {
  uploadProgress?: number; // 上传进度 0-100
  uploadStatus?: 'uploading' | 'success' | 'error'; // 上传状态
  uploadDetail?: string; // 上传详情
}

export interface FileListProps {
  toolFiles: FileInfoWithProgress[];
  docsFiles: FileInfoWithProgress[];
  maxFiles: number;
  onRemoveFile: (fileId: string, type: 'tool' | 'docs') => void;
}

export interface FileUploadButtonProps {
  uploading: boolean;
  isLoading: boolean;
  onUploadClick: (type: 'tool' | 'docs') => void;
}

export interface MarkdownEditorProps {
  agentName?: string;
  mdContent: string;
  onChange: (value: string) => void;
}

export interface ChatAssistantProps {
  messages: any[];
  isLoading: boolean;
  toolFiles: FileInfoDTO[];
  docsFiles: FileInfoDTO[];
  uploading: boolean;
  maxFiles: number;
  onSendMessage: (message: string) => Promise<void>;
  onCleanSession: () => Promise<void>;
  onRemoveFile: (fileId: string, type: 'tool' | 'docs') => void;
  onUploadClick: (type: 'tool' | 'docs') => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  uploadType: 'tool' | 'docs';
  renderMessage: (msg: ChatMessageData, index: number) => React.ReactNode;
  mode?: 'create' | 'edit'; // 模式：创建 or 编辑
  mdContent?: string; // Markdown 内容（编辑模式下使用）
}

export interface AgentFormData {
  name: string;
  description: string;
  platform: string;
  isPublic: boolean;
  licenseType?:
    | 'no-license'
    | 'MIT'
    | 'APACHE_2_0'
    | 'GPL_3_0'
    | 'BSD_3_CLAUSE'
    | 'AGPL_3_0'
    | 'PROPRIETARY'
    | 'CUSTOM';
}

// export enum AgentPlatform {
//   LITE_AGENT = 'LiteAgent',
//   DIFY = 'Dify',
//   COZE = 'Coze',
// }
