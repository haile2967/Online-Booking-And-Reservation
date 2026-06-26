import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5176/api';

// Async thunks for API calls
export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async () => {
    const response = await api.get('/Service');
    return response.data;
  }
);

export const fetchServiceById = createAsyncThunk(
  'services/fetchServiceById',
  async (id) => {
    const response = await api.get(`/Service/${id}`);
    return response.data;
  }
);

export const fetchServicesByCategory = createAsyncThunk(
  'services/fetchServicesByCategory',
  async (categoryId) => {
    const response = await api.get(`/Service/category/${categoryId}`);
    return response.data;
  }
);

export const fetchServicesByStatus = createAsyncThunk(
  'services/fetchServicesByStatus',
  async (status) => {
    const response = await api.get(`/Service/status/${status}`);
    return response.data;
  }
);

export const fetchServicesByPriceRange = createAsyncThunk(
  'services/fetchServicesByPriceRange',
  async ({ minPrice, maxPrice }) => {
    const response = await api.get(`/Service/price-range/${minPrice}/${maxPrice}`);
    return response.data;
  }
);

export const updateServiceStatus = createAsyncThunk(
  'services/updateServiceStatus',
  async ({ id, status }) => {
    const response = await api.put(`/Service/${id}/status`, { status });
    return response.data;
  }
);

export const createService = createAsyncThunk(
  'services/createService',
  async (serviceData) => {
    const response = await api.post('/Service', serviceData);
    return response.data;
  }
);

export const updateService = createAsyncThunk(
  'services/updateService',
  async ({ id, serviceData }) => {
    // Extract only the required fields for the API
    const updateData = {
      serviceId: id,
      name: serviceData.name,
      categoryId: serviceData.categoryId,
      basePrice: serviceData.basePrice,
      capacity: serviceData.capacity,
      policyId: serviceData.policyId,
      status: serviceData.status
    };
    
    const response = await api.put(`/Service/${id}`, updateData);
    return response.data;
  }
);

export const deleteService = createAsyncThunk(
  'services/deleteService',
  async (id) => {
    await api.delete(`/Service/${id}`);
    return id;
  }
);

const initialState = {
  services: [],
  selectedService: null,
  loading: false,
  error: null,
  formVisible: false,
  editingService: null,
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setFormVisible: (state, action) => {
      state.formVisible = action.payload;
    },
    setEditingService: (state, action) => {
      state.editingService = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch services
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Fetch service by ID
    builder
      .addCase(fetchServiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedService = action.payload;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Fetch services by category
    builder
      .addCase(fetchServicesByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServicesByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServicesByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Fetch services by status
    builder
      .addCase(fetchServicesByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServicesByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServicesByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Fetch services by price range
    builder
      .addCase(fetchServicesByPriceRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServicesByPriceRange.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServicesByPriceRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Update service status
    builder
      .addCase(updateServiceStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateServiceStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.services.findIndex(service => service.serviceId === action.payload.serviceId);
        if (index !== -1) {
          state.services[index] = action.payload;
        }
      })
      .addCase(updateServiceStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Create service
    builder
      .addCase(createService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.loading = false;
        state.services.push(action.payload);
        state.formVisible = false;
      })
      .addCase(createService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Update service
    builder
      .addCase(updateService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.services.findIndex(service => service.serviceId === action.payload.serviceId);
        if (index !== -1) {
          state.services[index] = action.payload;
        }
        state.formVisible = false;
        state.editingService = null;
      })
      .addCase(updateService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Delete service
    builder
      .addCase(deleteService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.loading = false;
        state.services = state.services.filter(service => service.serviceId !== action.payload);
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setFormVisible, setEditingService, clearError } = servicesSlice.actions;
export default servicesSlice.reducer; 