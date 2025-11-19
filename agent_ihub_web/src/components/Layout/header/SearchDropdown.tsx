import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, App } from 'antd';
import type { InputRef } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  SearchOutlined,
  // RobotOutlined,
  // InfoCircleOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { agentService } from '../../../services/agentService';
import { userService } from '../../../services/userService';
import './SearchDropdown.css';

interface SearchDropdownProps {
  visible: boolean;
  onClose: () => void;
  onSearch?: (query: string) => void;
  initialQuery?: string;
}

interface SearchSuggestion {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  visible,
  onClose,
  onSearch,
  initialQuery,
}) => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<InputRef>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchSuggestions: SearchSuggestion[] = [
    // {
    //   id: 'copilot',
    //   title: 'Chat with Copilot',
    //   description: '与 AI 助手对话',
    //   icon: <RobotOutlined />,
    //   action: () => {
    //     console.log('Chat with Copilot clicked');
    //     onClose();
    //   },
    // },
  ];

  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
      setSelectedIndex(-1);
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setSearchQuery(initialQuery || '');
    }
  }, [initialQuery, visible]);

  // 处理搜索API调用
  const handleSearchWithAPIs = async (query: string) => {
    try {
      // 显示加载消息
      message.loading('正在搜索...', 0);

      // 并行调用两个API
      await Promise.all([
        agentService.getPublicAgents({
          pageNum: 1,
          pageSize: 10,
          search: query,
        }),
        userService.listUsers({
          pageNum: 1,
          pageSize: 10,
          content: query,
        }),
      ]);

      // 隐藏加载消息
      message.destroy();

      // 关闭下拉框
      onClose();

      // 跳转到搜索结果页面，传递搜索参数
      navigate(`/search?q=${encodeURIComponent(query)}`);

      // 如果有onSearch回调，也调用它
      if (onSearch) {
        onSearch(query);
      }
    } catch (error) {
      // 隐藏加载消息
      message.destroy();

      console.error('搜索失败:', error);
      message.error('搜索失败，请稍后重试');

      // 即使API调用失败，也跳转到搜索结果页面
      onClose();
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!visible) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchSuggestions.length) {
          searchSuggestions[selectedIndex].action();
        } else if (searchQuery.trim()) {
          // 有搜索内容时，调用两个API并跳转到搜索结果页
          handleSearchWithAPIs(searchQuery);
        } else {
          // 搜索框为空时，跳转到 SearchEmpty 页面
          onClose(); // 先关闭下拉框
          navigate('/search?q='); // 跳转到带空q参数的路由
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        visible
      ) {
        onClose();
      }
    };
    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <>
      <div className="search-dropdown-mask" onClick={onClose} />
      <div className="github-search-dropdown" ref={dropdownRef}>
        <div className="search-input-container">
          <Input
            ref={inputRef}
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            prefix={<SearchOutlined className="search-icon" />}
            suffix={
              <Button
                type="text"
                size="small"
                className="search-shortcut"
                onClick={() => onClose()}
              >
                ESC
              </Button>
            }
          />
        </div>

        <div className="search-suggestions">
          <div className="suggestion-items">
            {searchSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                className={`suggestion-item ${selectedIndex === index ? 'selected' : ''}`}
                onClick={suggestion.action}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="suggestion-icon">{suggestion.icon}</div>
                <div className="suggestion-content">
                  <div className="suggestion-title">{suggestion.title}</div>
                  <div className="suggestion-description">
                    {suggestion.description}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* <div className="search-footer">
            <a
              className="syntax-tips-link"
              onClick={() => {
                console.log('Search syntax tips clicked');
                onClose();
              }}
            >
              <InfoCircleOutlined />
              Search syntax tips
            </a>
          </div> */}
          <div className="flex items-center justify-center gap-2">
            <BellOutlined className="text-base text-blue-600" />
            <span className="text-base text-gray-600 font-normal">
              寻找 <span className="text-blue-600 font-semibold">agents</span>、
              <span className="text-blue-600 font-semibold">users</span>{' '}
              等更多内容
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchDropdown;
