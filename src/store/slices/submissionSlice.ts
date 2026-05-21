// src/store/slices/submissionSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/api';
import type { ReviewSubmissionPayload, Submission, SubmissionResponse, SubmissionsListResponse, SubmissionState, SubmitAssignmentPayload } from '../../interfaces/submission.interface';


const initialState: SubmissionState = {
  submissions: [],
  currentSubmission: null,
  loading: false,
  submitting: false,
  error: null,
  message: null,
};

// Helper error extractor
const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) return axiosError.response.data.message;
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
};

// ─── Kid submits assignment ─────────────────────────────────────────────────
export const submitAssignment = createAsyncThunk(
  'submissions/submit',
  async (payload: SubmitAssignmentPayload, { rejectWithValue }) => {
    try {
      const response = await api.post<SubmissionResponse>('/submissions', payload);
      return response.data.data.submission;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ─── Kid gets all submissions for an enrollment ────────────────────────────
export const getMySubmissions = createAsyncThunk(
  'submissions/getMySubmissions',
  async (enrollmentId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<SubmissionsListResponse>(`/submissions/enrollment/${enrollmentId}`);
      return response.data.data.submissions;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ─── Kid gets submission for a specific lesson ─────────────────────────────
export const getSubmissionByLesson = createAsyncThunk(
  'submissions/getByLesson',
  async (lessonId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<SubmissionResponse>(`/submissions/lesson/${lessonId}`);
      return response.data.data.submission;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ─── Admin gets all submissions (filterable) ───────────────────────────────
export const getAllSubmissions = createAsyncThunk(
  'submissions/getAll',
  async (filters: { status?: string; lesson_id?: string; course_id?: string } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.lesson_id) params.append('lesson_id', filters.lesson_id);
      if (filters.course_id) params.append('course_id', filters.course_id);
      const response = await api.get<SubmissionsListResponse>(`/submissions?${params.toString()}`);
      return response.data.data.submissions;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ─── Admin gets submissions for a specific lesson ──────────────────────────
export const getSubmissionsByLesson = createAsyncThunk(
  'submissions/getByLessonAdmin',
  async (lessonId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<SubmissionsListResponse>(`/submissions/lesson/${lessonId}/all`);
      return response.data.data.submissions;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ─── Admin reviews a submission ────────────────────────────────────────────
export const reviewSubmission = createAsyncThunk(
  'submissions/review',
  async ({ submissionId, marks, feedback }: ReviewSubmissionPayload, { rejectWithValue }) => {
    try {
      const response = await api.patch<SubmissionResponse>(`/submissions/${submissionId}/review`, {
        marks,
        feedback,
      });
      return response.data.data.submission;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const submissionSlice = createSlice({
  name: 'submissions',
  initialState,
  reducers: {
    clearSubmissionError: (state) => {
      state.error = null;
    },
    clearSubmissionMessage: (state) => {
      state.message = null;
    },
    resetSubmissionState: () => initialState,
    setCurrentSubmission: (state, action: PayloadAction<Submission | null>) => {
      state.currentSubmission = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // submitAssignment
      .addCase(submitAssignment.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitAssignment.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentSubmission = action.payload;
        state.message = 'Assignment submitted successfully!';
      })
      .addCase(submitAssignment.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })

      // getMySubmissions
      .addCase(getMySubmissions.fulfilled, (state, action) => {
        state.submissions = action.payload;
      })
      .addCase(getSubmissionByLesson.fulfilled, (state, action) => {
        state.currentSubmission = action.payload;
      })
      .addCase(getAllSubmissions.fulfilled, (state, action) => {
        state.submissions = action.payload;
      })
      .addCase(getSubmissionsByLesson.fulfilled, (state, action) => {
        state.submissions = action.payload;
      })

      // reviewSubmission
      .addCase(reviewSubmission.fulfilled, (state, action) => {
        state.loading = false;
        // update in submissions list
        const index = state.submissions.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.submissions[index] = action.payload;
        if (state.currentSubmission?.id === action.payload.id) state.currentSubmission = action.payload;
        state.message = 'Submission reviewed successfully';
      })

      // generic pending / rejected handlers
      .addMatcher(
        (action) => action.type.startsWith('submissions/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('submissions/') && action.type.endsWith('/rejected'),
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.submitting = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearSubmissionError, clearSubmissionMessage, resetSubmissionState, setCurrentSubmission } =
  submissionSlice.actions;
export default submissionSlice.reducer;