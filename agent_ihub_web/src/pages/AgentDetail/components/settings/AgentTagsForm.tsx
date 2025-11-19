import React, { useState, useMemo } from 'react';
import { Input, Tag, Button, Divider, Space, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { AgentDTO } from '@/api/types.gen';
import { agentService } from '@/services/agentService';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

interface AgentTagsFormProps {
  agentData: AgentDTO;
  reFetchAgentData: () => void;
}

export const AgentTagsForm: React.FC<AgentTagsFormProps> = ({
  agentData,
  reFetchAgentData,
}) => {
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>(agentData.tags || []);
  const [inputValue, setInputValue] = useState('');
  const { message } = App.useApp();

  // Detect unsaved changes by comparing tags with original
  const hasUnsavedChanges = useMemo(() => {
    const originalTags = agentData.tags || [];
    return JSON.stringify(tags.sort()) !== JSON.stringify(originalTags.sort());
  }, [tags, agentData.tags]);

  // Use unsaved changes hook
  useUnsavedChanges({
    hasUnsavedChanges,
    message: '您有未保存的更改，确定要离开吗？',
    title: '离开此页面？',
  });

  const handleAddTag = () => {
    if (inputValue && !tags.includes(inputValue)) {
      if (tags.length >= 10) {
        message.warning('最多只能添加 10 个标签');
        return;
      }
      setTags([...tags, inputValue]);
      setInputValue('');
    }
  };

  const handleRemoveTag = (removedTag: string) => {
    setTags(tags.filter((tag) => tag !== removedTag));
  };

  const handleSaveTags = async () => {
    if (!agentData.id) return;

    try {
      setLoading(true);
      const response = await agentService.updateAgent({
        id: agentData.id,
        ...agentData,
        tags: tags,
      });

      console.log(response);

      if (response.success) {
        reFetchAgentData();
        message.success('标签已保存');
      }
    } catch (error) {
      console.error('更新标签失败:', error);
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const popularTags = [
    'AI',
    'ChatGPT',
    '自动化',
    '数据分析',
    '文本处理',
    '图像处理',
    'API',
    '爬虫',
    '机器学习',
    '工具',
  ];

  const isAtMax = tags.length >= 10;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">标签管理</h3>
        <p className="text-sm text-gray-600">
          为您的 Agent 添加标签，帮助其他用户更容易地发现和使用
        </p>
      </div>

      <div className="space-y-6">
        {/* 当前标签 */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-3">当前标签</h4>
          <div className="min-h-[60px] p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
            {tags.length > 0 ? (
              <Space size={[8, 8]} wrap>
                {tags.map((tag) => (
                  <Tag
                    key={tag}
                    closable
                    onClose={() => handleRemoveTag(tag)}
                    className="mb-2"
                    color="green"
                  >
                    {tag}
                  </Tag>
                ))}
              </Space>
            ) : (
              <div className="text-gray-500 text-sm">
                暂无标签，请在下方添加
              </div>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
            {tags.length}/10 个标签
            {isAtMax && <span className="text-red-600">标签数量已达上限</span>}
          </div>
        </div>

        <Divider />

        {/* 添加标签 */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-3">
            添加新标签
          </h4>
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="输入标签名称"
              onPressEnter={handleAddTag}
              maxLength={20}
              className="rounded-md flex-1"
              size="large"
              disabled={isAtMax}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddTag}
              disabled={
                !inputValue.trim() || tags.includes(inputValue) || isAtMax
              }
              className="bg-green-600 hover:bg-green-700 border-green-600 rounded-md"
              size="large"
            >
              添加
            </Button>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {isAtMax ? (
              <span className="text-red-600">
                已达 10 个标签上限，不能继续添加
              </span>
            ) : (
              '标签长度不超过 20 个字符，最多添加 10 个标签'
            )}
          </div>
        </div>

        <Divider />

        {/* 热门标签推荐 */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-3">热门标签</h4>
          <div className="space-y-2">
            <div className="text-sm text-gray-600 mb-3">
              点击下方标签快速添加：
            </div>
            <Space size={[8, 8]} wrap>
              {popularTags.map((tag) => {
                const disabled = isAtMax || tags.includes(tag);
                return (
                  <Tag
                    key={tag}
                    onClick={() => {
                      if (disabled) return;
                      setTags([...tags, tag]);
                    }}
                    aria-disabled={disabled}
                    className={`
                      cursor-pointer mb-2
                      ${
                        disabled
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-green-100 hover:border-green-500'
                      }
                    `}
                    color={disabled ? 'default' : 'blue'}
                  >
                    {tag}
                  </Tag>
                );
              })}
            </Space>
          </div>
        </div>

        <Divider />

        {/* 保存按钮 */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            size="large"
            onClick={() => setTags(agentData.tags || [])}
            className="rounded-md"
          >
            重置
          </Button>
          <Button
            type="primary"
            onClick={handleSaveTags}
            loading={loading}
            size="large"
            className="bg-green-600 hover:bg-green-700 border-green-600 rounded-md"
          >
            保存标签
          </Button>
        </div>
      </div>
    </div>
  );
};
