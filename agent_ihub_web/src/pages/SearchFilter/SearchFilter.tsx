import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout, Menu, Tag, Typography, Card, Space, App } from 'antd';
import type { MenuProps } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import MainLayout from '../../components/Layout/MainLayout';
import { AgentSearch, UserSearch } from './component';
import { agentService } from '../../services/agentService';
import { userService } from '../../services/userService';
import { BeakerIcon } from '@primer/octicons-react';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

interface FilterItem {
  key: string;
  label: string;
  count?: number | string;
  icon?: React.ReactNode;
  dotColor?: string;
}

interface FilterSection {
  key: string;
  title: string;
  items: FilterItem[];
}

// 将primarySections移到组件内部，以便使用动态状态

const mockResults: Record<
  string,
  { title: string; desc: string; tags?: string[] }[]
> = {
  repositories: [
    {
      title: 'wshobson/agents',
      desc: '智能自动化与多 Agent 协同框架',
      tags: ['automation', 'workflows', 'ai-agents'],
    },
    {
      title: 'contains-studio/agents',
      desc: '分享当前使用中的 Agent 项目',
      tags: ['agents', 'showcase'],
    },
    {
      title: 'livekit/agents',
      desc: '实时语音 AI Agent 框架',
      tags: ['real-time', 'voice', 'openai'],
    },
  ],
  code: [
    { title: 'search.ts', desc: '实现带筛选器的防抖搜索逻辑' },
    { title: 'filter.ts', desc: '可组合的筛选条件函数' },
  ],
  issues: [{ title: '小屏幕侧边栏溢出问题', desc: '需要调整 CSS 样式' }],
  users: [
    { title: 'alice', desc: 'Agent 开发者与维护者' },
    { title: 'bob', desc: '创建了 Agent 协同演示项目' },
  ],
};

const buildMenuItems = (sections: FilterSection[]): MenuProps['items'] =>
  sections.flatMap((section) => [
    {
      type: 'group' as const,
      key: section.key,
      label: (
        <span
          className={
            section.key === 'category'
              ? 'text-black font-bold'
              : 'text-gray-500'
          }
        >
          {section.title}
        </span>
      ),
      children: section.items.map((it) => ({
        key: it.key,
        label: (
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
              {it.icon ? (
                <span className="text-gray-500">{it.icon}</span>
              ) : it.dotColor ? (
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: it.dotColor }}
                />
              ) : null}
              <span>{it.label}</span>
            </span>
            {it.count !== undefined && (
              <span
                style={{
                  backgroundColor: '#e8e9ea',
                  color: '#000000',
                  borderRadius: '50px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  minWidth: '40px',
                  height: '20px',
                  lineHeight: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {it.count}
              </span>
            )}
          </div>
        ),
      })),
    },
  ]);

