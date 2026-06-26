import React, { useEffect } from 'react';
import { Card, Table, Button, Space, Popconfirm, message, Typography, Row, Col, Statistic, Tag, Select, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchResources, 
  deleteResource, 
  setFormVisible, 
  setEditingResource,
  fetchResourcesByService,
  fetchResourcesByType
} from '../redux/slice/ResourcesSlice';
import { fetchServices } from '../redux/slice/ServicesSlice';
import ResourcesForm from '../components/ResourcesForm';

const { Title } = Typography;

const Resources = () => {
  const dispatch = useDispatch();
  const resourcesState = useSelector((state) => state.resources);
  const servicesState = useSelector((state) => state.services);
  
  // Add fallback for undefined state
  const { resources = [], loading = false, error = null } = resourcesState || {};
  const { services = [] } = servicesState || {};

  // Filter states
  const [filterService, setFilterService] = React.useState('');
  const [filterType, setFilterType] = React.useState('');
  const [quantityRange, setQuantityRange] = React.useState({ min: '', max: '' });

  useEffect(() => {
    dispatch(fetchResources());
    dispatch(fetchServices());
  }, [dispatch]);

  const handleAdd = () => {
    dispatch(setEditingResource(null));
    dispatch(setFormVisible(true));
  };

  const handleEdit = (record) => {
    dispatch(setEditingResource(record));
    dispatch(setFormVisible(true));
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteResource(id)).unwrap();
      message.success('Resource deleted successfully');
    } catch (error) {
      message.error(error.message || 'Failed to delete resource');
    }
  };

  const handleRefresh = () => {
    dispatch(fetchResources());
    setFilterService('');
    setFilterType('');
    setQuantityRange({ min: '', max: '' });
  };

  const handleFilterByService = (serviceId) => {
    setFilterService(serviceId);
    if (serviceId) {
      dispatch(fetchResourcesByService(serviceId));
    } else {
      dispatch(fetchResources());
    }
  };

  const handleFilterByType = (type) => {
    setFilterType(type);
    if (type) {
      dispatch(fetchResourcesByType(type));
    } else {
      dispatch(fetchResources());
    }
  };

  const handleFilterByQuantityRange = () => {
    if (quantityRange.min && quantityRange.max) {
      // Filter locally since we don't have a specific API for quantity range
      const filtered = resources.filter(resource => 
        resource.quantity >= quantityRange.min && resource.quantity <= quantityRange.max
      );
      // You might want to implement this as a local filter or add an API endpoint
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Facility':
        return 'blue';
      case 'Equipment':
        return 'green';
      case 'Vehicle':
        return 'orange';
      case 'Staff':
        return 'purple';
      case 'Other':
        return 'default';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Resource Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <span style={{ fontWeight: 500, color: '#1890ff' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Service',
      dataIndex: 'service',
      key: 'service',
      render: (service) => (
        <Tag color="blue">
          {service?.name || 'Unknown Service'}
        </Tag>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={getTypeColor(type)}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => (
        <span style={{ color: '#666' }}>
          {quantity} {record.unit}
        </span>
      ),
    },
    {
      title: 'Address/Location',
      dataIndex: 'address',
      key: 'address',
      render: (address) => (
        <span style={{ color: '#666', fontSize: '12px' }}>
          {address}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
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
            title="Are you sure you want to delete this resource?"
            onConfirm={() => handleDelete(record.resourceId)}
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

  const facilityResources = resources.filter(resource => resource.type === 'Facility');
  const equipmentResources = resources.filter(resource => resource.type === 'Equipment');
  const totalQuantity = resources.reduce((sum, resource) => sum + (resource.quantity || 0), 0);

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <Title level={2} style={{ margin: 0 }}>
            Resources Management
          </Title>
          <p style={{ color: '#666', margin: '8px 0 0 0' }}>
            Manage and organize your resources. Track equipment, facilities, and other resources available for your services.
          </p>
        </div>

        {/* Filters and Add Button */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Select
              placeholder="Filter by Service"
              style={{ width: 150 }}
              value={filterService}
              onChange={handleFilterByService}
              allowClear
              loading={servicesState?.loading}
            >
              {services.map((service) => (
                <Select.Option key={service.serviceId} value={service.serviceId}>
                  {service.name}
                </Select.Option>
              ))}
            </Select>
            <Select
              placeholder="Filter by Type"
              style={{ width: 150 }}
              value={filterType}
              onChange={handleFilterByType}
              allowClear
            >
              <Select.Option value="Facility">Facility</Select.Option>
              <Select.Option value="Equipment">Equipment</Select.Option>
            </Select>
            <Space>
              <InputNumber
                placeholder="Min Quantity"
                style={{ width: 100 }}
                value={quantityRange.min}
                onChange={(value) => setQuantityRange({ ...quantityRange, min: value })}
              />
              <span>-</span>
              <InputNumber
                placeholder="Max Quantity"
                style={{ width: 100 }}
                value={quantityRange.max}
                onChange={(value) => setQuantityRange({ ...quantityRange, max: value })}
              />
              <Button 
                icon={<FilterOutlined />}
                onClick={handleFilterByQuantityRange}
                disabled={!quantityRange.min || !quantityRange.max}
              >
                Filter
              </Button>
            </Space>
          </Space>
          
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Add Resource
          </Button>
        </div>

        {/* Resources Table */}
        <div>
          <Table
            columns={columns}
            dataSource={resources}
            rowKey="resourceId"
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

      {/* Form Modal */}
      <ResourcesForm />
    </div>
  );
};

export default Resources; 