import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchUsers = createAsyncThunk(
  'userManagement/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/User');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch users');
    }
  }
);

export const fetchUserDetails = createAsyncThunk(
  'userManagement/fetchUserDetails',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/User/${userId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch user details');
    }
  }
);

export const fetchUserBookings = createAsyncThunk(
  'userManagement/fetchUserBookings',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/Booking?userId=${userId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch user bookings');
    }
  }
);

export const updateUser = createAsyncThunk(
  'userManagement/updateUser',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/User/${userId}`, userData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'userManagement/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete(`/User/${userId}`);
      return userId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to delete user');
    }
  }
);

const initialState = {
  users: [],
  selectedUser: null,
  userBookings: [],
  loading: false,
  error: null,
  selectedUserId: null,
  searchTerm: '',
  filterStatus: 'all'
};

const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
      state.selectedUserId = action.payload?.userId;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
      state.selectedUserId = null;
      state.userBookings = [];
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch User Details
    builder
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch User Bookings
    builder
      .addCase(fetchUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.userBookings = action.payload;
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update User
    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        // Update the user in the list
        const index = state.users.findIndex(user => user.userId === action.payload.userId);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        // Update selected user if it's the same user
        if (state.selectedUser && state.selectedUser.userId === action.payload.userId) {
          state.selectedUser = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete User
    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        // Remove user from list
        state.users = state.users.filter(user => user.userId !== action.payload);
        // Clear selected user if it was the deleted user
        if (state.selectedUser && state.selectedUser.userId === action.payload) {
          state.selectedUser = null;
          state.selectedUserId = null;
          state.userBookings = [];
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  setSelectedUser, 
  clearSelectedUser, 
  setSearchTerm, 
  setFilterStatus, 
  clearError 
} = userManagementSlice.actions;

export default userManagementSlice.reducer; 