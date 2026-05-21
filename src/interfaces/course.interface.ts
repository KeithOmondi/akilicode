// src/interfaces/course.interface.ts

// ─── COURSE ───────────────────────────────────────────────────────────────────
export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

// ─── MODULE ───────────────────────────────────────────────────────────────────
export interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  lesson_count?: number;        // Returned by getModulesByCourse
  created_at: string;
  updated_at?: string;
}

// ─── LESSON ───────────────────────────────────────────────────────────────────
export type LessonLanguage = 'javascript' | 'python' | 'html' | 'scratch';

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  lesson_type: 'notes' | 'coding' | 'scratch';
  notes?: string;               // Markdown content
  assignment?: string | null;   // ✨ FIXED: coding task description (plain text)
  language?: LessonLanguage;
  starter_code?: string;
  solution_code?: string;
  expected_output?: string;     // For optional auto‑check
  order_index: number;
  question_count?: number;      // Joined from curriculum query
  module_title?: string;        // Joined from getLessonById
  course_id?: string;           // Joined from getLessonById
  created_at: string;
  updated_at?: string;
}

// ─── CURRICULUM ───────────────────────────────────────────────────────────────
export interface ModuleWithLessons extends Module {
  lessons: Lesson[];
}

export interface CourseCurriculum extends Course {
  modules: ModuleWithLessons[];
}

// ─── STATE (fully matches Redux slice) ────────────────────────────────────────
export interface CourseState {
  courses: Course[];
  currentCurriculum: CourseCurriculum | null;
  currentLesson: Lesson | null;
  currentLessonAssignment: string | null;   // ✨ NEW: lightweight assignment cache
  loading: boolean;
  error: string | null;
}

// ─── API RESPONSES ────────────────────────────────────────────────────────────
export interface CoursesListResponse {
  status: string;
  results: number;
  data: {
    courses: Course[];
  };
}