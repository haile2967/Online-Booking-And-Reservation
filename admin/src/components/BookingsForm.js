import React, { useEffect } from 'react';
import { Form, Select, Button, Modal, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { updateBooking, setFormVisible, setEditingBooking } from '../redux/slice/BookingsSlice';

const BookingsForm = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const bookingsState = useSelector((state) => state.bookings || {});
  const { formVisible = false, editingBooking = null, loading = false } = bookingsState;

  useEffect(() => {
    if (editingBooking) {
      form.setFieldsValue({
        status: editingBooking.status,
        requires_admin_approval: editingBooking.requires_admin_approval,
      });
    } else {
      form.resetFields();
    }
  }, [editingBooking, form]);

  const handleSubmit = async (values) => {
    try {
      if (editingBooking) {
        await dispatch(updateBooking({
          id: editingBooking.booking_id,
          bookingData: values
        })).unwrap();
        message.success('Booking updated successfully');
      }
      handleCancel();
    } catch (error) {
      message.error(error.message || 'Operation failed');
    }
  };

  const handleCancel = () => {
    dispatch(setFormVisible(false));
    dispatch(setEditingBooking(null));
    form.resetFields();
  };

  return (
    <Modal
      title="Edit Booking"
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
          status: '',
          requires_admin_approval: false,
        }}
      >
        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select a status' }]}
        >
          <Select
            placeholder="Select status"
            size="large"
            options={[
              { value: 'Confirmed', label: 'Confirmed' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Cancelled', label: 'Cancelled' },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="requires_admin_approval"
          label="Requires Admin Approval"
          rules={[{ required: true, message: 'Please select approval status' }]}
        >
          <Select
            placeholder="Select approval status"
            size="large"
            options={[
              { value: true, label: 'Yes' },
              { value: false, label: 'No' },
            ]}
          />
        </Form.Item>

        <Form.Item className="mb-0 text-right">
          <Button 
            type="default" 
            onClick={handleCancel}
            className="mr-2"
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
            Update
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BookingsForm;