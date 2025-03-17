// import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// import axios from "axios";

// interface OrderItem {
//   id: string;
//   productId: string;
//   quantity: number;
//   price: number;
//   product: {
//     name: string;
//     slug?: string;
//     images?: { id: string; url: string }[];
//   };
// }

// interface Address {
//   id: string;
//   name: string;
//   street: string;
//   city: string;
//   state: string;
//   postalCode: string;
//   country: string;
//   phone: string;
// }

// interface Order {
//   id: string;
//   userId: string;
//   addressId: string;
//   total: number;
//   status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
//   paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
//   invoiceNumber: string | null;
//   createdAt: string;
//   updatedAt: string;
//   user: {
//     id: string;
//     name: string;
//     email: string;
//   };
//   address: Address;
//   orderItems: OrderItem[];
// }

// interface OrdersState {
//   items: Order[];
//   selectedOrder: Order | null;
//   status: 'idle' | 'loading' | 'succeeded' | 'failed';
//   error: string | null;
// }

// const initialState: OrdersState = {
//   items: [],
//   selectedOrder: null,
//   status: 'idle',
//   error: null
// };

// export const fetchOrders = createAsyncThunk(
//   'adminOrders/fetchOrders',
//   async (params?: { status?: string, search?: string }) => {
//     const queryParams = new URLSearchParams();
//     if (params?.status) queryParams.append('status', params.status);
//     if (params?.search) queryParams.append('search', params.search);

//     const response = await axios.get(`/api/admin/orders?${queryParams.toString()}`);
//     return response.data;
//   }
// );

// export const fetchOrderById = createAsyncThunk(
//   'adminOrders/fetchOrderById',
//   async (id: string) => {
//     const response = await axios.get(`/api/admin/orders/${id}`);
//     return response.data;
//   }
// );

// export const updateOrderStatus = createAsyncThunk(
//   'adminOrders/updateOrderStatus',
//   async ({ id, status, paymentStatus }: { id: string, status: string, paymentStatus: string }) => {
//     const response = await axios.put(`/api/admin/orders/${id}`, { status, paymentStatus });
//     return response.data;
//   }
// );

// const ordersSlice = createSlice({
//   name: 'adminOrders',
//   initialState,
//   reducers: {
//     clearSelectedOrder: (state) => {
//       state.selectedOrder = null;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchOrders.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
//         state.status = 'succeeded';
//         state.items = action.payload;
//       })
//       .addCase(fetchOrders.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.error.message || 'Failed to fetch orders';
//       })
//       .addCase(fetchOrderById.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<Order>) => {
//         state.status = 'succeeded';
//         state.selectedOrder = action.payload;
//       })
//       .addCase(fetchOrderById.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.error.message || 'Failed to fetch order';
//       })
//       .addCase(updateOrderStatus.fulfilled, (state, action: PayloadAction<Order>) => {
//         const index = state.items.findIndex(order => order.id === action.payload.id);
//         if (index !== -1) {
//           state.items[index] = action.payload;
//         }
//         if (state.selectedOrder?.id === action.payload.id) {
//           state.selectedOrder = action.payload;
//         }
//       });
//   }
// });

// export const { clearSelectedOrder } = ordersSlice.actions;
// export default ordersSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    slug?: string;
    images?: { id: string; url: string }[];
  };
}

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface ReturnRequest {
  id: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

interface Order {
  id: string;
  userId: string;
  addressId: string;
  total: number;
  subtotal: number;
  discount: number;
  codCharges: number;
  status:
    | "PENDING"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "RETURNED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentMethod: "ONLINE" | "COD";
  invoiceNumber: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  address: Address;
  orderItems: OrderItem[];
  returnRequest?: ReturnRequest;
  shipmentId?: string;
  awbNumber?: string;
  trackingUrl?: string;
  cancellationReason?: string;
}

interface OrdersState {
  items: Order[];
  selectedOrder: Order | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: OrdersState = {
  items: [],
  selectedOrder: null,
  status: "idle",
  error: null,
};

export const fetchOrders = createAsyncThunk(
  "adminOrders/fetchOrders",
  async (params?: { status?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);

    const response = await axios.get(
      `/api/admin/orders?${queryParams.toString()}`
    );
    return response.data;
  }
);

export const fetchOrderById = createAsyncThunk(
  "adminOrders/fetchOrderById",
  async (id: string) => {
    const response = await axios.get(`/api/admin/orders/${id}`);
    return response.data;
  }
);

export const updateOrderStatus = createAsyncThunk(
  "adminOrders/updateOrderStatus",
  async ({
    id,
    status,
    paymentStatus,
  }: {
    id: string;
    status: string;
    paymentStatus: string;
  }) => {
    const response = await axios.put(`/api/admin/orders/${id}`, {
      status,
      paymentStatus,
    });
    return response.data;
  }
);

export const processReturnRequest = createAsyncThunk(
  "adminOrders/processReturnRequest",
  async ({
    orderId,
    status,
    refundAmount,
  }: {
    orderId: string;
    status: "APPROVED" | "REJECTED";
    refundAmount?: number;
  }) => {
    const response = await axios.put(`/api/admin/orders/${orderId}/return`, {
      status,
      refundAmount,
    });
    return response.data;
  }
);

export const initiateRefund = createAsyncThunk(
  "adminOrders/initiateRefund",
  async ({
    orderId,
    amount,
    reason,
  }: {
    orderId: string;
    amount: number;
    reason: string;
  }) => {
    const response = await axios.post(`/api/admin/orders/${orderId}/refund`, {
      amount,
      reason,
    });
    return response.data;
  }
);

const ordersSlice = createSlice({
  name: "adminOrders",
  initialState,
  reducers: {
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchOrders.fulfilled,
        (state, action: PayloadAction<Order[]>) => {
          state.status = "succeeded";
          state.items = action.payload;
        }
      )
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch orders";
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchOrderById.fulfilled,
        (state, action: PayloadAction<Order>) => {
          state.status = "succeeded";
          state.selectedOrder = action.payload;
        }
      )
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch order";
      })
      .addCase(
        updateOrderStatus.fulfilled,
        (state, action: PayloadAction<Order>) => {
          const index = state.items.findIndex(
            (order) => order.id === action.payload.id
          );
          if (index !== -1) {
            state.items[index] = action.payload;
          }
          if (state.selectedOrder?.id === action.payload.id) {
            state.selectedOrder = action.payload;
          }
        }
      )
      .addCase(
        processReturnRequest.fulfilled,
        (state, action: PayloadAction<Order>) => {
          const index = state.items.findIndex(
            (order) => order.id === action.payload.id
          );
          if (index !== -1) {
            state.items[index] = action.payload;
          }
          if (state.selectedOrder?.id === action.payload.id) {
            state.selectedOrder = action.payload;
          }
        }
      )
      .addCase(
        initiateRefund.fulfilled,
        (state, action: PayloadAction<Order>) => {
          const index = state.items.findIndex(
            (order) => order.id === action.payload.id
          );
          if (index !== -1) {
            state.items[index] = action.payload;
          }
          if (state.selectedOrder?.id === action.payload.id) {
            state.selectedOrder = action.payload;
          }
        }
      );
  },
});

export const { clearSelectedOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
