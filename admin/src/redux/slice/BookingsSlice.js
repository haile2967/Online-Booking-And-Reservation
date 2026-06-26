import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for API calls
export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async ({ status, limit, sort } = {}) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit);
    if (sort) params.append('sort', sort);
    const response = await api.get(`/Booking${params.toString() ? `?${params}` : ''}`);
    return response.data;
  }
);

export const fetchBookingById = createAsyncThunk(
  'bookings/fetchBookingById',
  async (id) => {
    const response = await api.get(`/Booking/${id}`);
    return response.data;
  }
);

export const updateBooking = createAsyncThunk(
  'bookings/updateBooking',
  async ({ id, bookingData }) => {
    const response = await api.put(`/Booking/${id}`, bookingData);
    return response.data;
  }
);

export const fetchBookingStats = createAsyncThunk(
  'bookings/fetchBookingStats',
  async () => {
    const response = await api.get('/Booking');
    return { total: response.data.length };
  }
);

const initialState = {
  bookings: [],
  selectedBooking: null,
  stats: { total: 0, pending: 0 },
  loading: false,
  error: null,
  formVisible: false,
  editingBooking: null,
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setFormVisible: (state, action) => {
      state.formVisible = action.payload;
    },
    setEditingBooking: (state, action) => {
      state.editingBooking = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch bookings
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Fetch booking by ID
    builder
      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBooking = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Update booking
    builder
      .addCase(updateBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bookings.findIndex(b => b.bookingId === action.payload.bookingId);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        state.formVisible = false;
        state.editingBooking = null;
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Fetch booking stats
    builder
      .addCase(fetchBookingStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchBookingStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setFormVisible, setEditingBooking, clearError } = bookingsSlice.actions;
export default bookingsSlice.reducer;