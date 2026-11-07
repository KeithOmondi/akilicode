import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/api';
import type {
  KidCourse,
  CourseContent,
  KidDashboardStats,
  LeaderboardEntry,
  Achievement,
  SubmitLessonResponse,
  Lesson,
  Question,               // ✨ new
  QuizSubmissionResult,   // ✨ new
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
  // ✨ Quiz state
  quizQuestions: Question[] | null;
  quizSubmitting: boolean;
  quizResult: QuizSubmissionResult | null;
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
  quizQuestions: null,
  quizSubmitting: false,
  quizResult: null,
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

// ─── Async Thunks (existing) ───────────────────────────────────────────────

export const getMyCourses = createAsyncThunk(
  'kidLearning/getMyCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/learning/courses');
      return response.data.data.courses;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const getCourseContent = createAsyncThunk(
  'kidLearning/getCourseContent',
  async (enrollmentId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/learning/courses/${enrollmentId}/content`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const getLesson = createAsyncThunk(
  'kidLearning/getLesson',
  async ({ enrollmentId, lessonId }: { enrollmentId: string; lessonId: string }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/learning/courses/${enrollmentId}/lessons/${lessonId}`);
      return response.data.data.lesson;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// For notes‑only lessons (no coding assignment) – still used for manual completion? Actually replaced by quiz.
export const submitLesson = createAsyncThunk(
  'kidLearning/submitLesson',
  async (
    { enrollmentId, lessonId, code_submitted }: { enrollmentId: string; lessonId: string; code_submitted?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post<SubmitLessonResponse>(
        `/learning/courses/${enrollmentId}/lessons/${lessonId}/submit`,
        { code_submitted }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Dashboard, leaderboard, achievements (unchanged)
export const getDashboardStats = createAsyncThunk(
  'kidLearning/getDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/learning/dashboard');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const getLeaderboard = createAsyncThunk(
  'kidLearning/getLeaderboard',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const response = await api.get(`/learning/leaderboard?limit=${limit}`);
      return response.data.data.leaderboard;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const getAchievements = createAsyncThunk(
  'kidLearning/getAchievements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/learning/achievements');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ✨ NEW – QUIZ THUNKS ──────────────────────────────────────────────────────

// Fetch quiz questions for a lesson
export const getLessonQuestions = createAsyncThunk<
  Question[],
  string, // lessonId
  { rejectValue: string }
>(
  'kidLearning/getLessonQuestions',
  async (lessonId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/courses/lessons/${lessonId}/questions`);
      return response.data.data.questions;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Submit quiz answers
export const submitLessonQuiz = createAsyncThunk<
  QuizSubmissionResult,
  { lessonId: string; enrollmentId?: string; answers: { questionId: string; selectedIndex: number }[] },
  { rejectValue: string }
>(
  'kidLearning/submitLessonQuiz',
  async ({ lessonId, enrollmentId, answers }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/courses/lessons/${lessonId}/submit`, {
        enrollmentId,
        answers,
      });
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
      state.quizQuestions = null;
      state.quizSubmitting = false;
      state.quizResult = null;
    },
    setCurrentLesson: (state, action: PayloadAction<Lesson | null>) => {
      state.currentLesson = action.payload;
    },
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
      state.currentLesson = null;
    },
    // ✨ Clear quiz result (e.g., when leaving lesson)
    clearQuizResult: (state) => {
      state.quizResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Existing cases ...
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

      .addCase(getLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLesson = action.payload;
        // Clear previous quiz state when loading a new lesson
        state.quizQuestions = null;
        state.quizResult = null;
        state.quizSubmitting = false;
      })
      .addCase(getLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(submitLesson.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitLesson.fulfilled, (state, action) => {
        state.submitting = false;
        state.message = action.payload.message;
        if (state.currentLesson) {
          state.currentLesson.completed = true;
          state.currentLesson.points_earned = action.payload.points_earned;
        }
      })
      .addCase(submitLesson.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })

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
      })

      // ✨ NEW quiz cases
      .addCase(getLessonQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.quizQuestions = null;
      })
      .addCase(getLessonQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.quizQuestions = action.payload;
      })
      .addCase(getLessonQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(submitLessonQuiz.pending, (state) => {
        state.quizSubmitting = true;
        state.error = null;
        state.quizResult = null;
      })
      .addCase(submitLessonQuiz.fulfilled, (state, action) => {
        state.quizSubmitting = false;
        state.quizResult = action.payload;
        // If the quiz is passed, we may want to mark lesson completed automatically.
        // The parent component (KidCourseView) will call getLesson again to refresh.
        // Optionally we can update currentLesson.completed = true if action.payload.passed,
        // but it's safer to let the backend update and then refetch.
      })
      .addCase(submitLessonQuiz.rejected, (state, action) => {
        state.quizSubmitting = false;
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
  clearQuizResult,       // ✨ new
} = kidLearningSlice.actions;

export default kidLearningSlice.reducer;







