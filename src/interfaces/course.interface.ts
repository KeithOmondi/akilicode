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
  lesson_count?: number;        // returned by getModulesByCourse
  created_at: string;
  updated_at?: string;
}

// ─── LESSON ───────────────────────────────────────────────────────────────────

export type LessonLanguage = 'javascript' | 'python' | 'html' | 'scratch';

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  notes?: string;               // markdown content
  language?: LessonLanguage;
  starter_code?: string;        // pre-filled in the editor
  solution_code?: string;       // admin's reference solution
  order_index: number;
  module_title?: string;        // joined from getLessonById
  course_id?: string;           // joined from getLessonById
  created_at: string;
  updated_at?: string;
}

// ─── CURRICULUM ───────────────────────────────────────────────────────────────
// Returned by getCourseCurriculum — full nested structure

export interface ModuleWithLessons extends Module {
  lessons: Lesson[];
}

export interface CourseCurriculum extends Course {
  modules: ModuleWithLessons[];
}

// ─── STATE ────────────────────────────────────────────────────────────────────

export interface CourseState {
  courses: Course[];
  currentCurriculum: CourseCurriculum | null;
  currentLesson: Lesson | null;
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