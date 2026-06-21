import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/User', {
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone
      });
      
      return {
        user_id: response.data.user_id,
        full_name: response.data.full_name,
        email: response.data.email,
        phone: response.data.phone,
        created_at: response.data.created_at,
        isAuthenticated: true
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to create user');
    }
  }
);

export const getUserByEmail = createAsyncThunk(
  'user/getUserByEmail',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.get(`/User/email/${email}`);
      
      return {
        user_id: response.data.user_id,
        full_name: response.data.full_name,
        email: response.data.email,
        phone: response.data.phone,
        created_at: response.data.created_at,
        isAuthenticated: true
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'User not found');
    }
  }
);

const initialState = {
  user: null, // { user_id, full_name, email, phone, created_at, isAuthenticated }
  loading: false,
  error: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getUserByEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserByEmail.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getUserByEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setUser, clearUser, setLoading, setError } = userSlice.actions;
export default userSlice.reducer;