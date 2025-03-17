// import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// import axios from "axios";

// interface Settings {
//   id: string;
//   razorpayKeyId: string;
//   razorpayKeySecret: string;
//   smtpHost: string;
//   smtpPort: number;
//   smtpUser: string;
//   smtpPass: string;
//   maintenanceMode: boolean;
// }

// interface SettingsState {
//   data: Settings | null;
//   status: 'idle' | 'loading' | 'succeeded' | 'failed';
//   error: string | null;
// }

// const initialState: SettingsState = {
//   data: null,
//   status: 'idle',
//   error: null
// };

// export const fetchSettings = createAsyncThunk(
//   'adminSettings/fetchSettings',
//   async () => {
//     const response = await axios.get('/api/admin/settings');
//     return response.data;
//   }
// );

// export const updateSettings = createAsyncThunk(
//   'adminSettings/updateSettings',
//   async (settingsData: Settings) => {
//     const response = await axios.put('/api/admin/settings', settingsData);
//     return response.data;
//   }
// );

// export const updatePaymentSettings = createAsyncThunk(
//   'adminSettings/updatePaymentSettings',
//   async (data: { razorpayKeyId: string, razorpayKeySecret: string }) => {
//     const response = await axios.put('/api/admin/settings/payment', data);
//     return response.data;
//   }
// );

// export const updateEmailSettings = createAsyncThunk(
//   'adminSettings/updateEmailSettings',
//   async (data: { smtpHost: string, smtpPort: number, smtpUser: string, smtpPass: string }) => {
//     const response = await axios.put('/api/admin/settings/email', data);
//     return response.data;
//   }
// );

// export const testEmailSettings = createAsyncThunk(
//   'adminSettings/testEmailSettings',
//   async (data: { smtpHost: string, smtpPort: number, smtpUser: string, smtpPass: string }) => {
//     const response = await axios.post('/api/admin/settings/email/test', data);
//     return response.data;
//   }
// );

// export const updateMaintenanceMode = createAsyncThunk(
//   'adminSettings/updateMaintenanceMode',
//   async (maintenanceMode: boolean) => {
//     const response = await axios.put('/api/admin/settings/maintenance', { maintenanceMode });
//     return response.data;
//   }
// );

// const settingsSlice = createSlice({
//   name: 'adminSettings',
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchSettings.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(fetchSettings.fulfilled, (state, action: PayloadAction<Settings>) => {
//         state.status = 'succeeded';
//         state.data = action.payload;
//       })
//       .addCase(fetchSettings.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.error.message || 'Failed to fetch settings';
//       })
//       .addCase(updateSettings.fulfilled, (state, action: PayloadAction<Settings>) => {
//         state.data = action.payload;
//       })
//       .addCase(updatePaymentSettings.fulfilled, (state, action) => {
//         if (state.data) {
//           state.data.razorpayKeyId = action.payload.data.razorpayKeyId;
//         }
//       })
//       .addCase(updateEmailSettings.fulfilled, (state, action) => {
//         if (state.data) {
//           state.data.smtpHost = action.payload.data.smtpHost;
//           state.data.smtpPort = action.payload.data.smtpPort;
//           state.data.smtpUser = action.payload.data.smtpUser;
//         }
//       })
//       .addCase(updateMaintenanceMode.fulfilled, (state, action) => {
//         if (state.data) {
//           state.data.maintenanceMode = action.payload.data.maintenanceMode;
//         }
//       });
//   }
// });

// export default settingsSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface Settings {
  id: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  maintenanceMode: boolean;
  enableShiprocket: boolean;
  enableCOD: boolean;
  enableReturns: boolean;
  returnPeriod: number; // in days
  shiprocketEmail: string;
  shiprocketPassword: string;
  codCharges: number;
}

interface SettingsState {
  data: Settings | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: SettingsState = {
  data: null,
  status: "idle",
  error: null,
};

export const fetchSettings = createAsyncThunk(
  "adminSettings/fetchSettings",
  async () => {
    const response = await axios.get("/api/admin/settings");
    return response.data;
  }
);

export const updateSettings = createAsyncThunk(
  "adminSettings/updateSettings",
  async (settingsData: Settings) => {
    const response = await axios.put("/api/admin/settings", settingsData);
    return response.data;
  }
);

export const updatePaymentSettings = createAsyncThunk(
  "adminSettings/updatePaymentSettings",
  async (data: {
    razorpayKeyId: string;
    razorpayKeySecret: string;
    enableCOD: boolean;
    codCharges: number;
  }) => {
    const response = await axios.put("/api/admin/settings/payment", data);
    return response.data;
  }
);

export const updateEmailSettings = createAsyncThunk(
  "adminSettings/updateEmailSettings",
  async (data: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
  }) => {
    const response = await axios.put("/api/admin/settings/email", data);
    return response.data;
  }
);

export const testEmailSettings = createAsyncThunk(
  "adminSettings/testEmailSettings",
  async (data: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
  }) => {
    const response = await axios.post("/api/admin/settings/email/test", data);
    return response.data;
  }
);

