import React, { useEffect } from 'react';
import { Card, Table, Button, Space, Popconfirm, message, Typography, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCategories, 
  deleteCategory, 
  setFormVisible, 
  setEditingCategory 
} from '../redux/slice/Categoriesslice';
import CategoriesForm from '../components/CategoriesForm';

const { Title } = Typography;

const Categories = () => {
  const dispatch = useDispatch();
  const categoriesState = useSelector((state) => state.categories);
  
  // Add fallback for undefined state
  const { categories = [], loading = false, error = null } = categoriesState || {};

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleAdd = () => {
    dispatch(setEditingCategory(null));
    dispatch(setFormVisible(true));
  };

  const handleEdit = (record) => {
    dispatch(setEditingCategory(record));
    dispatch(setFormVisible(true));
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteCategory(id)).unwrap();
      message.success('Category deleted successfully');
    } catch (error) {
      message.error(error.message || 'Failed to delete category');
    }
  };

  const handleRefresh = () => {
    dispatch(fetchCategories());
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <span style={{ fontWeight: 500, color: '#1890ff' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <Title level={2} style={{ margin: 0 }}>
            Categories Management
          </Title>
          <p style={{ color: '#666', margin: '8px 0 0 0' }}>
            Manage and organize service categories. Create, edit, and delete categories to better organize your services.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Add Category
            </Button>
          </div>
        </div>

        {/* Categories Table */}
        <div>
          <Table
            columns={columns}
            dataSource={categories}
            rowKey="categoryId"
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
      <CategoriesForm />
    </div>
  );
};

export default Categories; 