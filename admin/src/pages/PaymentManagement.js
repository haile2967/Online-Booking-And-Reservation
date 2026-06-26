import React, { useEffect } from 'react';
import { Card, Table, Button, Space, Typography, Row, Col, Statistic, message, Modal, Descriptions, Tag } from 'antd';
import { ReloadOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayments, fetchPaymentStats, verifyPayments, clearVerificationResult } from '../redux/slice/PaymentsSlice';

const { Title } = Typography;

const PaymentManagement = () => {
  const dispatch = useDispatch();
  const paymentsState = useSelector((state) => state.payments || {});
  const { 
    payments = [], 
    stats = { total: 0, total_amount: 0, pending: 0 }, 
    loading = false, 
    error = null,
    verificationResult = null
  } = paymentsState;

  useEffect(() => {
    dispatch(fetchPayments({ sort: 'payment_date desc' }));
    dispatch(fetchPaymentStats());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchPayments({ sort: 'payment_date desc' }));
    dispatch(fetchPaymentStats());
  };

  const handleVerifyPayments = async () => {
    try {
      console.log("�� Verifying payments...");
      await dispatch(verifyPayments()).unwrap();
      
      // Refresh data after verification
      dispatch(fetchPayments({ sort: 'payment_date desc' }));
      dispatch(fetchPaymentStats());
      
      message.success('Payment verification completed successfully!');
    } catch (error) {
      message.error(error.message || 'Failed to verify payments');
      console.error('Error verifying payments:', error);
    }
  };

  const handleCloseVerificationModal = () => {
    dispatch(clearVerificationResult());
  };

  const columns = [
    {
      title: 'User',
      dataIndex: ['booking', 'user', 'full_name'],
      key: 'user_name',
      render: (text, record) => record.booking?.user?.full_name || 'N/A',
    },
    {
      title: 'Service',
      dataIndex: ['booking', 'service', 'name'],
      key: 'service_name',
      render: (text, record) => record.booking?.service?.name || 'N/A',
    },
    {
      title: 'Base Price',
      dataIndex: ['booking', 'service', 'base_price'],
      key: 'base_price',
      render: (text, record) => {
        const basePrice = record.booking?.service?.base_price || 0;
        return `${parseFloat(basePrice).toFixed(2)} ETB`;
      },
    },
    {
      title: 'Amount Paid',
      dataIndex: 'amount_paid',
      key: 'amount_paid',
      render: (text) => `${parseFloat(text).toFixed(2)} ETB`,
    },
    {
      title: 'Remaining Amount',
      key: 'remaining_amount',
      render: (text, record) => {
        const basePrice = record.booking?.service?.base_price || 0;
        const amountPaid = parseFloat(record.amount_paid) || 0;
        const remaining = basePrice - amountPaid;
        const color = remaining > 0 ? '#ff4d4f' : remaining < 0 ? '#52c41a' : '#666';
        return (
          <span style={{ color }}>
            {remaining.toFixed(2)} ETB
          </span>
        );
      },
    },
    {
      title: 'Method',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (text) => (
        <span style={{ 
          color: text === 'M_Pesa' ? '#f5222d' : 
                 text === 'CBE_Birr' ? '#52c41a' : 
                 text === 'Bank_Transfer' ? '#1890ff' : '#666' 
        }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'payment_type',
      key: 'payment_type',
      render: (text) => (
        <span style={{ 
          color: text === 'full' ? '#52c41a' : 
                 text === 'deposit' ? '#faad14' : '#666' 
        }}>
          {text.charAt(0).toUpperCase() + text.slice(1)}
        </span>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'payment_date',
      key: 'payment_date',
      render: (text) => new Date(text).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <Title level={2} style={{ margin: 0 }}>
            Payment Management
          </Title>
          <p style={{ color: '#666', margin: '8px 0 0 0' }}>
            View and manage all payments, verify pending deposits, and monitor financial transactions.
          </p>
        </div>

        {/* Verify Payments Button */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleVerifyPayments}
            loading={loading}
          >
            Verify Payments
          </Button>
        </div>

        {/* Payments Table */}
        <div>
          <Table
            columns={columns}
            dataSource={payments}
            rowKey="payment_id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            }}
          />
        </div>
      </Card>

      {/* Verification Result Modal */}
      <Modal
        title={
          <Space>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
            <span>Payment Verification Results</span>
          </Space>
        }
        open={!!verificationResult}
        onCancel={handleCloseVerificationModal}
        footer={[
          <Button key="close" onClick={handleCloseVerificationModal}>
            Close
          </Button>
        ]}
        width={700}
      >
        {verificationResult && (
          <div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Message">
                {verificationResult.message}
              </Descriptions.Item>
              <Descriptions.Item label="Total Processed">
                {verificationResult.total_processed}
              </Descriptions.Item>
              <Descriptions.Item label="Total Updated">
                {verificationResult.total_updated}
              </Descriptions.Item>
            </Descriptions>
            
            {verificationResult.updated_bookings && verificationResult.updated_bookings.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4>Updated Bookings:</h4>
                <Table
                  dataSource={verificationResult.updated_bookings}
                  columns={[
                    { title: 'Booking ID', dataIndex: 'booking_id', key: 'booking_id' },
                    { title: 'Status', dataIndex: 'status', key: 'status',
                      render: (text) => <Tag color="green">{text}</Tag> },
                    { title: 'Total Paid', dataIndex: 'total_paid', key: 'total_paid',
                      render: (text) => `${parseFloat(text).toFixed(2)} ETB` },
                    { title: 'Total Required', dataIndex: 'total_required', key: 'total_required',
                      render: (text) => `${parseFloat(text).toFixed(2)} ETB` }
                  ]}
                  pagination={false}
                  size="small"
                />
              </div>
            )}
            
            {verificationResult.updated_schedules && verificationResult.updated_schedules.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4>Updated Schedules:</h4>
                <Table
                  dataSource={verificationResult.updated_schedules}
                  columns={[
                    { title: 'Schedule ID', dataIndex: 'schedule_id', key: 'schedule_id' },
                    { title: 'Status', dataIndex: 'status', key: 'status',
                      render: (text) => <Tag color="red">{text}</Tag> },
                    { title: 'Booking ID', dataIndex: 'booking_id', key: 'booking_id' }
                  ]}
                  pagination={false}
                  size="small"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentManagement;