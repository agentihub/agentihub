import React, { useState } from 'react';
import { Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

export interface FilterValues {
  platform?: string;
  sortBy?: string;
  tags?: string[];
}

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onFilterChange?: (filters: FilterValues) => void;
  defaultPlatform?: string;
  defaultSortBy?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = '查找 Agent...',
  onSearch,
  onFilterChange,
  defaultPlatform,
  defaultSortBy = 'updateTime',
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [platform] = useState<string | undefined>(defaultPlatform);
  const [sortBy, setSortBy] = useState<string>(defaultSortBy);

  // 搜索处理
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
  };

  // 平台筛选处理
  // const handlePlatformChange = (value: string | undefined) => {
  //   setPlatform(value);
  //   if (onFilterChange) {
  //     onFilterChange({
  //       platform: value,
  //       sortBy,
  //     });
  //   }
  // };

  // 排序处理
  const handleSortChange = (value: string) => {
    setSortBy(value);
    if (onFilterChange) {
      onFilterChange({
        platform,
        sortBy: value,
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2 w-full">
      {/* 搜索输入框 */}
      <div className="flex-1 min-w-0">
        <Input
          className="h-8 rounded-md border-[#d0d7de] hover:border-[#8c959f] focus:border-[#0969da] focus:shadow-[0_0_0_3px_rgba(9,105,218,0.1)] transition-all"
          placeholder={placeholder}
          value={searchValue}
          onChange={handleSearchChange}
          prefix={<SearchOutlined className="text-[#656d76] text-sm" />}
          allowClear
          onPressEnter={() => onSearch(searchValue)}
        />
      </div>

      {/* 筛选器区域 */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Type 筛选器 */}
        {/* <Select
          className="w-[120px] h-8"
          placeholder="类型"
          value={platform}
          onChange={handlePlatformChange}
          allowClear
          popupClassName="rounded-md shadow-lg"
          options={[
            { label: '全部', value: undefined },
            { label: 'LiteAgent', value: 'LiteAgent' },
            { label: 'Dify', value: 'Dify' },
            { label: 'Coze', value: 'Coze' },
            { label: '自定义', value: 'Custom' },
          ]}
        /> */}

        {/* Sort 筛选器 */}
        <Select
          className="w-[130px] h-8"
          placeholder="排序"
          value={sortBy}
          onChange={handleSortChange}
          popupClassName="rounded-md shadow-lg"
          options={[
            { label: '最近更新', value: 'updateTime' },
            { label: '最近创建', value: 'createTime' },
            { label: 'Stars', value: 'stars' },
            { label: 'Forks', value: 'forks' },
          ]}
        />
      </div>
    </div>
  );
};

export default SearchBar;
