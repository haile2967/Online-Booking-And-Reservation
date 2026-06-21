import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const createPayment = createAsyncThunk(
  'payments/createPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/Payment', {
        bookingId: paymentData.booking_id,
        paymentMethod: paymentData.payment_method,
        amountPaid: paymentData.amount_paid,
        paymentType: paymentData.payment_type
      });

      const data = response.data;
      return {
        payment_id: data.payment_id,
        booking_id: data.booking_id,
        payment_method: data.payment_method,
        amount_paid: data.amount_paid,
        payment_type: data.payment_type,
        payment_date: data.payment_date,
        booking_status_updated: data.booking_status_updated,
        total_paid: data.total_paid,
        total_amount: data.total_amount,
        remaining_amount: data.remaining_amount,
        is_fully_paid: data.is_fully_paid
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to create payment');
    }
  }
);

export const fetchPayment = createAsyncThunk(
  'payments/fetchPayment',
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/Payment/${paymentId}`);
      const data = response.data;
      
      return {
        payment_id: data.payment_id,
        booking_id: data.booking_id,
        payment_method: data.payment_method,
        amount_paid: data.amount_paid,
        payment_type: data.payment_type,
        payment_date: data.payment_date,
        booking: data.booking
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Payment not found');
    }
  }
);

export const fetchPaymentSummary = createAsyncThunk(
  'payments/fetchPaymentSummary',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/Payment/booking/${bookingId}/summary`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch payment summary');
    }
  }
);

const initialState = {
  payments: [],
  currentPayment: null,
  paymentSummary: null,
  loading: false,
  error: null
};

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    addPayment: (state, action) => {
      state.payments.push(action.payload);
    },
    setCurrentPayment: (state, action) => {
      state.currentPayment = action.payload;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },
    setPaymentSummary: (state, action) => {
      state.paymentSummary = action.payload;
    },
    clearPaymentSummary: (state) => {
      state.paymentSummary = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        const existingIndex = state.payments.findIndex(p => p.payment_id === action.payload.payment_id);
        if (existingIndex >= 0) {
          state.payments[existingIndex] = action.payload;
        } else {
          state.payments.push(action.payload);
        }
        state.currentPayment = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayment.fulfilled, (state, action) => {
        const existingIndex = state.payments.findIndex(p => p.payment_id === action.payload.payment_id);
        if (existingIndex >= 0) {
          state.payments[existingIndex] = action.payload;
        } else {
          state.payments.push(action.payload);
        }
        state.currentPayment = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPaymentSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentSummary.fulfilled, (state, action) => {
        state.paymentSummary = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchPaymentSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  addPayment, 
  setCurrentPayment, 
  clearCurrentPayment, 
  setPaymentSummary, 
  clearPaymentSummary, 
  clearError 
} = paymentsSlice.actions;

export default paymentsSlice.reducer;