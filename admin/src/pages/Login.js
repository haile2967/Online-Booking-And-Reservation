import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, forgotPassword, clearError, clearSuccess } from '../redux/slice/authSlice';
import { renderErrorMessage } from '../utils/errorHandler';
import { Form, Input, Button, Card, Typography, Alert, Space, Divider, Spin } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, MailOutlined, ArrowLeftOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import api from '../services/api';

const Login = () => {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [serverStatus, setServerStatus] = useState('waking'); // 'waking' | 'ready' | 'hidden'

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, success, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Clear error and success messages when component mounts
    dispatch(clearError());
    dispatch(clearSuccess());
  }, [dispatch, isForgotPassword]); // Also clear when toggling forms

  // Warm up the server on page load
  useEffect(() => {
    let hideTimer;
    const warmUpServer = async () => {
      try {
        await api.get('/Health');
        setServerStatus('ready');
        // Auto-hide the status banner after 3 seconds
        hideTimer = setTimeout(() => setServerStatus('hidden'), 3000);
      } catch {
        // Even if it fails, the request itself may have triggered the container wake-up
        // Retry once after a delay
        setTimeout(async () => {
          try {
            await api.get('/Health');
            setServerStatus('ready');
            hideTimer = setTimeout(() => setServerStatus('hidden'), 3000);
          } catch {
            setServerStatus('hidden');
          }
        }, 5000);
      }
    };
    warmUpServer();
    return () => clearTimeout(hideTimer);
  }, []);

  const handleLoginSubmit = async (values) => {
    dispatch(loginUser(values));
  };

  const handleForgotSubmit = async (values) => {
    dispatch(forgotPassword(values.email));
  };

  const { Title, Text } = Typography;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        minWidth: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
        backgroundSize: 'cover',
        overflow: 'hidden',
      }}
    >
      <div 
        style={{
          width: 420,
          perspective: '1000px',
        }}
      >
        <Card
          style={{
            borderRadius: 12,
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            transform: `scale(${isForgotPassword ? 0.98 : 1})`,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          styles={{ body: { padding: '32px 24px' } }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ margin: 0, color: '#1e293b', fontWeight: 800, letterSpacing: '-0.5px' }}>
                {!isForgotPassword ? (
                  <><LoginOutlined style={{ marginRight: 10, color: '#4f46e5' }} />Admin Login</>
                ) : (
                  <><MailOutlined style={{ marginRight: 10, color: '#4f46e5' }} />Reset Password</>
                )}
              </Title>
              <Text type="secondary" style={{ fontSize: 14, display: 'block', marginTop: '8px' }}>
                {!isForgotPassword ? 'Sign in to manage your bookings' : 'Enter your email to receive a new password'}
              </Text>
            </div>

            <Divider style={{ margin: '0' }} />

            {/* Server warm-up status banner */}
            {serverStatus === 'waking' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '10px 16px',
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                  border: '1px solid #f59e0b',
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              >
                <Spin indicator={<LoadingOutlined style={{ fontSize: 16, color: '#d97706' }} spin />} />
                <Text style={{ color: '#92400e', fontSize: 13, fontWeight: 500 }}>
                  Waking up server... This may take a moment
                </Text>
              </div>
            )}

            {serverStatus === 'ready' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '10px 16px',
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                  border: '1px solid #10b981',
                  transition: 'opacity 0.5s ease',
                }}
              >
                <CheckCircleOutlined style={{ fontSize: 16, color: '#059669' }} />
                <Text style={{ color: '#065f46', fontSize: 13, fontWeight: 500 }}>
                  Server is ready!
                </Text>
              </div>
            )}

            {error && (
              <Alert
                message="Error"
                description={renderErrorMessage(error)}
                type="error"
                showIcon
              />
            )}

            {success && (
              <Alert
                message="Success"
                description={success}
                type="success"
                showIcon
              />
            )}

            {!isForgotPassword ? (
              /* LOGIN FORM */
              <Form
                name="login"
                onFinish={handleLoginSubmit}
                layout="vertical"
                size="large"
                initialValues={credentials}
              >
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter your email!' },
                    { type: 'email', message: 'Please enter a valid email!' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                    placeholder="Admin Email"
                    style={{ borderRadius: '6px' }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: 'Please enter your password!' },
                    { min: 6, message: 'Password must be at least 6 characters!' }
                  ]}
                  style={{ marginBottom: '12px' }}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                    placeholder="Password"
                    style={{ borderRadius: '6px' }}
                  />
                </Form.Item>

                <div style={{ textAlign: 'right', marginBottom: '24px' }}>
                  <Button 
                    type="link" 
                    onClick={() => setIsForgotPassword(true)}
                    style={{ padding: 0, color: '#4f46e5', fontWeight: 500 }}
                  >
                    Forgot Password?
                  </Button>
                </div>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    size="large"
                    style={{
                      fontWeight: 600,
                      background: 'linear-gradient(to right, #4f46e5, #6366f1)',
                      border: 'none',
                      borderRadius: '8px',
                      height: '44px',
                      boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)',
                    }}
                  >
                    {loading ? 'Signing in...' : 'Login Securely'}
                  </Button>
                </Form.Item>
              </Form>
            ) : (
              /* FORGOT PASSWORD FORM */
              <Form
                name="forgot_password"
                onFinish={handleForgotSubmit}
                layout="vertical"
                size="large"
              >
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter your registered email!' },
                    { type: 'email', message: 'Please enter a valid email!' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                    placeholder="Enter your registered email"
                    style={{ borderRadius: '6px' }}
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: '16px', marginTop: '8px' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    size="large"
                    style={{
                      fontWeight: 600,
                      background: 'linear-gradient(to right, #4f46e5, #6366f1)',
                      border: 'none',
                      borderRadius: '8px',
                      height: '44px',
                      boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)',
                    }}
                  >
                    {loading ? 'Sending Request...' : 'Reset Password'}
                  </Button>
                </Form.Item>

                <div style={{ textAlign: 'center' }}>
                  <Button 
                    type="link" 
                    onClick={() => setIsForgotPassword(false)}
                    icon={<ArrowLeftOutlined />}
                    style={{ color: '#64748b', fontWeight: 500 }}
                  >
                    Back to Login
                  </Button>
                </div>
              </Form>
            )}

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                © {new Date().getFullYear()} Booking System Admin
              </Text>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default Login;
