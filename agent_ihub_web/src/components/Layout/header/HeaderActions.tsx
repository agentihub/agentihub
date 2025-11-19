import React, { useRef } from 'react';
import { Button, Space, Dropdown } from 'antd';
import { DefaultAvatar } from '@/components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useAuthActions } from '../../../hooks/useAuthActions';
import SearchDropdown from './SearchDropdown';
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
  StarOutlined,
  PlusOutlined,
  DownOutlined,
  ImportOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { UserDTO } from '@/api';

interface HeaderActionsProps {
  currentAuth: boolean;
  currentUser: UserDTO;
  onMobileMenuToggle: () => void;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
  currentAuth,
  currentUser,
  onMobileMenuToggle,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth();
  const { logout } = useAuthActions(setUser);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = React.useState(false);
  const urlParams = new URLSearchParams(location.search);
  const queryFromUrl = urlParams.get('q') || '';

  const openSearchDropdown = () => setIsSearchDropdownOpen(true);
  const closeSearchDropdown = () => setIsSearchDropdownOpen(false);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'profile':
        navigate(`/${currentUser?.userName}`);
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'stars':
        navigate(`/${currentUser?.userName}?tab=stars`);
        break;
      case 'agents':
        navigate(`/${currentUser?.userName}?tab=agents`);
        break;
      case 'logout':
        handleLogout();
        break;
    }
  };

  const handleNewAgentMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'new-agent':
        navigate('/new');
        break;
      case 'import-agent':
        navigate('/import');
        break;
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人概览',
    },
    {
      key: 'agents',
      icon: <RobotOutlined />,
      label: 'Agents',
    },
    {
      key: 'stars',
      icon: <StarOutlined />,
      label: 'Stars',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  const newAgentMenuItems: MenuProps['items'] = [
    {
      key: 'new-agent',
      icon: <PlusOutlined />,
      label: 'New Agent',
    },
    {
      key: 'import-agent',
      icon: <ImportOutlined />,
      label: 'Import Agent',
    },
  ];

  return (
    <div className="header-actions">
      {/* Mobile Menu Button */}
      <Button
        type="primary"
        icon={<MenuOutlined />}
        className="mobile-menu-btn"
        onClick={onMobileMenuToggle}
      />

      {/* Desktop Actions */}
      <div className="desktop-actions">
        {currentAuth ? (
          <Space size="middle">
            <div className="header-search-container" ref={searchContainerRef}>
              <input
                type="text"
                placeholder="Type / to Search"
                readOnly
                onClick={openSearchDropdown}
                className="header-search-input"
                value={queryFromUrl}
              />
              <SearchDropdown
                visible={isSearchDropdownOpen}
                onClose={closeSearchDropdown}
                onSearch={handleSearch}
                initialQuery={queryFromUrl}
              />
            </div>
            <Dropdown
              menu={{
                items: newAgentMenuItems,
                onClick: handleNewAgentMenuClick,
              }}
              placement="bottomRight"
              arrow
            >
              <Button
                type="text"
                icon={<PlusOutlined />}
                className="header-new-agent-btn"
              >
                <DownOutlined />
              </Button>
            </Dropdown>
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              placement="bottomRight"
              arrow
            >
              <div className="user-profile">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.userName || 'avatar'}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      backgroundColor: 'transparent',
                      display: 'block',
                    }}
                  />
                ) : (
                  <DefaultAvatar
                    size={32}
                    className="user-avatar"
                    alt={user?.userName || 'avatar'}
                  />
                )}
              </div>
            </Dropdown>
          </Space>
        ) : (
          <Button
            type="primary"
            onClick={() => navigate('/login')}
            className="login-btn"
          >
            Sign In
          </Button>
        )}
      </div>
    </div>
  );
};

export default HeaderActions;
