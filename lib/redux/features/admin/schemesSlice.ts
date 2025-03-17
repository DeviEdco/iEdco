import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface Scheme {
  id: string;
  name: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  freeDelivery: boolean;
  isActive: boolean;
  startDate: string | Date;
  endDate: string | Date;
}

interface SchemesState {
  items: Scheme[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SchemesState = {
  items: [],
  status: 'idle',
  error: null
};

export const fetchSchemes = createAsyncThunk(
  'adminSchemes/fetchSchemes',
  async () => {
    const response = await axios.get('/api/admin/schemes');
    return response.data;
  }
);

export const addScheme = createAsyncThunk(
  'adminSchemes/addScheme',
  async (schemeData: Omit<Scheme, 'id'>) => {
    const response = await axios.post('/api/admin/schemes', schemeData);
    return response.data;
  }
);

export const updateScheme = createAsyncThunk(
  'adminSchemes/updateScheme',
  async ({ id, data }: { id: string, data: Omit<Scheme, 'id'> }) => {
    const response = await axios.put(`/api/admin/schemes/${id}`, data);
    return response.data;
  }
);

export const deleteScheme = createAsyncThunk(
  'adminSchemes/deleteScheme',
  async (id: string) => {
    await axios.delete(`/api/admin/schemes/${id}`);
    return id;
  }
);

export const toggleSchemeStatus = createAsyncThunk(
  'adminSchemes/toggleSchemeStatus',
  async ({ id, isActive }: { id: string, isActive: boolean }) => {
    const scheme = await axios.get(`/api/admin/schemes/${id}`);
    const updatedData = {
      ...scheme.data,
      isActive: !isActive,
      startDate: new Date(scheme.data.startDate),
      endDate: new Date(scheme.data.endDate)
    };
    
    const response = await axios.put(`/api/admin/schemes/${id}`, updatedData);
    return response.data;
  }
);

const schemesSlice = createSlice({
  name: 'adminSchemes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchemes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSchemes.fulfilled, (state, action: PayloadAction<Scheme[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchSchemes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch schemes';
      })
      .addCase(addScheme.fulfilled, (state, action: PayloadAction<Scheme>) => {
        state.items.push(action.payload);
      })
      .addCase(updateScheme.fulfilled, (state, action: PayloadAction<Scheme>) => {
        const index = state.items.findIndex(scheme => scheme.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteScheme.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter(scheme => scheme.id !== action.payload);
      })
      .addCase(toggleSchemeStatus.fulfilled, (state, action: PayloadAction<Scheme>) => {
        const index = state.items.findIndex(scheme => scheme.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  }
});

export default schemesSlice.reducer;