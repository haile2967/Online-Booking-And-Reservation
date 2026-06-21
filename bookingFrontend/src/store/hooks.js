import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';

// Memoized selector for services
const selectServicesState = createSelector(
  [state => state.services],
  services => ({
    services: services.services,
    filteredServices: services.filteredServices,
    categories: services.categories,
    resources: services.resources,
    schedules: services.schedules,
    loading: services.loading,
    error: services.error,
    searchTerm: services.searchTerm,
    maxPrice: services.maxPrice,
    selectedCategory: services.selectedCategory
  })
);

// Memoized selector for bookings
const selectBookingsState = createSelector(
  [state => state.bookings],
  bookings => ({
    bookings: bookings.bookings,
    filteredBookings: bookings.filteredBookings,
    availableSchedules: bookings.availableSchedules,
    loading: bookings.loading,
    error: bookings.error,
    statusFilter: bookings.statusFilter,
    dateFilter: bookings.dateFilter
  })
);

// Memoized selector for payments
const selectPaymentsState = createSelector(
  [state => state.payments],
  payments => ({
    payments: payments.payments,
    loading: payments.loading,
    error: payments.error
  })
);

// Memoized selector for user
const selectUserState = createSelector(
  [state => state.user],
  user => ({
    user: user.user,
    loading: user.loading,
    error: user.error
  })
);

// Memoized selector for schedules
const selectSchedulesState = createSelector(
  [state => state.schedules],
  schedules => ({
    schedules: schedules.schedules,
    loading: schedules.loading,
    error: schedules.error
  })
);

export const useServices = () => useSelector(selectServicesState);
export const useBookings = () => useSelector(selectBookingsState);
export const usePayments = () => useSelector(selectPaymentsState);
export const useUser = () => useSelector(selectUserState);
export const useSchedules = () => useSelector(selectSchedulesState);
export const useAppDispatch = () => useDispatch();