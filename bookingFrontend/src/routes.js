import React from 'react';
import Hero from './components/Hero.jsx';
import Services from './components/Services.jsx';
import BookingForm from './components/BookingForm.jsx';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import Profile from './components/Profile.jsx';
import MyBookings from './components/MyBookings.jsx';
import MultipleBookingServices from './components/MultipleBookingServices.jsx';

// Routes configuration
export const routes = [
  {
    id: 'home',
    path: '/',
    label: 'Home',
    component: ({ onBookNow }) => (
      <>
        <Hero onBookNow={onBookNow} />
        <Services />
      </>
    ),
    isDefault: true,
    showInNav: true,
    icon: '🏠'
  },
  {
    id: 'services',
    path: '/services',
    label: 'Services',
    component: () => <Services />,
    showInNav: true,
    icon: '🛠️'
  },

  {
    id: 'about',
    path: '/about',
    label: 'About Us',
    component: () => <About />,
    showInNav: true,
    icon: 'ℹ️'
  },
  {
    id: 'contact',
    path: '/contact',
    label: 'Contact',
    component: () => <Contact />,
    showInNav: true,
    icon: '📞'
  },
  {
    id: 'profile',
    path: '/profile',
    label: 'Profile',
    component: () => <Profile />,
    showInNav: false,
    icon: '👤'
  },
  {
    id: 'bookings',
    path: '/bookings',
    label: 'Bookings',
    component: () => <MyBookings />,
    showInNav: true,
    icon: '📋'
  },
  {
    id: 'multiple-booking',
    path: '/multiple-booking',
    label: 'Multiple Booking',
    component: () => <MultipleBookingServices />,
    showInNav: true,
    icon: '🛒'
  },
  {
    id: 'settings',
    path: '/settings',
    label: 'Settings',
    component: () => <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Settings</h2>
        <p className="text-gray-600">Settings page (under construction).</p>
      </div>
    </div>,
    showInNav: false,
    icon: '⚙️'
  }
];

// Helper function to get route by ID
export const getRouteById = (id) => {
  return routes.find(route => route.id === id);
};

// Helper function to get default route
export const getDefaultRoute = () => {
  return routes.find(route => route.isDefault) || routes[0];
};

// Helper function to get all navigation items (only those that should show in nav)
export const getNavigationItems = () => {
  return routes
    .filter(route => route.showInNav)
    .map(route => ({
      id: route.id,
      label: route.label,
      icon: route.icon
    }));
};

// Helper function to get route by path
export const getRouteByPath = (path) => {
  return routes.find(route => route.path === path);
};

// Helper function to get all routes (including hidden ones)
export const getAllRoutes = () => {
  return routes;
};

// Helper function to check if route exists
export const routeExists = (id) => {
  return routes.some(route => route.id === id);
};