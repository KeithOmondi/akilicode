// src/interfaces/calendar.interface.ts

export type CalendarEventType = 'lesson_completed' | 'submission_submitted' | 'submission_reviewed';

export interface CalendarEvent {
  id: string;
  date: string;        // YYYY-MM-DD
  type: CalendarEventType;
  title: string;
  points_earned?: number | null;
  marks?: number | null;
  status?: 'submitted' | 'reviewed';
}

export interface CalendarState {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
}

export interface CalendarResponse {
  status: string;
  data: {
    events: CalendarEvent[];
  };
}