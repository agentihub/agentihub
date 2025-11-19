import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Header.css';
import type { NavItem } from '../Navs';
import Navs from '../Navs';
import HeaderLogo from './HeaderLogo';
import HeaderActions from './HeaderActions';
import HeaderMobileNav from './HeaderMobileNav';

const { Header: AntHeader } = Layout;

interface TitleSegment {
  text: string;
  clickable?: boolean;
  url?: string;
}

interface TitleInfo {
  segments: TitleSegment[];
}

interface HeaderProps {
  localBar?: {
    activeTab: string;
    onTabChange: (tab: string) => void;
    navItems: NavItem[];
  };
}

// 路径到标题的映射
const routeTitleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/explore': 'Explore',
  '/trending': 'Trending',
  '/': 'Home',
  '/agents': 'My Agents',
  '/search': 'Search',
  '/contact': 'Contact',
  '/settings/profile': 'Settings',
  '/settings/account': 'Settings',
  new: 'New Agent',
};

const Header: React.FC<HeaderProps> = ({ localBar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userName, agentname } = useParams<{
    userName?: string;
    agentname?: string;
  }>();
  const { user } = useAuth();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [title, setTitle] = useState<TitleInfo>({ segments: [] });
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Use auth context if available, otherwise use props
  const currentUser = user;
  const currentAuth = user ? true : false;

  // 根据当前路由自动更新标题
  useEffect(() => {
    const currentPath = location.pathname;
    const pathSegments = currentPath.split('/').filter(Boolean);
    let newTitle: TitleInfo = { segments: [] };

    // 优先检查静态路由
    if (routeTitleMap[currentPath]) {
      newTitle = {
        segments: [{ text: routeTitleMap[currentPath], url: currentPath }],
      };
    }
    // 检查 /:userName/:agentname/* 模式
    else if (pathSegments.length >= 2 && userName && agentname) {
      newTitle = {
        segments: [
          {
            text: userName,
            url: `/${userName}`,
          },
          { text: ' / ' },
          {
            text: agentname,
            url: `/${userName}/${agentname}`,
          },
        ],
      };
    }
    // 检查 /:userName 模式
    else if (pathSegments.length === 1 && userName) {
      newTitle = {
        segments: [{ text: userName, url: `/${userName}` }],
      };
    }
    // 检查是否包含 'new' 路径段
    else if (pathSegments.includes('new')) {
      newTitle = {
        segments: [{ text: routeTitleMap.new || 'New Agent', url: '/new' }],
      };
    }
    // 默认情况：使用第一个路径段
    else if (pathSegments.length > 0) {
      newTitle = {
        segments: [{ text: pathSegments[0], url: `/${pathSegments[0]}` }],
      };
    }

    setTitle(newTitle);
  }, [location.pathname, userName, agentname]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuVisible(!mobileMenuVisible);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuVisible(false);
  };

  const handleMobileNavClick = (href: string) => {
    navigate(href);
    setMobileMenuVisible(false);
  };

  return (
    <AntHeader className="header">
      <div className="header-content">
        <HeaderLogo
          title={title}
          onDrawerToggle={handleDrawerToggle}
          drawerOpen={drawerOpen}
        />

        <HeaderActions
          currentAuth={currentAuth}
          currentUser={currentUser!}
          onMobileMenuToggle={handleMobileMenuToggle}
        />
      </div>

      {localBar && (
        <Navs
          activeTab={localBar.activeTab}
          onTabChange={localBar.onTabChange}
          navItems={localBar.navItems}
        />
      )}

      <HeaderMobileNav
        visible={mobileMenuVisible}
        onClose={handleMobileMenuClose}
        onNavigate={handleMobileNavClick}
      />
    </AntHeader>
  );
};

export default Header;
