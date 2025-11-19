import React from 'react';
import { Button } from 'antd';
import { StarIcon, RepoForkedIcon } from '@primer/octicons-react';
import { Link } from 'react-router-dom';
import type { ForkDTO } from '@/api/types.gen';
import { RobotOutlined } from '@ant-design/icons';

interface RepoHeaderProps {
  ownerName: string;
  agentName: string;
  isPublic: boolean;
  stars: number;
  forks: number;
  watchers?: number;
  isStarred: boolean;
  forkInfo?: ForkDTO;
  onStar: () => void;
  onFork: () => void;
}

const RepoHeader: React.FC<RepoHeaderProps> = ({
  ownerName,
  agentName,
  isPublic,
  stars,
  forks,
  isStarred,
  forkInfo,
  onStar,
  onFork,
}) => {
  // 格式化数字显示（如 3600 -> 3.6k）
  const formatCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="border-b border-[#D0D7DE] pb-5">
      <div className="flex items-center justify-between pt-4 gap-3 flex-wrap">
        {/* 左侧：仓库名称和标签 */}
        <div className="flex items-center gap-2 flex-1">
          <RobotOutlined size={16} className="text-gray-600" />
          <div className="flex items-center gap-1 flex-wrap">
            <a
              href={`/${ownerName}`}
              className="text-xl no-underline hover:underline"
              style={{ color: '#0969DA' }}
            >
              {ownerName}
            </a>
            <span className="text-xl" style={{ color: '#57606A' }}>
              /
            </span>
            <span
              className="text-xl font-semibold"
              style={{ color: '#0969DA' }}
            >
              {agentName}
            </span>
            <span
              className="ml-2 px-2 py-0.5 text-xs font-medium border rounded-xl"
              style={{
                borderColor: '#D0D7DE',
                color: '#57606A',
              }}
            >
              {isPublic ? 'public' : 'private'}
            </span>
          </div>
        </div>

        {/* 右侧：操作按钮组 */}
        <div className="flex items-center gap-2 flex-none">
          {/* Fork 按钮 */}
          <div className="flex items-center">
            <Button
              size="small"
              icon={<RepoForkedIcon size={16} />}
              onClick={onFork}
              style={{
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                borderColor: '#D0D7DE',
                borderRadius: '6px 0 0 6px',
              }}
            >
              Fork
            </Button>
            <Button
              size="small"
              style={{
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderLeft: 'none',
                paddingLeft: '8px',
                paddingRight: '8px',
                minWidth: 'auto',
                borderColor: '#D0D7DE',
              }}
            >
              <span className="flex items-center gap-1 text-xs font-semibold">
                {formatCount(forks)}
              </span>
            </Button>
          </div>

          {/* Star 按钮 */}
          <div className="flex items-center">
            <Button
              size="small"
              icon={<StarIcon size={16} />}
              onClick={onStar}
              type={isStarred ? 'primary' : 'default'}
              style={{
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                borderColor: isStarred ? undefined : '#D0D7DE',
                borderRadius: '6px 0 0 6px',
              }}
            >
              {isStarred ? 'Starred' : 'Star'}
            </Button>
            <Button
              size="small"
              type={isStarred ? 'primary' : 'default'}
              style={{
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderLeft: 'none',
                paddingLeft: '8px',
                paddingRight: '8px',
                minWidth: 'auto',
                borderColor: isStarred ? undefined : '#D0D7DE',
              }}
            >
              <span className="flex items-center gap-1 text-xs font-semibold">
                {formatCount(stars)}
              </span>
            </Button>
          </div>
        </div>
      </div>
      {forkInfo && (
        <div className="pt-1 text-xs font-medium">
          Forked from{' '}
          <Link
            to={`/${forkInfo?.originalAgentAuthorName}/${forkInfo?.originalAgentName}`}
          >
            {forkInfo?.originalAgentAuthorName}/{forkInfo?.originalAgentName}
          </Link>
        </div>
      )}
    </div>
  );
};

export default RepoHeader;
