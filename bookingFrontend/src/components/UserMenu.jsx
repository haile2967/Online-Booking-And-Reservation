import React, { useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { clearUser } from '../store/userSlice';
import { getRouteById } from '../routes';

const UserMenu = ({ onNavigate, currentView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();

  const userRoutes = [
    { id: 'bookings', label: 'My Bookings', icon: '📋' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const handleMenuClick = (routeId) => {
    const route = getRouteById(routeId);
    if (route) {
      onNavigate(routeId);
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(clearUser()); // Replace with actual logout logic if using auth provider
    onNavigate('home');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* User Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
          {userRoutes.map((route) => {
            const routeData = getRouteById(route.id);
            return (
              <button
                key={route.id}
                onClick={() => handleMenuClick(route.id)}
                disabled={!routeData}
                className={`block w-full text-left px-4 py-2 text-sm font-medium transition-colors duration-200 flex items-center ${
                  currentView === route.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50' +
                      (!routeData ? ' opacity-50 cursor-not-allowed' : '')
                }`}
              >
                <span className="mr-3">{route.icon}</span>
                {route.label}
              </button>
            );
          })}
          <div className="border-t border-gray-200 my-1"></div>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center"
          >
            <span className="mr-3">🚪</span>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;