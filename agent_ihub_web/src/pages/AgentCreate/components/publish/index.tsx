import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form } from 'antd';
import { useAuth } from '@/context';
import { useAgentCreateForm } from '@/hooks/useAgentCreateForm';
import { StepContainer } from './StepContainer';
import { GeneralInfoSection } from './GeneralInfoSection';
import { ConfigurationSection } from './ConfigurationSection';
import { agentService } from '@/services/agentService';
import type { AgentDTO, CreateAgentDTO } from '@/api/types.gen';
import type { AgentFormData } from '@/types/agent';
import StepActions from '../StepActions';

interface PublishSectionProps {
  agentForEditor: AgentDTO | null;
  onBack?: () => void;
}

const PublishSection: React.FC<PublishSectionProps> = ({
  agentForEditor,
  onBack,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { form, loading, formData, handleFormChange } = useAgentCreateForm({
    user,
    navigate,
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (values: AgentFormData) => {
    setIsSubmitting(true);

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

    const createData: CreateAgentDTO = {
      name: values.name,
      description: values.description,
      platform: values.platform as 'LiteAgent' | 'Dify' | 'Coze',
      isPublic: values.isPublic,
      license: license,
      mdContent: agentForEditor?.mdContent || '',
      toolFileIdList: agentForEditor?.toolFileIdList || [],
      docsFileIdList: agentForEditor?.docsFileIdList || [],
    };

    try {
      const response = await agentService.createAgent(createData);
      if (response.success && response.data) {
        navigate(`/${user?.userName}/${response.data.name}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-250px)] flex flex-col">
      {/* 主内容区 */}
      <div className="flex-1">
        <div className="max-w-[850px] mx-auto px-4 sm:px-6 lg:px-4 pb-6 pt-2">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              创建一个新的 Agent
            </h1>
            <p className="text-xs text-gray-500 mt-2">必填字段标有星号 (*)。</p>
          </div>

          <div className="bg-white">
            <Form
              form={form}
              layout="vertical"
              className="px-3"
              onValuesChange={handleFormChange}
              onFinish={handleSubmit}
              initialValues={formData}
            >
              <StepContainer stepNumber={1} title="基本信息">
                <GeneralInfoSection user={user} formData={formData} />
              </StepContainer>

              <StepContainer stepNumber={2} title="配置选项">
                <ConfigurationSection
                  formData={formData}
                  onFormChange={handleFormChange}
                  onFieldsChange={(fields) => {
                    form.setFieldsValue(fields);
                  }}
                  agentForEditor={agentForEditor}
                />
              </StepContainer>
            </Form>
          </div>
        </div>
      </div>

      {/* 底部操作按钮 */}
      <StepActions
        showBack={!!onBack}
        onBack={onBack}
        nextText="确认并发布"
        nextLoading={isSubmitting || loading}
        onNext={() => form.submit()}
      />
    </div>
  );
};

export default PublishSection;
