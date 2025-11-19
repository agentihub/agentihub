import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Button,
  Typography,
  Card,
  Space,
  Input,
  Select,
  Row,
  Col,
  Statistic,
  Empty,
  Spin,
  Switch,
  Modal,
  message,
  Dropdown,
  type MenuProps,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  EyeOutlined,
  StarOutlined,
  ForkOutlined,
} from '@ant-design/icons';
import { MainLayout } from '../../components';
import { useAuth } from '../../context';
import { handleError, agentService } from '../../services';
import type { AgentDTO } from '../../api/types.gen';
import './Agents.css';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface UserAgent {
  id: string;
  name: string;
  description: string;
  platform: string;
  stars: number;
  forks: number;
  isPublic: boolean;
  lastUpdated: string;
  createdAt: string;
  status: 'active' | 'draft' | 'archived';
}

// Convert API agent data to display format
const convertAgentData = (agent: AgentDTO): UserAgent => ({
  id: agent.id || '',
  name: agent.name || '',
  description: agent.description || '',
  platform: agent.platform || 'LITE_AGENT',
  stars: agent.stars || 0,
  forks: agent.forks || 0,
  isPublic: agent.isPublic || false,
  lastUpdated: agent.createTime || '',
  createdAt: agent.createTime || '',
  status: agent.isPublished ? 'active' : 'draft',
});

