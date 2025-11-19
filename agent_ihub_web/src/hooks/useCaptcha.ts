// src/hooks/useCaptcha.ts
import { useState, useRef } from 'react';
import { verifyCaptcha } from '../api/services.gen';

export interface UseCaptchaReturn {
  captchaKey: string;
  captchaImage: string;
  loading: boolean;
  error: string | null;
  fetchCaptcha: () => Promise<void>;
  verifyCaptchaCode: (code: string) => Promise<boolean>;
  resetCaptcha: () => void;
}

// 运行时解析：兼容 R 包装 { data } 或直接布尔
function unwrapData<T = any>(raw: unknown): T | unknown {
  if (raw && typeof raw === 'object') {
    const anyRaw = raw as Record<string, any>;
    if ('data' in anyRaw && anyRaw.data != null) return anyRaw.data as T;
  }
  return raw as T;
}

export function useCaptcha(): UseCaptchaReturn {
  const [captchaKey, setCaptchaKey] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const cleanupObjectUrl = () => {
    if (objectUrlRef.current && objectUrlRef.current.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(objectUrlRef.current);
      } catch {
        // ignore
      }
      objectUrlRef.current = null;
    }
  };

  const fetchCaptcha = async () => {
    try {
      setLoading(true);
      setError(null);
      cleanupObjectUrl();

      // 直接以二进制方式请求验证码图片，读取响应头中的 captcha-key
      const res = await fetch('/api/v1/account/captcha', {
        method: 'POST',
        // 如果后端通过 Cookie 鉴权，建议携带凭据
        credentials: 'include',
        headers: {
          // 明确声明期望图片流；有些服务端会基于 Accept 返回不同格式
          Accept: 'image/png,*/*;q=0.8',
        },
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`获取验证码失败: ${res.status}`);
      }

      // 尝试从响应头读取 key（大小写不敏感，兼容多种命名）
      const headerKey =
        res.headers.get('captcha-key') ||
        res.headers.get('Captcha-Key') ||
        res.headers.get('X-Captcha-Key') ||
        res.headers.get('x-captcha-key') ||
        '';

      const blob = await res.blob();
      const contentType = res.headers.get('Content-Type') || '';
      if (!contentType.includes('image')) {
        // 返回的不是图片，尝试作为文本查看错误内容
        let text = '';
        try {
          text = await blob.text();
        } catch (readErr) {
          text = '无法读取错误响应';
          console.error('Failed to read captcha error blob:', readErr);
        }
        throw new Error(text || '验证码接口未返回图片');
      }

      const objectUrl = URL.createObjectURL(blob);
      objectUrlRef.current = objectUrl;

      if (!headerKey) {
        // 即使没有 key，也先展示图片，便于排查；但验证时会失败
        setError('未从响应头获取到 captcha-key');
      }

      setCaptchaKey(headerKey);
      setCaptchaImage(objectUrl);
    } catch (e) {
      setError((e as Error).message || '获取验证码失败');
      setCaptchaKey('');
      setCaptchaImage('');
    } finally {
      setLoading(false);
    }
  };

  const verifyCaptchaCode = async (code: string): Promise<boolean> => {
    if (!captchaKey) return false;
    try {
      setLoading(true);
      setError(null);
      const { data } = await verifyCaptcha({
        body: { captchaKey, captchaCode: code },
      });
      const unwrapped = unwrapData(data) as any;
      if (typeof unwrapped === 'boolean') return unwrapped;
      if (unwrapped && typeof unwrapped === 'object' && 'data' in unwrapped) {
        return Boolean(unwrapped.data);
      }
      return Boolean(unwrapped);
    } catch (e) {
      setError((e as Error).message || '验证码验证失败');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetCaptcha = () => {
    cleanupObjectUrl();
    setCaptchaKey('');
    setCaptchaImage('');
    setError(null);
  };

  return {
    captchaKey,
    captchaImage,
    loading,
    error,
    fetchCaptcha,
    verifyCaptchaCode,
    resetCaptcha,
  };
}

export default useCaptcha;
