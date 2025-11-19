import React from 'react';
import { RepoHeader } from '../index';
import type { ForkDTO } from '@/api/types.gen';

interface RepoHeaderWrapperProps {
  ownerName: string;
  agentName: string;
  isPublic: boolean;
  stars: number;
  forks: number;
  watchers: number;
  isStarred: boolean;
  forkInfo?: ForkDTO;
  onStar: () => void;
  onFork: () => void;
}

const RepoHeaderWrapper: React.FC<RepoHeaderWrapperProps> = ({
  ownerName,
  agentName,
  isPublic,
  stars,
  forks,
  forkInfo,
  watchers,
  isStarred,
  onStar,
  onFork,
}) => {
  return (
    <header className="max-w-[1280px] w-full mx-auto pb-4">
      <RepoHeader
        ownerName={ownerName}
        agentName={agentName}
        isPublic={isPublic}
        stars={stars}
        forks={forks}
        watchers={watchers}
        isStarred={isStarred}
        forkInfo={forkInfo}
        onStar={onStar}
        onFork={onFork}
      />
    </header>
  );
};

export default RepoHeaderWrapper;
