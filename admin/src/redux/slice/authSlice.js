import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const API_BASE_URL = '/Account';

// Async thunks for API calls
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post(`${API_BASE_URL}/login`, credentials);
      // Store token if provided in response
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Login failed';
      return rejectWithValue(typeof errorMessage === 'string' ? errorMessage : 'Login failed');
    }
  }
);

export const getAccounts = createAsyncThunk(
  'auth/getAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_BASE_URL}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to fetch accounts';
      return rejectWithValue(typeof errorMessage === 'string' ? errorMessage : 'Failed to fetch accounts');
    }
  }
);

export const getAccountById = createAsyncThunk(
  'auth/getAccountById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to fetch account';
      return rejectWithValue(typeof errorMessage === 'string' ? errorMessage : 'Failed to fetch account');
    }
  }
);

export const updateAccount = createAsyncThunk(
  'auth/updateAccount',
  async ({ id, accountData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`${API_BASE_URL}/${id}`, accountData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to update account';
      return rejectWithValue(typeof errorMessage === 'string' ? errorMessage : 'Failed to update account');
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/${id}`);
      return id;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to delete account';
      return rejectWithValue(typeof errorMessage === 'string' ? errorMessage : 'Failed to delete account');
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_BASE_URL}/profile/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to fetch profile';
      return rejectWithValue(typeof errorMessage === 'string' ? errorMessage : 'Failed to fetch profile');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ id, passwordData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`${API_BASE_URL}/change-password/${id}`, passwordData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to change password';
      return rejectWithValue(typeof errorMessage === 'string' ? errorMessage : 'Failed to change password');
    }
  }
);

const initialState = {
  user: null,
  accounts: [],
  currentAccount: null,
  profile: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  success: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.currentAccount = null;
      state.profile = null;
      state.error = null;
      state.success = null;
      // Clear token and persisted auth state from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('authState');
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.success = 'Login successful';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Accounts
    builder
      .addCase(getAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload;
      })
      .addCase(getAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Account by ID
    builder
      .addCase(getAccountById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAccountById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAccount = action.payload;
      })
      .addCase(getAccountById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Account
    builder
      .addCase(updateAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAccount = action.payload;
        state.success = 'Account updated successfully';
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Account
    builder
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = state.accounts.filter(account => account.id !== action.payload);
        state.success = 'Account deleted successfully';
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Profile
    builder
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Change Password
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Password changed successfully';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
