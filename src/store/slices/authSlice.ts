import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import type { AuthResponse, AuthState } from "../../interfaces/auth.interface";
import api, { setAccessToken } from "../../api/api";

const initialState: AuthState = {
  user: null,
  users: [],
  isAuthenticated: false,
  // We keep this true ONLY if you are immediately calling refreshSession on app load
  loading: false, 
  error: null,
  message: null,
};

// ============ ASYNC THUNKS ============

/**
 * EMAIL VERIFICATION
 * Matches: router.get('/verify-email', authController.verifyEmail)
 */
export const verifyEmail = createAsyncThunk<{ message: string }, string>(
  "auth/verifyEmail",
  async (token, thunkAPI) => {
    try {
      // Typically verification tokens are passed as query params in GET requests
      const res = await api.get<{ message: string }>(`/auth/verify-email?token=${token}`);
      return res.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Verification failed");
    }
  }
);

export const register = createAsyncThunk<AuthResponse, object>(
  "auth/register",
  async (data, thunkAPI) => {
    try {
      const res = await api.post<AuthResponse>("/auth/register", data);
      return res.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Registration failed");
    }
  }
);

export const login = createAsyncThunk<AuthResponse, object>(
  "auth/login",
  async (data, thunkAPI) => {
    try {
      const res = await api.post<AuthResponse>("/auth/login", data);
      return res.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const refreshSession = createAsyncThunk<AuthResponse, void>(
  "auth/refresh",
  async (_, thunkAPI) => {
    try {
      const res = await api.get<AuthResponse>("/auth/refresh");
      return res.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Session expired");
    }
  }
);

export const forgotPassword = createAsyncThunk<{ message: string }, { email: string }>(
  "auth/forgotPassword",
  async (data, thunkAPI) => {
    try {
      const res = await api.post<{ message: string }>("/auth/forgot-password", data);
      return res.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Request failed");
    }
  }
);

export const resetPassword = createAsyncThunk<{ message: string }, object>(
  "auth/resetPassword",
  async (data, thunkAPI) => {
    try {
      const res = await api.patch<{ message: string }>("/auth/reset-password", data);
      return res.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Reset failed");
    }
  }
);

export const updatePassword = createAsyncThunk<{ message: string }, object>(
  "auth/updatePassword",
  async (data, thunkAPI) => {
    try {
      const res = await api.patch<{ message: string }>("/auth/update-password", data);
      return res.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Update failed");
    }
  }
);

export const logout = createAsyncThunk<{ message: string }, void>(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      const res = await api.post<{ message: string }>("/auth/logout");
      return res.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

// ============ SLICE ============

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Login ──────────────────────────────────────────────────────────────
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.error = null;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        state.message = action.payload.message ?? null;
        setAccessToken(action.payload.accessToken);
      })

      // ── Refresh Session ────────────────────────────────────────────────────
      .addCase(refreshSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshSession.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.error = null;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        setAccessToken(action.payload.accessToken);
      })
      .addCase(refreshSession.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
        setAccessToken(null);
      })

      // ── Logout ─────────────────────────────────────────────────────────────
      .addCase(logout.fulfilled, () => {
        setAccessToken(null);
        return { ...initialState, loading: false };
      })

      // ── Success Matcher for Message-only Actions ───────────────────────────
      .addMatcher(
        (action) =>
          [
            register.fulfilled.type,
            verifyEmail.fulfilled.type,
            forgotPassword.fulfilled.type,
            resetPassword.fulfilled.type,
            updatePassword.fulfilled.type,
          ].includes(action.type),
        (state, action: PayloadAction<{ message: string }>) => {
          state.loading = false;
          state.message = action.payload.message;
          state.error = null;
        }
      )

      // ── Global Pending Matcher ─────────────────────────────────────────────
      .addMatcher(
        (action) =>
          action.type.startsWith("auth/") &&
          action.type.endsWith("/pending") &&
          !action.type.includes("refresh"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      // ── Global Rejected Matcher ────────────────────────────────────────────
      .addMatcher(
        (action) =>
          action.type.startsWith("auth/") &&
          action.type.endsWith("/rejected") &&
          !action.type.includes("refresh"),
        (state, action: PayloadAction<string | null>) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;