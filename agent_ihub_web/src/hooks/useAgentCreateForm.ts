import { useState } from 'react';
import { Form, App } from 'antd';
import type { NavigateFunction } from 'react-router-dom';
import { agentService } from '../services';
import type { CreateAgentDTO } from '../api/types.gen';
import type { User } from '../context/AuthContext';
import type { AgentFormData } from '../types/agent';

interface UseAgentCreateFormProps {
  user: User | null;
  navigate: NavigateFunction;
}

export const useAgentCreateForm = ({
  user,
  navigate,
}: UseAgentCreateFormProps) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    description: '',
    platform: 'LiteAgent',
    isPublic: true,
    licenseType: 'no-license',
  });

  // 处理表单值变化
  const handleFormChange = (changedValues: Partial<AgentFormData>) => {
    setFormData((prev) => ({ ...prev, ...changedValues }));
  };

  // 处理表单提交
  const handleSubmit = async (values: AgentFormData) => {
    if (!user) {
      message.error('请先登录');
      return;
    }

    setLoading(true);
    try {
      // 转换 licenseType 为 AgentLicenseDTO 格式
      let license: CreateAgentDTO['license'] = undefined;
      if (values.licenseType && values.licenseType !== 'no-license') {
        license = {
          type: values.licenseType as
            | 'MIT'
            | 'APACHE_2_0'
            | 'GPL_3_0'
            | 'BSD_3_CLAUSE'
            | 'AGPL_3_0'
            | 'PROPRIETARY'
            | 'CUSTOM',
        };
      }

      // 构造创建Agent的数据
      const createData: CreateAgentDTO = {
        name: values.name.trim(),
        description: values.description?.trim() || '',
        platform: values.platform as 'LiteAgent' | 'Dify' | 'Coze',
        mdContent: '',
        license: license,
      };

      // 调用API创建Agent
      const response = await agentService.createAgent(createData);

      if (response.code === 200 && response.data) {
        message.success('Agent创建成功！');
        // 跳转到Agent详情页面
        const { name, authorName } = response.data;
        if (name && authorName) {
          navigate(`/${authorName}/${name}`);
        } else {
          navigate('/dashboard');
        }
      } else {
        throw new Error('创建失败');
      }
    } catch (error) {
      console.error('创建Agent失败:', error);
      message.error(
        error instanceof Error ? error.message : '创建Agent失败，请稍后重试'
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    formData,
    handleFormChange,
    handleSubmit,
  };
};
