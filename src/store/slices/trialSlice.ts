import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { 
  CheckTrialResponse, 
  ConvertTrialRequest, 
  GetActiveTrialsResponse, 
  StartTrialRequest, 
  StartTrialResponse, 
  TrialSummary, 
  TrialWithDetails 
} from '../../interfaces/trial.interface';
import api from '../../api/api';

// ─── State Type ─────────────────────────────────────────────────────────────
interface TrialState {
  activeTrials: TrialWithDetails[];
  currentTrial: TrialWithDetails | null;
  hasActiveTrial: boolean;
  summary: TrialSummary | null;
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: TrialState = {
  activeTrials: [],
  currentTrial: null,
  hasActiveTrial: false,
  summary: null,
  loading: false,
  error: null,
  message: null,
};

// ─── Helper to extract error message ────────────────────────────────────────
const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// ─── Async Thunks ───────────────────────────────────────────────────────────

// Start a free trial for a kid
export const startFreeTrial = createAsyncThunk(
  'trials/startFreeTrial',
  async (data: StartTrialRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<StartTrialResponse>('/trials/start', data);
      return response.data.data.trial;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Check trial status for a specific kid and course
export const checkTrialStatus = createAsyncThunk(
  'trials/checkTrialStatus',
  async ({ kid_id, course_id }: { kid_id: string; course_id: string }, { rejectWithValue }) => {
    try {
      const response = await api.get<CheckTrialResponse>(`/trials/check/${kid_id}/${course_id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Get all active trials for the parent
export const getActiveTrials = createAsyncThunk(
  'trials/getActiveTrials',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<GetActiveTrialsResponse>('/trials/active');
      return response.data.data.trials;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Convert trial to paid enrollment
export const convertTrialToEnrollment = createAsyncThunk(
  'trials/convertTrialToEnrollment',
  async (data: ConvertTrialRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<{ status: string; message: string }>(
        `/trials/convert/${data.trial_id}`,
        { enrollment_id: data.enrollment_id }
      );
      return { message: response.data.message, trial_id: data.trial_id };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Get trial summary for dashboard
export const getTrialSummary = createAsyncThunk(
  'trials/getTrialSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{ status: string; data: { summary: TrialSummary } }>('/trials/summary');
      return response.data.data.summary;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────
const trialSlice = createSlice({
  name: 'trials',
  initialState,
  reducers: {
    clearTrialError: (state) => {
      state.error = null;
    },
    clearTrialMessage: (state) => {
      state.message = null;
    },
    resetTrialState: (state) => {
      state.activeTrials = [];
      state.currentTrial = null;
      state.hasActiveTrial = false;
      state.summary = null;
      state.loading = false;
      state.error = null;
      state.message = null;
    },
    setCurrentTrial: (state, action: PayloadAction<TrialWithDetails | null>) => {
      state.currentTrial = action.payload;
    },
  },
  extraReducers: (builder) => {
    // startFreeTrial
    builder.addCase(startFreeTrial.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(startFreeTrial.fulfilled, (state, action) => {
      state.loading = false;
      state.currentTrial = action.payload;
      state.hasActiveTrial = true;
      state.message = 'Free trial started successfully!';
    });
    builder.addCase(startFreeTrial.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // checkTrialStatus
    builder.addCase(checkTrialStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(checkTrialStatus.fulfilled, (state, action) => {
      state.loading = false;
      state.hasActiveTrial = action.payload.hasActiveTrial;
      state.currentTrial = action.payload.trial || null;
    });
    builder.addCase(checkTrialStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // getActiveTrials
    builder.addCase(getActiveTrials.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getActiveTrials.fulfilled, (state, action) => {
      state.loading = false;
      state.activeTrials = action.payload;
    });
    builder.addCase(getActiveTrials.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // convertTrialToEnrollment
    builder.addCase(convertTrialToEnrollment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(convertTrialToEnrollment.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
      // Remove the converted trial from active trials
      state.activeTrials = state.activeTrials.filter(
        (trial) => trial.id !== action.payload.trial_id
      );
      if (state.currentTrial?.id === action.payload.trial_id) {
        state.currentTrial = null;
        state.hasActiveTrial = false;
      }
    });
    builder.addCase(convertTrialToEnrollment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // getTrialSummary
    builder.addCase(getTrialSummary.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getTrialSummary.fulfilled, (state, action) => {
      state.loading = false;
      state.summary = action.payload;
    });
    builder.addCase(getTrialSummary.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

// ─── Exports ─────────────────────────────────────────────────────────────────
export const { 
  clearTrialError, 
  clearTrialMessage, 
  resetTrialState,
  setCurrentTrial 
} = trialSlice.actions;

export default trialSlice.reducer;