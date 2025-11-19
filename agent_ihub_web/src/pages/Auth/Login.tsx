import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined, CloseOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context';
import { useAuthActions } from '../../hooks/useAuthActions';
import useCaptcha from '../../hooks/useCaptcha';
import { ReloadOutlined } from '@ant-design/icons';
import './Auth.css';
import logo from '@/assets/images/logo.png';

const { Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
  captcha?: string;
}

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaStatus, setCaptchaStatus] = useState<
    'success' | 'error' | 'validating' | undefined
  >(undefined);
  const [captchaHelp, setCaptchaHelp] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [captchaVerified, setCaptchaVerified] = useState<boolean>(false);
  const { setUser } = useAuth();
  const { login } = useAuthActions(setUser);
  const {
    captchaImage,
    loading: captchaLoading,
    fetchCaptcha,
    verifyCaptchaCode,
    resetCaptcha,
    error: captchaError,
  } = useCaptcha();

  const onFinish = async (values: LoginFormValues) => {
    const trimmedEmail = (values.email ?? '').trim();
    const trimmedPassword = (values.password ?? '').trim();
    try {
      setLoading(true);
      setLoginError(null);
      await login(trimmedEmail, trimmedPassword);
      setFailedAttempts(0);
      setShowCaptcha(false);
      resetCaptcha();
      setCaptchaStatus(undefined);
      setCaptchaHelp(null);
      setCaptchaVerified(false);
    } catch (_error) {
      console.error('Login form error:', _error);
      setLoginError('用户名或密码错误');
      setFailedAttempts((prev) => {
        const next = prev + 1;
        // 只有在首次达到3次失败时才显示验证码并获取
        if (next >= 3 && !showCaptcha) {
          setShowCaptcha(true);
          fetchCaptcha();
        }
        return next;
      });

      // 如果验证码已经显示且验证通过，登录失败时需要刷新验证码
      if (showCaptcha && captchaVerified) {
        setCaptchaVerified(false);
        setCaptchaStatus(undefined);
        setCaptchaHelp(null);
        fetchCaptcha();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseError = () => {
    setLoginError(null);
  };

  return (
    <div className="auth-container">
      {/* Right side - Login Form */}
      <div className="auth-right">
        <div className="auth-content">
          <div className="auth-header">
            <img
              src={logo}
              alt="logo"
              className="w-20 h-20 object-cover rounded-full mx-auto mb-4"
            />
            <p style={{ fontSize: 24, fontWeight: 'bold', marginTop: 16 }}>
              登录 Agent iHub
            </p>
          </div>

          {/* 错误提示框 */}
          {loginError && (
            <div
              style={{
                backgroundColor: '#ffeaea',
                border: '1px solid #f5c6cb',
                borderRadius: '6px',
                padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span style={{ color: '#721c24', fontSize: '14px' }}>
                  {loginError}
                  {failedAttempts > 0 && ` (失败 ${failedAttempts} 次)`}
                </span>
                {showCaptcha ? (
                  <span style={{ color: '#721c24', fontSize: '14px' }}>
                    失败3次后需验证图片
                  </span>
                ) : (
                  ''
                )}
              </div>
              <CloseOutlined
                style={{
                  color: '#721c24',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
                onClick={handleCloseError}
              />
            </div>
          )}

          <Card className="auth-card">
            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="middle"
              autoComplete="off"
            >
              <Form.Item label="邮箱" name="email" style={{ marginBottom: 16 }}>
                <Input
                  prefix={<UserOutlined />}
                  placeholder="请输入邮箱"
                  autoComplete="email"
                  style={{ height: '46px' }}
                />
              </Form.Item>

              <Form.Item
                label="密码"
                name="password"
                style={{ marginBottom: 16 }}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                  style={{ height: '46px' }}
                />
              </Form.Item>

              {showCaptcha && (
                <Form.Item
                  label="图片验证码"
                  name="captcha"
                  style={{ marginBottom: 16 }}
                  validateTrigger={['onChange']}
                  rules={[
                    { required: true, message: '请输入图片验证码' },
                    {
                      validator: async (_, value) => {
                        const v = (value || '').trim();
                        // 已验证通过则不再触发
                        if (captchaVerified && captchaStatus === 'success') {
                          return Promise.resolve();
                        }

                        if (v.length < 5) {
                          setCaptchaStatus(undefined);
                          setCaptchaHelp(null);
                          setCaptchaVerified(false);
                          return Promise.resolve();
                        }

                        // 恰好5位时发起校验
                        setCaptchaStatus('validating');
                        const ok = await verifyCaptchaCode(v);
                        if (ok) {
                          setCaptchaStatus('success');
                          setCaptchaHelp('验证通过');
                          setCaptchaVerified(true);
                          return Promise.resolve();
                        }
                        // 校验失败：刷新图片并报错
                        setCaptchaStatus('error');
                        setCaptchaHelp('验证码错误，请重试');
                        setCaptchaVerified(false);
                        fetchCaptcha();
                        return Promise.reject('验证码错误');
                      },
                    },
                  ]}
                  validateStatus={captchaStatus}
                  help={
                    captchaStatus === 'success' ? (
                      <span style={{ color: '#52c41a' }}>
                        {captchaHelp || '验证通过'}
                      </span>
                    ) : captchaStatus === 'error' ? (
                      <span style={{ color: '#ff4d4f' }}>
                        {captchaHelp || captchaError || '验证码错误，请重试'}
                      </span>
                    ) : captchaError ? (
                      <span style={{ color: '#ff4d4f' }}>{captchaError}</span>
                    ) : undefined
                  }
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <Input
                      placeholder="请输入验证码"
                      maxLength={5}
                      style={{ height: '40px' }}
                      onChange={() => {
                        setCaptchaStatus(undefined);
                        setCaptchaHelp(null);
                        setCaptchaVerified(false);
                      }}
                    />
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <img
                        src={captchaImage}
                        alt="captcha"
                        style={{
                          height: 40,
                          width: 160,
                          border: '1px solid #f0f0f0',
                        }}
                        onClick={() => fetchCaptcha()}
                      />
                      <Button
                        type="text"
                        icon={<ReloadOutlined />}
                        onClick={() => fetchCaptcha()}
                        loading={captchaLoading}
                      />
                    </div>
                  </div>
                </Form.Item>
              )}

              <Form.Item>
                <div className="auth-options">
                  <Link to="/forgot-password" className="forgot-link">
                    忘记密码？
                  </Link>
                </div>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="auth-button"
                >
                  登录
                </Button>
              </Form.Item>
            </Form>

            <div className="auth-footer">
              <Text type="secondary">
                还没有账户？{' '}
                <Link to="/register" className="auth-link">
                  立即注册
                </Link>
              </Text>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
