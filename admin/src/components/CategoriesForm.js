import React, { useEffect } from 'react';
import { Form, Input, Button, Modal, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { createCategory, updateCategory, setFormVisible, setEditingCategory } from '../redux/slice/Categoriesslice';

const CategoriesForm = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  
  const categoriesState = useSelector((state) => state.categories);
  
  // Add fallback for undefined state
  const { formVisible = false, editingCategory = null, loading = false } = categoriesState || {};

  useEffect(() => {
    if (editingCategory) {
      form.setFieldsValue({
        name: editingCategory.name,
        description: editingCategory.description,
      });
    } else {
      form.resetFields();
    }
  }, [editingCategory, form]);

  const handleSubmit = async (values) => {
    try {
      if (editingCategory) {
        // Update existing category
        await dispatch(updateCategory({
          id: editingCategory.categoryId,
          categoryData: values
        })).unwrap();
        message.success('Category updated successfully');
      } else {
        // Create new category
        await dispatch(createCategory(values)).unwrap();
        message.success('Category created successfully');
      }
      
      handleCancel();
    } catch (error) {
      message.error(error.message || 'Operation failed');
    }
  };

  const handleCancel = () => {
    dispatch(setFormVisible(false));
    dispatch(setEditingCategory(null));
    form.resetFields();
  };

  return (
    <Modal
      title={editingCategory ? 'Edit Category' : 'Add New Category'}
      open={formVisible}
      onCancel={handleCancel}
      footer={null}
      width={500}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          name: '',
          description: ''
        }}
      >
        <Form.Item
          name="name"
          label="Category Name"
          rules={[
            { required: true, message: 'Please enter category name' },
            { min: 2, message: 'Name must be at least 2 characters' }
          ]}
        >
          <Input 
            placeholder="Enter category name"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[
            { required: true, message: 'Please enter category description' },
            { min: 10, message: 'Description must be at least 10 characters' }
          ]}
        >
          <Input.TextArea
            placeholder="Enter category description"
            rows={4}
            size="large"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button 
            type="default" 
            onClick={handleCancel}
            style={{ marginRight: 8 }}
            size="large"
          >
            Cancel
          </Button>
          <Button 
            type="primary" 
            htmlType="submit"
            loading={loading}
            size="large"
          >
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoriesForm; 