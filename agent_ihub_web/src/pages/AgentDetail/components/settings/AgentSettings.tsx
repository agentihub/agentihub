import React, { useMemo } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import type { AgentDTO } from '@/api/types.gen';
import {
  AgentSettingsSidebar,
  type AgentSettingSection,
} from './AgentSettingsSidebar';
import { AgentGeneralForm } from './AgentGeneralForm';
import { AgentTagsForm } from './AgentTagsForm';

interface OutletContext {
  agentData: AgentDTO;
  reFetchAgentData: () => void;
}

const AgentSettings: React.FC = () => {
  const location = useLocation();
  const { agentData, reFetchAgentData } = useOutletContext<OutletContext>();

  // 从路由路径确定当前激活的部分
  const activeSection: AgentSettingSection = useMemo(() => {
    const pathname = location.pathname;
    if (pathname.includes('/settings/tags')) {
      return 'tags';
    }
    return 'general'; // 默认为 general
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-white max-w-[1280px] mx-auto px-4 py-8">
      <AgentSettingsSidebar activeSection={activeSection} />

      <div className="flex-1 md:ml-8">
        {activeSection === 'general' && (
          <AgentGeneralForm
            agentData={agentData}
            reFetchAgentData={reFetchAgentData}
          />
        )}
        {activeSection === 'tags' && (
          <AgentTagsForm
            agentData={agentData}
            reFetchAgentData={reFetchAgentData}
          />
        )}
      </div>
    </div>
  );
};

export default AgentSettings;
