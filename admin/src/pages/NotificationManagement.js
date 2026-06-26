import React, { useState } from 'react';

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Booking Request', message: 'Conference Room A has been booked for tomorrow', type: 'Booking', priority: 'High', status: 'Unread', date: '2024-01-15 10:30' },
    { id: 2, title: 'Payment Received', message: 'Payment of $150.00 received from John Doe', type: 'Payment', priority: 'Medium', status: 'Read', date: '2024-01-15 09:15' },
    { id: 3, title: 'Equipment Maintenance', message: 'Projector X1 requires maintenance', type: 'Maintenance', priority: 'High', status: 'Unread', date: '2024-01-15 08:45' },
    { id: 4, title: 'Staff Assignment', message: 'Sarah Johnson assigned to Meeting Room B', type: 'Staff', priority: 'Low', status: 'Read', date: '2024-01-14 16:20' },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'General',
    priority: 'Medium',
    status: 'Unread'
  });

  const handleAddNotification = (e) => {
    e.preventDefault();
    const notification = {
      id: notifications.length + 1,
      ...newNotification,
      date: new Date().toLocaleString()
    };
    setNotifications([...notifications, notification]);
    setNewNotification({ title: '', message: '', type: 'General', priority: 'Medium', status: 'Unread' });
    setShowAddForm(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Booking':
        return 'bg-blue-100 text-blue-800';
      case 'Payment':
        return 'bg-green-100 text-green-800';
      case 'Maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'Staff':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const unreadNotifications = notifications.filter(notification => notification.status === 'Unread').length;
  const highPriorityNotifications = notifications.filter(notification => notification.priority === 'High').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notification Management</h1>
            <p className="text-gray-600">Manage and track all system notifications</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
          >
            Add Notification
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-teal-100 rounded-lg">
              <span className="text-2xl">🔔</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-2xl">📬</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-gray-900">{unreadNotifications}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">{highPriorityNotifications}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Notification Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Notification</h2>
          <form onSubmit={handleAddNotification} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={newNotification.type}
                  onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="General">General</option>
                  <option value="Booking">Booking</option>
                  <option value="Payment">Payment</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newNotification.priority}
                  onChange={(e) => setNewNotification({...newNotification, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={newNotification.status}
                  onChange={(e) => setNewNotification({...newNotification, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Unread">Unread</option>
                  <option value="Read">Read</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={newNotification.message}
                onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
              >
                Add Notification
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">All Notifications</h2>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className={`border rounded-lg p-4 ${notification.status === 'Unread' ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-medium text-gray-900">{notification.title}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(notification.type)}`}>
                      {notification.type}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(notification.priority)}`}>
                      {notification.priority}
                    </span>
                    {notification.status === 'Unread' && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                  <p className="text-xs text-gray-500">{notification.date}</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-900 text-sm">Mark Read</button>
                  <button className="text-red-600 hover:text-red-900 text-sm">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationManagement; 