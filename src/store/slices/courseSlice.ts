import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "../../api/api";
import type {
  Course,
  CourseState,
  CoursesListResponse,
  Module,
  Lesson,
  CourseCurriculum,
} from "../../interfaces/course.interface";

const initialState: CourseState = {
  courses: [],
  currentCurriculum: null,
  currentLesson: null,
  loading: false,
  error: null,
};

// ─── COURSES ──────────────────────────────────────────────────────────────────

export const getAllCourses = createAsyncThunk<Course[], void>(
  "course/getAllCourses",
  async (_, thunkAPI) => {
    try {
      const res = await api.get<CoursesListResponse>("/courses");
      return res.data.data.courses;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch courses"
      );
    }
  }
);

export const createCourse = createAsyncThunk<Course, Partial<Course>>(
  "course/createCourse",
  async (courseData, thunkAPI) => {
    try {
      const res = await api.post<{ status: string; data: { course: Course } }>(
        "/courses/create",
        courseData
      );
      return res.data.data.course;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create course"
      );
    }
  }
);

// ─── CURRICULUM ───────────────────────────────────────────────────────────────

export const getCourseCurriculum = createAsyncThunk<CourseCurriculum, string>(
  "course/getCourseCurriculum",
  async (courseId, thunkAPI) => {
    try {
      const res = await api.get<{ status: string; data: { course: CourseCurriculum } }>(
        `/courses/${courseId}/curriculum`
      );
      return res.data.data.course;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch curriculum"
      );
    }
  }
);

// ─── MODULES ──────────────────────────────────────────────────────────────────

export const createModule = createAsyncThunk<Module, Partial<Module>>(
  "course/createModule",
  async (moduleData, thunkAPI) => {
    try {
      const res = await api.post<{ status: string; data: { module: Module } }>(
        "/courses/modules/create",
        moduleData
      );
      return res.data.data.module;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create module"
      );
    }
  }
);

export const updateModule = createAsyncThunk<Module, { moduleId: string; data: Partial<Module> }>(
  "course/updateModule",
  async ({ moduleId, data }, thunkAPI) => {
    try {
      const res = await api.patch<{ status: string; data: { module: Module } }>(
        `/courses/modules/${moduleId}`,
        data
      );
      return res.data.data.module;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update module"
      );
    }
  }
);

export const deleteModule = createAsyncThunk<string, string>(
  "course/deleteModule",
  async (moduleId, thunkAPI) => {
    try {
      await api.delete(`/courses/modules/${moduleId}`);
      return moduleId;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete module"
      );
    }
  }
);

// ─── LESSONS ──────────────────────────────────────────────────────────────────

export const createLesson = createAsyncThunk<Lesson, Partial<Lesson>>(
  "course/createLesson",
  async (lessonData, thunkAPI) => {
    try {
      const res = await api.post<{ status: string; data: { lesson: Lesson } }>(
        "/courses/lessons/create",
        lessonData
      );
      return res.data.data.lesson;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create lesson"
      );
    }
  }
);

export const getLessonById = createAsyncThunk<Lesson, string>(
  "course/getLessonById",
  async (lessonId, thunkAPI) => {
    try {
      const res = await api.get<{ status: string; data: { lesson: Lesson } }>(
        `/courses/lessons/${lessonId}`
      );
      return res.data.data.lesson;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch lesson"
      );
    }
  }
);

export const updateLesson = createAsyncThunk<Lesson, { lessonId: string; data: Partial<Lesson> }>(
  "course/updateLesson",
  async ({ lessonId, data }, thunkAPI) => {
    try {
      const res = await api.patch<{ status: string; data: { lesson: Lesson } }>(
        `/courses/lessons/${lessonId}`,
        data
      );
      return res.data.data.lesson;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update lesson"
      );
    }
  }
);

export const deleteLesson = createAsyncThunk<string, string>(
  "course/deleteLesson",
  async (lessonId, thunkAPI) => {
    try {
      await api.delete(`/courses/lessons/${lessonId}`);
      return lessonId;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete lesson"
      );
    }
  }
);

// ─── SLICE ────────────────────────────────────────────────────────────────────

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    resetCourseState: (state) => {
      state.error = null;
      state.loading = false;
    },
    clearCurrentLesson: (state) => {
      state.currentLesson = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Courses ────────────────────────────────────────────────────────────
      .addCase(getAllCourses.fulfilled, (state, action: PayloadAction<Course[]>) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(createCourse.fulfilled, (state, action: PayloadAction<Course>) => {
        state.loading = false;
        state.courses.unshift(action.payload);
      })

      // ── Curriculum ─────────────────────────────────────────────────────────
      .addCase(getCourseCurriculum.fulfilled, (state, action: PayloadAction<CourseCurriculum>) => {
        state.loading = false;
        state.currentCurriculum = action.payload;
      })

      // ── Modules ────────────────────────────────────────────────────────────
      .addCase(createModule.fulfilled, (state, action: PayloadAction<Module>) => {
        state.loading = false;
        if (state.currentCurriculum) {
          state.currentCurriculum.modules.push({ ...action.payload, lessons: [] });
        }
      })
      .addCase(updateModule.fulfilled, (state, action: PayloadAction<Module>) => {
        state.loading = false;
        if (state.currentCurriculum) {
          const idx = state.currentCurriculum.modules.findIndex(
            (m) => m.id === action.payload.id
          );
          if (idx !== -1) {
            state.currentCurriculum.modules[idx] = {
              ...state.currentCurriculum.modules[idx],
              ...action.payload,
            };
          }
        }
      })
      .addCase(deleteModule.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        if (state.currentCurriculum) {
          state.currentCurriculum.modules = state.currentCurriculum.modules.filter(
            (m) => m.id !== action.payload
          );
        }
      })

      // ── Lessons ────────────────────────────────────────────────────────────
      .addCase(createLesson.fulfilled, (state, action: PayloadAction<Lesson>) => {
        state.loading = false;
        if (state.currentCurriculum) {
          const mod = state.currentCurriculum.modules.find(
            (m) => m.id === action.payload.module_id
          );
          if (mod) mod.lessons.push(action.payload);
        }
      })
      .addCase(getLessonById.fulfilled, (state, action: PayloadAction<Lesson>) => {
        state.loading = false;
        state.currentLesson = action.payload;
      })
      .addCase(updateLesson.fulfilled, (state, action: PayloadAction<Lesson>) => {
        state.loading = false;
        if (state.currentCurriculum) {
          const mod = state.currentCurriculum.modules.find(
            (m) => m.id === action.payload.module_id
          );
          if (mod) {
            const idx = mod.lessons.findIndex((l) => l.id === action.payload.id);
            if (idx !== -1) mod.lessons[idx] = action.payload;
          }
        }
        if (state.currentLesson?.id === action.payload.id) {
          state.currentLesson = action.payload;
        }
      })
      .addCase(deleteLesson.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        if (state.currentCurriculum) {
          state.currentCurriculum.modules = state.currentCurriculum.modules.map((m) => ({
            ...m,
            lessons: m.lessons.filter((l) => l.id !== action.payload),
          }));
        }
      })

      // ── Global Pending ─────────────────────────────────────────────────────
      .addMatcher(
        (action) => action.type.startsWith("course/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      // ── Global Rejected ────────────────────────────────────────────────────
      .addMatcher(
        (action) => action.type.startsWith("course/") && action.type.endsWith("/rejected"),
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { resetCourseState, clearCurrentLesson } = courseSlice.actions;
export default courseSlice.reducer;