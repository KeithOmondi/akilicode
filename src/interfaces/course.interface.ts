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

// ─── LESSON (simplified – no coding execution fields) ────────────────────────
export type LessonLanguage = 'javascript' | 'python' | 'html' | 'scratch';

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  lesson_type?: 'notes' | 'coding' | 'scratch';  // Backward compatibility
  notes?: string;               // Markdown content (lesson text)
  assignment?: string | null;   // Optional coding task description (plain text)
  language?: LessonLanguage;    // For reference only – no code execution
  starter_code?: string;        // Can be removed, but keep for now
  solution_code?: string;       // Can be removed
  expected_output?: string;     // Not used in quiz-only mode
  order_index: number;
  question_count?: number;      // Number of quiz questions
  module_title?: string;        // Joined from getLessonById
  course_id?: string;           // Joined from getLessonById
  questions?: Question[];       // ✨ NEW – quiz questions embedded (when fetched)
  created_at: string;
  updated_at?: string;
}

// ─── QUIZ QUESTION (Multiple Choice) ─────────────────────────────────────────
export interface Question {
  id: string;
  question: string;
  options: string[];            // Array of possible answers
  answer: number;               // 0‑based index of correct option
  order_index: number;
}

// ─── QUIZ SUBMISSION RESULT ─────────────────────────────────────────────────
export interface QuizSubmissionResult {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;              // e.g., ≥70%
}

// ─── CURRICULUM (unchanged) ──────────────────────────────────────────────────
export interface ModuleWithLessons extends Module {
  lessons: Lesson[];
}

export interface CourseCurriculum extends Course {
  modules: ModuleWithLessons[];
}

// ─── STATE (fully matches Redux slice) ───────────────────────────────────────
export interface CourseState {
  courses: Course[];
  currentCurriculum: CourseCurriculum | null;
  currentLesson: Lesson | null;
  currentLessonAssignment: string | null;       // Cached assignment text
  currentLessonQuestions: Question[] | null;    // ✨ NEW – fetched questions
  quizSubmissionResult: QuizSubmissionResult | null; // ✨ NEW – last quiz result
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