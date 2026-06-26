import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5176/api';

// Async thunks for API calls
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async () => {
    const response = await api.get('/Category');
    return response.data;
  }
);

export const fetchCategoryById = createAsyncThunk(
  'categories/fetchCategoryById',
  async (id) => {
    const response = await api.get(`/Category/${id}`);
    return response.data;
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData) => {
    const response = await api.post('/Category', categoryData);
    return response.data;
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, categoryData }) => {
    const response = await api.put(`/Category/${id}`, categoryData);
    return response.data;
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id) => {
    await api.delete(`/Category/${id}`);
    return id;
  }
);

export const fetchCategoryStats = createAsyncThunk(
  'categories/fetchCategoryStats',
  async () => {
    const response = await api.get('/Category');
    return { total: response.data.length };
  }
);

const initialState = {
  categories: [],
  selectedCategory: null,
  stats: { total: 0 },
  loading: false,
  error: null,
  formVisible: false,
  editingCategory: null,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setFormVisible: (state, action) => {
      state.formVisible = action.payload;
    },
    setEditingCategory: (state, action) => {
      state.editingCategory = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Fetch category by ID
    builder
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Create category
    builder
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
        state.formVisible = false;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Update category
    builder
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categories.findIndex(cat => cat.categoryId === action.payload.categoryId);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        state.formVisible = false;
        state.editingCategory = null;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Delete category
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter(cat => cat.categoryId !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Fetch category stats
    builder
      .addCase(fetchCategoryStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchCategoryStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setFormVisible, setEditingCategory, clearError } = categoriesSlice.actions;
export default categoriesSlice.reducer; 