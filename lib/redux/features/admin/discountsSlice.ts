import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface Discount {
  id: string;
  name: string;
  description: string;
  percentage: number;
  isActive: boolean;
  startDate: string | Date;
  endDate: string | Date;
}

interface DiscountsState {
  items: Discount[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DiscountsState = {
  items: [],
  status: 'idle',
  error: null
};

export const fetchDiscounts = createAsyncThunk(
  'adminDiscounts/fetchDiscounts',
  async () => {
    const response = await axios.get('/api/admin/discounts');
    return response.data;
  }
);

export const addDiscount = createAsyncThunk(
  'adminDiscounts/addDiscount',
  async (discountData: Omit<Discount, 'id'>) => {
    const response = await axios.post('/api/admin/discounts', discountData);
    return response.data;
  }
);

export const updateDiscount = createAsyncThunk(
  'adminDiscounts/updateDiscount',
  async ({ id, data }: { id: string, data: Omit<Discount, 'id'> }) => {
    const response = await axios.put(`/api/admin/discounts/${id}`, data);
    return response.data;
  }
);

export const deleteDiscount = createAsyncThunk(
  'adminDiscounts/deleteDiscount',
  async (id: string) => {
    await axios.delete(`/api/admin/discounts/${id}`);
    return id;
  }
);

export const toggleDiscountStatus = createAsyncThunk(
  'adminDiscounts/toggleDiscountStatus',
  async ({ id, isActive }: { id: string, isActive: boolean }) => {
    const discount = await axios.get(`/api/admin/discounts/${id}`);
    const updatedData = {
      ...discount.data,
      isActive: !isActive,
      startDate: new Date(discount.data.startDate),
      endDate: new Date(discount.data.endDate)
    };
    
    const response = await axios.put(`/api/admin/discounts/${id}`, updatedData);
    return response.data;
  }
);

const discountsSlice = createSlice({
  name: 'adminDiscounts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiscounts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDiscounts.fulfilled, (state, action: PayloadAction<Discount[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchDiscounts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch discounts';
      })
      .addCase(addDiscount.fulfilled, (state, action: PayloadAction<Discount>) => {
        state.items.push(action.payload);
      })
      .addCase(updateDiscount.fulfilled, (state, action: PayloadAction<Discount>) => {
        const index = state.items.findIndex(discount => discount.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteDiscount.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter(discount => discount.id !== action.payload);
      })
      .addCase(toggleDiscountStatus.fulfilled, (state, action: PayloadAction<Discount>) => {
        const index = state.items.findIndex(discount => discount.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  }
});

export default discountsSlice.reducer;