import React from 'react';
import { Form, Input, Avatar, Select } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { User } from '../../../../context/AuthContext';

interface OwnerFieldProps {
  user: User | null;
}

export const OwnerField: React.FC<OwnerFieldProps> = ({ user }) => {
  return (
    <div className="flex">
      <div>
        <label className="mb-1 block text-sm font-bold">
          Owner <span>*</span>
        </label>
        <div className="flex items-center">
          <Avatar
            src={user?.avatar}
            icon={!user?.avatar && <UserOutlined />}
            className="w-6 h-6 border-0"
          />
          <Select
            value={user?.userName || 'user'}
            className="ml-2 [&_.ant-select-selector]:!bg-[#f6f8fa] [&_.ant-select-selector]:!border-[#d1d9e0] [&_.ant-select-selector]:!text-[13.9px] [&_.ant-select-selector]:!rounded-[3px] [&_.ant-select-selector]:!h-8"
            style={{ width: 200 }}
          >
            <Select.Option value={user?.userName || 'user'}>
              {user?.userName || 'Current User'}
            </Select.Option>
          </Select>
          <span className="mx-3 text-black/90 text-lg">/</span>
        </div>
      </div>
      <div className="flex flex-col flex-1">
        <label className="mb-1 block text-sm font-bold">
          Agent name <span>*</span>
        </label>
        <Form.Item
          name="name"
          rules={[{ required: true, message: '请输入Agent名称' }]}
          className="w-full"
        >
          <Input className="w-full" maxLength={50} />
        </Form.Item>
      </div>
    </div>
  );
};
