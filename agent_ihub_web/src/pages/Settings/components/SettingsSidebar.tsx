import React from 'react';
import { Link } from 'react-router-dom';
import { UserOutlined, SettingOutlined } from '@ant-design/icons';

export type SettingSection = 'profile' | 'account';

interface SettingsSidebarProps {
  activeSection: SettingSection;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ activeSection }) => {
  const menuItems = [
    {
      key: 'profile' as SettingSection,
      label: '公开资料',
      icon: <UserOutlined />,
      path: '/settings/profile',
    },
    {
      key: 'account' as SettingSection,
      label: '账户设置',
      icon: <SettingOutlined />,
      path: '/settings/account',
    },
  ];

  return (
    <div className="w-full md:w-64 bg-white">
      <nav className="py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.key}>
              <Link
                to={item.path}
                className={`block w-full text-left px-4 py-2 text-sm font-medium transition-colors rounded-md
                ${
                  activeSection === item.key
                    ? 'bg-[#eceef0] border-l-3 border-[#0969da]'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  {item.icon}
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SettingsSidebar;
