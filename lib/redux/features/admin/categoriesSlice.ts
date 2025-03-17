import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  productCount: number;
}

interface CategoriesState {
  items: Category[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CategoriesState = {
  items: [],
  status: 'idle',
  error: null
};

export const fetchCategories = createAsyncThunk(
  'adminCategories/fetchCategories',
  async () => {
    const response = await axios.get('/api/admin/categories');
    return response.data;
  }
);

export const addCategory = createAsyncThunk(
  'adminCategories/addCategory',
  async (categoryData: Omit<Category, 'id' | 'productCount'>) => {
    const response = await axios.post('/api/admin/categories', categoryData);
    return response.data;
  }
);

export const updateCategory = createAsyncThunk(
  'adminCategories/updateCategory',
  async ({ id, data }: { id: string, data: Omit<Category, 'id' | 'productCount'> }) => {
    const response = await axios.put(`/api/admin/categories/${id}`, data);
    return response.data;
  }
);

export const deleteCategory = createAsyncThunk(
  'adminCategories/deleteCategory',
  async (id: string) => {
    await axios.delete(`/api/admin/categories/${id}`);
    return id;
  }
);

const categoriesSlice = createSlice({
  name: 'adminCategories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch categories';
      })
      .addCase(addCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.items.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        const index = state.items.findIndex(category => category.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter(category => category.id !== action.payload);
      });
  }
});

export default categoriesSlice.reducer;