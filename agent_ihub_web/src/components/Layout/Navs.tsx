import React from 'react';

interface NavsProps {
  activeTab?: string;
  navItems: NavItem[];
  onTabChange?: (tab: string) => void;
}

export interface NavItem {
  key: string;
  label: string;
  icon: React.ElementType;
  count?: number;
  disabled?: boolean;
}

const Navs: React.FC<NavsProps> = ({ activeTab, onTabChange, navItems }) => {
  const handleTabClick = (tabKey: string) => {
    if (onTabChange) {
      onTabChange(tabKey);
    }
  };

  return (
    <div className="border-b border-[#D0D7DE] bg-[#F6F8FA] h-12 flex items-center">
      <div className="w-full px-4 h-full">
        <nav className="flex gap-2 h-full items-center" aria-label="navigation">
          {navItems?.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;

            if (item.disabled) {
              return null;
            }

            return (
              <div
                className={`h-full flex items-center p-2 border-b-2 cursor-pointer mb-[-1px]
                    ${
                      isActive
                        ? 'text-black font-bold border-b-[#FB8500]'
                        : 'border-transparent'
                    } 
              `}
                key={item.key}
              >
                <span
                  key={item.key}
                  onClick={() => handleTabClick(item.key)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    flex items-center gap-2 p-2 h-full 
                    relative border-transparent rounded
                     text-gray-900 hover:bg-gray-200
                  `}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className="px-1.5 py-0.5 text-xs font-semibold rounded-xl"
                      style={{
                        backgroundColor: 'rgba(175, 184, 193, 0.2)',
                        color: '#24292F',
                      }}
                    >
                      {item.count}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Navs;
