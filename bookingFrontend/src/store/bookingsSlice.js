import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/Booking');
      const data = response.data;
      
      return data.map(booking => ({
        booking_id: booking.bookingId,
        user_id: booking.userId,
        service_id: booking.serviceId,
        schedule_id: booking.scheduleId,
        total_amount: booking.totalAmount,
        status: booking.status,
        created_at: booking.createdAt,
        user: booking.user ? {
          full_name: booking.user.full_name,
          email: booking.user.email,
          phone: booking.user.phone
        } : null,
        service: booking.service ? {
          name: booking.service.name,
          base_price: booking.service.basePrice
        } : null,
        schedule: booking.schedule ? {
          start_date: booking.schedule.start_date,
          start_time: booking.schedule.start_time,
          end_time: booking.schedule.end_time
        } : null,
        // Map to the structure expected by MyBookings component
        id: booking.bookingId,
        type: booking.service?.name || 'Unknown Service',
        provider: booking.service?.name || 'Unknown Provider',
        date: booking.schedule?.start_date || booking.createdAt,
        time: booking.schedule?.start_time || '',
        details: {
          partySize: booking.service?.capacity || 1,
          guests: booking.service?.capacity || 1,
          service: booking.service?.name || 'Unknown Service'
        }
      }));
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch bookings');
    }
  }
);

export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await api.post('/Booking', {
        userId: bookingData.user_id,
        serviceId: bookingData.service_id,
        scheduleId: bookingData.schedule_id
        // TotalAmount is automatically set to service base price
      });

      const data = response.data;
      if (!data.bookingId) {
        throw new Error('Backend did not provide a bookingId');
      }

      return {
        booking_id: data.bookingId,
        user_id: data.userId,
        service_id: data.serviceId,
        schedule_id: data.scheduleId,
        total_amount: data.totalAmount,
        status: data.status,
        created_at: data.createdAt,
        // Map to the structure expected by MyBookings component
        id: data.bookingId,
        type: data.service?.name || 'Unknown Service',
        provider: data.service?.name || 'Unknown Provider',
        date: data.schedule?.start_date || data.createdAt,
        time: data.schedule?.start_time || '',
        details: {
          partySize: data.service?.capacity || 1,
          guests: data.service?.capacity || 1,
          service: data.service?.name || 'Unknown Service'
        }
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to create booking');
    }
  }
);

export const fetchBookedSchedules = createAsyncThunk(
  'bookings/fetchBookedSchedules',
  async ({ serviceId, startDate }, { rejectWithValue }) => {
    try {
      // First try to get available schedules
      const response = await api.get(`/Schedule?serviceId=${serviceId}&startDate=${startDate}&status=Available`);
      const availableSchedules = response.data;
      
      // If no schedules exist, we'll allow booking anyway (schedules will be created during booking)
      console.log('Available schedules found:', availableSchedules.length);
      
      return availableSchedules;
    } catch (err) {
      console.error('Error fetching available schedules:', err);
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch available schedules');
    }}
);

export const fetchAvailableSchedules = createAsyncThunk(
  'bookings/fetchAvailableSchedules',
  async ({ serviceId, startDate }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/Schedule?serviceId=${serviceId}&startDate=${startDate}&status=Available`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch available schedules');
    }
  }
);

const initialState = {
  bookings: [],
  filteredBookings: [],
  availableSchedules: [],
  bookedSchedules: [],
  loading: false,
  error: null,
  statusFilter: 'all',
  dateFilter: ''
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    addBooking: (state, action) => {
      state.bookings.push(action.payload);
      state.filteredBookings.push(action.payload);
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
      state.filteredBookings = state.bookings.filter(booking =>
        state.statusFilter === 'all' ? true : booking.status === state.statusFilter
      );
    },
    setDateFilter: (state, action) => {
      state.dateFilter = action.payload;
      state.filteredBookings = state.bookings.filter(booking =>
        state.dateFilter ? booking.date.includes(state.dateFilter) : true
      );
    },
    clearFilters: (state) => {
      state.statusFilter = 'all';
      state.dateFilter = '';
      state.filteredBookings = state.bookings;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.bookings = action.payload;
        state.filteredBookings = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch bookings';
      })
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.bookings.push(action.payload);
        state.filteredBookings.push(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create booking';
      })
      .addCase(fetchBookedSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookedSchedules.fulfilled, (state, action) => {
        state.bookedSchedules = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchBookedSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch booked schedules';
      })
      .addCase(fetchAvailableSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableSchedules.fulfilled, (state, action) => {
        state.availableSchedules = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchAvailableSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch available schedules';
      });
  }
});

export const { addBooking, setStatusFilter, setDateFilter, clearFilters } = bookingsSlice.actions;
export default bookingsSlice.reducer;