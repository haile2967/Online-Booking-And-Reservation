import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const createSchedule = createAsyncThunk(
  'schedules/createSchedule',
  async (scheduleData, { rejectWithValue }) => {
    try {
      const response = await api.post('/Schedule', {
        serviceId: scheduleData.service_id,
        startDate: scheduleData.start_date,
        startTime: scheduleData.start_time,
        endTime: scheduleData.end_time,
        status: scheduleData.status
      });

      const data = response.data;
      if (!data.scheduleId) {
        throw new Error('Backend did not provide a scheduleId');
      }

      return {
        schedule_id: data.scheduleId,
        service_id: data.serviceId,
        start_date: data.startDate,
        start_time: data.startTime,
        end_time: data.endTime,
        status: data.status,
        service: data.service
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to create schedule');
    }
  }
);

export const fetchAvailableSchedules = createAsyncThunk(
  'schedules/fetchAvailableSchedules',
  async ({ serviceId, startDate }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      
      const url = `/Schedule/available/${serviceId}${params.toString() ? `?${params}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch schedules');
    }
  }
);

const initialState = {
  schedules: [],
  availableSchedules: [],
  loading: false,
  error: null
};

const schedulesSlice = createSlice({
  name: 'schedules',
  initialState,
  reducers: {
    addSchedule: (state, action) => {
      state.schedules.push(action.payload);
    },
    clearAvailableSchedules: (state) => {
      state.availableSchedules = [];
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSchedule.fulfilled, (state, action) => {
        state.schedules.push(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(createSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create schedule';
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
        state.error = action.payload || 'Failed to fetch schedules';
      });
  }
});

export const { addSchedule, clearAvailableSchedules, clearError } = schedulesSlice.actions;
export default schedulesSlice.reducer;