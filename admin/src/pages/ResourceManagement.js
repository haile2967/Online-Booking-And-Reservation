import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ResourceManagement = () => {
  const [resources, setResources] = useState([
    { id: 1, name: 'Conference Room A', type: 'Room', capacity: 50, status: 'Available' },
    { id: 2, name: 'Projector System', type: 'Equipment', condition: 'Good', status: 'Available' },
    { id: 3, name: 'Catering Kitchen', type: 'Facility', capacity: 100, status: 'In Use' },
    { id: 4, name: 'Cleaning Equipment', type: 'Equipment', condition: 'Maintenance', status: 'Unavailable' },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newResource, setNewResource] = useState({
    name: '',
    type: '',
    capacity: '',
    condition: 'Good',
    status: 'Available'
  });

  const handleAddResource = (e) => {
    e.preventDefault();
    const resource = {
      id: resources.length + 1,
      ...newResource,
      capacity: parseInt(newResource.capacity)
    };
    setResources([...resources, resource]);
    setNewResource({ name: '', type: '', capacity: '', condition: 'Good', status: 'Available' });
    setShowAddForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'In Use':
        return 'bg-yellow-100 text-yellow-800';
      case 'Unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const availableResources = resources.filter(resource => resource.status === 'Available').length;
  const totalResources = resources.length;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <Link to="/categories" style={{ textDecoration: 'none' }}>
          <div style={{ 
            background: '#40444b', 
            borderRadius: '8px', 
            padding: '36px', 
            minHeight: '140px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #4f545c',
            cursor: 'pointer',
            transition: 'transform 0.2s ease-in-out'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '18px' }}>
              <span style={{ fontSize: '32px', marginRight: '18px' }}>📂</span>
              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 600, color: '#ffffff' }}>Categories</h3>
            </div>
            <p style={{ margin: 0, fontSize: '15px', color: '#b9bbbe', lineHeight: '1.6' }}>
              Organize and manage resource categories. Create, edit, and maintain different resource for better organization.
            </p>
                         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
               <span style={{ fontSize: '14px', color: '#8e9297', fontWeight: 500 }}>Manage Categories →</span>
             </div>
          </div>
        </Link>

        <Link to="/services" style={{ textDecoration: 'none' }}>
          <div style={{ 
            background: '#40444b', 
            borderRadius: '8px', 
            padding: '36px', 
            minHeight: '140px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #4f545c',
            cursor: 'pointer',
            transition: 'transform 0.2s ease-in-out'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '18px' }}>
              <span style={{ fontSize: '32px', marginRight: '18px' }}>🛠️</span>
              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 600, color: '#ffffff' }}>Services</h3>
            </div>
            <p style={{ margin: 0, fontSize: '15px', color: '#b9bbbe', lineHeight: '1.6' }}>
              Manage all available services and offerings. Add, edit, and configure service details, pricing, and availability.
            </p>
                         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
               <span style={{ fontSize: '14px', color: '#8e9297', fontWeight: 500 }}>Manage Services →</span>
             </div>
          </div>
        </Link>

        <Link to="/resources" style={{ textDecoration: 'none' }}>
          <div style={{ 
            background: '#40444b', 
            borderRadius: '8px', 
            padding: '36px', 
            minHeight: '140px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #4f545c',
            cursor: 'pointer',
            transition: 'transform 0.2s ease-in-out'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '18px' }}>
              <span style={{ fontSize: '32px', marginRight: '18px' }}>🏢</span>
              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 600, color: '#ffffff' }}>Resources</h3>
            </div>
            <p style={{ margin: 0, fontSize: '15px', color: '#b9bbbe', lineHeight: '1.6' }}>
              Track and manage equipment, facilities, and available resources. Monitor resource availability and allocation.
            </p>
                         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
               <span style={{ fontSize: '14px', color: '#8e9297', fontWeight: 500 }}>Manage Resources →</span>
             </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ResourceManagement; 