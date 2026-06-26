import React, { useEffect } from 'react';
import { Form, Input, Button, Modal, message, Select, InputNumber } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { createService, updateService, setFormVisible, setEditingService } from '../redux/slice/ServicesSlice';
import { fetchCategories } from '../redux/slice/Categoriesslice';
import { fetchPolicies } from '../redux/slice/policyslice';

const { TextArea } = Input;
const { Option } = Select;

const ServicesForm = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  
  const servicesState = useSelector((state) => state.services);
  const categoriesState = useSelector((state) => state.categories);
  const policiesState = useSelector((state) => state.policies);
  
  // Add fallback for undefined state
  const { formVisible = false, editingService = null, loading = false } = servicesState || {};
  const { categories = [] } = categoriesState || {};
  const { policies = [] } = policiesState || {};

  useEffect(() => {
    // Fetch categories and policies when component mounts
    dispatch(fetchCategories());
    dispatch(fetchPolicies());
  }, [dispatch]);



  useEffect(() => {
    if (editingService) {
      form.setFieldsValue({
        name: editingService.name,
        categoryId: editingService.categoryId,
        basePrice: editingService.basePrice,
        capacity: editingService.capacity,
        policyId: editingService.policyId,
        status: editingService.status || 'Available',
      });
    } else {
      form.resetFields();
    }
  }, [editingService, form]);

  const handleSubmit = async (values) => {
    try {
      if (editingService) {
        // Update existing service
        await dispatch(updateService({
          id: editingService.serviceId,
          serviceData: values
        })).unwrap();
        message.success('Service updated successfully');
      } else {
        // Create new service
        await dispatch(createService(values)).unwrap();
        message.success('Service created successfully');
      }
      
      handleCancel();
    } catch (error) {
      message.error(error.message || 'Operation failed');
    }
  };



  const handleCancel = () => {
    dispatch(setFormVisible(false));
    dispatch(setEditingService(null));
    form.resetFields();
  };

  return (
    <Modal
      title={editingService ? 'Edit Service' : 'Add New Service'}
      open={formVisible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          name: '',
          categoryId: '',
          basePrice: 0,
          capacity: 1,
          policyId: null,
          status: 'Available'
        }}
      >
        <Form.Item
          name="name"
          label="Service Name"
          rules={[
            { required: true, message: 'Please enter service name' },
            { min: 2, message: 'Name must be at least 2 characters' }
          ]}
        >
          <Input 
            placeholder="Enter service name"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="categoryId"
          label="Category"
          rules={[
            { required: true, message: 'Please select a category' }
          ]}
        >
          <Select
            placeholder="Select a category"
            size="large"
            showSearch
            optionFilterProp="children"
            loading={categoriesState?.loading}
          >
            {categories.map((category) => (
              <Option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="basePrice"
          label="Base Price"
          rules={[
            { required: true, message: 'Please enter service price' },
            { type: 'number', min: 0, message: 'Price must be a positive number' }
          ]}
        >
          <InputNumber
            placeholder="Enter base price"
            size="large"
            style={{ width: '100%' }}
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
            precision={2}
          />
        </Form.Item>

        <Form.Item
          name="capacity"
          label="Capacity"
          rules={[
            { required: true, message: 'Please enter service capacity' },
            { type: 'number', min: 1, message: 'Capacity must be at least 1' }
          ]}
        >
          <InputNumber
            placeholder="Enter capacity"
            size="large"
            style={{ width: '100%' }}
            min={1}
          />
        </Form.Item>

        <Form.Item
          name="policyId"
          label="Cancellation Policy"
        >
          <Select
            placeholder="Select cancellation policy (optional)"
            size="large"
            allowClear
            loading={policiesState?.loading}
            notFoundContent={policiesState?.loading ? "Loading..." : "No policies found"}
          >
            {policies && policies.length > 0 ? (
              policies.map((policy) => (
                <Option key={policy.policyId} value={policy.policyId}>
                  {policy.noticeHours}h notice - {policy.refundPercentage}% refund
                </Option>
              ))
            ) : (
              <Option value="" disabled>
                No policies available
              </Option>
            )}
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[
            { required: true, message: 'Please select service status' }
          ]}
        >
          <Select
            placeholder="Select service status"
            size="large"
          >
            <Option value="Available">Available</Option>
            <Option value="Under Maintenance">Under Maintenance</Option>
          </Select>
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
            {editingService ? 'Update' : 'Create'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ServicesForm; 