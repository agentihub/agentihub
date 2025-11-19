import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Spin, Alert, App, Divider } from 'antd';
import { agentService } from '@/services/agentService';
import type { AgentDTO } from '@/api/types.gen';
import { useAuth } from '@/context/AuthContext';

const AgentFork: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { userName, agentname } = useParams<{
    userName: string;
    agentname: string;
  }>();
  const { user } = useAuth();
  const myUsername = user?.userName;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [agentData, setAgentData] = useState<AgentDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAgentData = async () => {
      if (!userName || !agentname) {
        setError('未提供用户名或 Agent 名');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const agent = await agentService.getAgentByNames(userName, agentname);
        setAgentData(agent.data!);

        // Pre-fill form with forked agent data
        form.setFieldsValue({
          name: agent.data?.name,
        });
      } catch (error) {
        console.error('加载 Agent 失败:', error);
        setError(error instanceof Error ? error.message : '加载 Agent 失败');
        setAgentData(null);
      } finally {
        setLoading(false);
      }
    };

    loadAgentData();
  }, [userName, agentname, form]);

  const handleSubmit = async (values: {
    name: string;
    description: string;
  }) => {
    if (!agentData) return;

    try {
      setSubmitting(true);

      const res = await agentService.forkAgent(agentData.id!, {
        name: values.name,
        description: values.description,
      });

      if (res.success) {
        message.success('Fork 成功！');
        navigate(`/${myUsername}/${values.name}`);
      } else {
        message.error(res.message);
      }
    } catch (error) {
      console.error('Fork 失败:', error);
      message.error(
        error instanceof Error ? error.message : 'Fork 失败，请重试'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !agentData) {
    return (
      <div className="p-4">
        <Alert type="error" message={error || '未找到 Agent'} showIcon />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-[850px] mx-auto px-4 sm:px-6 lg:px-4">
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-2 leading-[22.5px]">
            Fork Agent
          </h1>
          <p className="text-[13.5px] text-gray-700 mb-0 leading-[16.3px]">
            Fork会创建一个 Agent 副本，方便你在不影响原 Agent
            的情况下自由尝试更改。
          </p>
          <Divider className="my-2" />
          <p className="text-[13.9px] italic text-gray-900 mt-1 leading-[16.8px]">
            带有星号（*）的为必填项。
          </p>
        </div>

        <div className="bg-white">
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            {/* Agent Name */}
            <div className="mb-6">
              <div className="mb-2">
                <label className="block text-sm font-bold">Agent name *</label>
              </div>
              <Form.Item
                name="name"
                className="mb-3"
                rules={[
                  { required: true, message: '请输入 Agent 名称' },
                  { max: 50, message: 'Agent 名称不能超过 50 个字符' },
                ]}
              >
                <Input placeholder="请输入 Agent 名称" className="w-full" />
              </Form.Item>
              <div className="text-sm text-gray-900">
                默认情况下，Fork后的 Agent 名称与上游 Agent
                相同。你可以自定义名称以便区分。
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <div className="mb-2">
                <label className="block text-sm font-bold">Description</label>
              </div>
              <Form.Item
                name="description"
                rules={[{ max: 350, message: '描述不能超过 350 个字符' }]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="描述该 Agent 的功能和用途"
                  maxLength={350}
                  showCount
                />
              </Form.Item>
            </div>

            {/* Submit Buttons */}
            <div className="py-6">
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Fork Agent
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AgentFork;
