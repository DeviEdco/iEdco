// import { configureStore } from "@reduxjs/toolkit";
// import cartReducer from "./features/cartSlice";
// import categoriesReducer from "./features/admin/categoriesSlice";
// import productsReducer from "./features/admin/productsSlice";
// import discountsReducer from "./features/admin/discountsSlice";
// import schemesReducer from "./features/admin/schemesSlice";
// import ordersReducer from "./features/admin/ordersSlice";
// import reviewsReducer from "./features/admin/reviewsSlice";
// import customersReducer from "./features/admin/customersSlice";
// import settingsReducer from "./features/admin/settingsSlice";
// import dashboardReducer from "./features/admin/dashboardSlice";

// export const store = configureStore({
//   reducer: {
//     cart: cartReducer,
//     adminCategories: categoriesReducer,
//     adminProducts: productsReducer,
//     adminDiscounts: discountsReducer,
//     adminSchemes: schemesReducer,
//     adminOrders: ordersReducer,
//     adminReviews: reviewsReducer,
//     adminCustomers: customersReducer,
//     adminSettings: settingsReducer,
//     adminDashboard: dashboardReducer,
//   },
//   devTools: process.env.NODE_ENV !== "production",
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./features/cartSlice";
import categoriesReducer from "./features/admin/categoriesSlice";
import productsReducer from "./features/admin/productsSlice";
import discountsReducer from "./features/admin/discountsSlice";
import schemesReducer from "./features/admin/schemesSlice";
import ordersReducer from "./features/admin/ordersSlice";
import reviewsReducer from "./features/admin/reviewsSlice";
import customersReducer from "./features/admin/customersSlice";
import settingsReducer from "./features/admin/settingsSlice";
import dashboardReducer from "./features/admin/dashboardSlice";
import couponsReducer from "./features/admin/couponsSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    adminCategories: categoriesReducer,
    adminProducts: productsReducer,
    adminDiscounts: discountsReducer,
    adminSchemes: schemesReducer,
    adminOrders: ordersReducer,
    adminReviews: reviewsReducer,
    adminCustomers: customersReducer,
    adminSettings: settingsReducer,
    adminDashboard: dashboardReducer,
    adminCoupons: couponsReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
