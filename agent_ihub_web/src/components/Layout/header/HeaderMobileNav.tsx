import React from 'react';
import { Drawer, Button } from 'antd';
import { DefaultAvatar } from '@/components';
import { useAuth } from '../../../context/AuthContext';
import { useAuthActions } from '../../../hooks/useAuthActions';
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  RobotOutlined,
  StarOutlined,
  SearchOutlined,
} from '@ant-design/icons';

interface HeaderMobileNavProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (href: string) => void;
}

const HeaderMobileNav: React.FC<HeaderMobileNavProps> = ({
  visible,
  onClose,
  onNavigate,
}) => {
  const { user, setUser } = useAuth();
  const { logout } = useAuthActions(setUser);
  const currentUser = user;
  const currentAuth = !!user;

  return (
    <Drawer
      title="Navigation"
      placement="right"
      onClose={onClose}
      open={visible}
      className="mobile-nav-drawer"
      width={280}
    >
      <div className="mobile-nav-content">
        {/* User Info Section */}
        {currentAuth && (
          <div className="mobile-user-info">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.userName || 'avatar'}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  backgroundColor: 'transparent',
                  display: 'block',
                }}
                className="mobile-user-avatar"
              />
            ) : (
              <DefaultAvatar
                size={40}
                className="mobile-user-avatar"
                alt={currentUser?.userName || 'avatar'}
              />
            )}
            <div className="mobile-user-details">
              <div className="mobile-userName">{currentUser?.userName}</div>
              <div className="mobile-user-role">用户</div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="mobile-nav-links">
          <Button
            type="text"
            icon={<SearchOutlined />}
            onClick={() => onNavigate('/explore')}
            className="mobile-nav-item"
            block
          >
            探索 Agents
          </Button>

          {currentAuth && (
            <>
              <Button
                type="text"
                icon={<RobotOutlined />}
                onClick={() => onNavigate('/dashboard')}
                className="mobile-nav-item"
                block
              >
                我的仪表板
              </Button>
              <Button
                type="text"
                icon={<RobotOutlined />}
                onClick={() => onNavigate('/agents')}
                className="mobile-nav-item"
                block
              >
                我的 Agents
              </Button>
              <Button
                type="text"
                icon={<StarOutlined />}
                onClick={() => onNavigate('/stars')}
                className="mobile-nav-item"
                block
              >
                我的收藏
              </Button>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="mobile-nav-actions">
          {currentAuth ? (
            <>
              <Button
                type="text"
                icon={<UserOutlined />}
                onClick={() => onNavigate(`/${currentUser?.userName}`)}
                className="mobile-nav-item"
                block
              >
                个人概览
              </Button>
              <Button
                type="text"
                icon={<SettingOutlined />}
                onClick={() => onNavigate('/settings')}
                className="mobile-nav-item"
                block
              >
                设置
              </Button>
              <Button
                type="text"
                icon={<BellOutlined />}
                onClick={() => onNavigate('/notifications')}
                className="mobile-nav-item"
                block
              >
                通知
              </Button>
              <Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={logout}
                className="mobile-nav-item logout"
                block
              >
                退出登录
              </Button>
            </>
          ) : (
            <Button
              type="primary"
              onClick={() => onNavigate('/login')}
              className="mobile-login-btn"
              block
              size="large"
            >
              登录
            </Button>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default HeaderMobileNav;
