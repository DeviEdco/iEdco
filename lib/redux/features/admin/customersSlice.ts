import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface Customer {
  id: string;
  name: string;
  email: string;
  emailVerified: string | null;
  image: string | null;
  createdAt: string;
  _count: {
    orders: number;
    addresses: number;
  };
}

interface CustomerDetail extends Customer {
  addresses: any[];
  recentOrders: any[];
  _count: {
    orders: number;
    reviews: number;
  };
}

interface CustomersState {
  items: Customer[];
  selectedCustomer: CustomerDetail | null;
  customerOrders: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CustomersState = {
  items: [],
  selectedCustomer: null,
  customerOrders: [],
  status: 'idle',
  error: null
};

export const fetchCustomers = createAsyncThunk(
  'adminCustomers/fetchCustomers',
  async (search?: string) => {
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    
    const response = await axios.get(`/api/admin/customers?${queryParams.toString()}`);
    return response.data;
  }
);

export const fetchCustomerById = createAsyncThunk(
  'adminCustomers/fetchCustomerById',
  async (id: string) => {
    const response = await axios.get(`/api/admin/customers/${id}`);
    return response.data;
  }
);

export const fetchCustomerOrders = createAsyncThunk(
  'adminCustomers/fetchCustomerOrders',
  async (id: string) => {
    const response = await axios.get(`/api/admin/customers/${id}/orders`);
    return response.data;
  }
);

const customersSlice = createSlice({
  name: 'adminCustomers',
  initialState,
  reducers: {
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
      state.customerOrders = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCustomers.fulfilled, (state, action: PayloadAction<Customer[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch customers';
      })
      .addCase(fetchCustomerById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCustomerById.fulfilled, (state, action: PayloadAction<CustomerDetail>) => {
        state.status = 'succeeded';
        state.selectedCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch customer';
      })
      .addCase(fetchCustomerOrders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCustomerOrders.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.status = 'succeeded';
        state.customerOrders = action.payload;
      })
      .addCase(fetchCustomerOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch customer orders';
      });
  }
});

export const { clearSelectedCustomer } = customersSlice.actions;
export default customersSlice.reducer;