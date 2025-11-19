import React, { useEffect, useMemo, useState } from 'react';
import { Form, Input, Button, Card, Typography, App } from 'antd';
import {
  MailOutlined,
  LockOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';
import { sendForgetPasswordCode, verifyCode, resetPassword } from '../../api';
import { apiCall } from '../../services/apiClient';
import logo from '@/assets/images/logo.png';

const { Title, Text } = Typography;

interface ForgotPasswordFormValues {
  email: string;
  emailCode: string;
  newPassword: string;
  confirmPassword: string;
}

const ForgotPassword: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const emailValue: string | undefined = Form.useWatch('email', form);
  const emailCodeValue: string | undefined = Form.useWatch('emailCode', form);
  const [verifyErrorMsg, setVerifyErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { message } = App.useApp();
  const navigate = useNavigate();

  // 倒计时效果
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  // 邮箱变更后需要重新验证
  useEffect(() => {
    if (emailVerified) {
      setEmailVerified(false);
    }
    if (verifyErrorMsg) {
      setVerifyErrorMsg(null);
    }
  }, [emailValue]);

  // 验证码变更后清除错误信息
  useEffect(() => {
    if (verifyErrorMsg) {
      setVerifyErrorMsg(null);
    }
  }, [emailCodeValue]);

  // 计算是否可以发送验证码
  const canSendCode = useMemo(() => {
    const hasValidEmail = !!emailValue && /.+@.+\..+/.test(emailValue);
    return hasValidEmail && countdown === 0 && !sendLoading;
  }, [emailValue, countdown, sendLoading]);

  // 发送忘记密码验证码
  const handleSendCode = async () => {
    try {
      const email: string = form.getFieldValue('email');
      await form.validateFields(['email']);
      setSendLoading(true);
      const res = await apiCall(
        () => sendForgetPasswordCode({ body: { email }, throwOnError: true }),
        {
          showSuccessNotification: true,
          successMessage: '验证码已发送，请查收邮箱',
        }
      );
      if (res.success) {
        setCountdown(60);
      } else {
        message.error(
          JSON.parse(res.message || '{}').msg + '，验证码发送失败。'
        );
      }
    } catch (error: any) {
      const apiMsg = error?.response?.data?.msg || error?.message;
      message.error(apiMsg || '验证码发送失败');
    } finally {
      setSendLoading(false);
    }
  };

  // 验证验证码
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

  // 提交重置密码表单
  const onFinish = async (values: ForgotPasswordFormValues) => {
    try {
      if (!emailVerified) {
        message.error('请先点击验证按钮完成邮箱验证码验证');
        return;
      }
      setLoading(true);
      const res = await apiCall(
        () =>
          resetPassword({
            body: {
              email: values.email,
              newPassword: values.newPassword,
            },
            throwOnError: true,
          }),
        {
          showSuccessNotification: true,
          successMessage: '密码重置成功',
        }
      );
      if (res.success) {
        setIsSuccess(true);
        // 5秒后自动跳转到登录页
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      }
    } catch (_error) {
      console.error('Reset password error:', _error);
    } finally {
      setLoading(false);
    }
  };

  // 成功视图
  if (isSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-right" style={{ width: '100%' }}>
          <div className="auth-content" style={{ textAlign: 'center' }}>
            <CheckCircleOutlined
              style={{
                fontSize: 72,
                color: '#52c41a',
                marginBottom: 24,
              }}
            />
            <Title level={2} className="auth-title">
              密码重置成功
            </Title>
            <Text
              type="secondary"
              style={{ fontSize: 16, display: 'block', marginBottom: 32 }}
            >
              您的密码已成功重置，请使用新密码登录
            </Text>
            <Button
              type="primary"
              size="large"
              className="auth-button"
              onClick={() => navigate('/login')}
              style={{ width: 200 }}
            >
              返回登录
            </Button>
            <div style={{ marginTop: 16 }}>
              <Text type="secondary" style={{ fontSize: 14 }}>
                页面将在 5 秒后自动跳转...
              </Text>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 表单视图
  return (
    <div className="auth-container">
      <div className="auth-right" style={{ width: '100%' }}>
        <div className="auth-content">
          <div className="auth-header">
            <img
              src={logo}
              alt="logo"
              style={{
                width: 60,
                height: 60,
                margin: 'auto',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
            <p
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                marginTop: 16,
                marginBottom: 0,
              }}
            >
              重置密码
            </p>
            <Text type="secondary" style={{ fontSize: 14 }}>
              通过邮箱验证码重置密码
            </Text>
          </div>

          <Card className="auth-card">
            <Form
              form={form}
              name="forgotPassword"
              onFinish={onFinish}
              layout="vertical"
              size="large"
              autoComplete="off"
              style={{ border: 'none' }}
              className="forgot-password-form"
            >
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
                label="新密码"
                name="newPassword"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 8, message: '密码至少8位' },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: '密码必须包含大小写字母和数字',
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入新密码"
                  autoComplete="new-password"
                />
              </Form.Item>

              <Form.Item
                label="确认密码"
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
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

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="auth-button"
                >
                  重置密码
                </Button>
              </Form.Item>
            </Form>

            <div className="auth-footer">
              <Text type="secondary">
                想起密码了？{' '}
                <Link to="/login" className="auth-link">
                  返回登录
                </Link>
              </Text>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
