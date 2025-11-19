import React from 'react';
import { Typography, Card } from 'antd';
import { ExclamationCircleOutlined, StarFilled } from '@ant-design/icons';

const { Text, Title } = Typography;

const Sidebar: React.FC = () => (
  <div className="px-4">
    {/* 赞助项目区域 */}
    <Card
      className="mb-4 border-gray-300 rounded-lg"
      bodyStyle={{ padding: '16px' }}
    >
      <div className="flex items-start gap-3">
        <div>
          <Title level={5} className="m-0 mb-2">
            <StarFilled className="text-yellow-500 mt-0.5" />
            {''} 收藏你喜欢的 Agent
          </Title>
          <Text type="secondary" className="text-sm block mb-3 text-gray-600">
            通过收藏 Agent，你可以随时关注感兴趣的项目，为开发者打
            call，一起让社区更好！
          </Text>
        </div>
      </div>
    </Card>

    {/* 搜索反馈区域 */}
    <Card
      className="mb-4 border-gray-300 rounded-lg"
      bodyStyle={{ padding: '16px' }}
    >
      <div>
        <Text type="secondary" className="text-sm block mb-2 text-gray-600">
          <ExclamationCircleOutlined className="text-yellow-500 mt-0.5" />
          {''} 我们正在努力让搜索结果更准确、更相关
        </Text>
        {/* <Button type="link" className="p-0">
          Give feedback
        </Button> */}
      </div>
    </Card>
  </div>
);

export default Sidebar;
