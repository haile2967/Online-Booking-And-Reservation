import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Resource Management', href: '/resource-management', icon: '⚙️' },
    { name: 'Booking Management', href: '/booking-management', icon: '📅' },
    { name: 'Payment Management', href: '/payment-management', icon: '💳' },
    { name: 'User Management', href: '/user-management', icon: '👤' },
    { name: 'Staff Assignment', href: '/staff-assignment', icon: '👥' },
    { name: 'Notification Management', href: '/notification-management', icon: '🔔' },
   
    { name: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div style={{ 
      backgroundColor: '#36393f',
      color: '#ffffff',
      transition: 'all 0.3s ease-in-out',
      width: isCollapsed ? '64px' : '256px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && <h2 className="text-xl font-bold">Admin Panel</h2>}
        <button
          onClick={toggleSidebar}
          style={{
            padding: '8px',
            borderRadius: '6px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#ffffff',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#40444b'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          {isCollapsed ? '☰' : '✕'}
        </button>
      </div>
      
      <nav className="flex-1 px-4" style={{ marginTop: '24px' }}>
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  color: isActive(item.href) ? '#ffffff' : '#b9bbbe',
                  backgroundColor: isActive(item.href) ? '#40444b' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.href)) {
                    e.target.style.backgroundColor = '#40444b';
                    e.target.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.href)) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#b9bbbe';
                  }
                }}
                title={isCollapsed ? item.name : ''}
              >
                <span className="mr-3">{item.icon}</span>
                {!isCollapsed && item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div style={{ padding: '16px', borderTop: '1px solid #40444b' }}>
        {!isCollapsed && (
          <div style={{ fontSize: '12px', color: '#72767d' }}>
            © 2024 Admin Dashboard
        </div>
      )}
      </div>
    </div>
  );
};

export default Sidebar;
