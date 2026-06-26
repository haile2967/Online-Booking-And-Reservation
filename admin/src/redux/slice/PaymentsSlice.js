import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for API calls
export const fetchPayments = createAsyncThunk(
  'payments/fetchPayments',
  async ({ limit, sort } = {}) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (sort) params.append('sort', sort);
    const response = await api.get(`/Payment${params.toString() ? `?${params}` : ''}`);
    return response.data;
  }
);

export const fetchPaymentById = createAsyncThunk(
  'payments/fetchPaymentById',
  async (id) => {
    const response = await api.get(`/Payment/${id}`);
    return response.data;
  }
);

export const createPayment = createAsyncThunk(
  'payments/createPayment',
  async (paymentData) => {
    const response = await api.post('/Payment', paymentData);
    return response.data;
  }
);

export const verifyPayments = createAsyncThunk(
  'payments/verifyPayments',
  async () => {
    const response = await api.post('/Payment/verify');
    return response.data;
  }
);

export const fetchPaymentStats = createAsyncThunk(
  'payments/fetchPaymentStats',
  async () => {
    const response = await api.get('/Payment');
    const payments = response.data;
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount_paid, 0);
    const pendingCount = payments.filter(payment => 
      payment.booking?.status === 'Pending' || payment.booking?.status === 'Pending Approval'
    ).length;
    
    return { 
      total: payments.length, 
      total_amount: totalAmount,
      pending: pendingCount
    };
  }
);

const initialState = {
  payments: [],
  selectedPayment: null,
  stats: { total: 0, total_amount: 0, pending: 0 },
  loading: false,
  error: null,
  verificationResult: null,
};

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearVerificationResult: (state) => {
      state.verificationResult = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch payments
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Fetch payment by ID
    builder
      .addCase(fetchPaymentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPayment = action.payload;
      })
      .addCase(fetchPaymentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Create payment
    builder
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments.unshift(action.payload);
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Verify payments
    builder
      .addCase(verifyPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.verificationResult = action.payload;
      })
      .addCase(verifyPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Fetch payment stats
    builder
      .addCase(fetchPaymentStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchPaymentStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError, clearVerificationResult } = paymentsSlice.actions;
export default paymentsSlice.reducer;