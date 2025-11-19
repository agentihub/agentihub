import React, { useEffect, useState } from 'react';
import { Form, Input, Button, App } from 'antd';
import type { User } from '../../../context/AuthContext';
import { updateCurrentUserProfile, getCurrentUserProfile } from '../../../api';
import AvatarUpload from './AvatarUpload';

const { TextArea } = Input;

interface ProfileFormValues {
  nickName?: string;
  email: string;
  bio?: string;
  website?: string;
  location?: string;
}

interface PublicProfileFormProps {
  user: User | null;
  onUserUpdate: (user: User) => void;
}

const PublicProfileForm: React.FC<PublicProfileFormProps> = ({
  user,
  onUserUpdate,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm<ProfileFormValues>();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(
    user?.avatar ? `${import.meta.env.VITE_API_BASE_URL}${user.avatar}` : ''
  );

  // 初始化表单数据
  useEffect(() => {
    if (user) {
      console.log('user', user);
      form.setFieldsValue({
        nickName: user.nickName || '',
        email: user.email || '',
        bio: user.bio || '',
        website: user.website || '',
        location: user.location || '',
      });
      setAvatarUrl(user.avatar ? `${user.avatar}` : '');
    }
  }, [user, form]);

  // 提交表单
  const handleSubmit = async (values: ProfileFormValues) => {
    if (!user) return;

    try {
      setLoading(true);

      // 更新用户资料
      const updateResponse = await updateCurrentUserProfile({
        body: {
          id: user.id,
          nickName: values.nickName,
          email: values.email,
          bio: values.bio,
          website: values.website,
          location: values.location,
          avatar: avatarUrl,
        },
      });

      // 检查更新是否成功
      if (updateResponse.data?.data === true) {
        // 重新获取最新的用户信息
        const profileResponse = await getCurrentUserProfile();

        if (profileResponse.data?.data) {
          message.success('个人概览更新成功！');
          onUserUpdate(profileResponse.data.data);
        } else {
          message.warning('更新成功，但获取最新数据失败，请刷新页面');
        }
      } else {
        message.error('更新失败，请稍后重试');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      const err = error as Error;
      message.error(err.message || '更新失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 px-8 pt-4 bg-white">
      <div className="max-w-3xl">
        <p className="text-xl text-black mb-6 border-b border-gray-200 pb-4">
          {user?.nickName
            ? `${user.nickName} (${user.userName})`
            : user?.userName}
        </p>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">公开资料</h1>
        <p className="text-sm text-gray-600 mb-6">
          这些信息将对外展示，请谨慎填写并确认内容无误。
        </p>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-4"
        >
          {/* 头像上传 */}
          <AvatarUpload
            currentAvatar={avatarUrl}
            onAvatarChange={setAvatarUrl}
          />

          {/* 用户名 */}
          <Form.Item
            label={
              <span className="text-sm font-semibold text-gray-900">昵称</span>
            }
            name="nickName"
            rules={[
              { message: '请输入用户昵称' },
              { min: 1, max: 39, message: '用户昵称长度为 1-39 个字符' },
            ]}
          >
            <Input
              placeholder="请输入用户昵称"
              className="rounded-md"
              maxLength={39}
            />
          </Form.Item>

          {/* 公开邮箱 */}
          <Form.Item
            label={
              <span className="text-sm font-semibold text-gray-900">
                公开邮箱
              </span>
            }
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入公开邮箱" className="rounded-md" />
          </Form.Item>

          {/* 个人简介 */}
          <Form.Item
            label={
              <span className="text-sm font-semibold text-gray-900">
                个人简介
              </span>
            }
            name="bio"
          >
            <TextArea
              placeholder="简单介绍一下你自己"
              rows={4}
              maxLength={160}
              showCount
              className="rounded-md"
            />
          </Form.Item>

          {/* 网站 */}
          <Form.Item
            label={
              <span className="text-sm font-semibold text-gray-900">
                个人网址
              </span>
            }
            name="website"
            rules={[{ type: 'url', message: '请输入有效的网址' }]}
          >
            <Input placeholder="https://example.com" className="rounded-md" />
          </Form.Item>

          {/* 位置 */}
          <Form.Item
            label={
              <span className="text-sm font-semibold text-gray-900">
                所在地区
              </span>
            }
            name="location"
          >
            <Input placeholder="例如：上海市" className="rounded-md" />
          </Form.Item>

          {/* 提交按钮 */}
          <div className="pt-4">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="bg-green-600 hover:bg-green-700 border-green-600 rounded-md px-4"
            >
              更新资料
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default PublicProfileForm;
