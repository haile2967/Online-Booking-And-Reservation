import React, { useEffect } from 'react';
import { Card, Table, Button, Space, Popconfirm, message, Typography, Row, Col, Statistic, Tag, Select, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchServices, 
  deleteService, 
  setFormVisible, 
  setEditingService,
  fetchServicesByCategory,
  fetchServicesByStatus,
  fetchServicesByPriceRange,
  updateServiceStatus
} from '../redux/slice/ServicesSlice';
import { fetchCategories } from '../redux/slice/Categoriesslice';
import ServicesForm from '../components/ServicesForm';

const { Title } = Typography;

const Services = () => {
  const dispatch = useDispatch();
  const servicesState = useSelector((state) => state.services);
  const categoriesState = useSelector((state) => state.categories);
  
  // Add fallback for undefined state
  const { services = [], loading = false, error = null } = servicesState || {};
  const { categories = [] } = categoriesState || {};

  // Filter states
  const [filterCategory, setFilterCategory] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('');
  const [priceRange, setPriceRange] = React.useState({ min: '', max: '' });

  useEffect(() => {
    dispatch(fetchServices());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleAdd = () => {
    dispatch(setEditingService(null));
    dispatch(setFormVisible(true));
  };

  const handleEdit = (record) => {
    dispatch(setEditingService(record));
    dispatch(setFormVisible(true));
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteService(id)).unwrap();
      message.success('Service deleted successfully');
      // Refresh the services list after deletion
      dispatch(fetchServices());
    } catch (error) {
      message.error(error.message || 'Failed to delete service');
    }
  };

  const handleRefresh = () => {
    dispatch(fetchServices());
    setFilterCategory('');
    setFilterStatus('');
    setPriceRange({ min: '', max: '' });
  };

  // Add effect to refresh services after form closes (for updates)
  useEffect(() => {
    if (!servicesState?.formVisible && servicesState?.editingService === null) {
      // Refresh services when form closes after editing
      dispatch(fetchServices());
    }
  }, [servicesState?.formVisible, servicesState?.editingService, dispatch]);

  const handleFilterByCategory = (categoryId) => {
    setFilterCategory(categoryId);
    if (categoryId) {
      dispatch(fetchServicesByCategory(categoryId));
    } else {
      dispatch(fetchServices());
    }
  };

  const handleFilterByStatus = (status) => {
    setFilterStatus(status);
    if (status) {
      dispatch(fetchServicesByStatus(status));
    } else {
      dispatch(fetchServices());
    }
  };

  const handleFilterByPriceRange = () => {
    if (priceRange.min && priceRange.max) {
      dispatch(fetchServicesByPriceRange({ 
        minPrice: priceRange.min, 
        maxPrice: priceRange.max 
      }));
    }
  };

  const handleStatusChange = async (serviceId, newStatus) => {
    try {
      await dispatch(updateServiceStatus({ id: serviceId, status: newStatus })).unwrap();
      message.success('Service status updated successfully');
    } catch (error) {
      message.error(error.message || 'Failed to update service status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'green';
      case 'Unavailable':
        return 'red';
      case 'Maintenance':
        return 'orange';
      default:
        return 'default';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };



  const columns = [
    {
      title: 'Service Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      render: (text) => (
        <span style={{ fontWeight: 500, color: '#1890ff' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: '15%',
      render: (category) => (
        <Tag color="blue">
          {category?.name || 'Unknown'}
        </Tag>
      ),
    },
    {
      title: 'Base Price',
      dataIndex: 'basePrice',
      key: 'basePrice',
      width: '15%',
      render: (price) => (
        <span style={{ fontWeight: 600, color: '#52c41a' }}>
          {formatPrice(price)}
        </span>
      ),
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      width: '12%',
      render: (capacity) => (
        <span style={{ color: '#666' }}>
          {capacity} {capacity === 1 ? 'person' : 'people'}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Cancellation Policy',
      dataIndex: 'cancellationPolicy',
      key: 'cancellationPolicy',
      width: '18%',
      render: (policy) => {
        if (!policy) return <Tag color="default">No Policy</Tag>;
        return (
          <Tag color="orange">
            {policy.noticeHours}h notice - {policy.refundPercentage}% refund
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '8%',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this service?"
            onConfirm={() => handleDelete(record.serviceId)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const availableServices = services.filter(service => service.status === 'Available');
  const totalRevenue = services.reduce((sum, service) => sum + (service.basePrice || 0), 0);

  return (
    <div style={{ padding: '24px', maxWidth: '100%', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ margin: 0 }}>
          Services Management
        </Title>
        <p style={{ color: '#666', margin: '8px 0 0 0' }}>
          Manage and organize your services. Create, edit, and delete services to offer a comprehensive range of options to your clients.
        </p>
      </div>

      {/* Filters and Add Button */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <Space wrap>
          <Select
            placeholder="Filter by Category"
            style={{ width: 150 }}
            value={filterCategory}
            onChange={handleFilterByCategory}
            allowClear
            loading={categoriesState?.loading}
          >
            {categories.map((category) => (
              <Select.Option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Filter by Status"
            style={{ width: 150 }}
            value={filterStatus}
            onChange={handleFilterByStatus}
            allowClear
          >
            <Select.Option value="Available">Available</Select.Option>
            <Select.Option value="Unavailable">Unavailable</Select.Option>
            <Select.Option value="Maintenance">Maintenance</Select.Option>
          </Select>
          <Space>
            <InputNumber
              placeholder="Min Price"
              style={{ width: 100 }}
              value={priceRange.min}
              onChange={(value) => setPriceRange({ ...priceRange, min: value })}
            />
            <span>-</span>
            <InputNumber
              placeholder="Max Price"
              style={{ width: 100 }}
              value={priceRange.max}
              onChange={(value) => setPriceRange({ ...priceRange, max: value })}
            />
            <Button 
              icon={<FilterOutlined />}
              onClick={handleFilterByPriceRange}
              disabled={!priceRange.min || !priceRange.max}
            >
              Filter
            </Button>
          </Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Space>
        
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add Service
        </Button>
      </div>

      {/* Services Table */}
      <div style={{ width: '100%' }}>
        <Table
          columns={columns}
          dataSource={services}
          rowKey="serviceId"
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

      {/* Form Modal */}
      <ServicesForm />
    </div>
  );
};

export default Services; 