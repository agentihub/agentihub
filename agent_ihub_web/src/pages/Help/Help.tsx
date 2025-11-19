import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Input,
  Card,
  Row,
  Col,
  Typography,
  List,
  Space,
  Tag,
  Divider,
  Collapse,
  Button,
  Empty,
} from 'antd';
import {
  SearchOutlined,
  RocketOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  StarOutlined,
  UserOutlined,
  BookOutlined,
  BulbOutlined,
  RightOutlined,
  MailOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import MainLayout from '../../components/Layout/MainLayout';
import './Help.css';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface HelpCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  articles: HelpArticle[];
}

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  views: number;
  tags: string[];
  lastUpdated: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const Help: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<HelpCategory[]>(
    []
  );

  // Mock help data
  const helpCategories: HelpCategory[] = [
    {
      id: 'quick-start',
      title: '快速开始',
      icon: <RocketOutlined style={{ color: '#52c41a' }} />,
      description: '了解 Agent iHub 的基本功能，快速上手',
      articles: [
        {
          id: 'first-agent',
          title: '如何创建第一个 Agent',
          description: '详细指南教您创建和配置您的第一个 AI Agent',
          views: 1250,
          tags: ['入门', 'Agent'],
          lastUpdated: '2024-07-01',
        },
        {
          id: 'platform-intro',
          title: '平台功能介绍',
          description: '了解 Agent iHub 的核心功能和特性',
          views: 980,
          tags: ['介绍', '功能'],
          lastUpdated: '2024-06-30',
        },
      ],
    },
    {
      id: 'agent-management',
      title: 'Agent 管理',
      icon: <SettingOutlined style={{ color: '#1890ff' }} />,
      description: '学习如何管理、配置和优化您的 Agent',
      articles: [
        {
          id: 'agent-config',
          title: 'Agent 配置最佳实践',
          description: '了解如何优化 Agent 配置以获得最佳性能',
          views: 856,
          tags: ['配置', '最佳实践'],
          lastUpdated: '2024-06-29',
        },
        {
          id: 'version-control',
          title: 'Agent 版本管理',
          description: '学习如何管理 Agent 的不同版本',
          views: 623,
          tags: ['版本', '管理'],
          lastUpdated: '2024-06-28',
        },
      ],
    },
    {
      id: 'account-settings',
      title: '账户设置',
      icon: <UserOutlined style={{ color: '#722ed1' }} />,
      description: '管理您的账户设置和偏好配置',
      articles: [
        {
          id: 'profile-setup',
          title: '完善个人概览',
          description: '设置头像、简介等个人信息',
          views: 445,
          tags: ['资料', '设置'],
          lastUpdated: '2024-06-27',
        },
        {
          id: 'security-settings',
          title: '账户安全设置',
          description: '配置密码、两步验证等安全功能',
          views: 512,
          tags: ['安全', '设置'],
          lastUpdated: '2024-06-26',
        },
      ],
    },
    {
      id: 'faq',
      title: '常见问题',
      icon: <QuestionCircleOutlined style={{ color: '#faad14' }} />,
      description: '查找常见问题的解答',
      articles: [
        {
          id: 'common-issues',
          title: '常见问题解答',
          description: '解决使用过程中遇到的常见问题',
          views: 1890,
          tags: ['FAQ', '问题'],
          lastUpdated: '2024-07-01',
        },
        {
          id: 'troubleshooting',
          title: '故障排除指南',
          description: '诊断和解决技术问题',
          views: 734,
          tags: ['故障', '排除'],
          lastUpdated: '2024-06-30',
        },
      ],
    },
  ];

  const faqs: FAQ[] = [
    {
      id: '1',
      question: '如何创建我的第一个 Agent？',
      answer:
        '点击右上角的"创建 Agent"按钮，选择模板或从头开始创建，填写基本信息后即可创建成功。',
      category: 'quick-start',
    },
    {
      id: '2',
      question: 'Agent 可以在哪些平台使用？',
      answer: '目前支持 LiteAgent、Dify、Coze 等主流平台，后续会支持更多平台。',
      category: 'agent-management',
    },
    {
      id: '3',
      question: '如何让我的 Agent 被更多人发现？',
      answer: '设置为公开 Agent，添加详细描述和标签，提供完整的使用说明。',
      category: 'agent-management',
    },
    {
      id: '4',
      question: '忘记密码怎么办？',
      answer: '在登录页面点击"忘记密码"，输入邮箱后会收到重置密码的邮件。',
      category: 'account-settings',
    },
  ];

  const popularArticles = helpCategories
    .flatMap((category) => category.articles)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  React.useEffect(() => {
    if (searchTerm) {
      const filtered = helpCategories
        .map((category) => ({
          ...category,
          articles: category.articles.filter(
            (article) =>
              article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              article.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              article.tags.some((tag) =>
                tag.toLowerCase().includes(searchTerm.toLowerCase())
              )
          ),
        }))
        .filter((category) => category.articles.length > 0);
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(helpCategories);
    }
  }, [searchTerm]);

  const handleArticleClick = (articleId: string) => {
    navigate(`/help/article/${articleId}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/help/category/${categoryId}`);
  };

  return (
    <MainLayout>
      <div className="help-page">
        {/* Hero Section */}
        <div className="help-hero">
          <Title level={1}>帮助中心</Title>
          <Paragraph className="help-subtitle">
            找到您需要的答案，快速解决问题
          </Paragraph>

          <div className="help-search">
            <Input
              size="large"
              placeholder="搜索帮助文档..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: 600 }}
            />
          </div>
        </div>

        <Row gutter={[24, 24]}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
            {/* Help Categories */}
            <div className="help-categories">
              <Title level={3}>帮助分类</Title>
              <Row gutter={[16, 16]}>
                {filteredCategories.map((category) => (
                  <Col xs={24} sm={12} key={category.id}>
                    <Card
                      hoverable
                      className="category-card"
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      <div className="category-header">
                        <Space>
                          {category.icon}
                          <Title level={4} style={{ margin: 0 }}>
                            {category.title}
                          </Title>
                        </Space>
                      </div>
                      <Paragraph
                        type="secondary"
                        className="category-description"
                      >
                        {category.description}
                      </Paragraph>
                      <List
                        size="small"
                        dataSource={category.articles.slice(0, 3)}
                        renderItem={(article) => (
                          <List.Item
                            className="article-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArticleClick(article.id);
                            }}
                          >
                            <div className="article-info">
                              <Text strong>{article.title}</Text>
                              <div className="article-meta">
                                <Space size={4}>
                                  {article.tags.map((tag) => (
                                    <Tag key={tag}>{tag}</Tag>
                                  ))}
                                </Space>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {article.views} 浏览
                                </Text>
                              </div>
                            </div>
                            <RightOutlined />
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            {/* FAQ Section */}
            <div className="help-faq">
              <Title level={3}>常见问题</Title>
              <Collapse>
                {faqs.map((faq) => (
                  <Panel header={faq.question} key={faq.id}>
                    <Text>{faq.answer}</Text>
                  </Panel>
                ))}
              </Collapse>
            </div>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            {/* Popular Articles */}
            <Card title="热门文章" className="help-sidebar-card">
              <List
                size="small"
                dataSource={popularArticles}
                renderItem={(article, index) => (
                  <List.Item
                    className="popular-article-item"
                    onClick={() => handleArticleClick(article.id)}
                  >
                    <div className="popular-article-content">
                      <div className="popular-article-rank">{index + 1}</div>
                      <div className="popular-article-info">
                        <Text strong>{article.title}</Text>
                        <div className="popular-article-meta">
                          <Space size={4}>
                            <StarOutlined
                              style={{ color: '#faad14', fontSize: 12 }}
                            />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {article.views} 浏览
                            </Text>
                          </Space>
                        </div>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </Card>

            {/* Contact Support */}
            <Card title="联系我们" className="help-sidebar-card">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="default"
                  icon={<MessageOutlined />}
                  block
                  onClick={() => navigate('/contact')}
                >
                  在线客服
                </Button>
                <Button
                  type="default"
                  icon={<MailOutlined />}
                  block
                  onClick={() =>
                    (window.location.href = 'mailto:support@agentihub.com')
                  }
                >
                  邮件支持
                </Button>
                <Divider style={{ margin: '12px 0' }} />
                <div className="contact-info">
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    工作时间：周一至周五 9:00-18:00
                  </Text>
                </div>
              </Space>
            </Card>

            {/* Quick Links */}
            <Card title="快速链接" className="help-sidebar-card">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="text"
                  icon={<BookOutlined />}
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => navigate('/docs')}
                >
                  开发文档
                </Button>
                <Button
                  type="text"
                  icon={<BulbOutlined />}
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => navigate('/tutorials')}
                >
                  教程中心
                </Button>
                <Button
                  type="text"
                  icon={<MessageOutlined />}
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => navigate('/community')}
                >
                  社区论坛
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Search Results */}
        {searchTerm && filteredCategories.length === 0 && (
          <div className="help-no-results">
            <Empty
              description={`没有找到包含 "${searchTerm}" 的帮助文档`}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={() => setSearchTerm('')}>
                清除搜索
              </Button>
            </Empty>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Help;
