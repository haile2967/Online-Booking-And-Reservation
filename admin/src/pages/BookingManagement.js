import React from 'react';
import { Link } from 'react-router-dom';

const BookingManagement = () => {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <Link to="/view-bookings" style={{ textDecoration: 'none' }}>
          <div style={{ 
            background: '#40444b', 
            borderRadius: '8px', 
            padding: '32px', 
            minHeight: '160px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #4f545c',
            cursor: 'pointer',
            transition: 'transform 0.2s ease-in-out'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '28px', marginRight: '16px' }}>📅</span>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#ffffff' }}>Bookings</h3>
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: '#b9bbbe', lineHeight: '1.5' }}>
              Manage and view all current bookings. Track booking status, customer details, and service requests. Handle booking confirmations and cancellations.
            </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
              <span style={{ fontSize: '14px', color: '#8e9297', fontWeight: 500 }}>View Bookings →</span>
            </div>
          </div>
        </Link>

        <Link to="/view-schedule" style={{ textDecoration: 'none' }}>
          <div style={{ 
            background: '#40444b', 
            borderRadius: '8px', 
            padding: '32px', 
            minHeight: '160px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #4f545c',
            cursor: 'pointer',
            transition: 'transform 0.2s ease-in-out'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '28px', marginRight: '16px' }}>📊</span>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#ffffff' }}>Schedules</h3>
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: '#b9bbbe', lineHeight: '1.5' }}>
              View and manage the booking schedule. Check availability, time slots, and resource allocation. Monitor daily, weekly, and monthly schedules.
            </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
              <span style={{ fontSize: '14px', color: '#8e9297', fontWeight: 500 }}>View Schedules →</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default BookingManagement;
