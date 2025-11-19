import React from 'react';
import './ExploreNav.css';

export interface ExploreNavProps {
  align?: 'center' | 'left';
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

// 导航项定义
const navigationTabs = [
  { id: 'explore', label: 'Explore' },
  // { id: 'topics', label: 'Topics' },
  { id: 'trending', label: 'Trending' },
  // { id: 'collections', label: 'Collections' },
  //   { id: 'events', label: 'Events' },
  //   { id: 'sponsors', label: 'GitHub Sponsors' },
];

const ExploreNav: React.FC<ExploreNavProps> = ({
  align = 'center',
  activeTab = 'explore',
  onTabChange,
}) => {
  const handleTabClick = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <div
      className={`explore-nav ${align === 'center' ? 'explore-nav--center' : 'explore-nav--left'}`}
    >
      <div className="explore-nav-content">
        {navigationTabs.map((tab) => (
          <div
            key={tab.id}
            className={`explore-nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExploreNav;
