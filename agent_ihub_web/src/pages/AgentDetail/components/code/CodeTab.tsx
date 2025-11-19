import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { AboutSidebar, FileBrowser, FileList, ReadmeViewer } from '../index';
import RepoHeaderWrapper from './RepoHeaderWrapper';
import type { AgentDTO } from '@/api/types.gen';

interface OutletContext {
  isOwnAgent: boolean;
  agentData: AgentDTO;
  reFetchAgentData: () => void;
  isStarred: boolean;
  handleStar: () => void;
  handleFork: () => void;
}

const CodeTab: React.FC = () => {
  const {
    agentData,
    isStarred,
    handleStar,
    handleFork,
    isOwnAgent,
    reFetchAgentData,
  } = useOutletContext<OutletContext>();

  const getFileList = () => {
    if (!agentData) return [];

    return [
      {
        name: 'tools',
        type: 'directory' as const,
        description: '工具目录',
        fileCount: agentData.toolFileIdList?.length || 0,
        updatedAt: agentData.updateTime?.toDateString(),
      },
      {
        name: 'knowledge',
        type: 'directory' as const,
        description: '知识库目录',
        fileCount: agentData.docsFileIdList?.length || 0,
        updatedAt: agentData.updateTime?.toDateString(),
      },
      {
        name: 'hub_agent.md',
        type: 'file' as const,
        description: 'hub_agent.md',
        updatedAt: agentData.updateTime?.toDateString(),
      },
    ];
  };

  return (
    <div className="max-w-[1280px] w-full mx-auto px-4 py-4">
      <RepoHeaderWrapper
        ownerName={agentData.authorName || '未知作者'}
        agentName={agentData.name || '未命名 Agent'}
        isPublic={agentData.isPublic || false}
        stars={agentData.stars || 0}
        forks={agentData.forks || 0}
        watchers={agentData.stars || 0}
        isStarred={isStarred}
        forkInfo={agentData.forkInfo}
        onStar={handleStar}
        onFork={handleFork}
      />

      <div className="flex flex-row gap-6">
        <main className="flex-1 min-w-0">
          <FileBrowser
            agentData={agentData}
            readOnly={!isOwnAgent}
            onUploadSuccess={reFetchAgentData}
          />

          {getFileList().length > 0 && (
            <div className="mt-4">
              <FileList files={getFileList()} />
            </div>
          )}

          <ReadmeViewer
            readOnly={!isOwnAgent}
            content={agentData.mdContent || '# 暂无 ihub agent 内容'}
            filename="ihub_agent.md"
          />
        </main>

        <aside className="w-[296px] hidden lg:block flex-shrink-0">
          <AboutSidebar
            description={agentData.description || undefined}
            tags={agentData.tags || []}
            license={agentData.license}
            stars={agentData.stars || 0}
            forks={agentData.forks || 0}
          />
        </aside>
      </div>
    </div>
  );
};

export default CodeTab;
