// src/store/slices/kidCalendarSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/api';
import type { CalendarEvent, CalendarResponse, CalendarState } from '../../interfaces/calendar.interface';

const initialState: CalendarState = {
  events: [],
  loading: false,
  error: null,
};

// Helper to extract error message
const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
};

// Async thunk to fetch calendar events
export const getCalendarEvents = createAsyncThunk<
  CalendarEvent[],                    // return type
  { year?: number; month?: number },  // argument type
  { rejectValue: string }
>(
  'kidCalendar/getEvents',
  async ({ year, month }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (year !== undefined) params.append('year', String(year));
      if (month !== undefined) params.append('month', String(month));
      const response = await api.get<CalendarResponse>(`/kid/calendar?${params.toString()}`);
      return response.data.data.events;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const kidCalendarSlice = createSlice({
  name: 'kidCalendar',
  initialState,
  reducers: {
    clearCalendarError: (state) => {
      state.error = null;
    },
    resetCalendarState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCalendarEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCalendarEvents.fulfilled, (state, action: PayloadAction<CalendarEvent[]>) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(getCalendarEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch calendar events';
      });
  },
});

export const { clearCalendarError, resetCalendarState } = kidCalendarSlice.actions;
export default kidCalendarSlice.reducer;