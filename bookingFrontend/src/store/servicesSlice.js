import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchServicesAndCategories = createAsyncThunk(
  'services/fetchServicesAndCategories',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch categories
      const categoryResponse = await api.get('/Category');
      let categoriesData = [];
      if (categoryResponse.status === 200) {
        categoriesData = categoryResponse.data;
      }

      // Fetch services
      const serviceResponse = await api.get('/Service');
      let servicesData = [];
      if (serviceResponse.status === 200) {
        servicesData = serviceResponse.data;
      }

      // Fetch resources
      const resourceResponse = await api.get('/Resource');
      let resourcesData = [];
      if (resourceResponse.status === 200) {
        resourcesData = resourceResponse.data;
      }

      // Fetch available schedules
      const scheduleResponse = await api.get('/Schedule?status=Available');
      let schedulesData = [];
      if (scheduleResponse.status === 200) {
        schedulesData = scheduleResponse.data;
      }

      // Map categories
      const mappedCategories = categoriesData.map(cat => ({
        category_id: cat.categoryId,
        name: cat.name,
        description: cat.description || 'No description available'
      }));

      // Map services
      const mappedServices = servicesData.map(srv => ({
        service_id: srv.serviceId,
        name: srv.name,
        category_id: srv.categoryId,
        base_price: srv.basePrice,
        capacity: srv.capacity,
        status: srv.status,
        policy_id: srv.policyId
      }));

      // Map resources
      const mappedResources = resourcesData.map(res => ({
        resource_id: res.resourceId,
        service_id: res.serviceId,
        name: res.name,
        type: res.type,
        quantity: res.quantity,
        unit: res.unit,
        address: res.address || null
      }));

      // Map schedules
      const mappedSchedules = schedulesData.map(sch => ({
        schedule_id: sch.schedule_id,
        service_id: sch.service_id,
        start_date: sch.start_date,
        start_time: sch.start_time,
        end_time: sch.end_time,
        status: sch.status,
        service: sch.service
      }));

      return {
        services: mappedServices,
        categories: mappedCategories,
        resources: mappedResources,
        schedules: mappedSchedules
      };
    } catch (err) {
      console.error('Error fetching data:', err);
      return rejectWithValue('Failed to fetch services and categories');
    }
  }
);

const initialState = {
  services: [],
  categories: [],
  resources: [],
  schedules: [],
  filteredServices: [],
  loading: false,
  error: null,
  searchTerm: '',
  maxPrice: '',
  selectedCategory: 'all'
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.filteredServices = state.services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(action.payload.toLowerCase());
        const matchesPrice = state.maxPrice ? service.base_price <= parseFloat(state.maxPrice) : true;
        const matchesCategory = state.selectedCategory === 'all' || 
          state.categories.find(cat => cat.category_id === service.category_id)?.name === state.selectedCategory;
        return matchesSearch && matchesPrice && matchesCategory;
      });
    },
    setMaxPrice: (state, action) => {
      state.maxPrice = action.payload;
      state.filteredServices = state.services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(state.searchTerm.toLowerCase());
        const matchesPrice = action.payload ? service.base_price <= parseFloat(action.payload) : true;
        const matchesCategory = state.selectedCategory === 'all' || 
          state.categories.find(cat => cat.category_id === service.category_id)?.name === state.selectedCategory;
        return matchesSearch && matchesPrice && matchesCategory;
      });
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
      state.filteredServices = state.services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(state.searchTerm.toLowerCase());
        const matchesPrice = state.maxPrice ? service.base_price <= parseFloat(state.maxPrice) : true;
        const matchesCategory = action.payload === 'all' || 
          state.categories.find(cat => cat.category_id === service.category_id)?.name === action.payload;
        return matchesSearch && matchesPrice && matchesCategory;
      });
    },
    clearFilters: (state) => {
      state.searchTerm = '';
      state.maxPrice = '';
      state.selectedCategory = 'all';
      state.filteredServices = state.services;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServicesAndCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServicesAndCategories.fulfilled, (state, action) => {
        state.services = action.payload.services;
        state.categories = action.payload.categories;
        state.resources = action.payload.resources;
        state.schedules = action.payload.schedules;
        state.filteredServices = action.payload.services;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchServicesAndCategories.rejected, (state, action) => {
        state.services = [];
        state.categories = [];
        state.resources = [];
        state.schedules = [];
        state.filteredServices = [];
        state.loading = false;
        state.error = action.payload || 'Failed to fetch services and categories';
      });
  }
});

export const { setSearchTerm, setMaxPrice, setSelectedCategory, clearFilters } = servicesSlice.actions;

export default servicesSlice.reducer;