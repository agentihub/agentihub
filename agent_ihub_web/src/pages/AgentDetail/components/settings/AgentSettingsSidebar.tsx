import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { InfoCircleOutlined, TagsOutlined } from '@ant-design/icons';

export type AgentSettingSection = 'general' | 'tags';

interface AgentSettingsSidebarProps {
  activeSection: AgentSettingSection;
}

const menuItems = [
  {
    key: 'general' as AgentSettingSection,
    label: 'General',
    icon: <InfoCircleOutlined />,
    path: '',
    description: 'Agent 名称、描述和基本设置',
  },
  {
    key: 'tags' as AgentSettingSection,
    label: 'Tags',
    icon: <TagsOutlined />,
    path: 'tags',
    description: '管理 Agent 的标签和分类',
  },
];

export const AgentSettingsSidebar: React.FC<AgentSettingsSidebarProps> = ({
  activeSection,
}) => {
  const { userName, agentname } = useParams<{
    userName: string;
    agentname: string;
  }>();

  return (
    <div className="w-full md:w-64 md:pr-8 md:border-r md:border-gray-200">
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = activeSection === item.key;
          const itemPath = item.path
            ? `/${userName}/${agentname}/settings/${item.path}`
            : `/${userName}/${agentname}/settings`;

          return (
            <Link
              key={item.key}
              to={itemPath}
              className={`
                flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${
                  isActive
                    ? 'bg-[#eceef0] border-l-3 border-[#0969da]'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <span
                className={`mr-3 text-lg ${isActive ? 'text-[#0969da]' : 'text-gray-400'}`}
              >
                {item.icon}
              </span>
              <div className="flex-1">
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-gray-500 mt-0.5 hidden md:block">
                  {item.description}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
