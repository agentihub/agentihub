import React from 'react';
import { useLocation } from 'react-router-dom';
import SearchEmpty from './SearchEmpty';
import SearchFilter from './SearchFilter';

const SearchRouter: React.FC = () => {
  const location = useLocation();

  // 检查是否有搜索查询参数
  const urlParams = new URLSearchParams(location.search);
  const searchQuery = urlParams.get('q');

  // 如果没有搜索查询或查询为空（包括q=的情况），显示空状态页面
  if (!searchQuery || searchQuery.trim() === '') {
    return <SearchEmpty />;
  }

  // 有搜索查询时，显示过滤页面
  return <SearchFilter />;
};

export default SearchRouter;
