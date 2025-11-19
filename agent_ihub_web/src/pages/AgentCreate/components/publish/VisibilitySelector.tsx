import React from 'react';
import { Select } from 'antd';
import { EyeOutlined, LockOutlined } from '@ant-design/icons';

const { Option } = Select;

interface VisibilitySelectorProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const VisibilitySelector: React.FC<VisibilitySelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      className="w-30 [&_.ant-select-selector]:hover:!bg-[#f6f8fa] [&_.ant-select-selector]:hover:!border-[#d1d9e0]"
      dropdownStyle={{ minWidth: '300px' }}
      optionLabelProp="label"
    >
      <Option
        value={true}
        label={
          <span className="flex items-center">
            <EyeOutlined className="mr-2" />
            公开
          </span>
        }
      >
        <div className="flex items-start py-2">
          <EyeOutlined className="text-base mt-0.5 mr-3 text-[#656d76]" />
          <div className="flex-1">
            <div className="font-semibold text-sm text-[#24292f] mb-1">
              公开
            </div>
            <div className="text-xs text-[#656d76] leading-relaxed">
              任何人都可以查看此 Agent。
            </div>
          </div>
        </div>
      </Option>
      <Option
        value={false}
        label={
          <span className="flex items-center">
            <LockOutlined className="mr-2" />
            私有
          </span>
        }
      >
        <div className="flex items-start py-2">
          <LockOutlined className="text-base mt-0.5 mr-3 text-[#656d76]" />
          <div className="flex-1">
            <div className="font-semibold text-sm text-[#24292f] mb-1">
              私有
            </div>
            <div className="text-xs text-[#656d76] leading-relaxed">
              仅你指定的成员可以查看并协作此 Agent。
            </div>
          </div>
        </div>
      </Option>
    </Select>
  );
};
