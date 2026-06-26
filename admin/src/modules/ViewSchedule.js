import React, { useEffect, useRef, useState } from 'react';
import { Card, Button, Space, Popconfirm, message, Typography, Row, Col, Statistic, DatePicker, Modal, Descriptions, Tag } from 'antd';
import { ReloadOutlined, FilterOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchedules, updateSchedule, setFormVisible, setEditingSchedule, fetchScheduleStats } from '../redux/slice/SchedulesSlice';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import moment from 'moment';

const { Title } = Typography;

const Schedules = () => {
  const dispatch = useDispatch();
  const schedulesState = useSelector((state) => state.schedules || {});
  const { schedules = [], stats = { total: 0, available: 0, booked: 0, cancelled: 0 }, loading = false, error = null } = schedulesState;
  const calendarRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    console.log("🔄 Schedules component mounted, fetching data...");
    // Fetch schedules without any status filter to get all schedules
    dispatch(fetchSchedules({ startDate: selectedDate.format('YYYY-MM-DD') }));
    dispatch(fetchScheduleStats());
  }, [dispatch, selectedDate]);

  // Add logging for debugging
  useEffect(() => {
    console.log("📅 Schedules data received:", schedules);
    console.log("📊 Stats data received:", stats);
    console.log("🔄 Loading state:", loading);
    console.log("❌ Error state:", error);
  }, [schedules, stats, loading, error]);

  const handleEdit = (record) => {
    dispatch(setEditingSchedule(record));
    dispatch(setFormVisible(true));
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(updateSchedule({ id, scheduleData: { status: 'Cancelled' } })).unwrap();
      message.success('Schedule cancelled successfully');
      dispatch(fetchSchedules({ startDate: selectedDate.format('YYYY-MM-DD') }));
    } catch (error) {
      message.error(error.message || 'Failed to cancel schedule');
    }
  };

  const handleRefresh = () => {
    console.log("🔄 Manual refresh triggered");
    dispatch(fetchSchedules({ startDate: selectedDate.format('YYYY-MM-DD') }));
    dispatch(fetchScheduleStats());
  };

  const handleDateFilter = (date) => {
    setSelectedDate(date);
    dispatch(fetchSchedules({ startDate: date.format('YYYY-MM-DD') }));
  };

  const handleClearFilter = () => {
    setSelectedDate(moment());
    dispatch(fetchSchedules({ startDate: moment().format('YYYY-MM-DD') }));
  };

  const handleEventClick = (info) => {
    const schedule = schedules.find(s => s.schedule_id === info.event.id);
    if (schedule) {
      setSelectedEvent(schedule);
      setInfoModalVisible(true);
    }
  };

  const handleEditFromInfo = () => {
    if (selectedEvent) {
      setInfoModalVisible(false);
      handleEdit(selectedEvent);
    }
  };

  const handleCloseInfo = () => {
    setInfoModalVisible(false);
    setSelectedEvent(null);
  };

  const events = schedules.map(schedule => {
    // Fix date formatting - remove the extra T00:00:00 from start_date
    const startDate = schedule.start_date.split('T')[0]; // Get only the date part
    const startTime = schedule.start_time;
    const endTime = schedule.end_time;
    
    const event = {
      id: schedule.schedule_id,
      title: `${schedule.service?.name || 'Unknown Service'} - ${schedule.status}`,
      start: `${startDate}T${startTime}`,
      end: `${startDate}T${endTime}`,
      backgroundColor: schedule.status === 'Available' ? '#52c41a' : 
                     schedule.status === 'Booked' ? '#ff4d4f' : 
                     schedule.status === 'Cancelled' ? '#d9d9d9' : '#1890ff',
      borderColor: schedule.status === 'Available' ? '#52c41a' : 
                   schedule.status === 'Booked' ? '#ff4d4f' : 
                   schedule.status === 'Cancelled' ? '#d9d9d9' : '#1890ff',
      textColor: '#ffffff', // White text for better contrast
      extendedProps: {
        serviceName: schedule.service?.name,
        categoryName: schedule.service?.category?.name,
        status: schedule.status,
        startTime: schedule.start_time,
        endTime: schedule.end_time,
        basePrice: schedule.service?.base_price,
        capacity: schedule.service?.capacity,
        resources: schedule.service?.resources || []
      }
    };
    
    return event;
  });

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <Title level={2} style={{ margin: 0 }}>
            Schedule Management
          </Title>
          <p style={{ color: '#666', margin: '8px 0 0 0' }}>
            Manage service schedules, add new slots, and update availability.
          </p>
        </div>

        {/* Filters and Add Button */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <DatePicker
              placeholder="Filter by date"
              value={selectedDate}
              onChange={handleDateFilter}
              format="YYYY-MM-DD"
              style={{ width: 150 }}
            />
            <Button
              icon={<FilterOutlined />}
              onClick={handleClearFilter}
            >
              Clear Filter
            </Button>
          </Space>
          
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </div>

        {/* Calendar */}
        <div>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events}
            eventClick={handleEventClick}
            editable={false}
            selectable={false} // Removed selectable as per edit hint
            height="600px"
            eventDisplay="block"
            eventContent={(eventInfo) => (
              <div 
                style={{ 
                  padding: '2px',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
                title={`${eventInfo.event.extendedProps.serviceName}
Status: ${eventInfo.event.extendedProps.status}
Time: ${eventInfo.event.extendedProps.startTime} - ${eventInfo.event.extendedProps.endTime}
Price: ${eventInfo.event.extendedProps.basePrice ? `${eventInfo.event.extendedProps.basePrice.toFixed(2)} ETB` : 'N/A'}
Resources: ${eventInfo.event.extendedProps.resources.length} items`}
              >
                <div style={{ fontSize: '11px', marginBottom: '1px' }}>
                  {eventInfo.event.extendedProps.serviceName}
                </div>
                <div style={{ fontSize: '9px', opacity: 0.9 }}>
                  {eventInfo.event.extendedProps.categoryName}
                </div>
                <div style={{ fontSize: '8px', opacity: 0.8 }}>
                  {eventInfo.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {eventInfo.event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )}
          />
        </div>
      </Card>

      {/* Form Modal */}
      {/* Removed SchedulesForm import, so this section is removed */}

      {/* Info Modal */}
      <Modal
        title={
          <Space>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
            <span>Schedule Information</span>
          </Space>
        }
        open={infoModalVisible}
        onCancel={handleCloseInfo}
        footer={[
          <Button key="cancel" onClick={handleCloseInfo}>
            Close
          </Button>,
          <Button key="edit" type="primary" onClick={handleEditFromInfo}>
            Edit Schedule
          </Button>
        ]}
        width={600}
      >
        {selectedEvent && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Service Name">
              {selectedEvent.service?.name || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Category">
              {selectedEvent.service?.category?.name || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={
                selectedEvent.status === 'Available' ? 'green' :
                selectedEvent.status === 'Booked' ? 'red' :
                selectedEvent.status === 'Cancelled' ? 'default' : 'blue'
              }>
                {selectedEvent.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Date">
              {moment(selectedEvent.start_date).format('MMMM DD, YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Time">
              {selectedEvent.start_time} - {selectedEvent.end_time}
            </Descriptions.Item>
            <Descriptions.Item label="Base Price">
              {selectedEvent.service?.base_price ? 
                `${selectedEvent.service.base_price.toFixed(2)} ETB` : 'N/A'
              }
            </Descriptions.Item>
            <Descriptions.Item label="Capacity">
              {selectedEvent.service?.capacity || 'N/A'} people
            </Descriptions.Item>
            <Descriptions.Item label="Resources">
              {selectedEvent.service?.resources?.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                  {selectedEvent.service.resources.map((resource, index) => (
                    <li key={index}>
                      {resource.name} ({resource.quantity} {resource.unit})
                    </li>
                  ))}
                </ul>
              ) : 'No resources assigned'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Schedules;