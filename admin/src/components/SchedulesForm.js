import React, { useEffect } from 'react';
import { Form, Input, Button, Modal, message, Select, InputNumber } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { createResource, updateResource, setFormVisible, setEditingResource } from '../redux/slice/ResourcesSlice';
import { fetchServices } from '../redux/slice/ServicesSlice';

const { TextArea } = Input;
const { Option } = Select;

const ResourcesForm = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  
  const resourcesState = useSelector((state) => state.resources);
  const servicesState = useSelector((state) => state.services);
  
  // Add fallback for undefined state
  const { formVisible = false, editingResource = null, loading = false } = resourcesState || {};
  const { services = [] } = servicesState || {};

  useEffect(() => {
    // Fetch services when component mounts
    dispatch(fetchServices());
  }, [dispatch]);

  useEffect(() => {
    if (editingResource) {
      form.setFieldsValue({
        serviceId: editingResource.serviceId,
        name: editingResource.name,
        type: editingResource.type,
        quantity: editingResource.quantity,
        unit: editingResource.unit,
        address: editingResource.address,
      });
    } else {
      form.resetFields();
    }
  }, [editingResource, form]);

  const handleSubmit = async (values) => {
    try {
      if (editingResource) {
        // Update existing resource
        await dispatch(updateResource({
          id: editingResource.resourceId,
          resourceData: values
        })).unwrap();
        message.success('Resource updated successfully');
      } else {
        // Create new resource
        await dispatch(createResource(values)).unwrap();
        message.success('Resource created successfully');
      }
      
      handleCancel();
    } catch (error) {
      message.error(error.message || 'Operation failed');
    }
  };

  const handleCancel = () => {
    dispatch(setFormVisible(false));
    dispatch(setEditingResource(null));
    form.resetFields();
  };

  return (
    <Modal
      title={editingResource ? 'Edit Resource' : 'Add New Resource'}
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
          serviceId: '',
          name: '',
          type: '',
          quantity: 1,
          unit: '',
          address: ''
        }}
      >
        <Form.Item
          name="serviceId"
          label="Service"
          rules={[
            { required: true, message: 'Please select a service' }
          ]}
        >
          <Select
            placeholder="Select a service"
            size="large"
            showSearch
            optionFilterProp="children"
            loading={servicesState?.loading}
          >
            {services.map((service) => (
              <Option key={service.serviceId} value={service.serviceId}>
                {service.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="name"
          label="Resource Name"
          rules={[
            { required: true, message: 'Please enter resource name' },
            { min: 2, message: 'Name must be at least 2 characters' }
          ]}
        >
          <Input 
            placeholder="Enter resource name"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="type"
          label="Resource Type"
          rules={[
            { required: true, message: 'Please select resource type' }
          ]}
        >
          <Select
            placeholder="Select resource type"
            size="large"
          >
            <Option value="Facility">Facility</Option>
            <Option value="Equipment">Equipment</Option>
            <Option value="Furniture">Furniture</Option>
            <Option value="Decoration">Decoration</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Quantity"
          rules={[
            { required: true, message: 'Please enter quantity' },
            { type: 'number', min: 1, message: 'Quantity must be at least 1' }
          ]}
        >
          <InputNumber
            placeholder="Enter quantity"
            size="large"
            style={{ width: '100%' }}
            min={1}
          />
        </Form.Item>

        <Form.Item
          name="unit"
          label="Unit"
          rules={[
            { required: true, message: 'Please enter unit' }
          ]}
        >
          <Input 
            placeholder="Enter unit (e.g., hall, piece, person)"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="address"
          label="Address/Location"
          rules={[
            { required: true, message: 'Please enter address/location' }
          ]}
        >
          <TextArea
            placeholder="Enter address or location details"
            size="large"
            rows={3}
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
            {editingResource ? 'Update' : 'Create'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ResourcesForm;