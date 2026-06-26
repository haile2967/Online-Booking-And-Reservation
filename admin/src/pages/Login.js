import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, clearError, clearSuccess } from '../redux/slice/authSlice';
import { renderErrorMessage } from '../utils/errorHandler';
import { Form, Input, Button, Card, Typography, Alert, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

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
  }, [dispatch]);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (values) => {
    dispatch(loginUser(values));
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
      <Card
        style={{
          width: 420,
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
        }}
        styles={{ body: { padding: '24px' } }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ margin: 0, color: '#1e293b', fontWeight: 700 }}>
              <LoginOutlined style={{ marginRight: 8, color: '#4f46e5' }} />
              Login
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Sign in to Admin Dashboard
            </Text>
          </div>

          <Divider style={{ margin: '8px 0' }} />

          <Form
            name="login"
            onFinish={handleSubmit}
            layout="vertical"
            size="middle"
            initialValues={credentials}
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Enter your email"
                size="middle"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter your password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Enter your password"
                size="middle"
              />
            </Form.Item>

            {error && (
              <Alert
                message="Login Error"
                description={renderErrorMessage(error)}
                type="error"
                showIcon
                style={{ marginBottom: 12 }}
              />
            )}

            {success && (
              <Alert
                message="Success"
                description={success}
                type="success"
                showIcon
                style={{ marginBottom: 12 }}
              />
            )}

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="middle"
                style={{
                  width: '100%',
                  height: '40px',
                  fontSize: 14,
                  fontWeight: 600,
                  background: '#4f46e5',
                  borderColor: '#4f46e5',
                }}
                icon={<LoginOutlined />}
              >
                {loading ? 'Signing in...' : 'Login'}
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ margin: '8px 0' }} />

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              © {new Date().getFullYear()} Admin Dashboard
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Login;
