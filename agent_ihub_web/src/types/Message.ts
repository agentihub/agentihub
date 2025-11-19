export type Message = {
  id?: string;
  sessionId?: string;
  taskId: string;
  role?: MessageRole;
  type: MessageType;
  to?: MessageRole;
  part?: string;
  content?:
    | {
        [MessageType.Text]: TextMessageContent;
        [MessageType.ImageUrl]: TextMessageContent;
        [MessageType.ContentList]: ContentListMessageContent;
        [MessageType.ToolCalls]: ToolcallMessageContent;
        [MessageType.ToolReturn]: ToolReturnMessageContent;
        [MessageType.Dispatch]: DispatchMessageContent;
        [MessageType.Reflection]: ReflectionMessageContent;
        [MessageType.TaskStatus]: TaskStatusMessageContent;
        [MessageType.FunctionCall]: ToolcallMessageContent;
        [MessageType.ReasoningContent]: TextMessageContent;
      }[MessageType]
    | string
    | any;
};

export type TextMessageContent = {
  text?: string;
  imageUrl?: string;
};

export type ToolcallMessageContent = {
  id: string;
  type: MessageType;
  name?: string;
  parameters?: Map<string, any>;
}[];

export type ToolReturnMessageContent = {
  id: string;
  functionName?: string;
  result?: Map<string, any>;
};

export type ContentListMessageContent = {
  type: MessageType.Text | MessageType.ImageUrl;
  message: string;
}[];

export type ReflectionMessageContent = {
  isPass: boolean;
  messageScore: {
    contentList: ContentListMessageContent;
    messageType: MessageType.Text | MessageType.FunctionCall;
    message: string;
  };
};

export type TaskStatusMessageContent = {
  status: 'start' | 'stop' | 'done' | 'toolsStart' | 'toolsDone' | 'exception';
  description: Map<string, any>;
};

export type DispatchMessageContent = {
  dispatchId: string;
  agentId: string;
  name: any;
  contentList: ContentListMessageContent;
};

export enum MessageType {
  Text = 'text',
  ImageUrl = 'imageUrl',
  ContentList = 'contentList',
  ToolCalls = 'toolCalls',
  Dispatch = 'dispatch',
  Reflection = 'reflection',
  ToolReturn = 'toolReturn',
  FunctionCall = 'functionCall',
  TaskStatus = 'taskStatus',
  ReasoningContent = 'reasoningContent',
}
export enum MessageRole {
  Developer = 'developer',
  User = 'user',
  Agent = 'agent',
  Assistant = 'assistant',
  Dispatcher = 'dispatcher',
  Subagent = 'subagent',
  Reflection = 'reflection',
  Tool = 'tool',
  Client = 'client',
}

export type ChannelMessage = {
  id?: string;
  taskId: string;
  parentTaskId?: string;
  createdAt?: string;
  message?: Message | string;
  role?: MessageRole;
  type?: MessageType;
  status:
    | 'start'
    | 'toolcalls'
    | 'done'
    | 'exception'
    | 'none'
    | 'reasoningContent';
  toolName?: string;
  isSupportAudio?: boolean;
  ipadVoiceOn?: boolean;
};
