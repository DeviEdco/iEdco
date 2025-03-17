// // "use client";

// // import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// // export interface CartItem {
// //   id: string;
// //   name: string;
// //   price: number;
// //   quantity: number;
// //   image: string;
// // }

// // interface CartState {
// //   items: CartItem[];
// //   totalAmount: number;
// //   totalQuantity: number;
// // }

// // const initialState: CartState = {
// //   items: [],
// //   totalAmount: 0,
// //   totalQuantity: 0,
// // };

// // const cartSlice = createSlice({
// //   name: "cart",
// //   initialState,
// //   reducers: {
// //     addToCart(state, action: PayloadAction<CartItem>) {
// //       const newItem = action.payload;
// //       const existingItem = state.items.find((item) => item.id === newItem.id);

// //       if (!existingItem) {
// //         state.items.push(newItem);
// //       } else {
// //         existingItem.quantity += newItem.quantity;
// //       }

// //       state.totalQuantity += newItem.quantity;
// //       state.totalAmount += newItem.price * newItem.quantity;
// //     },
// //     removeFromCart(state, action: PayloadAction<string>) {
// //       const id = action.payload;
// //       const existingItem = state.items.find((item) => item.id === id);

// //       if (existingItem) {
// //         state.totalQuantity -= existingItem.quantity;
// //         state.totalAmount -= existingItem.price * existingItem.quantity;
// //         state.items = state.items.filter((item) => item.id !== id);
// //       }
// //     },
// //     updateQuantity(
// //       state,
// //       action: PayloadAction<{ id: string; quantity: number }>
// //     ) {
// //       const { id, quantity } = action.payload;
// //       const existingItem = state.items.find((item) => item.id === id);

// //       if (existingItem) {
// //         state.totalQuantity = state.totalQuantity - existingItem.quantity + quantity;
// //         state.totalAmount =
// //           state.totalAmount -
// //           existingItem.price * existingItem.quantity +
// //           existingItem.price * quantity;
// //         existingItem.quantity = quantity;
// //       }
// //     },
// //     clearCart(state) {
// //       state.items = [];
// //       state.totalAmount = 0;
// //       state.totalQuantity = 0;
// //     },
// //   },
// // });

// // export const { addToCart, removeFromCart, updateQuantity, clearCart } =
// //   cartSlice.actions;
// // export default cartSlice.reducer;

// "use client";

// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// export interface CartItem {
//   id: string;
//   name: string;
//   price: number;
//   quantity: number;
//   image: string;
// }

// interface CartState {
//   items: CartItem[];
//   totalAmount: number;
//   totalQuantity: number;
//   coupon: {
//     id: string;
//     code: string;
//     discountPercentage: number;
//     maxDiscountAmount: number | null;
//     discount: number;
//   } | null;
// }

// const initialState: CartState = {
//   items: [],
//   totalAmount: 0,
//   totalQuantity: 0,
//   coupon: null,
// };

// const cartSlice = createSlice({
//   name: "cart",
//   initialState,
//   reducers: {
//     addToCart(state, action: PayloadAction<CartItem>) {
//       const newItem = action.payload;
//       const existingItem = state.items.find((item) => item.id === newItem.id);

//       if (!existingItem) {
//         state.items.push(newItem);
//       } else {
//         existingItem.quantity += newItem.quantity;
//       }

//       state.totalQuantity += newItem.quantity;
//       state.totalAmount += newItem.price * newItem.quantity;

//       // Recalculate discount if coupon exists
//       if (state.coupon) {
//         let discount =
//           (state.totalAmount * state.coupon.discountPercentage) / 100;
//         if (state.coupon.maxDiscountAmount) {
//           discount = Math.min(discount, state.coupon.maxDiscountAmount);
//         }
//         state.coupon.discount = parseFloat(discount.toFixed(2));
//       }
//     },
//     removeFromCart(state, action: PayloadAction<string>) {
//       const id = action.payload;
//       const existingItem = state.items.find((item) => item.id === id);

//       if (existingItem) {
//         state.totalQuantity -= existingItem.quantity;
//         state.totalAmount -= existingItem.price * existingItem.quantity;
//         state.items = state.items.filter((item) => item.id !== id);

//         // Recalculate discount if coupon exists
//         if (state.coupon) {
//           let discount =
//             (state.totalAmount * state.coupon.discountPercentage) / 100;
//           if (state.coupon.maxDiscountAmount) {
//             discount = Math.min(discount, state.coupon.maxDiscountAmount);
//           }
//           state.coupon.discount = parseFloat(discount.toFixed(2));
//         }
//       }
//     },
//     updateQuantity(
//       state,
//       action: PayloadAction<{ id: string; quantity: number }>
//     ) {
//       const { id, quantity } = action.payload;
//       const existingItem = state.items.find((item) => item.id === id);

//       if (existingItem) {
//         state.totalQuantity =
//           state.totalQuantity - existingItem.quantity + quantity;
//         state.totalAmount =
//           state.totalAmount -
//           existingItem.price * existingItem.quantity +
//           existingItem.price * quantity;
//         existingItem.quantity = quantity;

