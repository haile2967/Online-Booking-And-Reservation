import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for API calls
export const fetchSchedules = createAsyncThunk(
  'schedules/fetchSchedules',
  async ({ status, startDate, limit, sort } = {}) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (startDate) params.append('startDate', startDate);
    if (limit) params.append('limit', limit);
    if (sort) params.append('sort', sort);
    
    const url = `/Schedule${params.toString() ? `?${params}` : ''}`;
    
    try {
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

export const fetchScheduleById = createAsyncThunk(
  'schedules/fetchScheduleById',
  async (id) => {
    const response = await api.get(`/Schedule/${id}`);
    return response.data;
  }
);

export const createSchedule = createAsyncThunk(
  'schedules/createSchedule',
  async (scheduleData) => {
    const response = await api.post('/Schedule', scheduleData);
    return response.data;
  }
);

export const updateSchedule = createAsyncThunk(
  'schedules/updateSchedule',
  async ({ id, scheduleData }) => {
    const response = await api.patch(`/Schedule/${id}`, scheduleData);
    return response.data;
  }
);

export const fetchScheduleStats = createAsyncThunk(
  'schedules/fetchScheduleStats',
  async () => {
    try {
      const response = await api.get('/Schedule/stats');
      return response.data;
    } catch (error) {
      // Fallback: calculate stats from schedules data
      const schedulesResponse = await api.get('/Schedule');
      const schedules = schedulesResponse.data;
      
      const available = schedules.filter(s => s.status === 'Available').length;
      const booked = schedules.filter(s => s.status === 'Booked').length;
      const cancelled = schedules.filter(s => s.status === 'Cancelled').length;
      
      const stats = { 
        total: schedules.length, 
        available: available,
        booked: booked,
        cancelled: cancelled
      };
      
      return stats;
    }
  }
);

const initialState = {
  schedules: [],
  selectedSchedule: null,
  stats: { total: 0, available: 0, booked: 0, cancelled: 0 },
  loading: false,
  error: null,
  formVisible: false,
  editingSchedule: null,
};

const schedulesSlice = createSlice({
  name: 'schedules',
  initialState,
  reducers: {
    setFormVisible: (state, action) => {
      state.formVisible = action.payload;
    },
    setEditingSchedule: (state, action) => {
      state.editingSchedule = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch schedules
    builder
      .addCase(fetchSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = action.payload;
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Fetch schedule by ID
    builder
      .addCase(fetchScheduleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScheduleById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSchedule = action.payload;
      })
      .addCase(fetchScheduleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Create schedule
    builder
      .addCase(createSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules.push(action.payload);
        state.formVisible = false;
      })
      .addCase(createSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Update schedule
    builder
      .addCase(updateSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSchedule.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.schedules.findIndex(s => s.schedule_id === action.payload.schedule_id);
        if (index !== -1) {
          state.schedules[index] = action.payload;
        }
        state.formVisible = false;
        state.editingSchedule = null;
      })
      .addCase(updateSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Fetch schedule stats
    builder
      .addCase(fetchScheduleStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScheduleStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchScheduleStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setFormVisible, setEditingSchedule, clearError } = schedulesSlice.actions;
export default schedulesSlice.reducer;