import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { MainLayout } from '../../components';
import ConfigurePanel from './components/configure';
import DescribeSection from './components/describe';
import PublishSection from './components/publish';
import DiscoverSection from './components/discover';
import StepActions from './components/StepActions';
import type { AgentDTO } from '@/api/types.gen';
import { agentService } from '@/services';

// Define the possible panels
type Panel = 'describe' | 'discover' | 'configure' | 'publish';

const AgentCreate: React.FC = () => {
  const [activePanel, setActivePanel] = useState<Panel>('describe');
  const [userRequirement, setUserRequirement] = useState('');
  const [keyword, setKeyword] = useState('');
  const [firstQuestion, setFirstQuestion] = useState('');
  const [agentForEditor, setAgentForEditor] = useState<AgentDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [visitedPanels, setVisitedPanels] = useState<Set<Panel>>(
    new Set(['describe'])
  );

  useEffect(() => {
    agentService.cleanCreationChatSession();
  }, []);

  // 标记已访问的步骤
  const markPanelAsVisited = (panel: Panel) => {
    setVisitedPanels((prev) => new Set([...prev, panel]));
  };

  // Step 1: User submits their requirement
  const handleRequirementSubmit = async (requirement: string) => {
    setLoading(true);
    setUserRequirement(requirement);

    const decisionRes = await agentService.getNavigationDecision(requirement);
    if (decisionRes.data?.type === 'search') {
      setActivePanel('discover');
      markPanelAsVisited('discover');
      setKeyword(decisionRes.data?.text || '');
    } else {
      // If the decision is to go straight to the configure panel, create a new agent object
      const newAgent: Partial<AgentDTO> = {
        name: 'New Agent', // A better name could be generated
        description: requirement,
        mdContent:
          '# Agent 名称\n\n> 分发\n\n- 模式: 你的模式在这里\n\n~~~\n你的提示词在这里\n~~~',
      };
      setFirstQuestion(decisionRes.data?.text || '');
      setAgentForEditor(newAgent as AgentDTO);
      setActivePanel('configure');
      markPanelAsVisited('configure');
    }
    setLoading(false);
  };

  // Step 2b: User chooses to view details of a recommended agent
  const handleViewDetails = (agent: AgentDTO) => {
    if (agent.authorName && agent.name) {
      window.open(`/${agent.authorName}/${agent.name}`, '_blank');
    }
  };

  // 第 2c 步：用户点击“继续创建我的 Agent”
  const handleContinueToConfigure = () => {
    // Create a new agent object based on the user's requirement
    const newAgent: Partial<AgentDTO> = {
      name: 'New Agent', // A better name could be generated
      description: userRequirement,
      mdContent:
        '# Agent 名称\n\n> 分发\n\n- 模式: 你的模式在这里\n\n~~~\n你的提示词在这里\n~~~',
    };
    setFirstQuestion(userRequirement || '');
    setAgentForEditor(newAgent as AgentDTO);
    setActivePanel('configure');
    markPanelAsVisited('configure');
  };

  // 返回到 describe 并重置所有状态
  const resetToDescribe = () => {
    setActivePanel('describe');
    setVisitedPanels(new Set(['describe']));
    setUserRequirement('');
    setKeyword('');
    setFirstQuestion('');
    setAgentForEditor(null);
  };

  // 从 discover 返回到 describe
  const handleBackFromDiscover = () => {
    resetToDescribe();
  };

  // 从 configure 返回到 describe
  const handleBackFromConfigure = () => {
    resetToDescribe();
  };

  // 从 publish 返回到 configure
  const handleBackFromPublish = () => {
    setActivePanel('configure');
  };

  // 从配置页面继续到发布
  const handleContinueToPublish = () => {
    setActivePanel('publish');
    markPanelAsVisited('publish');
  };

  const renderPanel = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[calc(100vh-250px)]">
          <Spin size="large" tip="正在处理您的需求..." />
          <div className="text-center text-gray-500 ml-4">处理中...</div>
        </div>
      );
    }

    // 使用隐藏而不是卸载的方式，保留组件状态
    return (
      <>
        {/* Describe 步骤 */}
        <div style={{ display: activePanel === 'describe' ? 'block' : 'none' }}>
          <DescribeSection onSubmit={handleRequirementSubmit} />
        </div>

        {/* Discover 步骤 */}
        {visitedPanels.has('discover') && (
          <div
            style={{ display: activePanel === 'discover' ? 'block' : 'none' }}
          >
            <DiscoverSection
              keyword={keyword}
              onViewDetails={handleViewDetails}
              onContinue={handleContinueToConfigure}
              onBack={handleBackFromDiscover}
            />
          </div>
        )}

        {/* Configure 步骤 */}
        {visitedPanels.has('configure') && (
          <div
            style={{ display: activePanel === 'configure' ? 'block' : 'none' }}
          >
            <ConfigurePanel
              firstQuestion={firstQuestion}
              agentForEditor={agentForEditor}
              setAgentForEditor={setAgentForEditor}
            />
            <StepActions
              showBack={true}
              onBack={handleBackFromConfigure}
              nextText="下一步：发布"
              onNext={handleContinueToPublish}
            />
          </div>
        )}

        {/* Publish 步骤 */}
        {visitedPanels.has('publish') && (
          <div
            style={{ display: activePanel === 'publish' ? 'block' : 'none' }}
          >
            <PublishSection
              agentForEditor={agentForEditor}
              onBack={handleBackFromPublish}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <MainLayout showFooter={false}>
      <div className="py-8">
        {/* 内容区域 */}
        <div className="relative">{renderPanel()}</div>
      </div>
    </MainLayout>
  );
};

export default AgentCreate;