//         // Recalculate discount if coupon exists
//         if (state.coupon) {
//           let discount =
//             (state.totalAmount * state.coupon.discountPercentage) / 100;
//           if (state.coupon.maxDiscountAmount) {
//             discount = Math.min(discount, state.coupon.maxDiscountAmount);
//           }
//           state.coupon.discount = parseFloat(discount.toFixed(2));
//         }
//       }
//     },
//     applyCoupon(
//       state,
//       action: PayloadAction<{
//         id: string;
//         code: string;
//         discountPercentage: number;
//         maxDiscountAmount: number | null;
//       }>
//     ) {
//       const { id, code, discountPercentage, maxDiscountAmount } =
//         action.payload;
//       let discount = (state.totalAmount * discountPercentage) / 100;

//       if (maxDiscountAmount) {
//         discount = Math.min(discount, maxDiscountAmount);
//       }

//       state.coupon = {
//         id,
//         code,
//         discountPercentage,
//         maxDiscountAmount,
//         discount: parseFloat(discount.toFixed(2)),
//       };
//     },
//     removeCoupon(state) {
//       state.coupon = null;
//     },
//     clearCart(state) {
//       state.items = [];
//       state.totalAmount = 0;
//       state.totalQuantity = 0;
//       state.coupon = null;
//     },
//   },
// });

// export const {
//   addToCart,
//   removeFromCart,
//   updateQuantity,
//   applyCoupon,
//   removeCoupon,
//   clearCart,
// } = cartSlice.actions;
// export default cartSlice.reducer;
"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
  totalQuantity: number;
  codCharges: number;
  paymentMethod: "ONLINE" | "COD" | null;
  coupon: {
    id: string;
    code: string;
    discountPercentage: number;
    maxDiscountAmount: number | null;
    discount: number;
  } | null;
}

const initialState: CartState = {
  items: [],
  totalAmount: 0,
  totalQuantity: 0,
  codCharges: 0,
  paymentMethod: null,
  coupon: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<CartItem>) {
      const newItem = action.payload;
      const existingItem = state.items.find((item) => item.id === newItem.id);

      if (!existingItem) {
        state.items.push(newItem);
      } else {
        existingItem.quantity += newItem.quantity;
      }

      state.totalQuantity += newItem.quantity;
      state.totalAmount += newItem.price * newItem.quantity;

      // Recalculate discount if coupon exists
      if (state.coupon) {
        let discount =
          (state.totalAmount * state.coupon.discountPercentage) / 100;
        if (state.coupon.maxDiscountAmount) {
          discount = Math.min(discount, state.coupon.maxDiscountAmount);
        }
        state.coupon.discount = parseFloat(discount.toFixed(2));
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      const id = action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        state.totalQuantity -= existingItem.quantity;
        state.totalAmount -= existingItem.price * existingItem.quantity;
        state.items = state.items.filter((item) => item.id !== id);

        // Recalculate discount if coupon exists
        if (state.coupon) {
          let discount =
            (state.totalAmount * state.coupon.discountPercentage) / 100;
          if (state.coupon.maxDiscountAmount) {
            discount = Math.min(discount, state.coupon.maxDiscountAmount);
          }
          state.coupon.discount = parseFloat(discount.toFixed(2));
        }
      }
    },
    updateQuantity(
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        state.totalQuantity =
          state.totalQuantity - existingItem.quantity + quantity;
        state.totalAmount =
          state.totalAmount -
          existingItem.price * existingItem.quantity +
          existingItem.price * quantity;
        existingItem.quantity = quantity;

        // Recalculate discount if coupon exists
        if (state.coupon) {
          let discount =
            (state.totalAmount * state.coupon.discountPercentage) / 100;
          if (state.coupon.maxDiscountAmount) {
            discount = Math.min(discount, state.coupon.maxDiscountAmount);
          }
          state.coupon.discount = parseFloat(discount.toFixed(2));
        }
      }
    },
    setPaymentMethod(state, action: PayloadAction<"ONLINE" | "COD">) {
      state.paymentMethod = action.payload;
      // Update COD charges
      if (action.payload === "COD") {
        state.codCharges = 50; // Example fixed COD charge
      } else {
        state.codCharges = 0;
      }
    },
    applyCoupon(
      state,
      action: PayloadAction<{
        id: string;
        code: string;
        discountPercentage: number;
        maxDiscountAmount: number | null;
      }>
    ) {
      const { id, code, discountPercentage, maxDiscountAmount } =
        action.payload;
      let discount = (state.totalAmount * discountPercentage) / 100;

      if (maxDiscountAmount) {
        discount = Math.min(discount, maxDiscountAmount);
      }

      state.coupon = {
        id,
        code,
        discountPercentage,
        maxDiscountAmount,
        discount: parseFloat(discount.toFixed(2)),
      };
    },
    removeCoupon(state) {
      state.coupon = null;
    },
    clearCart(state) {
      state.items = [];
      state.totalAmount = 0;
      state.totalQuantity = 0;
      state.codCharges = 0;
      state.paymentMethod = null;
      state.coupon = null;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  setPaymentMethod,
  applyCoupon,
  removeCoupon,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
