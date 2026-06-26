import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5176/api';

// Fetch all resources
export const fetchResources = createAsyncThunk(
  'resources/fetchResources',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/Resource');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch resources');
    }
  }
);

// Create new resource
export const createResource = createAsyncThunk(
  'resources/createResource',
  async (resourceData, { rejectWithValue }) => {
    try {
      const response = await api.post('/Resource', resourceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create resource');
    }
  }
);

// Fetch resource by ID
export const fetchResourceById = createAsyncThunk(
  'resources/fetchResourceById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/Resource/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch resource');
    }
  }
);

// Update resource
export const updateResource = createAsyncThunk(
  'resources/updateResource',
  async ({ id, resourceData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/Resource/${id}`, resourceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update resource');
    }
  }
);

// Delete resource
export const deleteResource = createAsyncThunk(
  'resources/deleteResource',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/Resource/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete resource');
    }
  }
);

// Fetch resources by service
export const fetchResourcesByService = createAsyncThunk(
  'resources/fetchResourcesByService',
  async (serviceId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/Resource/service/${serviceId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch resources by service');
    }
  }
);

// Fetch resources by type
export const fetchResourcesByType = createAsyncThunk(
  'resources/fetchResourcesByType',
  async (type, { rejectWithValue }) => {
    try {
      const response = await api.get(`/Resource/type/${type}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch resources by type');
    }
  }
);

// Fetch available resources
export const fetchAvailableResources = createAsyncThunk(
  'resources/fetchAvailableResources',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/Resource/available');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch available resources');
    }
  }
);

// Fetch resource stats
export const fetchResourceStats = createAsyncThunk(
  'resources/fetchResourceStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/Resource');
      const resources = response.data;
      const available = resources.filter(r => r.status === 'Available').length;
      const occupied = resources.filter(r => r.status === 'Occupied').length;
      const maintenance = resources.filter(r => r.status === 'Maintenance').length;
      
      return { 
        total: resources.length, 
        available: available,
        occupied: occupied,
        maintenance: maintenance
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch resource stats');
    }
  }
);

const initialState = {
  resources: [],
  selectedResource: null,
  stats: { total: 0, available: 0, occupied: 0, maintenance: 0 },
  loading: false,
  error: null,
  formVisible: false,
  editingResource: null,
};

const resourcesSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    setFormVisible: (state, action) => {
      state.formVisible = action.payload;
    },
    setEditingResource: (state, action) => {
      state.editingResource = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch resources
    builder
      .addCase(fetchResources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.loading = false;
        state.resources = action.payload;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create resource
    builder
      .addCase(createResource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createResource.fulfilled, (state, action) => {
        state.loading = false;
        state.resources.push(action.payload);
      })
      .addCase(createResource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch resource by ID
    builder
      .addCase(fetchResourceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResourceById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedResource = action.payload;
      })
      .addCase(fetchResourceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update resource
    builder
      .addCase(updateResource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateResource.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.resources.findIndex(resource => resource.resourceId === action.payload.resourceId);
        if (index !== -1) {
          state.resources[index] = action.payload;
        }
      })
      .addCase(updateResource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete resource
    builder
      .addCase(deleteResource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteResource.fulfilled, (state, action) => {
        state.loading = false;
        state.resources = state.resources.filter(resource => resource.resourceId !== action.payload);
      })
      .addCase(deleteResource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch resources by service
    builder
      .addCase(fetchResourcesByService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResourcesByService.fulfilled, (state, action) => {
        state.loading = false;
        state.resources = action.payload;
      })
      .addCase(fetchResourcesByService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch resources by type
    builder
      .addCase(fetchResourcesByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResourcesByType.fulfilled, (state, action) => {
        state.loading = false;
        state.resources = action.payload;
      })
      .addCase(fetchResourcesByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch available resources
    builder
      .addCase(fetchAvailableResources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableResources.fulfilled, (state, action) => {
        state.loading = false;
        state.resources = action.payload;
      })
      .addCase(fetchAvailableResources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch resource stats
    builder
      .addCase(fetchResourceStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResourceStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchResourceStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFormVisible, setEditingResource, clearError } = resourcesSlice.actions;
export default resourcesSlice.reducer; 