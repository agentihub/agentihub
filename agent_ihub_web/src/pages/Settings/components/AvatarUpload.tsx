import React, { useState } from 'react';
import { Avatar, Button, Upload, Spin, App } from 'antd';
import { DefaultAvatar } from '@/components';
import { CameraOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { tokenManager } from '../../../services/apiClient';

interface AvatarUploadProps {
  currentAvatar: string;
  onAvatarChange: (avatarUrl: string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onAvatarChange,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const { message } = App.useApp();
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadProps: UploadProps = {
    name: 'file',
    listType: 'picture',
    fileList: fileList,
    maxCount: 1,
    beforeUpload: (file) => {
      // 只做文件验证
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        const msg = '只能上传图片文件！';
        message.error(msg);
        setUploadError('请上传小于2M，且比例为 1:1 的图片');
        return Upload.LIST_IGNORE;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        const msg = '图片大小不能超过 2MB！';
        message.error(msg);
        setUploadError('请上传小于2M，且比例为 1:1 的图片');
        return Upload.LIST_IGNORE;
      }
      // 验证通过，清理错误提示
      setUploadError(null);
      return true; // 验证通过，允许上传
    },
    customRequest: async (options) => {
      const { file, onSuccess, onError } = options;

      try {
        setUploading(true);
        setUploadError(null);

        // 构建 FormData
        const formData = new FormData();
        formData.append('file', file as File);

        // 使用原生 fetch 上传，确保正确的 multipart/form-data 格式
        const token = tokenManager.getToken();
        const response = await fetch('/api/v1/file/avatar', {
          method: 'POST',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            // 不要手动设置 Content-Type，让浏览器自动设置 boundary
          },
          body: formData,
        });

        let result: any = undefined;
        try {
          result = await response.json();
        } catch (_e) {
          // 非 JSON 响应，按失败处理
        }

        // HTTP 非 2xx 直接失败
        if (!response.ok) {
          const msg =
            result?.msg || response.statusText || '头像上传失败，请重试';
          message.error(msg);
          setUploadError('请上传小于2M，且比例为 1:1 的图片');
          onError?.(new Error(msg));
          return;
        }

        // 业务失败（code 非 200 或无 data）
        if (!(result && result.code === 200 && result.data)) {
          const msg = result?.msg || '头像上传失败，请重试';
          message.error(msg);
          setUploadError('请上传小于2M，且比例为 1:1 的图片');
          onError?.(new Error(msg));
          return;
        }

        // 成功
        const avatarUrl = result.data as string;
        onAvatarChange(avatarUrl);
        setFileList([file as UploadFile]);
        message.success('头像上传成功！');
        onSuccess?.(avatarUrl);
      } catch (error) {
        console.error('头像上传失败:', error);
        const msg = (error as any)?.message || '头像上传失败，请重试';
        message.error(msg);
        setUploadError('请上传小于2M，且比例为 1:1 的图片');
        onError?.(error as Error);
      } finally {
        setUploading(false);
      }
    },
    onRemove: () => {
      setFileList([]);
      onAvatarChange(currentAvatar);
      setUploadError(null);
    },
  };

  return (
    <div className="flex items-start gap-6">
      <div className="flex flex-col items-center gap-3">
        <Spin spinning={uploading} indicator={<LoadingOutlined spin />}>
          {(() => {
            const isGif = /\.gif(\?|$)/i.test(currentAvatar || '');
            if (isGif) {
              return (
                <img
                  src={currentAvatar}
                  alt="avatar"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    backgroundColor: 'transparent',
                    display: 'block',
                  }}
                />
              );
            }
            if (currentAvatar) {
              return (
                <Avatar size={80} src={currentAvatar} className="border-none" />
              );
            }
            return <DefaultAvatar size={80} alt="default avatar" />;
          })()}
        </Spin>
        <Upload {...uploadProps} showUploadList={false} disabled={uploading}>
          <Button
            icon={<CameraOutlined />}
            size="small"
            className="text-xs"
            loading={uploading}
          >
            上传头像
          </Button>
        </Upload>
      </div>
      <div className="flex-1">
        {/* <p className="text-sm text-gray-700 mb-2">头像</p> */}
        {uploading && (
          <p className="text-xs text-blue-600 mb-2">正在上传头像...</p>
        )}
        {!uploading && uploadError && (
          <p className="text-xs text-red-600 mb-2">
            请上传小于2M，且比例为 1:1 的图片
          </p>
        )}
        {fileList.length > 0 && !uploading && !uploadError && (
          <p className="text-xs text-green-600 mb-2">
            头像已上传，点击“更新资料”保存
          </p>
        )}
      </div>
    </div>
  );
};

export default AvatarUpload;
