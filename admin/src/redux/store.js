import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slice/authSlice';
import categoriesReducer from './slice/Categoriesslice';
import servicesReducer from './slice/ServicesSlice';
import policiesReducer from './slice/policyslice';
import resourcesReducer from './slice/ResourcesSlice';
import bookingsReducer from './slice/BookingsSlice';
import schedulesReducer from './slice/SchedulesSlice';
import paymentsReducer from './slice/PaymentsSlice';
import userManagementReducer from './slice/userslice';

// Load persisted auth state from localStorage
const loadAuthState = () => {
  try {
    const serialized = localStorage.getItem('authState');
    if (!serialized) return undefined;
    const parsed = JSON.parse(serialized);
    return {
      auth: {
        user: parsed.user || null,
        isAuthenticated: parsed.isAuthenticated || false,
        accounts: [],
        currentAccount: null,
        profile: null,
        loading: false,
        error: null,
        success: null,
      },
    };
  } catch {
    return undefined;
  }
};

// Save auth state to localStorage on every store update
const saveAuthState = (state) => {
  try {
    localStorage.setItem('authState', JSON.stringify({
      user: state.auth.user,
      isAuthenticated: state.auth.isAuthenticated,
    }));
  } catch {
    // ignore write errors
  }
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoriesReducer,
    services: servicesReducer,
    policies: policiesReducer,
    resources: resourcesReducer,
    bookings: bookingsReducer,
    schedules: schedulesReducer,
    payments: paymentsReducer,
    userManagement: userManagementReducer,
  },
  preloadedState: loadAuthState(),
});

// Subscribe to store changes to persist auth state
store.subscribe(() => saveAuthState(store.getState()));

export default store;

