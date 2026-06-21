import { configureStore } from '@reduxjs/toolkit';
import servicesReducer from './servicesSlice';
import bookingsReducer from './bookingsSlice';
import paymentsReducer from './paymentsSlice';
import userReducer from './userSlice';
import schedulesReducer from './schedulesSlice';

export const store = configureStore({
  reducer: {
    services: servicesReducer,
    bookings: bookingsReducer,
    payments: paymentsReducer,
    user: userReducer,
    schedules: schedulesReducer
  }
});