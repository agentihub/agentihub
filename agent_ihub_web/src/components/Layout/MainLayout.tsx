import React from 'react';
import { Layout } from 'antd';
import Header from './header/Header';
import './MainLayout.css';
import Footer from './Footer';
import type { NavItem } from './Navs';

const { Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  localBar?: {
    activeTab: string;
    onTabChange: (tab: string) => void;
    navItems: NavItem[];
  };
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  localBar,
  showFooter = true,
}) => {
  return (
    <Layout className="main-layout">
      <Header localBar={localBar} />
      <Content className="main-content">{children}</Content>
      {showFooter && <Footer />}
    </Layout>
  );
};

export default MainLayout;
