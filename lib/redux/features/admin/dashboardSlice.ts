// import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// import axios from "axios";

// interface DashboardStats {
//   totalRevenue: number;
//   totalCustomers: number;
//   totalOrders: number;
//   totalProducts: number;
//   monthlyRevenue: Array<{ name: string; revenue: number }>;
//   categoryData: Array<{ name: string; value: number }>;
//   orderStatusData: Array<{ name: string; value: number }>;
// }

// interface DashboardState {
//   stats: DashboardStats | null;
//   status: 'idle' | 'loading' | 'succeeded' | 'failed';
//   error: string | null;
// }

// const initialState: DashboardState = {
//   stats: null,
//   status: 'idle',
//   error: null
// };

// export const fetchDashboardStats = createAsyncThunk(
//   'adminDashboard/fetchDashboardStats',
//   async () => {
//     const response = await axios.get('/api/admin/dashboard/stats');
//     return response.data;
//   }
// );

// const dashboardSlice = createSlice({
//   name: 'adminDashboard',
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchDashboardStats.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(fetchDashboardStats.fulfilled, (state, action: PayloadAction<DashboardStats>) => {
//         state.status = 'succeeded';
//         state.stats = action.payload;
//       })
//       .addCase(fetchDashboardStats.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.error.message || 'Failed to fetch dashboard stats';
//       });
//   }
// });

// export default dashboardSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface DashboardStats {
  totalRevenue: number;
  totalCustomers: number;
  totalOrders: number;
  totalProducts: number;
  monthlyRevenue: Array<{ name: string; revenue: number }>;
  categoryData: Array<{ name: string; value: number }>;
  orderStatusData: Array<{ name: string; value: number }>;
}

interface DashboardState {
  stats: DashboardStats | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  status: "idle",
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  "adminDashboard/fetchDashboardStats",
  async () => {
    const response = await axios.get("/api/admin/dashboard/stats");
    return response.data;
  }
);

const dashboardSlice = createSlice({
  name: "adminDashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchDashboardStats.fulfilled,
        (state, action: PayloadAction<DashboardStats>) => {
          state.status = "succeeded";
          state.stats = action.payload;
        }
      )
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch dashboard stats";
      });
  },
});

export default dashboardSlice.reducer;
