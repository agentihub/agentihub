import React, { type ReactNode } from 'react';

interface ConfigOptionProps {
  title: string;
  description: string | ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export const ConfigOption: React.FC<ConfigOptionProps> = ({
  title,
  description,
  required = false,
  className,
  children,
}) => {
  return (
    <div
      className={`flex justify-between items-start p-3 border border-gray-200 rounded-lg ${className}`}
    >
      <div>
        <label className="mb-1 block text-sm font-bold">
          {title} {required && <span>*</span>}
        </label>
        <div className="text-sm text-gray-700 mt-1">{description}</div>
      </div>
      {children}
    </div>
  );
};
