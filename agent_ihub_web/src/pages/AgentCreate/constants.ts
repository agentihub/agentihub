/**
 * Agent Wizard 常量配置
 */

// 平台选项
export const PLATFORM_OPTIONS = [
  { label: 'LiteAgent', value: 'LiteAgent' },
  // { label: 'Dify', value: 'Dify' },
  // { label: 'Coze', value: 'Coze' },
] as const;

// 许可证选项 - 映射到 API 的 AgentLicenseDTO.type
export const LICENSE_OPTIONS = [
  { label: 'No license', value: 'no-license' },
  { label: 'MIT License', value: 'MIT' },
  { label: 'Apache License 2.0', value: 'APACHE_2_0' },
  { label: 'GNU General Public License v3.0', value: 'GPL_3_0' },
] as const;
