import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5176/api';

// Async thunks for API calls
export const fetchPolicies = createAsyncThunk(
  'policies/fetchPolicies',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching policies from API...');
      const response = await api.get('/CancellationPolicy');
      console.log('Policies response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching policies:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch policies');
    }
  }
);

export const fetchPolicyById = createAsyncThunk(
  'policies/fetchPolicyById',
  async (id) => {
    const response = await api.get(`/CancellationPolicy/${id}`);
    return response.data;
  }
);

export const createPolicy = createAsyncThunk(
  'policies/createPolicy',
  async (policyData) => {
    const response = await api.post('/CancellationPolicy', policyData);
    return response.data;
  }
);

export const updatePolicy = createAsyncThunk(
  'policies/updatePolicy',
  async ({ id, policyData }) => {
    const response = await api.put(`/CancellationPolicy/${id}`, policyData);
    return response.data;
  }
);

export const deletePolicy = createAsyncThunk(
  'policies/deletePolicy',
  async (id) => {
    await api.delete(`/CancellationPolicy/${id}`);
    return id;
  }
);

export const fetchPoliciesByRefund = createAsyncThunk(
  'policies/fetchPoliciesByRefund',
  async (percentage) => {
    const response = await api.get(`/CancellationPolicy/by-refund/${percentage}`);
    return response.data;
  }
);

export const fetchPoliciesByNotice = createAsyncThunk(
  'policies/fetchPoliciesByNotice',
  async (hours) => {
    const response = await api.get(`/CancellationPolicy/by-notice/${hours}`);
    return response.data;
  }
);

const initialState = {
  policies: [],
  selectedPolicy: null,
  loading: false,
  error: null,
  formVisible: false,
  editingPolicy: null,
};

const policiesSlice = createSlice({
  name: 'policies',
  initialState,
  reducers: {
    setFormVisible: (state, action) => {
      state.formVisible = action.payload;
    },
    setEditingPolicy: (state, action) => {
      state.editingPolicy = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch policies
    builder
      .addCase(fetchPolicies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPolicies.fulfilled, (state, action) => {
        state.loading = false;
        state.policies = action.payload;
      })
      .addCase(fetchPolicies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Fetch policy by ID
    builder
      .addCase(fetchPolicyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPolicyById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPolicy = action.payload;
      })
      .addCase(fetchPolicyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Fetch policies by refund percentage
    builder
      .addCase(fetchPoliciesByRefund.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPoliciesByRefund.fulfilled, (state, action) => {
        state.loading = false;
        state.policies = action.payload;
      })
      .addCase(fetchPoliciesByRefund.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Fetch policies by notice hours
    builder
      .addCase(fetchPoliciesByNotice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPoliciesByNotice.fulfilled, (state, action) => {
        state.loading = false;
        state.policies = action.payload;
      })
      .addCase(fetchPoliciesByNotice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Create policy
    builder
      .addCase(createPolicy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPolicy.fulfilled, (state, action) => {
        state.loading = false;
        state.policies.push(action.payload);
        state.formVisible = false;
      })
      .addCase(createPolicy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Update policy
    builder
      .addCase(updatePolicy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePolicy.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.policies.findIndex(policy => policy.policyId === action.payload.policyId);
        if (index !== -1) {
          state.policies[index] = action.payload;
        }
        state.formVisible = false;
        state.editingPolicy = null;
      })
      .addCase(updatePolicy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Delete policy
    builder
      .addCase(deletePolicy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePolicy.fulfilled, (state, action) => {
        state.loading = false;
        state.policies = state.policies.filter(policy => policy.policyId !== action.payload);
      })
      .addCase(deletePolicy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setFormVisible, setEditingPolicy, clearError } = policiesSlice.actions;
export default policiesSlice.reducer;
