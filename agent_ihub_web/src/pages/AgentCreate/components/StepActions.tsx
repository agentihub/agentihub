import React from 'react';
import { Button } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';

interface StepActionsProps {
  onBack?: () => void;
  onNext?: () => void;
  nextText?: string;
  nextLoading?: boolean;
  nextDisabled?: boolean;
  showBack?: boolean;
  showNext?: boolean;
  backText?: string;
  className?: string;
}

/**
 * 统一的步骤导航按钮组件 - GitHub 风格
 * 提供一致的底部导航体验
 */
const StepActions: React.FC<StepActionsProps> = ({
  onBack,
  onNext,
  nextText = '下一步',
  nextLoading = false,
  nextDisabled = false,
  showBack = true,
  showNext = true,
  backText = '返回',
  className = '',
}) => {
  return (
    <div className={`border-t border-gray-200 mt-8 ${className}`}>
      <div className="max-w-screen-xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 左侧：返回按钮 */}
          <div>
            {showBack && onBack && (
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={onBack}
                className="!h-9 !px-4 !text-sm !font-medium !border-gray-300 hover:!bg-gray-100 hover:!border-gray-400"
              >
                {backText}
              </Button>
            )}
          </div>

          {/* 右侧：下一步/提交按钮 */}
          <div>
            {showNext && onNext && (
              <Button
                type="primary"
                icon={<ArrowRightOutlined />}
                iconPosition="end"
                onClick={onNext}
                loading={nextLoading}
                disabled={nextDisabled}
                className="!h-9 !px-5 !text-sm !font-semibold !bg-green-600 hover:!bg-green-700 !border-green-600 hover:!border-green-700 !shadow-sm"
              >
                {nextText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepActions;
