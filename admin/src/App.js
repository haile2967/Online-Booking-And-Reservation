import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import store from './redux/store';
import './App.css';

// Components
import Login from './pages/Login';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Profile from './components/Profile';
import ChangePassword from './components/ChangePassword';
import Dashboard from './components/Dashboard';

// Management Pages

import PaymentManagement from './pages/PaymentManagement';
import BookingManagement from './pages/BookingManagement';
import ResourceManagement from './pages/ResourceManagement';
import StaffAssignment from './pages/StaffAssignment';
import NotificationManagement from './pages/NotificationManagement';
import UserManagement from './pages/UserManagement';

// Module Pages
import Categories from './modules/Categories';
import Services from './modules/Services';
import Resources from './modules/Resources';
import Bookings from './modules/ViewBookings';
import Schedules from './modules/ViewSchedule';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Dashboard Layout Component
const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={<Navigate to="/dashboard" />}
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Profile />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ChangePassword />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-management"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <PaymentManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking-management"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <BookingManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/resource-management"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ResourceManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff-assignment"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <StaffAssignment />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notification-management"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <NotificationManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-management"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <UserManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Categories />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/services"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Services />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/resources"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Resources />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-bookings"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Bookings />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-schedule"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Schedules/>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
