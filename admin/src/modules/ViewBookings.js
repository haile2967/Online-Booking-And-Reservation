import React, { useEffect } from 'react';
import { Card, Table, Button, Space, Popconfirm, message, Typography, Row, Col, Statistic } from 'antd';
import { ReloadOutlined, EditOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookings, fetchBookingStats, setFormVisible, setEditingBooking } from '../redux/slice/BookingsSlice';
import BookingsForm from '../components/BookingsForm';

const { Title } = Typography;

const Bookings = () => {
  const dispatch = useDispatch();
  const bookingsState = useSelector((state) => state.bookings || {});
  const { bookings = [], stats = { total: 0, pending: 0 }, loading = false, error = null } = bookingsState;

  useEffect(() => {
    dispatch(fetchBookings());
    dispatch(fetchBookingStats());
  }, [dispatch]);

  const handleEdit = (record) => {
    dispatch(setEditingBooking(record));
    dispatch(setFormVisible(true));
  };

  const handleRefresh = () => {
    dispatch(fetchBookings());
    dispatch(fetchBookingStats());
  };

  const columns = [
    {
      title: 'User',
      dataIndex: ['user', 'fullName'],
      key: 'user_name',
    },
    {
      title: 'Service',
      dataIndex: ['service', 'name'],
      key: 'service_name',
    },
    {
      title: 'Date',
      dataIndex: ['schedule', 'startDate'],
      key: 'start_date',
      render: (text) => text ? new Date(text).toLocaleDateString('en-US', { dateStyle: 'medium' }) : '-',
    },
    {
      title: 'Time',
      key: 'time',
      render: (_, record) => {
        if (record.schedule && record.schedule.startTime && record.schedule.endTime) {
          return `${record.schedule.startTime} - ${record.schedule.endTime}`;
        }
        return '-';
      },
    },
    {
      title: 'Resource',
      dataIndex: ['schedule', 'resource', 'name'],
      key: 'resource_name',
    },
    {
      title: 'Amount (ETB)',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (text) => text ? `${text.toFixed(2)} ETB` : '0.00 ETB',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text) => (
        <span style={{
          color: text === 'Confirmed' ? '#52c41a' : text === 'Pending' ? '#faad14' : '#ff4d4f',
        }}>
          {text}
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <Title level={2} style={{ margin: 0 }}>
            Booking Management
          </Title>
          <p style={{ color: '#666', margin: '8px 0 0 0' }}>
            Manage all bookings, approve pending bookings, and update statuses.
          </p>
        </div>

        {/* Bookings Table */}
        <div>
          <Table
            columns={columns}
            dataSource={bookings}
            rowKey="bookingId"
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

      {/* Form Modal */}
      <BookingsForm />
    </div>
  );
};

export default Bookings;