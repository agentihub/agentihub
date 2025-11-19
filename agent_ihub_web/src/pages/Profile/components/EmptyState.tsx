import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  StarOutlined,
  FileAddOutlined,
  UsergroupAddOutlined,
  UserAddOutlined,
} from '@ant-design/icons';

export type EmptyStateType =
  | 'no-agents'
  | 'no-actions'
  | 'no-starred-agents'
  | 'no-search-results'
  | 'no-followers'
  | 'no-following';

interface EmptyStateProps {
  type: EmptyStateType;
  isOwnProfile?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  isOwnProfile = false,
}) => {
  const navigate = useNavigate();

  const getConfig = (isOwn: boolean) => {
    switch (type) {
      case 'no-agents':
        return isOwn
          ? {
              icon: (
                <FileAddOutlined className="text-5xl text-[#656d76] mb-4" />
              ),
              title: '创建你的第一个 Agent',
              description: 'Agents 让你更容易组织和展示你创建的智能助手。',
              actionText: '创建你的第一个 Agent',
              actionPath: '/new',
            }
          : {
              icon: (
                <FileAddOutlined className="text-5xl text-[#656d76] mb-4" />
              ),
              title: '暂无公开的 Agent',
              description: null,
              actionText: null,
              actionPath: null,
            };
      case 'no-actions':
        return isOwn
          ? {
              icon: null,
              title: '暂无操作记录',
              description:
                '当你进行创建、收藏、关注等操作时，这里会显示你的操作记录。',
              actionText: null,
              actionPath: null,
            }
          : {
              icon: null,
              title: '暂无操作记录',
              description: null,
              actionText: null,
              actionPath: null,
            };
      case 'no-starred-agents':
        return isOwn
          ? {
              icon: <StarOutlined className="text-5xl text-[#656d76] mb-4" />,
              title: '创建你的第一个收藏列表',
              description:
                '收藏列表让你更容易组织和整理你收藏的 Agent。当你收藏 Agent 时，它们会显示在这里。你可以用搜索按钮来查找你想查找的 Agent。也可以进入Explore页面来查找你感兴趣的Agent。',
              actionPath: '/explore',
              actionText: '进入 Explore 页面',
            }
          : {
              icon: <StarOutlined className="text-5xl text-[#656d76] mb-4" />,
              title: '暂无收藏的 Agent',
              description: null,
              actionText: null,
              actionPath: null,
            };
      case 'no-search-results':
        return {
          icon: null,
          title: '未找到匹配的 Agent',
          description: '请尝试调整搜索条件或筛选选项。',
          actionText: null,
          actionPath: null,
        };
      case 'no-followers':
        return isOwn
          ? {
              icon: (
                <UsergroupAddOutlined className="text-5xl text-[#656d76] mb-4" />
              ),
              title: '暂无粉丝',
              description: '当有用户关注你时，他们会显示在这里。',
              actionText: null,
              actionPath: null,
            }
          : {
              icon: (
                <UsergroupAddOutlined className="text-5xl text-[#656d76] mb-4" />
              ),
              title: '暂无粉丝',
              description: null,
              actionText: null,
              actionPath: null,
            };
      case 'no-following':
        return isOwn
          ? {
              icon: (
                <UserAddOutlined className="text-5xl text-[#656d76] mb-4" />
              ),
              title: '暂无关注的用户',
              description: '你可以在 Explore 页面发现并关注感兴趣的用户。',
              actionText: '进入 Explore 页面',
              actionPath: '/explore',
            }
          : {
              icon: (
                <UserAddOutlined className="text-5xl text-[#656d76] mb-4" />
              ),
              title: '暂无关注的用户',
              description: null,
              actionText: null,
              actionPath: null,
            };
      default:
        return {
          icon: null,
          title: '暂无数据',
          description: '',
          actionText: null,
          actionPath: null,
        };
    }
  };

  const config = getConfig(isOwnProfile);

  const handleActionClick = () => {
    if (config.actionPath) {
      navigate(config.actionPath);
    }
  };

  return (
    <div className="border border-[#d0d7de] rounded-lg bg-white py-16 px-6">
      <div className="flex flex-col items-center text-center max-w-md mx-auto">
        {config.icon}
        <h3 className="text-xl font-semibold text-[#24292f] mb-2">
          {config.title}
        </h3>
        {(config.description || config.actionText) && (
          <p className="text-sm text-[#656d76] mb-4">
            {config.description}
            {config.actionText && (
              <button
                onClick={handleActionClick}
                className="text-[#0969da] hover:text-[#0860ca] hover:underline ml-1 bg-transparent border-0 p-0 cursor-pointer"
              >
                {config.actionText}
              </button>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
