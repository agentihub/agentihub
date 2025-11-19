import React, { useState } from 'react';
import { Input } from 'antd';
import StepActions from '../StepActions';

const { TextArea } = Input;

interface DescribeSectionProps {
  onSubmit: (requirement: string) => void;
}

const DescribeSection: React.FC<DescribeSectionProps> = ({ onSubmit }) => {
  const [requirement, setRequirement] = useState('');

  const handleSubmit = () => {
    if (requirement.trim()) {
      onSubmit(requirement.trim());
    }
  };

  return (
    <div className="min-h-[calc(100vh-250px)] flex flex-col">
      {/* 主内容区 */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-3xl mx-auto text-center py-12 px-5">
          <h1 className="text-3xl font-semibold mb-3 text-gray-900">
            让我们创建一个 Agent
          </h1>
          <p className="text-base text-gray-600 mb-8">
            请描述你的需求。是要实现什么目标，还是完成什么任务，亦或者是...
          </p>
          <div className="flex flex-col gap-4">
            <TextArea
              className="!text-base !rounded-md !p-3 !border-gray-300 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-100"
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="我要..."
              autoSize={{ minRows: 4, maxRows: 10 }}
            />
          </div>
        </div>
      </div>

      {/* 底部操作按钮 */}
      <StepActions
        showBack={false}
        nextText="开始"
        nextDisabled={!requirement.trim()}
        onNext={handleSubmit}
      />
    </div>
  );
};

export default DescribeSection;
