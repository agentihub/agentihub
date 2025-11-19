import React, { Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { AuthProvider } from './context';
import ErrorBoundary from './components/ErrorBoundary';
import { PageLoading } from './components/Loading';
import { performanceMonitor } from './utils/performanceMonitor';
import './App.css';
import RootLayout from './RootLayout';
import { initClient } from './services/apiClient';

const Login = React.lazy(() => import('./pages/Auth/Login'));
const Register = React.lazy(() => import('./pages/Auth/Register'));
const ForgotPassword = React.lazy(() => import('./pages/Auth/ForgotPassword'));
const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard'));
const AgentDetail = React.lazy(() => import('./pages/AgentDetail/AgentDetail'));
const Explore = React.lazy(() => import('./pages/Explore/Explore'));
const AgentCreate = React.lazy(() => import('./pages/AgentCreate/AgentCreate'));
const Agents = React.lazy(() => import('./pages/Agents/Agents'));
const Profile = React.lazy(() => import('./pages/Profile/Profile'));
const Settings = React.lazy(() => import('./pages/Settings/Settings'));
const Notifications = React.lazy(
  () => import('./pages/Notifications/Notifications')
);
const Help = React.lazy(() => import('./pages/Help/Help'));
const Contact = React.lazy(() => import('./pages/Contact'));
const SearchFilter = React.lazy(() => import('./pages/SearchFilter'));
const Trending = React.lazy(() => import('./pages/Trending/Trending'));
const Developers = React.lazy(
  () => import('./pages/Trending/developers/Developers')
);
const CodeTab = React.lazy(
  () => import('./pages/AgentDetail/components/code/CodeTab')
);
const AgentSettings = React.lazy(
  () => import('./pages/AgentDetail/components/settings/AgentSettings')
);
const AgentFork = React.lazy(
  () => import('./pages/AgentDetail/components/fork/AgentFork')
);
const AgentForksList = React.lazy(
  () => import('./pages/AgentDetail/components/forks/Forks')
);
const AgentCopilot = React.lazy(
  () => import('./pages/AgentDetail/components/copilot/AgentCopilot')
);
const AgentStargazers = React.lazy(
  () => import('./pages/AgentDetail/components/stargazers/Stargazers')
);
const CodeEditor = React.lazy(
  () => import('./pages/AgentDetail/components/editor/CodeEditor')
);
const DirectoryViewer = React.lazy(
  () => import('./pages/AgentDetail/components/editor/DirectoryViewer')
);
const AgentImport = React.lazy(() => import('./pages/AgentImport/AgentImport'));
const Privacy = React.lazy(() => import('./pages/Privacy/Privacy'));
const PrivacyContent = React.lazy(
  () => import('./pages/Privacy/PrivacyContent')
);

// 初始化性能监控
if (import.meta.env.PROD) {
  // 在页面完全加载后生成性能报告
  window.addEventListener('load', () => {
    setTimeout(() => {
      try {
        performanceMonitor.generateReport();
      } catch (error) {
        console.warn('Performance report failed:', error);
      }
    }, 1000);
  });
}

initClient();

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#2da44e',
            colorPrimaryHover: '#2c974b',
            colorPrimaryActive: '#298e46',
            borderRadius: 8,
            colorLink: '#0969da',
            colorLinkHover: '#0550ae',
          },
          components: {
            Button: {
              primaryColor: '#ffffff',
              primaryShadow: 'none',
            },
            Input: {
              activeBorderColor: '#2da44e',
              hoverBorderColor: '#2da44e',
            },
            Select: {
              optionSelectedBg: '#ddf4ff',
            },
          },
        }}
      >
        <AntApp>
          <Router>
            <ErrorBoundary>
              <AuthProvider>
                <ErrorBoundary>
                  <Suspense fallback={<PageLoading text="正在加载页面..." />}>
                    <Routes>
                      <Route element={<RootLayout />}>
                        <Route
                          path="/"
                          element={<Navigate to="/dashboard" replace />}
                        />
                        <Route path="/explore" element={<Explore />} />
                        <Route path="/trending" element={<Trending />} />
                        <Route
                          path="/trending/developers"
                          element={<Developers />}
                        />
                        {/* <Route path="/search" element={<Explore />} /> */}
                        <Route path="/search" element={<SearchFilter />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                          path="/forgot-password"
                          element={<ForgotPassword />}
                        />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/agents" element={<Agents />} />
                        <Route path="/:userName" element={<Profile />} />
                        <Route
                          path="/settings"
                          element={<Navigate to="/settings/profile" replace />}
                        />
                        <Route
                          path="/settings/profile"
                          element={<Settings />}
                        />
                        <Route
                          path="/settings/account"
                          element={<Settings />}
                        />
                        <Route
                          path="/notifications"
                          element={<Notifications />}
                        />
                        <Route path="/help" element={<Help />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route
                          path="/privacy-content"
                          element={<PrivacyContent />}
                        />
                        <Route
                          path="/:userName/:agentname"
                          element={<AgentDetail />}
                        >
                          <Route index element={<CodeTab />} />
                          <Route path="blob/*" element={<CodeEditor />} />
                          <Route path="tree/*" element={<DirectoryViewer />} />
                          <Route path="settings" element={<AgentSettings />} />
                          <Route
                            path="settings/:item"
                            element={<AgentSettings />}
                          />
                          <Route
                            path="stargazers"
                            element={<AgentStargazers />}
                          />
                          <Route path="forks" element={<AgentForksList />} />
                          <Route path="fork" element={<AgentFork />} />
                          <Route path="copilot" element={<AgentCopilot />} />
                        </Route>
                        <Route path="/new" element={<AgentCreate />} />
                        <Route path="/import" element={<AgentImport />} />
                      </Route>
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </AuthProvider>
            </ErrorBoundary>
          </Router>
        </AntApp>
      </ConfigProvider>
    </ErrorBoundary>
  );
};

export default App;