const SearchFilter: React.FC = () => {
  const { message } = App.useApp();
  const location = useLocation();

  // 从URL同步初始化，避免首次渲染错误视图导致闪烁
  const initialQuery = React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('q')?.trim() || '';
  }, [location.search]);

  const [activeKey, setActiveKey] = useState<string>(
    initialQuery ? 'Agents' : 'repositories'
  );
  const [agentsTotal, setAgentsTotal] = useState<number>(6); // 初始值设为mockAgents的长度
  const [usersTotal, setUsersTotal] = useState<number>(6); // 初始值设为mockUsers的长度

  // 搜索相关状态
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [agentsData, setAgentsData] = useState<any[]>([]);
  const [usersData, setUsersData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(initialQuery));

  // 仅在本页放大头部搜索框
  useEffect(() => {
    document.body.classList.add('page-search-filter');
    return () => {
      document.body.classList.remove('page-search-filter');
    };
  }, []);

  // 监听URL参数变化，如果有搜索查询则自动跳转到agents菜单并调用API
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const query = urlParams.get('q');

    if (query && query.trim() !== '') {
      setSearchQuery(query);
      setActiveKey('Agents');

      // 调用API获取数据
      const fetchSearchData = async () => {
        setLoading(true);
        try {
          // 并行调用两个API
          const [agentsResponse, usersResponse] = await Promise.all([
            agentService.getPublicAgents({
              pageNum: 1,
              pageSize: 50,
              search: query,
            }),
            userService.listUsers({
              pageNum: 1,
              pageSize: 50,
              content: query,
            }),
          ]);

          // 设置数据
          setAgentsData(agentsResponse.data?.contentData || []);
          setUsersData(usersResponse.data?.contentData || []);

          // 更新总数
          setAgentsTotal(agentsResponse.data?.totalSize || 0);
          setUsersTotal(usersResponse.data?.totalSize || 0);
        } catch (error) {
          console.error('搜索失败:', error);
          message.error('搜索失败，请稍后重试');

          // 重置数据
          setAgentsData([]);
          setUsersData([]);
          setAgentsTotal(0);
          setUsersTotal(0);
        } finally {
          setLoading(false);
        }
      };

      fetchSearchData();
    } else {
      // 没有搜索查询时，重置数据
      setSearchQuery('');
      setAgentsData([]);
      setUsersData([]);
      setAgentsTotal(6); // 恢复默认值
      setUsersTotal(6); // 恢复默认值
    }
  }, [location.search]);

  // 动态创建primarySections，使用状态中的总数
  const primarySections: FilterSection[] = useMemo(
    () => [
      {
        key: 'category',
        title: '筛选条件',
        items: [
          {
            key: 'Agents',
            label: 'Agent 列表',
            count: agentsTotal,
            icon: <BeakerIcon />,
          },
          {
            key: 'users',
            label: '用户',
            count: usersTotal,
            icon: <TeamOutlined />,
          },
        ],
      },
    ],
    [agentsTotal, usersTotal]
  );

  const items = useMemo(
    () => buildMenuItems(primarySections),
    [primarySections]
  );
  const currentList = mockResults[activeKey] ?? mockResults.repositories;
  const fallbackTitles: Record<string, string> = {
    repositories: '仓库',
    code: '代码',
    issues: '问题',
    users: '用户',
  };

  return (
    <MainLayout>
      <Layout className="bg-white min-h-[calc(100vh-64px)]">
        <Sider
          className="border-r border-gray-200 bg-white py-4"
          width={280}
          breakpoint="lg"
          collapsedWidth={0}
          theme="light"
        >
          <Menu
            mode="inline"
            items={items}
            selectedKeys={[activeKey]}
            onClick={(e) => setActiveKey(e.key)}
            className="h-full [&_.ant-menu-item]:pt-1.5 [&_.ant-menu-item]:pb-1.5 [&_.ant-menu-item]:m-0 [&_.ant-menu-item]:h-auto [&_.ant-menu-item]:leading-5 [&_.ant-menu-item-group-title]:px-4 [&_.ant-menu-item-group-title]:pt-2 [&_.ant-menu-item-group-title]:pb-1 [&_.ant-menu-item-group-list_.ant-menu-item]:m-0 [&_.ant-menu-item-selected]:bg-gray-100 [&_.ant-menu-item-selected]:text-black [&_.ant-menu-item-selected]:font-semibold [&_.ant-menu-item-selected]:rounded-md [&_.ant-menu-item-selected]:relative [&_.ant-menu-item-selected]:before:content-[''] [&_.ant-menu-item-selected]:before:absolute [&_.ant-menu-item-selected]:before:left-1.5 [&_.ant-menu-item-selected]:before:top-1/2 [&_.ant-menu-item-selected]:before:-translate-y-1/2 [&_.ant-menu-item-selected]:before:w-1 [&_.ant-menu-item-selected]:before:h-[70%] [&_.ant-menu-item-selected]:before:bg-blue-600 [&_.ant-menu-item-selected]:before:rounded-sm [&_.ant-menu-item-selected_.sf-menu-left_span]:text-black [&_.ant-menu-item-selected_.sf-menu-left_span]:font-semibold [&_.ant-menu-item-selected_.sf-icon]:text-black [&_.ant-menu-item-selected_.sf-icon]:font-semibold"
          />
        </Sider>
        <Layout>
          <Content className="p-6">
            {activeKey === 'Agents' ? (
              <AgentSearch
                onTotalChange={setAgentsTotal}
                searchQuery={searchQuery}
                agentsData={agentsData}
                loading={loading}
              />
            ) : activeKey === 'users' ? (
              <UserSearch
                onTotalChange={setUsersTotal}
                searchQuery={searchQuery}
                usersData={usersData}
                loading={loading}
              />
            ) : (
              <>
                <div className="flex items-baseline justify-between mb-4">
                  <Title level={4} style={{ margin: 0 }}>
                    {fallbackTitles[activeKey] ||
                      activeKey.charAt(0).toUpperCase() + activeKey.slice(1)}
                  </Title>
                  <Text type="secondary">根据所选筛选条件展示示例结果</Text>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {currentList.map((row, idx) => (
                    <Card
                      key={`${activeKey}-${idx}`}
                      className="rounded-lg"
                      hoverable
                    >
                      <Space direction="vertical" size={4}>
                        <Title level={5} style={{ margin: 0 }}>
                          {row.title}
                        </Title>
                        <Text>{row.desc}</Text>
                        {row.tags && (
                          <Space wrap>
                            {row.tags.map((t) => (
                              <Tag key={t}>{t}</Tag>
                            ))}
                          </Space>
                        )}
                      </Space>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </Content>
        </Layout>
      </Layout>
    </MainLayout>
  );
};

export default SearchFilter;
