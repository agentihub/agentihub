export const formatRelativeTime = (
  input: Date | string | number | undefined | null
): string => {
  if (!input) return '';
  let timeMs: number;
  if (input instanceof Date) {
    timeMs = input.getTime();
  } else if (typeof input === 'string') {
    // 兼容 ISO 字符串 或 yyyy-MM-dd HH:mm:ss
    const parsed = Date.parse(input.replace(/-/g, '/'));
    timeMs = isNaN(parsed) ? new Date(input).getTime() : parsed;
  } else {
    // number 时间戳，可能是秒也可能是毫秒
    timeMs = input < 1e12 ? input * 1000 : input;
  }

  if (!timeMs || isNaN(timeMs)) return '';

  const now = Date.now();
  const diffInSeconds = Math.floor((now - timeMs) / 1000);

  if (diffInSeconds < 60) return '刚刚';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} 分钟前`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} 小时前`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} 天前`;
  return `${Math.floor(diffInSeconds / 2592000)} 个月前`;
};
