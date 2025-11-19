import React from 'react';
import { Typography, Empty, Spin, Card, Tag, Button } from 'antd';
import {
  FireOutlined,
  BulbOutlined,
  RobotOutlined,
  StarOutlined,
  ForkOutlined,
} from '@ant-design/icons';
import type { AgentDTO } from '../../../api/types.gen';

const { Title, Text, Paragraph } = Typography;

interface DashboardMainContentProps {
  loading: boolean;
  feedAgents: AgentDTO[];
  onCreateAgent: () => void;
  onAgentClick: (agent: AgentDTO) => void;
}

const DashboardMainContent: React.FC<DashboardMainContentProps> = ({
  loading,
  feedAgents,
  onCreateAgent,
  onAgentClick,
}) => {
  return (
    <main className="min-w-0 p-8 bg-white">
      {/* 区域标题 */}
      <div className="mb-6 pb-4 border-b-2 border-[#d0d7de]">
        <Title
          level={4}
          className="!m-0 !mb-2 !text-xl !font-semibold !text-gray-900 flex items-center gap-2"
        >
          <FireOutlined />
          首页概览
        </Title>
        <Text type="secondary" className="block text-sm mt-1">
          发现优质开源 Agents 项目
        </Text>
      </div>

      {/* AI助手卡片 */}
      <Card
        className="border border-[#d0d7de] rounded-lg shadow-sm mb-6 bg-gradient-to-br from-blue-50 to-white w-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
        bordered={false}
      >
        <div className="p-0">
          <div className="flex items-center gap-4">
            <BulbOutlined className="text-3xl text-green-600" />
            <div className="flex-1 flex flex-col gap-1">
              <Text strong>快速创建 Agent</Text>
              <Text type="secondary" className="!m-0">
                使用 AI 助手快速生成 Agent 配置，节省您的时间
              </Text>
            </div>
            <Button
              type="primary"
              onClick={onCreateAgent}
              className="bg-[#238636] border-[#238636] rounded-md font-medium hover:bg-[#2ea043] hover:border-[#2ea043]"
            >
              开始创建
            </Button>
          </div>
        </div>
      </Card>

      {/* Feed板块 */}
      <div className="border border-[#d0d7de] rounded-lg bg-white w-full shadow-sm">
        <div className="flex items-center gap-2 p-4 border-b border-[#d0d7de]">
          <FireOutlined className="text-base text-green-600" />
          <Title
            level={5}
            className="!m-0 !text-sm !font-semibold !text-gray-900"
          >
            热门 Agents
          </Title>
        </div>

        <Spin spinning={loading}>
          {feedAgents.length > 0 ? (
            <div className="p-0">
              {feedAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="p-4 border-b border-[#d0d7de] cursor-pointer transition-colors duration-200 hover:bg-[#f6f8fa] last:border-b-0"
                  onClick={() => onAgentClick(agent)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <RobotOutlined className="text-base text-gray-500" />
                    <div className="flex flex-col gap-0.5">
                      <Text strong className="text-sm text-blue-600">
                        {agent.name}
                      </Text>
                      <Text type="secondary" className="text-xs">
                        由 {agent.authorName || '匿名用户'}
                      </Text>
                    </div>
                  </div>

                  <Paragraph
                    className="text-sm text-gray-500 leading-6 mb-3"
                    ellipsis={{ rows: 2 }}
                  >
                    {agent.description || '暂无描述'}
                  </Paragraph>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-1.5 flex-wrap">
                      {agent.platform && (
                        <Tag className="!m-0 !text-xs !text-[#24292f] !bg-[#f6f8fa] !border-[#d0d7de] !rounded-full">
                          {agent.platform}
                        </Tag>
                      )}
                      {agent.tags &&
                        agent.tags.slice(0, 2).map((tag) => (
                          <Tag
                            key={tag}
                            className="!m-0 !text-xs !text-[#0969da] !bg-[#ddf4ff] !border-[#54aeff66] !rounded-full"
                          >
                            {tag}
                          </Tag>
                        ))}
                    </div>
                    <div className="flex gap-3 text-gray-500 text-xs">
                      <span className="flex items-center gap-1">
                        <StarOutlined /> {agent.stars || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <ForkOutlined /> {agent.forks || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !loading && (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无推荐"
                className="py-10"
              />
            )
          )}
        </Spin>
      </div>
    </main>
  );
};

export default DashboardMainContent;
