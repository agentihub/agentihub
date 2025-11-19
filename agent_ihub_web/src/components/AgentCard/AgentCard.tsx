import React, { memo, useCallback } from 'react';
import { StarOutlined, ForkOutlined } from '@ant-design/icons';
import { Tag } from 'antd';

export interface AgentCardProps {
  id?: string;
  name: string;
  description?: string;
  platform: string;
  author: string;
  stars?: number;
  forks?: number;
  updateTime?: string;
  onClick?: (id: string, name: string, author: string) => void;
  visibility?: 'public' | 'private';
}

const AgentCard: React.FC<AgentCardProps> = memo(
  ({
    id,
    name,
    description,
    platform,
    author,
    stars = 0,
    forks = 0,
    updateTime,
    onClick,
    visibility,
  }) => {
    const handleCardClick = useCallback(() => {
      onClick?.(id || '', name, author);
    }, [onClick, id, name, author]);

    return (
      <div
        className="group relative flex flex-col rounded-md border border-[#d1d9e0] bg-white p-4 transition-all duration-200 cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Header with title and platform tag */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="flex flex-1 items-center gap-2 text-base font-semibold leading-snug text-[#0969da]">
            <span className="min-w-0 flex-1 line-clamp-1">
              {name}
              {visibility && (
                <Tag className="shrink-0 !m-0 ml-2" color={'default'}>
                  {visibility}
                </Tag>
              )}
            </span>
          </h3>
          <span className="shrink-0 items-center rounded-full border border-[#d1d9e0] bg-[#f6f8fa] px-2.5 py-0.5 text-xs font-medium text-[#656d76]">
            {platform}
          </span>
        </div>

        {/* Description */}
        <p className="mb-4 min-h-[42px] flex-1 text-sm leading-relaxed text-[#656d76] line-clamp-2">
          {description || '暂无描述'}
        </p>

        {/* Footer with author, stars/forks, and update time */}
        <div className="flex items-center justify-between text-xs text-[#656d76]">
          <span className="font-medium">
            by <span className="text-[#0969da] hover:underline">@{author}</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[#656d76]">
              <StarOutlined className="align-middle" />
              <span>{stars}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[#656d76]">
              <ForkOutlined className="align-middle" />
              <span>{forks}</span>
            </span>
            {updateTime && <span className="text-[#6e7781]">{updateTime}</span>}
          </div>
        </div>
      </div>
    );
  }
);

AgentCard.displayName = 'AgentCard';

export default AgentCard;
