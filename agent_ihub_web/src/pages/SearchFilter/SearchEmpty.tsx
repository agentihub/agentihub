import React, { useState, useEffect } from 'react';
import { Input, Typography } from 'antd';
import { SearchOutlined, BellOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';

const { Title, Text } = Typography;

const SearchEmpty: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  // 从 URL 参数获取初始搜索词
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const queryFromUrl = urlParams.get('q') || '';
    setSearchQuery(queryFromUrl);
  }, [location.search]); // 恢复依赖，确保URL变化时更新输入框

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-10 px-5">
        <div className="text-center max-w-2xl w-full">
          <Title
            level={1}
            className="text-5xl md:text-4xl font-semibold text-gray-800 mb-10"
          >
            Agent ihub
          </Title>

          <div className="mb-10 max-w-2xl mx-auto">
            <Input
              size="large"
              placeholder="搜索 Agent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              prefix={<SearchOutlined />}
              className="w-full h-12 text-lg rounded-xl border-2 border-gray-300 transition-all duration-200 hover:border-gray-500 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(9,105,218,0.1)]"
            />
          </div>

          <div className="text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2">
              <BellOutlined className="text-base text-blue-600" />
              <Text className="text-base text-gray-600 font-normal">
                寻找 <span className="text-blue-600 font-semibold">agents</span>
                、<span className="text-blue-600 font-semibold">users</span>{' '}
                等更多内容
              </Text>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SearchEmpty;
