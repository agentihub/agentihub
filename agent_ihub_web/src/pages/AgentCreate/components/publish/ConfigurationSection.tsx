import React, { useState, useEffect } from 'react';
import { Form, Select, Tag } from 'antd';
import { FileTextOutlined, FileOutlined } from '@ant-design/icons';
import type { AgentFormData } from '@/types/agent';
import type { AgentDTO, FileInfoDTO } from '@/api/types.gen';
import { getFileInfosByIds } from '@/api';
import { PLATFORM_OPTIONS, LICENSE_OPTIONS } from '../../constants';
import { ConfigOption } from './ConfigOption';
import { VisibilitySelector } from './VisibilitySelector';

const { Option } = Select;

interface ConfigurationSectionProps {
  formData: AgentFormData;
  onFormChange: (changedValues: Partial<AgentFormData>) => void;
  onFieldsChange: (fields: Partial<AgentFormData>) => void;
  agentForEditor: AgentDTO | null;
}

export const ConfigurationSection: React.FC<ConfigurationSectionProps> = ({
  formData,
  onFormChange,
  onFieldsChange,
  agentForEditor,
}) => {
  const [toolFiles, setToolFiles] = useState<FileInfoDTO[]>([]);
  const [docsFiles, setDocsFiles] = useState<FileInfoDTO[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // 获取文件信息
  useEffect(() => {
    const fetchFileInfos = async () => {
      if (!agentForEditor) return;

      const allFileIds = [
        ...(agentForEditor.toolFileIdList || []),
        ...(agentForEditor.docsFileIdList || []),
      ];

      if (allFileIds.length === 0) return;

      setLoadingFiles(true);
      try {
        const response = await getFileInfosByIds({ body: allFileIds });
        if (response.data?.code === 200 && response.data?.data) {
          const files = response.data.data;

          // 分类文件
          const tools: FileInfoDTO[] = [];
          const docs: FileInfoDTO[] = [];

          files.forEach((file) => {
            if (agentForEditor.toolFileIdList?.includes(file.id!)) {
              tools.push(file);
            } else if (agentForEditor.docsFileIdList?.includes(file.id!)) {
              docs.push(file);
            }
          });

          setToolFiles(tools);
          setDocsFiles(docs);
        }
      } catch (error) {
        console.error('获取文件信息失败:', error);
      } finally {
        setLoadingFiles(false);
      }
    };

    fetchFileInfos();
  }, [agentForEditor]);

  return (
    <>
      {/* 可见性选择 */}
      <Form.Item
        name="isPublic"
        className="mb-2"
        rules={[{ required: true, message: '请选择可见性' }]}
      >
        <ConfigOption
          title="选择可见性"
          description="决定哪些人可以查看并协作此 Agent。"
          required
        >
          <VisibilitySelector
            value={formData.isPublic}
            onChange={(value) => {
              onFormChange({ isPublic: value });
              onFieldsChange({ isPublic: value });
            }}
          />
        </ConfigOption>
      </Form.Item>

      {/* 平台选择 */}
      <Form.Item
        name="platform"
        className="mb-2"
        rules={[{ required: true, message: '请选择平台' }]}
      >
        <ConfigOption
          title="选择平台"
          description="选择 Agent 将要运行的平台环境。"
          required
        >
          <Select
            value={formData.platform}
            onChange={(value) => {
              onFormChange({ platform: value });
              onFieldsChange({ platform: value });
            }}
            dropdownStyle={{ minWidth: '300px' }}
            className="w-30 [&_.ant-select-selector]:hover:!bg-[#f6f8fa] [&_.ant-select-selector]:hover:!border-[#d1d9e0]"
          >
            {PLATFORM_OPTIONS.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </ConfigOption>
      </Form.Item>

      {/* 许可证选择 */}
      <Form.Item name="licenseType" className="mb-3" initialValue="no-license">
        <ConfigOption
          title="添加许可证"
          description={<>许可证用于说明他人如何使用你的Agent。</>}
          required
        >
          <Select
            value={formData.licenseType || 'no-license'}
            onChange={(value) => {
              onFormChange({ licenseType: value });
              onFieldsChange({ licenseType: value });
            }}
            placeholder="请选择许可证"
            className="w-30 [&_.ant-select-selector]:hover:!bg-[#f6f8fa] [&_.ant-select-selector]:hover:!border-[#d1d9e0]"
            dropdownStyle={{ minWidth: '300px' }}
          >
            {LICENSE_OPTIONS.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </ConfigOption>
      </Form.Item>

      {/* ihub_agent.md 说明 */}
      {agentForEditor?.mdContent && (
        <ConfigOption
          className="mb-2"
          title="Agent 配置文件（ihub_agent.md）"
          description="根据你的 Agent 配置生成的核心配置文件。"
        >
          <div className="flex items-center gap-2">
            <FileTextOutlined className="text-blue-600 text-lg" />
            <Tag color="blue" className="m-0">
              ihub_agent.md
            </Tag>
          </div>
        </ConfigOption>
      )}

      {/* 工具文件说明 */}
      {agentForEditor && (agentForEditor.toolFileIdList?.length ?? 0) > 0 && (
        <ConfigOption
          className="mb-2"
          title="工具文件"
          description="Agent 可使用的工具配置文件。"
        >
          {loadingFiles ? (
            <div className="text-sm text-gray-500">加载中...</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {toolFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg"
                >
                  <FileOutlined className="text-purple-600" />
                  <span className="text-sm text-purple-800">
                    {file.fileName}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ConfigOption>
      )}

      {/* 知识库文档说明 */}
      {agentForEditor && (agentForEditor.docsFileIdList?.length ?? 0) > 0 && (
        <ConfigOption
          className="mb-2"
          title="知识库文档"
          description="为 Agent 提供领域知识的文档资料。"
        >
          {loadingFiles ? (
            <div className="text-sm text-gray-500">加载中...</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {docsFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg"
                >
                  <FileOutlined className="text-green-600" />
                  <span className="text-sm text-green-800">
                    {file.fileName}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ConfigOption>
      )}
    </>
  );
};
