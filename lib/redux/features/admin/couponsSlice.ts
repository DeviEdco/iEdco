// import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// import axios from "axios";

// interface Coupon {
//   id: string;
//   code: string;
//   description: string | null;
//   discountPercentage: number;
//   maxDiscountAmount: number | null;
//   minOrderValue: number | null;
//   usageLimit: number | null;
//   usageCount: number;
//   isActive: boolean;
//   startDate: string | Date;
//   endDate: string | Date | null;
//   createdAt: string;
//   updatedAt: string;
//   orderCount?: number;
// }

// interface CouponsState {
//   items: Coupon[];
//   status: "idle" | "loading" | "succeeded" | "failed";
//   error: string | null;
// }

// const initialState: CouponsState = {
//   items: [],
//   status: "idle",
//   error: null,
// };

// export const fetchCoupons = createAsyncThunk(
//   "adminCoupons/fetchCoupons",
//   async () => {
//     const response = await axios.get("/api/admin/coupons");
//     return response.data;
//   }
// );

// export const addCoupon = createAsyncThunk(
//   "adminCoupons/addCoupon",
//   async (
//     couponData: Omit<Coupon, "id" | "createdAt" | "updatedAt" | "usageCount">
//   ) => {
//     const response = await axios.post("/api/admin/coupons", couponData);
//     return response.data;
//   }
// );

// export const updateCoupon = createAsyncThunk(
//   "adminCoupons/updateCoupon",
//   async ({
//     id,
//     data,
//   }: {
//     id: string;
//     data: Omit<Coupon, "id" | "createdAt" | "updatedAt" | "usageCount">;
//   }) => {
//     const response = await axios.put(`/api/admin/coupons/${id}`, data);
//     return response.data;
//   }
// );

// export const deleteCoupon = createAsyncThunk(
//   "adminCoupons/deleteCoupon",
//   async (id: string) => {
//     await axios.delete(`/api/admin/coupons/${id}`);
//     return id;
//   }
// );

// export const toggleCouponStatus = createAsyncThunk(
//   "adminCoupons/toggleCouponStatus",
//   async ({ id, isActive }: { id: string; isActive: boolean }) => {
//     const coupon = await axios.get(`/api/admin/coupons/${id}`);
//     const updatedData = {
//       ...coupon.data,
//       isActive: !isActive,
//       startDate: new Date(coupon.data.startDate),
//       endDate: coupon.data.endDate ? new Date(coupon.data.endDate) : null,
//     };

//     const response = await axios.put(`/api/admin/coupons/${id}`, updatedData);
//     return response.data;
//   }
// );

// const couponsSlice = createSlice({
//   name: "adminCoupons",
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchCoupons.pending, (state) => {
//         state.status = "loading";
//       })
//       .addCase(
//         fetchCoupons.fulfilled,
//         (state, action: PayloadAction<Coupon[]>) => {
//           state.status = "succeeded";
//           state.items = action.payload;
//         }
//       )
//       .addCase(fetchCoupons.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.error.message || "Failed to fetch coupons";
//       })
//       .addCase(addCoupon.fulfilled, (state, action: PayloadAction<Coupon>) => {
//         state.items.unshift(action.payload);
//       })
//       .addCase(
//         updateCoupon.fulfilled,
//         (state, action: PayloadAction<Coupon>) => {
//           const index = state.items.findIndex(
//             (coupon) => coupon.id === action.payload.id
//           );
//           if (index !== -1) {
//             state.items[index] = action.payload;
//           }
//         }
//       )
//       .addCase(
//         deleteCoupon.fulfilled,
//         (state, action: PayloadAction<string>) => {
//           state.items = state.items.filter(
//             (coupon) => coupon.id !== action.payload
//           );
//         }
//       )
//       .addCase(
//         toggleCouponStatus.fulfilled,
//         (state, action: PayloadAction<Coupon>) => {
//           const index = state.items.findIndex(
//             (coupon) => coupon.id === action.payload.id
//           );
//           if (index !== -1) {
//             state.items[index] = action.payload;
//           }
//         }
//       );
//   },
// });

// export default couponsSlice.reducer;
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountPercentage: number;
  maxDiscountAmount: number | null;
  minOrderValue: number | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
  startDate: string | Date;
  endDate: string | Date | null;
  createdAt: string;
  updatedAt: string;
  orderCount?: number;
}

interface CouponsState {
  items: Coupon[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: CouponsState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchCoupons = createAsyncThunk(
  "adminCoupons/fetchCoupons",
  async () => {
    const response = await axios.get("/api/admin/coupons");
    return response.data;
  }
);

export const addCoupon = createAsyncThunk(
  "adminCoupons/addCoupon",
  async (
    couponData: Omit<Coupon, "id" | "createdAt" | "updatedAt" | "usageCount">
  ) => {
    const response = await axios.post("/api/admin/coupons", couponData);
    return response.data;
  }
);

export const updateCoupon = createAsyncThunk(
  "adminCoupons/updateCoupon",
  async ({
    id,
    data,
  }: {
    id: string;
    data: Omit<Coupon, "id" | "createdAt" | "updatedAt" | "usageCount">;
  }) => {
    const response = await axios.put(`/api/admin/coupons/${id}`, data);
    return response.data;
  }
);

export const deleteCoupon = createAsyncThunk(
  "adminCoupons/deleteCoupon",
  async (id: string) => {
    await axios.delete(`/api/admin/coupons/${id}`);
    return id;
  }
);

export const toggleCouponStatus = createAsyncThunk(
  "adminCoupons/toggleCouponStatus",
  async ({ id, isActive }: { id: string; isActive: boolean }) => {
    const coupon = await axios.get(`/api/admin/coupons/${id}`);
    const updatedData = {
      ...coupon.data,
      isActive: !isActive,
      startDate: new Date(coupon.data.startDate),
      endDate: coupon.data.endDate ? new Date(coupon.data.endDate) : null,
    };

    const response = await axios.put(`/api/admin/coupons/${id}`, updatedData);
    return response.data;
  }
);

const couponsSlice = createSlice({
  name: "adminCoupons",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoupons.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchCoupons.fulfilled,
        (state, action: PayloadAction<Coupon[]>) => {
          state.status = "succeeded";
          state.items = action.payload;
        }
      )
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch coupons";
      })
      .addCase(addCoupon.fulfilled, (state, action: PayloadAction<Coupon>) => {
        state.items.unshift(action.payload);
      })
      .addCase(
        updateCoupon.fulfilled,
        (state, action: PayloadAction<Coupon>) => {
          const index = state.items.findIndex(
            (coupon) => coupon.id === action.payload.id
          );
          if (index !== -1) {
            state.items[index] = action.payload;
          }
        }
      )
      .addCase(
        deleteCoupon.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.items = state.items.filter(
            (coupon) => coupon.id !== action.payload
          );
        }
      )
      .addCase(
        toggleCouponStatus.fulfilled,
        (state, action: PayloadAction<Coupon>) => {
          const index = state.items.findIndex(
            (coupon) => coupon.id === action.payload.id
          );
          if (index !== -1) {
            state.items[index] = action.payload;
          }
        }
      );
  },
});

export default couponsSlice.reducer;
