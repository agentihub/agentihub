import React from 'react';
import { Form, Input } from 'antd';
import type { User } from '@/context/AuthContext';
import type { AgentFormData } from '@/types/agent';
import { OwnerField } from './OwnerField';

interface GeneralInfoSectionProps {
  user: User | null;
  formData: AgentFormData;
}

export const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({
  user,
  formData,
}) => {
  return (
    <>
      <OwnerField user={user} />

      <div className="text-sm text-gray-700 -mt-2">
        优秀的 Agent 名称应当简短、易记。
      </div>

      <div className="mt-6 mb-2">
        <label className="block text-sm font-bold">描述</label>
      </div>
      <Form.Item name="description" className=" mb-0">
        <Input className="" maxLength={350} />
      </Form.Item>
      <div className="text-[12.4px] text-[#8c999e] text-right mt-1 leading-[15px]">
        {(formData.description || '').length} / 350 字符
      </div>
    </>
  );
};
