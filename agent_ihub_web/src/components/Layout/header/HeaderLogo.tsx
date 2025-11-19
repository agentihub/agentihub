import React from 'react';
import { Drawer, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import { MenuOutlined, HomeOutlined, ShopOutlined } from '@ant-design/icons';
import logo from '@/assets/images/logo.png';

interface TitleSegment {
  text: string;
  clickable?: boolean;
  url?: string;
}

interface TitleInfo {
  segments: TitleSegment[];
}

interface HeaderLogoProps {
  title: TitleInfo;
  onDrawerToggle: () => void;
  drawerOpen: boolean;
}

const HeaderLogo: React.FC<HeaderLogoProps> = ({
  title,
  onDrawerToggle,
  drawerOpen,
}) => {
  const navigate = useNavigate();

  return (
    <div className="logo">
      <MenuOutlined className="header-menu-icon" onClick={onDrawerToggle} />
      <Drawer
        title={<img src={logo} alt="logo" className="logo-icon" />}
        placement={'left'}
        closable={false}
        onClose={onDrawerToggle}
        open={drawerOpen}
        key={'left'}
      >
        <p
          className="drawer-menu-item"
          onClick={() => {
            navigate('/dashboard');
            onDrawerToggle();
          }}
        >
          <HomeOutlined /> Home
        </p>
        <Divider />
        <p
          className="drawer-menu-item"
          onClick={() => {
            navigate('/explore');
            onDrawerToggle();
          }}
        >
          <ShopOutlined /> Explore
        </p>
      </Drawer>
      <div className="logo-text">
        <img
          src={logo}
          alt="logo"
          className="logo-icon"
          onClick={() => (window.location.href = '/dashboard')}
        />
        {title.segments.map((segment, index) => {
          if (segment.url) {
            return (
              <span
                key={index}
                onClick={() => (window.location.href = segment.url!)}
                className="cursor-pointer hover:bg-[#eaedf0] h-7 leading-7 px-2 rounded-md"
              >
                {segment.text}
              </span>
            );
          }
          return <span key={index}>{segment.text}</span>;
        })}
      </div>
    </div>
  );
};

export default HeaderLogo;
