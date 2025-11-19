import React, { useState, useMemo, useEffect } from 'react';
import { Form, Input, Switch, Button, Divider, Select, App } from 'antd';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import type { AgentDTO } from '@/api/types.gen';
import { agentService } from '@/services/agentService';
import { platform } from '@/api/types.gen';
import ResponseCode from '@/constants/ResponseCode';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { AgentDeleteSection } from './AgentDeleteSection';

interface AgentGeneralFormProps {
  agentData: AgentDTO;
  reFetchAgentData: () => void;
}

interface GeneralFormValues {
  name: string;
  platform: 'LiteAgent' | 'Dify' | 'Coze';
  description: string;
  isPublic: boolean;
}

export const AgentGeneralForm: React.FC<AgentGeneralFormProps> = ({
  agentData,
  reFetchAgentData,
}) => {
  const [form] = Form.useForm<GeneralFormValues>();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { userName } = useParams<{ userName: string; agentname: string }>();
  const location = useLocation();

  const [initialValues, setInitialValues] = useState<GeneralFormValues>({
    name: agentData?.name || '',
    platform:
      (agentData?.platform as GeneralFormValues['platform']) || 'LiteAgent',
    description: agentData?.description || '',
    isPublic: agentData?.isPublic || false,
  });
  const [ignoreUnsavedPrompt, setIgnoreUnsavedPrompt] = useState(false);

  useEffect(() => {
    const nextValues: GeneralFormValues = {
      name: agentData?.name || '',
      platform:
        (agentData?.platform as GeneralFormValues['platform']) || 'LiteAgent',
      description: agentData?.description || '',
      isPublic: agentData?.isPublic || false,
    };
    setInitialValues(nextValues);
    form.setFieldsValue(nextValues);
  }, [
    agentData?.name,
    agentData?.platform,
    agentData?.description,
    agentData?.isPublic,
    form,
  ]);

  const name = Form.useWatch('name', form);
  const platformValue = Form.useWatch('platform', form);
  const description = Form.useWatch('description', form);
  const isPublic = Form.useWatch('isPublic', form);

  const hasUnsavedChanges = useMemo(() => {
    if (
      name === undefined ||
      platformValue === undefined ||
      description === undefined ||
      isPublic === undefined
    ) {
      return false;
    }

    return (
      name !== initialValues.name ||
      platformValue !== initialValues.platform ||
      description !== initialValues.description ||
      isPublic !== initialValues.isPublic
    );
  }, [name, platformValue, description, isPublic, initialValues]);

  useEffect(() => {
    if (ignoreUnsavedPrompt) {
      setIgnoreUnsavedPrompt(false);
    }
  }, [location.pathname, ignoreUnsavedPrompt]);

  const { reset: resetUnsaved } = useUnsavedChanges({
    hasUnsavedChanges: hasUnsavedChanges && !ignoreUnsavedPrompt,
    message: '您有未保存的更改，确定要离开吗？',
    title: '离开此页面？',
  });

  const handleSubmit = async (values: GeneralFormValues) => {
    if (!agentData.id) return;

    const originalName = agentData.name;

    try {
      setLoading(true);
      const response = await agentService.updateAgent({
        id: agentData.id,
        ...agentData,
        ...values,
      });

      if (response.code === ResponseCode.S_OK) {
        const nextValues: GeneralFormValues = {
          name: values.name,
          platform: values.platform,
          description: values.description,
          isPublic: values.isPublic,
        };
        setInitialValues(nextValues);
        form.setFieldsValue(nextValues);
        resetUnsaved();
        setIgnoreUnsavedPrompt(true);
        reFetchAgentData();

        if (values.name !== originalName && userName) {
          window.requestAnimationFrame(() => {
            navigate(`/${userName}/${values.name}/settings`, { replace: true });
          });
        }

        message.success('设置已保存');
      } else {
        message.error(response.message ?? '保存失败，请重试');
      }
    } catch (error) {
      console.error('更新 Agent 失败:', error);
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          General Settings
        </h3>
        <p className="text-sm text-gray-600">
          配置 Agent 的基本信息和可见性设置
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleSubmit}
        className="space-y-6"
      >
        <Form.Item
          label="Agent 名称"
          name="name"
          rules={[
            { required: true, message: '请输入 Agent 名称' },
            { min: 1, max: 100, message: '名称长度应在 1-100 个字符之间' },
          ]}
        >
          <Input
            placeholder="输入 Agent 名称"
            className="rounded-md"
            size="large"
          />
        </Form.Item>

        {/* todo add platform select */}
        <Form.Item label="平台" name="platform">
          <Select>
            <Select.Option value={platform.LITE_AGENT}>LiteAgent</Select.Option>
            {/* <Select.Option value={platform.DIFY}>Dify</Select.Option> */}
            {/* <Select.Option value={platform.COZE}>Coze</Select.Option> */}
          </Select>
        </Form.Item>

        <Form.Item
          label="描述"
          name="description"
          rules={[{ max: 500, message: '描述长度不能超过 500 个字符' }]}
        >
          <Input.TextArea
            placeholder="描述您的 Agent 功能和用途"
            rows={4}
            className="rounded-md"
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Divider />

        <div className="space-y-4">
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3">
              可见性设置
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              控制 Agent 的访问权限和可见范围
            </p>
          </div>

          <Form.Item className="mb-0">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div>
                <div className="font-medium text-gray-900">公开访问</div>
                <div className="text-sm text-gray-600 mt-1">
                  其他用户可以查看和使用此 Agent
                </div>
              </div>
              <Form.Item name="isPublic" valuePropName="checked">
                <Switch />
              </Form.Item>
            </div>
          </Form.Item>
        </div>

        <Divider />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            size="large"
            onClick={() => form.resetFields()}
            className="rounded-md"
          >
            重置
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            className="bg-green-600 hover:bg-green-700 border-green-600 rounded-md"
          >
            保存更改
          </Button>
        </div>
      </Form>

      {/* 删除区域 */}
      <AgentDeleteSection agentData={agentData} />
    </div>
  );
};
