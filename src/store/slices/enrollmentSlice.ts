import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import type {
  EnrollmentState,
  Enrollment,
  EnrollKidPayload,
  EnrollmentResponse,
  EnrollmentsListResponse,
} from "../../interfaces/enrollment.interface";
import api from "../../api/api";

const initialState: EnrollmentState = {
  enrollments: [],
  currentEnrollment: null,
  loading: false,
  error: null,
  message: null,
};

// ============ ASYNC THUNKS ============

// GET /enrollments/all — admin only: fetch every enrollment in the system
export const getAllEnrollments = createAsyncThunk<Enrollment[], void>(
  "enrollment/getAllEnrollments",
  async (_, thunkAPI) => {
    try {
      // Matches the /all route we defined in the controller
      const res = await api.get<EnrollmentsListResponse>("/enrollments/all");
      return res.data.data.enrollments;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch all enrollments"
      );
    }
  }
);

// POST /enrollments — parent only
export const enrollKid = createAsyncThunk<Enrollment, EnrollKidPayload>(
  "enrollment/enrollKid",
  async (data, thunkAPI) => {
    try {
      const res = await api.post<EnrollmentResponse>("/enrollments/create", data);
      return res.data.data.enrollment;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Enrollment failed"
      );
    }
  }
);

// GET /enrollments — parent: fetch all enrollments for their kids
export const getMyEnrollments = createAsyncThunk<Enrollment[], void>(
  "enrollment/getMyEnrollments",
  async (_, thunkAPI) => {
    try {
      const res = await api.get<EnrollmentsListResponse>("/enrollments/get");
      return res.data.data.enrollments;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch enrollments"
      );
    }
  }
);

// GET /enrollments/kid/:kidId — admin: fetch enrollments for a specific kid
export const getKidEnrollments = createAsyncThunk<Enrollment[], string>(
  "enrollment/getKidEnrollments",
  async (kidId, thunkAPI) => {
    try {
      const res = await api.get<EnrollmentsListResponse>(
        `/enrollments/kid/${kidId}`
      );
      return res.data.data.enrollments;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch kid enrollments"
      );
    }
  }
);

// PATCH /enrollments/:enrollmentId/cancel — admin/parent
export const cancelEnrollment = createAsyncThunk<Enrollment, string>(
  "enrollment/cancelEnrollment",
  async (enrollmentId, thunkAPI) => {
    try {
      const res = await api.patch<EnrollmentResponse>(
        `/enrollments/${enrollmentId}/cancel`
      );
      return res.data.data.enrollment;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to cancel enrollment"
      );
    }
  }
);

// GET /enrollments/:enrollmentId — fetch a single enrollment by id
export const getEnrollmentById = createAsyncThunk<Enrollment, string>(
  "enrollment/getEnrollmentById",
  async (enrollmentId, thunkAPI) => {
    try {
      const res = await api.get<EnrollmentResponse>(`/enrollments/${enrollmentId}`);
      return res.data.data.enrollment;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch enrollment"
      );
    }
  }
);



export const getMyEnrolledCourses = createAsyncThunk<Enrollment[], void>(
  "enrollment/getMyEnrolledCourses",
  async (_, thunkAPI) => {
    try {
      const res = await api.get<EnrollmentsListResponse>("/enrollments/my-courses");
      
      // Use ?? [] to ensure we always return an array, 
      // satisfying the Enrollment[] return type.
      return res.data.data.courses ?? []; 
      
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch your courses"
      );
    }
  }
);

// ============ SLICE ============

const enrollmentSlice = createSlice({
  name: "enrollment",
  initialState,
  reducers: {
    resetEnrollmentState: (state) => {
      state.error = null;
      state.message = null;
    },
    clearCurrentEnrollment: (state) => {
      state.currentEnrollment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Get Enrolled Courses (Kid View) ─────────────────────────────────────
      .addCase(
        getMyEnrolledCourses.fulfilled,
        (state, action: PayloadAction<Enrollment[]>) => {
          state.loading = false;
          state.error = null;
          state.enrollments = action.payload;
        }
      )

      // ── Get All Enrollments (admin) ─────────────────────────────────────────
      .addCase(
        getAllEnrollments.fulfilled,
        (state, action: PayloadAction<Enrollment[]>) => {
          state.loading = false;
          state.error = null;
          state.enrollments = action.payload;
        }
      )

      // ── Enroll Kid ──────────────────────────────────────────────────────────
      .addCase(enrollKid.fulfilled, (state, action: PayloadAction<Enrollment>) => {
        state.loading = false;
        state.error = null;
        state.currentEnrollment = action.payload;
        state.enrollments.unshift(action.payload);
        state.message = "Enrollment created! Please complete payment to activate.";
      })

      // ── Get Enrollment By Id ────────────────────────────────────────────────────
      .addCase(getEnrollmentById.fulfilled, (state, action: PayloadAction<Enrollment>) => {
        state.loading = false;
        state.currentEnrollment = action.payload; // Set this as current for detail views
        state.enrollments = state.enrollments.map((e) =>
          e.id === action.payload.id ? action.payload : e
        );
      })

      // ── Get My Enrollments (Parent) ─────────────────────────────────────────
      .addCase(
        getMyEnrollments.fulfilled,
        (state, action: PayloadAction<Enrollment[]>) => {
          state.loading = false;
          state.error = null;
          state.enrollments = action.payload;
        }
      )

      // ── Get Kid Enrollments (admin) ─────────────────────────────────────────
      .addCase(
        getKidEnrollments.fulfilled,
        (state, action: PayloadAction<Enrollment[]>) => {
          state.loading = false;
          state.error = null;
          state.enrollments = action.payload;
        }
      )

      // ── Cancel Enrollment ───────────────────────────────────────────────────
      .addCase(
        cancelEnrollment.fulfilled,
        (state, action: PayloadAction<Enrollment>) => {
          state.loading = false;
          state.error = null;
          state.currentEnrollment = action.payload;
          state.enrollments = state.enrollments.map((e) =>
            e.id === action.payload.id ? action.payload : e
          );
          state.message = "Enrollment cancelled";
        }
      )

      // ── Global Pending ──────────────────────────────────────────────────────
      .addMatcher(
        (action) => action.type.startsWith("enrollment/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
          state.message = null;
        }
      )

      // ── Global Rejected ─────────────────────────────────────────────────────
      .addMatcher(
        (action) => action.type.startsWith("enrollment/") && action.type.endsWith("/rejected"),
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { resetEnrollmentState, clearCurrentEnrollment } =
  enrollmentSlice.actions;
export default enrollmentSlice.reducer;