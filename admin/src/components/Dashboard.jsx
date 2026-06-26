import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Row, Col, Statistic, Table, Typography, Spin } from 'antd';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  UserOutlined, 
  CalendarOutlined, 
  DollarOutlined, 
  SettingOutlined,
  BookOutlined,
  ScheduleOutlined
} from '@ant-design/icons';

// Import all the API slice actions
import { fetchServices } from '../redux/slice/ServicesSlice';
import { fetchCategories, fetchCategoryStats } from '../redux/slice/Categoriesslice';
import { fetchResources, fetchResourceStats } from '../redux/slice/ResourcesSlice';
import { fetchBookings, fetchBookingStats } from '../redux/slice/BookingsSlice';
import { fetchSchedules, fetchScheduleStats } from '../redux/slice/SchedulesSlice';
import { fetchPayments, fetchPaymentStats } from '../redux/slice/PaymentsSlice';

const { Title } = Typography;

const Dashboard = () => {
  const dispatch = useDispatch();
  
  // Get data from all slices
  const servicesState = useSelector((state) => state.services || {});
  const categoriesState = useSelector((state) => state.categories || {});
  const resourcesState = useSelector((state) => state.resources || {});
  const bookingsState = useSelector((state) => state.bookings || {});
  const schedulesState = useSelector((state) => state.schedules || {});
  const paymentsState = useSelector((state) => state.payments || {});

  const { services = [], loading: servicesLoading } = servicesState;
  const { categories = [], stats: categoryStats = { total: 0 }, loading: categoriesLoading } = categoriesState;
  const { resources = [], stats: resourceStats = { total: 0, available: 0, occupied: 0, maintenance: 0 }, loading: resourcesLoading } = resourcesState;
  const { bookings = [], stats: bookingStats = { total: 0, pending: 0 }, loading: bookingsLoading } = bookingsState;
  const { schedules = [], stats: scheduleStats = { total: 0, available: 0, booked: 0, cancelled: 0 }, loading: schedulesLoading } = schedulesState;
  const { payments = [], stats: paymentStats = { total: 0, total_amount: 0, pending: 0 }, loading: paymentsLoading } = paymentsState;

  useEffect(() => {
    // Fetch all data on component mount
    dispatch(fetchServices());
    dispatch(fetchCategories());
    dispatch(fetchCategoryStats());
    dispatch(fetchResources());
    dispatch(fetchResourceStats());
    dispatch(fetchBookings());
    dispatch(fetchBookingStats());
    dispatch(fetchSchedules());
    dispatch(fetchScheduleStats());
    dispatch(fetchPayments());
    dispatch(fetchPaymentStats());
  }, [dispatch]);

  const isLoading = servicesLoading || categoriesLoading || resourcesLoading || 
                   bookingsLoading || schedulesLoading || paymentsLoading;

  // Prepare chart data
  const serviceStatusData = services.reduce((acc, service) => {
    const status = service.status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const serviceChartData = Object.entries(serviceStatusData).map(([status, count]) => ({
    status,
    count
  }));

  // Ensure we have at least one data point for charts
  if (serviceChartData.length === 0) {
    serviceChartData.push({ status: 'No Data', count: 1 });
  }

  const categoryChartData = categories.map(category => ({
    name: category.name,
    services: services.filter(service => service.category_id === category.category_id).length
  }));

  // Ensure we have at least one data point for category chart
  if (categoryChartData.length === 0) {
    categoryChartData.push({ name: 'No Categories', services: 0 });
  }

  const paymentMethodData = payments.reduce((acc, payment) => {
    const method = payment.payment_method || 'Unknown';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {});

  const paymentChartData = Object.entries(paymentMethodData).map(([method, count]) => ({
    method,
    count
  }));

  // Ensure we have at least one data point for payment chart
  if (paymentChartData.length === 0) {
    paymentChartData.push({ method: 'No Payments', count: 0 });
  }

  const scheduleStatusData = [
    { name: 'Available', value: scheduleStats.available, color: '#52c41a' },
    { name: 'Booked', value: scheduleStats.booked, color: '#ff4d4f' },
    { name: 'Cancelled', value: scheduleStats.cancelled, color: '#faad14' }
  ];

  const resourceStatusData = [
    { name: 'Available', value: resourceStats.available, color: '#52c41a' },
    { name: 'Occupied', value: resourceStats.occupied, color: '#ff4d4f' },
    { name: 'Maintenance', value: resourceStats.maintenance, color: '#faad14' }
  ];

  const recentBookings = bookings.slice(0, 5).map(booking => ({
    key: booking.bookingId,
    user: booking.user?.fullName || 'N/A',
    service: booking.service?.name || 'N/A',
    status: booking.status,
    amount: booking.totalAmount,
    date: new Date(booking.createdAt).toLocaleDateString()
  }));

  const recentPayments = payments.slice(0, 5).map(payment => ({
    key: payment.payment_id,
    user: payment.booking?.user?.fullName || payment.user?.fullName || payment.user_name || 'N/A',
    amount: payment.amount_paid,
    method: payment.payment_method,
    date: new Date(payment.payment_date).toLocaleDateString()
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Debug information
  console.log('Dashboard Data:', {
    services: services.length,
    categories: categories.length,
    resources: resources.length,
    bookings: bookings.length,
    schedules: schedules.length,
    payments: payments.length,
    serviceChartData,
    categoryChartData,
    paymentChartData,
    scheduleStatusData,
    resourceStatusData
  });

  return (
    <div className="p-6">
      <Title level={2} className="mb-6">Dashboard Overview</Title>
      
      {isLoading ? (
        <div className="text-center py-12">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Services"
                  value={services.length}
                  prefix={<SettingOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Bookings"
                  value={bookingStats.total}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Revenue"
                  value={paymentStats.total_amount}
                  precision={2}
                  prefix={<DollarOutlined />}
                  suffix="ETB"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Available Resources"
                  value={resources.length}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
          </Row>



          {/* Charts Row 2 */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} lg={12}>
              <Card title="Services by Category" className="h-80">
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {categoryChartData.length > 0 && categoryChartData[0].name !== 'No Categories' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="services" fill="#1890ff" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#666' }}>
                      <p>No category data available</p>
                      <p>Categories: {categories.length}</p>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Payment Methods" className="h-80">
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {paymentChartData.length > 0 && paymentChartData[0].method !== 'No Payments' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={paymentChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="method" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#52c41a" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#666' }}>
                      <p>No payment data available</p>
                      <p>Payments: {payments.length}</p>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>

          {/* Charts Row 3 */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} lg={12}>
              <Card title="Revenue Overview" className="h-80">
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {paymentStats.total_amount > 0 || paymentStats.total > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: 'Total Revenue', value: paymentStats.total_amount },
                        { name: 'Total Payments', value: paymentStats.total },
                        { name: 'Pending', value: paymentStats.pending }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="#52c41a" fill="#52c41a" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#666' }}>
                      <p>No revenue data available</p>
                      <p>Total Revenue: {paymentStats.total_amount} ETB</p>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Recent Bookings">
                <Table
                  dataSource={recentBookings}
                  columns={[
                    { title: 'User', dataIndex: 'user', key: 'user' },
                    { title: 'Service', dataIndex: 'service', key: 'service' },
                    { title: 'Status', dataIndex: 'status', key: 'status' },
                    { title: 'Amount', dataIndex: 'amount', key: 'amount',
                      render: (text) => `${parseFloat(text || 0).toFixed(2)} ETB` },
                    { title: 'Date', dataIndex: 'date', key: 'date' }
                  ]}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          </Row>

          {/* Additional Statistics */}
          <Row gutter={[16, 16]} className="mt-6">
            <Col xs={24} lg={8}>
              <Card>
                <Statistic
                  title="Pending Bookings"
                  value={bookingStats.pending}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card>
                <Statistic
                  title="Total Categories"
                  value={categories.length}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card>
                <Statistic
                  title="Total Schedules"
                  value={scheduleStats.total}
                  valueStyle={{ color: '#13c2c2' }}
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default Dashboard; 