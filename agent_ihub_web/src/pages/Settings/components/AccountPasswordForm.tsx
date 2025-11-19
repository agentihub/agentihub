import React, { useState } from 'react';
import { Form, Input, Button, App } from 'antd';
import { changePassword } from '../../../api';

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const AccountPasswordForm: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<PasswordFormValues>();
  const [loading, setLoading] = useState(false);

  // 提交密码修改表单
  const handleSubmit = async (values: PasswordFormValues) => {
    try {
      setLoading(true);
      const res = await changePassword({
        body: {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
      });
      const ok = res?.data?.data === true;
      if (ok) {
        message.success('密码更新成功');
        form.resetFields();
      } else {
        const msg = res?.error?.msg + '密码修改失败';
        message.error(msg);
      }
    } catch (error) {
      const err = error as any;
      const apiMsg = err?.response?.data?.msg || err?.data?.msg || err?.message;
      message.error(apiMsg || '密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 bg-white">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">修改密码</h1>
        <p className="text-sm text-gray-600 mb-6">更新密码以保障账户安全。</p>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-4"
        >
          {/* 当前密码 */}
          <Form.Item
            label={
              <span className="text-sm font-semibold text-gray-900">
                当前密码
              </span>
            }
            name="currentPassword"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password
              placeholder="请输入当前密码"
              className="rounded-md"
            />
          </Form.Item>

          {/* 新密码 */}
          <Form.Item
            label={
              <span className="text-sm font-semibold text-gray-900">
                新密码
              </span>
            }
            name="newPassword"
            dependencies={['currentPassword']}
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少需要 6 个字符' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const current = getFieldValue('currentPassword');
                  if (!value || value !== current) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('新密码不能与当前密码相同'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请输入新密码" className="rounded-md" />
          </Form.Item>

          {/* 确认新密码 */}
          <Form.Item
            label={
              <span className="text-sm font-semibold text-gray-900">
                确认新密码
              </span>
            }
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="请再次输入新密码"
              className="rounded-md"
            />
          </Form.Item>

          {/* 提交按钮 */}
          <div className="pt-4">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="bg-green-600 hover:bg-green-700 border-green-600 rounded-md px-4"
            >
              更新密码
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default AccountPasswordForm;
