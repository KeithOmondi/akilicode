import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/api';
import type {
  KidCourse,
  CourseContent,
  KidDashboardStats,
  LeaderboardEntry,
  Achievement,
  SubmitLessonResponse,
  Lesson
} from '../../interfaces/kidLearning.interface';

// ─── State Type ─────────────────────────────────────────────────────────────
interface KidLearningState {
  courses: KidCourse[];
  currentCourse: CourseContent | null;
  currentLesson: Lesson | null;
  dashboardStats: KidDashboardStats | null;
  leaderboard: LeaderboardEntry[];
  achievements: Achievement[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  message: string | null;
}

const initialState: KidLearningState = {
  courses: [],
  currentCourse: null,
  currentLesson: null,
  dashboardStats: null,
  leaderboard: [],
  achievements: [],
  loading: false,
  submitting: false,
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

// Get kid's enrolled courses
export const getMyCourses = createAsyncThunk(
  'kidLearning/getMyCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/kid/courses');
      return response.data.data.courses;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Get course content with modules and lessons
export const getCourseContent = createAsyncThunk(
  'kidLearning/getCourseContent',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/kid/courses/${courseId}/content`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Get single lesson
export const getLesson = createAsyncThunk(
  'kidLearning/getLesson',
  async (lessonId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/kid/lessons/${lessonId}`);
      return response.data.data.lesson;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Submit lesson solution
export const submitLesson = createAsyncThunk(
  'kidLearning/submitLesson',
  async ({ lessonId, code_submitted }: { lessonId: string; code_submitted?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post<SubmitLessonResponse>(`/kid/lessons/${lessonId}/submit`, { code_submitted });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Get dashboard stats
export const getDashboardStats = createAsyncThunk(
  'kidLearning/getDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/kid/dashboard');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Get leaderboard
export const getLeaderboard = createAsyncThunk(
  'kidLearning/getLeaderboard',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const response = await api.get(`/kid/leaderboard?limit=${limit}`);
      return response.data.data.leaderboard;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Get achievements/badges
export const getAchievements = createAsyncThunk(
  'kidLearning/getAchievements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/kid/achievements');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────
const kidLearningSlice = createSlice({
  name: 'kidLearning',
  initialState,
  reducers: {
    clearKidLearningError: (state) => {
      state.error = null;
    },
    clearKidLearningMessage: (state) => {
      state.message = null;
    },
    resetKidLearningState: (state) => {
      state.courses = [];
      state.currentCourse = null;
      state.currentLesson = null;
      state.dashboardStats = null;
      state.leaderboard = [];
      state.achievements = [];
      state.loading = false;
      state.submitting = false;
      state.error = null;
      state.message = null;
    },
    setCurrentLesson: (state, action: PayloadAction<Lesson | null>) => {
      state.currentLesson = action.payload;
    },
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
      state.currentLesson = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── getMyCourses ─────────────────────────────────────────────────────
      .addCase(getMyCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(getMyCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── getCourseContent ─────────────────────────────────────────────────
      .addCase(getCourseContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCourseContent.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
      })
      .addCase(getCourseContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── getLesson ────────────────────────────────────────────────────────
      .addCase(getLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLesson = action.payload;
      })
      .addCase(getLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── submitLesson ─────────────────────────────────────────────────────
      .addCase(submitLesson.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitLesson.fulfilled, (state, action) => {
        state.submitting = false;
        state.message = action.payload.message;
        // Update current lesson completion status
        if (state.currentLesson) {
          state.currentLesson.completed = true;
          state.currentLesson.points_earned = action.payload.points_earned;
        }
      })
      .addCase(submitLesson.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })

      // ── getDashboardStats ────────────────────────────────────────────────
      .addCase(getDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── getLeaderboard ───────────────────────────────────────────────────
      .addCase(getLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.leaderboard = action.payload;
      })
      .addCase(getLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── getAchievements ──────────────────────────────────────────────────
      .addCase(getAchievements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAchievements.fulfilled, (state, action) => {
        state.loading = false;
        state.achievements = action.payload.badges;
      })
      .addCase(getAchievements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// ─── Exports ─────────────────────────────────────────────────────────────────
export const {
  clearKidLearningError,
  clearKidLearningMessage,
  resetKidLearningState,
  setCurrentLesson,
  clearCurrentCourse,
} = kidLearningSlice.actions;

export default kidLearningSlice.reducer;