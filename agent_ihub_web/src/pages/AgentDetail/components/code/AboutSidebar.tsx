import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheckIcon,
  StarIcon,
  RepoForkedIcon,
} from '@primer/octicons-react';
import type { AgentLicenseDTO } from '@/api';

interface AboutSidebarProps {
  description?: string;
  tags?: string[];
  license?: AgentLicenseDTO;
  stars?: number;
  forks?: number;
}

const AboutSidebar: React.FC<AboutSidebarProps> = ({
  description,
  tags = [],
  license,
  stars = 0,
  forks = 0,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* About Section */}
      <div className="pb-4 border-b" style={{ borderBottomColor: '#D0D7DE' }}>
        <h2
          className="text-base font-semibold mb-3"
          style={{ color: '#24292F' }}
        >
          简介
        </h2>

        {description && (
          <p
            className="text-sm mb-3 leading-relaxed line-clamp-4 break-words"
            style={{ color: '#24292F' }}
          >
            {description}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs font-medium rounded cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: 'rgba(9, 105, 218, 0.1)',
                  color: '#0969DA',
                  borderRadius: '6px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* License */}
        <div className="mb-2">
          {license?.type ? (
            <a
              href={license?.url}
              className="inline-flex items-center gap-1.5 text-sm font-semibold no-underline"
              style={{ color: '#0969DA', cursor: 'default' }}
            >
              <ShieldCheckIcon size={16} />
              {license.type}
            </a>
          ) : (
            <div
              className="inline-flex items-center gap-1.5 text-sm font-medium"
              style={{ color: '#57606A' }}
            >
              <ShieldCheckIcon size={16} />
              暂无证书
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-2">
          <Link
            to="stargazers"
            className="flex items-center gap-1.5 text-sm font-semibold hover:underline no-underline"
            style={{ color: '#0969DA' }}
          >
            <StarIcon size={16} className="text-gray-600" />
            {stars} stars
          </Link>

          <Link
            to="forks"
            className="flex items-center gap-1.5 text-sm font-semibold hover:underline no-underline"
            style={{ color: '#0969DA' }}
          >
            <RepoForkedIcon size={16} className="text-gray-600" />
            {forks} forks
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutSidebar;
