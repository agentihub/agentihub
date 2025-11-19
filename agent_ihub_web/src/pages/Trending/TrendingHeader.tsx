import React from 'react';

export interface TrendingHeaderProps {
  type: 'repositories' | 'developers';
}

const TrendingHeader: React.FC<TrendingHeaderProps> = ({ type }) => {
  const getTitle = () => {
    return '热门趋势';
  };

  const getDescription = () => {
    switch (type) {
      case 'repositories':
        return '看看 Agent 社区今天都在关注哪些项目。';
      case 'developers':
        return '这些开发者正在打造最受欢迎的工具。';
      default:
        return '';
    }
  };

  return (
    <div className="text-center bg-[#f6f8fa] w-full h-[200px] flex flex-col items-center justify-center gap-2 border-b border-[#d0d7de] mb-10 md:h-[180px] md:mb-8 sm:h-[160px] sm:mb-6">
      <h1 className="text-[35px] font-semibold text-[#24292f] m-0 leading-tight md:text-[28px] sm:text-[24px]">
        {getTitle()}
      </h1>
      <p className="text-[18px] text-[#57606a] m-0 leading-relaxed md:text-[16px] sm:text-[14px]">
        {getDescription()}
      </p>
    </div>
  );
};

export default TrendingHeader;
