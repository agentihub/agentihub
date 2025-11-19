import React, { type ReactNode } from 'react';

interface StepContainerProps {
  stepNumber: number;
  title: string;
  children: ReactNode;
  isLast?: boolean;
}

export const StepContainer: React.FC<StepContainerProps> = ({
  stepNumber,
  title,
  children,
  isLast = false,
}) => {
  return (
    <div className="flex relative">
      {!isLast && (
        <div className="absolute left-0 bottom-0 w-[2px] h-full bg-gray-200" />
      )}
      <div className="relative z-1">
        <span
          className="inline-flex items-center justify-center w-8 h-8 -ml-4 mr-2 rounded-full bg-gray-100"
          style={{ border: '1px solid #fff' }}
        >
          {stepNumber}
        </span>
      </div>

      <div className="flex-1">
        <h2 className="text-lg">{title}</h2>
        {children}
      </div>
    </div>
  );
};
