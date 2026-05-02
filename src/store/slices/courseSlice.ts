import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "../../api/api";
import type { 
  Course, 
  CourseState, 
  CoursesListResponse 
} from "../../interfaces/course.interface";

const initialState: CourseState = {
  courses: [],
  loading: false,
  error: null,
};

// ============ ASYNC THUNKS ============

/**
 * GET /courses — Fetch all courses (Admin/Parent/Public)
 */
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

/**
 * POST /courses/create — Admin: Add a new course
 */
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

// ============ SLICE ============

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    resetCourseState: (state) => {
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Courses
      .addCase(getAllCourses.fulfilled, (state, action: PayloadAction<Course[]>) => {
        state.loading = false;
        state.courses = action.payload;
      })
      
      // Create New Course
      .addCase(createCourse.fulfilled, (state, action: PayloadAction<Course>) => {
        state.loading = false;
        state.courses.unshift(action.payload); // Add new course to the top of the list
      })

      // Global Pending Matcher
      .addMatcher(
        (action) => action.type.startsWith("course/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      // Global Rejected Matcher
      .addMatcher(
        (action) => action.type.startsWith("course/") && action.type.endsWith("/rejected"),
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { resetCourseState } = courseSlice.actions;
export default courseSlice.reducer;