const Agents: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<UserAgent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<UserAgent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<UserAgent | null>(null);

  // Load user agents from API
  useEffect(() => {
    const loadUserAgents = async () => {
      if (!user?.id) {
        setAgents([]);
        setFilteredAgents([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch user's agents
        const response = await agentService.getUserAgents({
          userId: user.id,
          userName: user.userName || '',
          pageNum: 1,
          pageSize: 100, // Get all user's agents
        });

        if (response.success && response.data && response.data.contentData) {
          const userAgents = response.data.contentData.map((agent: AgentDTO) =>
            convertAgentData(agent)
          );
          setAgents(userAgents);
          setFilteredAgents(userAgents);
        } else {
          setAgents([]);
          setFilteredAgents([]);
        }
      } catch (error) {
        console.error('Failed to load user agents:', error);
        const errorResult = handleError(error);
        handleApiNotification(error, '加载 Agents 失败');
        message.error(errorResult.message || '加载 Agents 失败');
        setAgents([]);
        setFilteredAgents([]);
      } finally {
        setLoading(false);
      }
    };

    loadUserAgents();
  }, [user?.id]);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...agents];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (agent) =>
          agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          agent.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter((agent) => agent.platform === platformFilter);
    }

    // Sort
    switch (sortBy) {
      case 'updated':
        filtered.sort((a, b) => {
          const dateA = new Date(a.lastUpdated).getTime();
          const dateB = new Date(b.lastUpdated).getTime();
          // Handle invalid dates by putting them at the end
          if (isNaN(dateA) && isNaN(dateB)) return 0;
          if (isNaN(dateA)) return 1;
          if (isNaN(dateB)) return -1;
          return dateB - dateA;
        });
        break;
      case 'stars':
        filtered.sort((a, b) => b.stars - a.stars);
        break;
      case 'created':
        filtered.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          // Handle invalid dates by putting them at the end
          if (isNaN(dateA) && isNaN(dateB)) return 0;
          if (isNaN(dateA)) return 1;
          if (isNaN(dateB)) return -1;
          return dateB - dateA;
        });
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFilteredAgents(filtered);
  }, [agents, searchQuery, sortBy, platformFilter]);

  const handleCreateAgent = () => {
    navigate('/new');
  };

  const handleAgentClick = (agent: UserAgent) => {
    const userName = user?.userName;
    if (userName && agent.name) {
      navigate(`/${userName}/${agent.name}`);
    }
  };

  const handleEditAgent = (id: string) => {
    navigate(`/agent/${id}/edit`);
  };

  const handleDeleteAgent = (agent: UserAgent) => {
    setAgentToDelete(agent);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!agentToDelete) return;

    try {
      await agentService.deleteAgent(agentToDelete.id);

      setAgents((prev) =>
        prev.filter((agent) => agent.id !== agentToDelete.id)
      );
      message.success(`已删除 "${agentToDelete.name}"`);
    } catch (error) {
      console.error('Failed to delete agent:', error);
      const errorResult = handleError(error);
      handleApiNotification(error, '删除 Agent 失败');
      message.error(errorResult.message || '删除 Agent 失败');
    } finally {
      setDeleteModalVisible(false);
      setAgentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setAgentToDelete(null);
  };

  const handleTogglePublic = async (id: string, isPublic: boolean) => {
    try {
      // 首先获取Agent的完整信息
      const agentResponse = await agentService.getAgentById(id);
      if (!agentResponse.success || !agentResponse.data) {
        throw new Error('无法获取Agent信息');
      }

      const agentData = agentResponse.data;
      await agentService.updateAgent({
        id,
        name: agentData.name,
        platform: agentData.platform,
        mdContent: agentData.mdContent,
        description: agentData.description,
        category: agentData.category,
        isPublic,
        tags: agentData.tags,
        toolFileIdList: agentData.toolFileIdList,
        docsFileIdList: agentData.docsFileIdList,
      });

      setAgents((prev) =>
        prev.map((agent) => (agent.id === id ? { ...agent, isPublic } : agent))
      );
      message.success(isPublic ? '已设为公开' : '已设为私有');
    } catch (error) {
      console.error('Failed to toggle agent visibility:', error);
      const errorResult = handleError(error);
      handleApiNotification(error, '更新 Agent 可见性失败');
      message.error(errorResult.message || '更新 Agent 可见性失败');
    }
  };

  // Calculate statistics
  const totalAgents = agents.length;
  const totalStars = agents.reduce((sum, agent) => sum + agent.stars, 0);
  const totalForks = agents.reduce((sum, agent) => sum + agent.forks, 0);

  const getActionMenuItems = (agent: UserAgent): MenuProps['items'] => [
    {
      key: 'view',
      label: '查看详情',
      icon: <EyeOutlined />,
      onClick: () => handleAgentClick(agent),
    },
    {
      key: 'edit',
      label: '编辑',
      icon: <EditOutlined />,
      onClick: () => handleEditAgent(agent.id),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: '删除',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDeleteAgent(agent),
    },
  ];

  if (loading) {
    return (
      <MainLayout>
        <Content style={{ padding: '24px', textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>加载中...</div>
        </Content>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            <Title level={2} style={{ margin: 0 }}>
              我的 Agents
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateAgent}
            >
              创建 Agent
            </Button>
          </div>

          {/* Statistics */}
          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col span={8}>
              <Card>
                <Statistic title="Agent 总数" value={totalAgents} />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic title="收藏总数" value={totalStars} />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic title="Fock总数" value={totalForks} />
              </Card>
            </Col>
          </Row>

          {/* Filters */}
          <Card style={{ marginBottom: '24px' }}>
            <Row gutter={16} align="middle">
              <Col flex="auto">
                <Search
                  placeholder="搜索我的 Agents"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col>
                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  style={{ width: 120 }}
                >
                  <Option value="updated">最近更新</Option>
                  <Option value="stars">收藏数量</Option>
                  <Option value="created">创建时间</Option>
                  <Option value="name">名称</Option>
                </Select>
              </Col>
              <Col>
                <Select
                  value={platformFilter}
                  onChange={setPlatformFilter}
                  style={{ width: 120 }}
                >
                  <Option value="all">全部平台</Option>
                  <Option value="LiteAgent">LiteAgent</Option>
                  <Option value="Dify">Dify</Option>
                  <Option value="Coze">Coze</Option>
                  <Option value="DingTalk">DingTalk</Option>
                </Select>
              </Col>
            </Row>
          </Card>

          {/* Agents List */}
          {filteredAgents.length === 0 ? (
            <Card>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <Text type="secondary">暂无 Agent</Text>
                    <br />
                    <Text type="secondary">开始创建您的第一个 Agent</Text>
                  </div>
                }
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateAgent}
                >
                  创建 Agent
                </Button>
              </Empty>
            </Card>
          ) : (
            <Row gutter={[16, 16]}>
              {filteredAgents.map((agent) => (
                <Col xs={24} sm={12} lg={8} key={agent.id}>
                  <Card
                    hoverable
                    onClick={() => handleAgentClick(agent)}
                    actions={[
                      <Space key="stats">
                        <StarOutlined /> {agent.stars}
                        <ForkOutlined /> {agent.forks}
                      </Space>,
                      <Switch
                        key="public"
                        checked={agent.isPublic}
                        size="small"
                        onClick={(checked, e) => {
                          e.stopPropagation();
                          handleTogglePublic(agent.id, checked);
                        }}
                        aria-label={`设为公开 ${agent.name}`}
                      />,
                      <Dropdown
                        key="actions"
                        menu={{ items: getActionMenuItems(agent) }}
                        placement="bottomRight"
                        trigger={['click']}
                      >
                        <Button
                          type="text"
                          icon={<MoreOutlined />}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`编辑 ${agent.name}`}
                        />
                      </Dropdown>,
                    ]}
                  >
                    <Card.Meta
                      title={agent.name}
                      description={
                        <div>
                          <Text type="secondary" ellipsis>
                            {agent.description}
                          </Text>
                          <div style={{ marginTop: '8px' }}>
                            <Space>
                              <Text type="secondary">{agent.platform}</Text>
                              <Text type="secondary">•</Text>
                              <Text type="secondary">
                                {agent.lastUpdated
                                  ? new Date(
                                      agent.lastUpdated
                                    ).toLocaleDateString('zh-CN')
                                  : '未知'}
                              </Text>
                            </Space>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* Delete Confirmation Modal */}
          <Modal
            title="确认删除"
            open={deleteModalVisible}
            onOk={confirmDelete}
            onCancel={cancelDelete}
            okText="确定"
            cancelText="取消"
            okType="danger"
          >
            <p>确定要删除 "{agentToDelete?.name}" 吗？此操作不可撤销。</p>
          </Modal>
        </div>
      </Content>
    </MainLayout>
  );
};

export default Agents;
