import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import type {
  KidState,
  Kid,
  RegisterKidPayload,
  KidResponse,
  KidsListResponse,
} from "../../interfaces/kid.interface";
import api from "../../api/api";

const initialState: KidState = {
  kids: [],
  currentKid: null,
  loading: false,
  error: null,
  message: null,
};

// ============ ASYNC THUNKS ============

// POST /kids/register — parent only
export const registerKid = createAsyncThunk<Kid, RegisterKidPayload>(
  "kid/registerKid",
  async (data, thunkAPI) => {
    try {
      const res = await api.post<KidResponse>("/kids/register", data);
      return res.data.data.kid;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to register kid",
      );
    }
  },
);

// GET /kids/my-kids — parent only
export const getMyKids = createAsyncThunk<Kid[], void>(
  "kid/getMyKids",
  async (_, thunkAPI) => {
    try {
      const res = await api.get<KidsListResponse>("/kids/my-kids");
      return res.data.data.kids;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch kids",
      );
    }
  },
);

// ============ SLICE ============

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
      // ── Register Kid ────────────────────────────────────────────────────────
      .addCase(registerKid.fulfilled, (state, action: PayloadAction<Kid>) => {
        state.loading = false;
        state.error = null;
        state.currentKid = action.payload;
        // Prepend to list — matches ORDER BY created_at DESC on fetch
        state.kids.unshift(action.payload);
        state.message = "Kid registered successfully";
      })

      // ── Get My Kids ─────────────────────────────────────────────────────────
      .addCase(getMyKids.fulfilled, (state, action: PayloadAction<Kid[]>) => {
        state.loading = false;
        state.error = null;
        state.kids = action.payload;
      })

      // ── Global Pending ──────────────────────────────────────────────────────
      .addMatcher(
        (action) =>
          action.type.startsWith("kid/") &&
          action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
          state.message = null;
        },
      )

      // ── Global Rejected ─────────────────────────────────────────────────────
      .addMatcher(
        (action) =>
          action.type.startsWith("kid/") &&
          action.type.endsWith("/rejected"),
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        },
      );
  },
});

export const { resetKidState, clearCurrentKid } = kidSlice.actions;
export default kidSlice.reducer;