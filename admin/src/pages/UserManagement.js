import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Table, Button, Space, message, Typography, Row, Col, Tag, Modal, Input, Select } from 'antd';
import { ReloadOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { 
  fetchUsers, 
  fetchUserDetails, 
  fetchUserBookings, 
  updateUser, 
  deleteUser,
  setSelectedUser,
  clearSelectedUser,
  setSearchTerm,
  setFilterStatus,
  clearError
} from '../redux/slice/userslice';

const { Title } = Typography;
const { Option } = Select;

const UserManagement = () => {
  const dispatch = useDispatch();
  const { 
    users, 
    selectedUser, 
    userBookings, 
    loading, 
    error, 
    searchTerm, 
    filterStatus 
  } = useSelector(state => state.userManagement);

  const [showUserDetails, setShowUserDetails] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  // Fetch users on component mount
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Handle user selection
  const handleUserSelect = async (user) => {
    dispatch(setSelectedUser(user));
    setShowUserDetails(true);
    
    // Fetch user details and bookings
    await Promise.all([
      dispatch(fetchUserDetails(user.userId)),
      dispatch(fetchUserBookings(user.userId))
    ]);
  };

  // Handle search
  const handleSearch = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  // Handle filter
  const handleFilterChange = (value) => {
    dispatch(setFilterStatus(value));
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || ''
    });
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    try {
      await dispatch(updateUser({ 
        userId: editingUser.userId, 
        userData: editForm 
      })).unwrap();
      message.success('User updated successfully');
      setEditingUser(null);
      setEditForm({ fullName: '', email: '', phone: '' });
    } catch (err) {
      message.error(err.message || 'Failed to update user');
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    try {
      await dispatch(deleteUser(userId)).unwrap();
      message.success('User deleted successfully');
      if (selectedUser && selectedUser.userId === userId) {
        setShowUserDetails(false);
      }
    } catch (err) {
      message.error(err.message || 'Failed to delete user');
    }
  };

  // Close user details
  const handleCloseDetails = () => {
    setShowUserDetails(false);
    dispatch(clearSelectedUser());
  };

  // Clear error
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Filter and search users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && userBookings.length > 0) ||
                         (filterStatus === 'inactive' && userBookings.length === 0);
    
    return matchesSearch && matchesFilter;
  });

  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text) => (
        <span style={{ fontWeight: 500, color: '#1890ff' }}>
          {text || 'No Name'}
        </span>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => (
        <span style={{ color: '#666' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => (
        <span style={{ color: '#666' }}>
          {text || 'Not provided'}
        </span>
      ),
    },
    {
      title: 'Joined Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => (
        <span style={{ color: '#666', fontSize: '12px' }}>
          {text ? new Date(text).toLocaleDateString() : 'Unknown'}
        </span>
      ),
    },

    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleUserSelect(record)}
          size="small"
        >
          View
        </Button>
      ),
    },
  ];



  return (
    <div style={{ padding: '24px' }}>
      <Card>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <Title level={2} style={{ margin: 0 }}>
            User Management
          </Title>
          <p style={{ color: '#666', margin: '8px 0 0 0' }}>
            Manage registered users and view their booking history. Search, filter, and manage user accounts.
          </p>
        </div>



        {/* Filters and Search */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <Space wrap>
            <Input
              placeholder="Search by name, email, or phone..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={handleSearch}
              style={{ width: 300 }}
              allowClear
            />
            <Select
              placeholder="Filter by status"
              value={filterStatus}
              onChange={handleFilterChange}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="all">All Users</Option>
              <Option value="active">Active Users</Option>
              <Option value="inactive">Inactive Users</Option>
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => dispatch(fetchUsers())}
            >
              Refresh
            </Button>
          </Space>
        </div>

        {/* Users Table */}
        <div>
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="userId"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
          />
        </div>
      </Card>

      {/* User Details Modal */}
      <Modal
        title="User Details"
        open={showUserDetails && selectedUser}
        onCancel={handleCloseDetails}
        footer={null}
        width={800}
        destroyOnClose
      >
        {selectedUser && (
          <div>
            {/* User Information */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: '#1890ff' }}>Contact Information</h3>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Full Name</label>
                    <p style={{ margin: 0, color: '#666' }}>{selectedUser.fullName || 'Not provided'}</p>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Email</label>
                    <p style={{ margin: 0, color: '#666' }}>{selectedUser.email}</p>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Phone</label>
                    <p style={{ margin: 0, color: '#666' }}>{selectedUser.phone || 'Not provided'}</p>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Joined</label>
                    <p style={{ margin: 0, color: '#666' }}>
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Unknown'}
                    </p>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Booking History */}
            <div>
              <h3 style={{ marginBottom: '16px', color: '#1890ff' }}>Booking History</h3>
              {userBookings.length === 0 ? (
                <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No bookings found</p>
              ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {userBookings.map((booking) => (
                    <Card
                      key={booking.bookingId}
                      size="small"
                      style={{ marginBottom: '8px' }}
                    >
                      <Row justify="space-between" align="middle">
                        <Col span={16}>
                          <div>
                            <p style={{ margin: 0, fontWeight: 500 }}>
                              {booking.service?.name || 'Unknown Service'}
                            </p>
                            <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
                              {booking.schedule?.startDate ? new Date(booking.schedule.startDate).toLocaleDateString() : 'No date'}
                            </p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                              {booking.schedule?.startTime && booking.schedule?.endTime 
                                ? `${booking.schedule.startTime} - ${booking.schedule.endTime}`
                                : 'No time specified'}
                            </p>
                          </div>
                        </Col>
                        <Col span={8} style={{ textAlign: 'right' }}>
                          <Tag
                            color={
                              booking.status === 'Confirmed' ? 'green' :
                              booking.status === 'Pending' ? 'orange' :
                              booking.status === 'Cancelled' ? 'red' : 'default'
                            }
                          >
                            {booking.status}
                          </Tag>
                          <p style={{ margin: '4px 0 0 0', fontWeight: 500 }}>
                            ${booking.totalAmount?.toFixed(2) || '0.00'}
                          </p>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Edit User"
        open={!!editingUser}
        onCancel={() => setEditingUser(null)}
        onOk={handleSaveEdit}
        confirmLoading={loading}
        destroyOnClose
      >
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px' }}>
              Full Name
            </label>
            <Input
              value={editForm.fullName}
              onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
              placeholder="Enter full name"
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px' }}>
              Email
            </label>
            <Input
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              placeholder="Enter email"
              type="email"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px' }}>
              Phone
            </label>
            <Input
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              placeholder="Enter phone number"
              type="tel"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;