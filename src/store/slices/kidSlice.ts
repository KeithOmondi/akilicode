import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import type {
  KidState,
  IKid,
  RegisterKidPayload,
  KidResponse,
  KidsListResponse,
  SetKidLoginPayload,
  UpdateKidLoginPayload,
  KidLoginPayload,
} from "../../interfaces/kid.interface";
import api from "../../api/api";

const initialState: KidState = {
  kids: [],
  currentKid: null,
  loading: false,
  error: null,
  message: null,
};

// ─── ASYNC THUNKS ─────────────────────────────────────────────────────────────

// POST /kids/register — parent only
export const registerKid = createAsyncThunk<IKid, RegisterKidPayload>(
  "kid/registerKid",
  async (data, thunkAPI) => {
    try {
      const res = await api.post<KidResponse>("/kids/register", data);
      return res.data.data.kid;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to register kid"
      );
    }
  }
);

// GET /kids/my-kids — parent only
export const getMyKids = createAsyncThunk<IKid[], void>(
  "kid/getMyKids",
  async (_, thunkAPI) => {
    try {
      const res = await api.get<KidsListResponse>("/kids/my-kids");
      return res.data.data.kids;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch kids"
      );
    }
  }
);

// GET /kids/:kidId — parent only
export const getKidById = createAsyncThunk<IKid, string>(
  "kid/getKidById",
  async (kidId, thunkAPI) => {
    try {
      const res = await api.get<KidResponse>(`/kids/${kidId}`);
      return res.data.data.kid;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch kid"
      );
    }
  }
);

// PATCH /kids/:kidId — update name, age, grade, avatar
export const updateKid = createAsyncThunk<
  IKid,
  { kidId: string; data: Partial<RegisterKidPayload> }
>(
  "kid/updateKid",
  async ({ kidId, data }, thunkAPI) => {
    try {
      const res = await api.patch<KidResponse>(`/kids/${kidId}`, data);
      return res.data.data.kid;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update kid"
      );
    }
  }
);

// POST /kids/:kidId/set-login — parent sets username + PIN for the first time
export const setKidLogin = createAsyncThunk<
  IKid,
  { kidId: string; data: SetKidLoginPayload }
>(
  "kid/setKidLogin",
  async ({ kidId, data }, thunkAPI) => {
    try {
      const res = await api.post<KidResponse>(`/kids/${kidId}/set-login`, data);
      return res.data.data.kid;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to set kid login"
      );
    }
  }
);

// PATCH /kids/:kidId/update-login — parent changes username or PIN
export const updateKidLogin = createAsyncThunk<
  IKid,
  { kidId: string; data: UpdateKidLoginPayload }
>(
  "kid/updateKidLogin",
  async ({ kidId, data }, thunkAPI) => {
    try {
      const res = await api.patch<KidResponse>(
        `/kids/${kidId}/update-login`,
        data
      );
      return res.data.data.kid;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update kid login"
      );
    }
  }
);

// POST /kids/login — kid logs in with username + PIN
export const kidLogin = createAsyncThunk<IKid, KidLoginPayload>(
  "kid/kidLogin",
  async (data, thunkAPI) => {
    try {
      const res = await api.post<KidResponse>("/kids/login", data);
      return res.data.data.kid;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Incorrect username or PIN"
      );
    }
  }
);

// ─── SLICE ────────────────────────────────────────────────────────────────────

const kidSlice = createSlice({
  name: "kid",
  initialState,
  reducers: {
    resetKidState: (state) => {
      state.error = null;
      state.message = null;
    },
    clearCurrentKid: (state) => {
      state.currentKid = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Register Kid ──────────────────────────────────────────────────────
      .addCase(registerKid.fulfilled, (state, action: PayloadAction<IKid>) => {
        state.loading = false;
        state.kids.unshift(action.payload);
        state.message = "Kid registered successfully";
      })

      // ── Get My Kids ───────────────────────────────────────────────────────
      .addCase(getMyKids.fulfilled, (state, action: PayloadAction<IKid[]>) => {
        state.loading = false;
        state.kids = action.payload;
      })

      // ── Get Kid By ID ─────────────────────────────────────────────────────
      .addCase(getKidById.fulfilled, (state, action: PayloadAction<IKid>) => {
        state.loading = false;
        state.currentKid = action.payload;
      })

      // ── Update Kid ────────────────────────────────────────────────────────
      .addCase(updateKid.fulfilled, (state, action: PayloadAction<IKid>) => {
        state.loading = false;
        const idx = state.kids.findIndex((k) => k.id === action.payload.id);
        if (idx !== -1) state.kids[idx] = action.payload;
        if (state.currentKid?.id === action.payload.id) {
          state.currentKid = action.payload;
        }
        state.message = "Kid updated successfully";
      })

      // ── Set Kid Login ─────────────────────────────────────────────────────
      .addCase(setKidLogin.fulfilled, (state, action: PayloadAction<IKid>) => {
        state.loading = false;
        const idx = state.kids.findIndex((k) => k.id === action.payload.id);
        if (idx !== -1) state.kids[idx] = { ...state.kids[idx], ...action.payload };
        state.message = "Login credentials set successfully";
      })

      // ── Update Kid Login ──────────────────────────────────────────────────
      .addCase(updateKidLogin.fulfilled, (state, action: PayloadAction<IKid>) => {
        state.loading = false;
        const idx = state.kids.findIndex((k) => k.id === action.payload.id);
        if (idx !== -1) state.kids[idx] = { ...state.kids[idx], ...action.payload };
        state.message = "Login credentials updated";
      })

      // ── Kid Login ─────────────────────────────────────────────────────────
      .addCase(kidLogin.fulfilled, (state, action: PayloadAction<IKid>) => {
        state.loading = false;
        state.currentKid = action.payload;
        state.message = `Welcome back, ${action.payload.name}!`;
      })

      // ── Global Pending ────────────────────────────────────────────────────
      .addMatcher(
        (action) =>
          action.type.startsWith("kid/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
          state.message = null;
        }
      )

      // ── Global Rejected ───────────────────────────────────────────────────
      .addMatcher(
        (action) =>
          action.type.startsWith("kid/") && action.type.endsWith("/rejected"),
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { resetKidState, clearCurrentKid } = kidSlice.actions;
export default kidSlice.reducer;