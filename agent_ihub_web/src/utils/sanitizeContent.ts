const sanitizeContent = (text: string) => {
  // 匹配 {{<...>}} 模式，转义尖括号并添加高亮样式
  return text.replace(/\{\{<([^>]+)>\}\}/g, (_match, varName) => {
    // data-variable 属性保留，方便后续实现点击配置功能
    return `<span class="template-variable" data-variable="${varName}" style="background-color: #ddf4ff; color: #0969da; padding: 2px 6px; border-radius: 4px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 0.9em; font-weight: 500; border: 1px solid #9cd7ff;">{{&lt;${varName}&gt;}}</span>`;
  });
};

export default sanitizeContent;