export const updateMaintenanceMode = createAsyncThunk(
  "adminSettings/updateMaintenanceMode",
  async (maintenanceMode: boolean) => {
    const response = await axios.put("/api/admin/settings/maintenance", {
      maintenanceMode,
    });
    return response.data;
  }
);

export const updateShiprocketSettings = createAsyncThunk(
  "adminSettings/updateShiprocketSettings",
  async (data: {
    enableShiprocket: boolean;
    shiprocketEmail: string;
    shiprocketPassword: string;
  }) => {
    const response = await axios.put("/api/admin/settings/shiprocket", data);
    return response.data;
  }
);

export const updateReturnSettings = createAsyncThunk(
  "adminSettings/updateReturnSettings",
  async (data: { enableReturns: boolean; returnPeriod: number }) => {
    const response = await axios.put("/api/admin/settings/returns", data);
    return response.data;
  }
);

const settingsSlice = createSlice({
  name: "adminSettings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchSettings.fulfilled,
        (state, action: PayloadAction<Settings>) => {
          state.status = "succeeded";
          state.data = action.payload;
        }
      )
      .addCase(fetchSettings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch settings";
      })
      .addCase(
        updateSettings.fulfilled,
        (state, action: PayloadAction<Settings>) => {
          state.data = action.payload;
        }
      )
      .addCase(updatePaymentSettings.fulfilled, (state, action) => {
        if (state.data) {
          state.data = {
            ...state.data,
            razorpayKeyId: action.payload.data.razorpayKeyId,
            enableCOD: action.payload.data.enableCOD,
            codCharges: action.payload.data.codCharges,
          };
        }
      })
      .addCase(updateEmailSettings.fulfilled, (state, action) => {
        if (state.data) {
          state.data = {
            ...state.data,
            smtpHost: action.payload.data.smtpHost,
            smtpPort: action.payload.data.smtpPort,
            smtpUser: action.payload.data.smtpUser,
          };
        }
      })
      .addCase(updateMaintenanceMode.fulfilled, (state, action) => {
        if (state.data) {
          state.data.maintenanceMode = action.payload.data.maintenanceMode;
        }
      })
      .addCase(updateShiprocketSettings.fulfilled, (state, action) => {
        if (state.data) {
          state.data = {
            ...state.data,
            enableShiprocket: action.payload.data.enableShiprocket,
            shiprocketEmail: action.payload.data.shiprocketEmail,
          };
        }
      })
      .addCase(updateReturnSettings.fulfilled, (state, action) => {
        if (state.data) {
          state.data = {
            ...state.data,
            enableReturns: action.payload.data.enableReturns,
            returnPeriod: action.payload.data.returnPeriod,
          };
        }
      });
  },
});

export default settingsSlice.reducer;
