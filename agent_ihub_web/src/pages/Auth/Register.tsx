import React, { useEffect, useMemo, useState } from 'react';
import { Form, Input, Button, Card, Typography, Checkbox, App } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context';
import { useAuthActions } from '../../hooks/useAuthActions';
import './Auth.css';
import { sendRegistrationCode, verifyCode } from '../../api';
import {
  passwordFormValidator,
  passwordValidationMessages,
  usernameFormValidator,
  usernameValidationMessages,
} from '@/utils/validators';
import { apiCall } from '../../services/apiClient';
import logo from '@/assets/images/logo.png';

const { Title, Text } = Typography;

interface RegisterFormValues {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreement: boolean;
  emailCode?: string;
}

const Register: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const emailValue: string | undefined = Form.useWatch('email', form);
  const emailCodeValue: string | undefined = Form.useWatch('emailCode', form);
  const [verifyErrorMsg, setVerifyErrorMsg] = useState<string | null>(null);
  const { message } = App.useApp();
  const { setUser } = useAuth();
  const { register } = useAuthActions(setUser);

  const onFinish = async (values: RegisterFormValues) => {
    try {
      if (!emailVerified) {
        console.log('emailVerified', emailVerified);
        message.error('请先点击验证按钮完成邮箱验证码验证');
        console.log('请先完成邮箱验证码验证');
        return;
      }
      setLoading(true);
      await register(values.userName, values.email, values.password);
      // Success handling (including navigation) is done in AuthContext
    } catch (_error) {
      // Error notification is handled in AuthContext via handleApiNotification
      console.error('Registration form error:', _error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const canSendCode = useMemo(() => {
    const hasValidEmail = !!emailValue && /.+@.+\..+/.test(emailValue);
    return hasValidEmail && countdown === 0 && !sendLoading;
  }, [emailValue, countdown, sendLoading]);

  useEffect(() => {
    // 邮箱变更后需要重新验证
    if (emailVerified) {
      setEmailVerified(false);
    }
    if (verifyErrorMsg) {
      setVerifyErrorMsg(null);
    }
  }, [emailValue]);

  useEffect(() => {
    if (verifyErrorMsg) {
      setVerifyErrorMsg(null);
    }
  }, [emailCodeValue]);

  const handleSendCode = async () => {
    try {
      const email: string = form.getFieldValue('email');
      await form.validateFields(['email']);
      setSendLoading(true);
      const res = await apiCall(
        () => sendRegistrationCode({ body: { email }, throwOnError: true }),
        {
          showSuccessNotification: true,
          successMessage: '验证码已发送，请查收邮箱',
        }
      );
      if (res.success) {
        setCountdown(60);
      } else {
        const response = JSON.parse(res.message || '{}');
        message.error(response.msg);
      }
    } catch (error) {
      console.error('error', error);
      message.error('验证码发送失败');
    } finally {
      setSendLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      const email: string = form.getFieldValue('email');
      const code: string = form.getFieldValue('emailCode');
      await form.validateFields(['email', 'emailCode']);
      setVerifyLoading(true);
      setVerifyErrorMsg(null);
      const res = await apiCall<boolean>(() =>
        verifyCode({ body: { email, code }, throwOnError: true })
      );
      if (res.success && res.data === true) {
        setEmailVerified(true);
        message.success('邮箱已验证');
      } else {
        setEmailVerified(false);
        const msg = '验证码已过期或无效';
        setVerifyErrorMsg(msg);
        message.error(msg);
      }
    } finally {
      setVerifyLoading(false);
    }
  };

  // const handleSocialLogin = (provider: string) => {
  //   message.info(`${provider} 注册功能开发中...`);
  // };

  return (
    <div className="auth-container">
      {/* Left side - Visual/Branding */}
      <div className="auth-left" style={{ backgroundColor: '#8c8c8c' }}>
        <div className="auth-visual">
          <img
            src={logo}
            alt="logo"
            className="w-20 h-20 object-cover rounded-full mx-auto mb-2"
          />

          <Title level={1} className="auth-visual-title">
            Agent iHub
          </Title>
          <Text className="auth-visual-subtitle">
            构建属于您的AI Agent生态系统
          </Text>

          <ul className="auth-features">
            <li>快速创建和部署Agent</li>
            <li>团队协作与知识共享</li>
            <li>版本控制与迭代管理</li>
            <li>丰富的模板与组件库</li>
          </ul>
        </div>
        {/* 插入图片 */}
      </div>

      {/* Right side - Register Form */}
      <div className="auth-right">
        <div className="auth-content">
          <div className="auth-header">
            <Title level={2} className="auth-title">
              创建你的账户
            </Title>
            <Text type="secondary" className="auth-subtitle">
              加入 Agent iHub，开始管理你的 AI Agent 配置
            </Text>
            {/* <img src="/favicon.ico" alt="logo" style={{ width: 48, height: 48 }} /> */}
          </div>

          <Card className="auth-card">
            <Form
              form={form}
              name="register"
              onFinish={onFinish}
              layout="vertical"
              size="large"
              autoComplete="off"
              style={{ border: 'none' }}
              className="register-form"
            >
              <Form.Item
                label="用户名"
                name="userName"
                rules={[
                  {
                    required: true,
                    message: usernameValidationMessages.required,
                  },
                  usernameFormValidator(),
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="请输入用户名"
                  autoComplete="userName"
                />
              </Form.Item>

              <Form.Item
                label="邮箱"
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <div style={{ display: 'flex', gap: 8 }}>
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="请输入邮箱"
                    autoComplete="email"
                  />
                  <Button
                    onClick={handleSendCode}
                    disabled={!canSendCode}
                    loading={sendLoading}
                  >
                    {countdown > 0 ? `${countdown}s` : '发送验证码'}
                  </Button>
                </div>
              </Form.Item>

              <Form.Item
                label={
                  <span>
                    验证码{' '}
                    {emailVerified ? (
                      <span style={{ color: '#52c41a' }}>（验证成功）</span>
                    ) : null}
                  </span>
                }
                name="emailCode"
                rules={[
                  { required: true, message: '请输入邮箱验证码' },
                  { pattern: /^\d+$/, message: '验证码只能输入数字' },
                ]}
                validateStatus={verifyErrorMsg ? 'error' : undefined}
                help={
                  verifyErrorMsg ? (
                    <span style={{ color: '#ff4d4f' }}>{verifyErrorMsg}</span>
                  ) : undefined
                }
              >
                <div style={{ display: 'flex', gap: 8 }}>
                  <Input
                    placeholder="请输入验证码"
                    maxLength={8}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/\D/g, '');
                      if (onlyDigits !== e.target.value) {
                        form.setFieldsValue({ emailCode: onlyDigits });
                      }
                    }}
                  />
                  <Button
                    type="default"
                    onClick={handleVerifyCode}
                    loading={verifyLoading}
                  >
                    验证
                  </Button>
                </div>
              </Form.Item>

              <Form.Item
                label="密码"
                name="password"
                rules={[
                  {
                    required: true,
                    message: passwordValidationMessages.required,
                  },
                  passwordFormValidator(),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入密码"
                  autoComplete="new-password"
                />
              </Form.Item>

              <Form.Item
                label="确认密码"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请再次输入密码"
                  autoComplete="new-password"
                />
              </Form.Item>

              <Form.Item
                name="agreement"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(new Error('请同意服务条款')),
                  },
                ]}
              >
                <Checkbox>
                  我已阅读并同意{' '}
                  {/* <Link to="/terms" className="auth-link">
                    服务条款
                  </Link>{' '}
                  和{' '} */}
                  <Link
                    to="/privacy-content"
                    target="_blank"
                    className="auth-link"
                  >
                    隐私政策
                  </Link>
                </Checkbox>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="auth-button"
                >
                  创建账户
                </Button>
              </Form.Item>
            </Form>

            <div className="auth-footer">
              <Text type="secondary">
                已有账户？{' '}
                <Link to="/login" className="auth-link">
                  立即登录
                </Link>
              </Text>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
