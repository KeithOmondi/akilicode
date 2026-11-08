import api from "../api/api";

export interface OutlineLesson {
  title: string;
  type: "notes" | "coding" | "scratch";
  has_assignment: boolean;
  done: boolean;
  completed_at: string | null;
  points: number;
  quiz: { score: number; total: number } | null;
}

export interface ProgressCourse {
  enrollment_id: string;
  course_id: string | null;
  fee_amount: string | number;
  billing_cycle: string | null;
  next_payment_date: string | null;
  total_paid: string | number | null;
  last_payment_date: string | null;
  start_date: string | null;
  pay_ref: string | null;
  modules: { module: string; lessons: OutlineLesson[] }[];
  course_name: string;
  status: string;
  payment_status: string;
  trial_ends_at: string | null;
  /** true when the child can open lessons right now (active, and any free trial not over) */
  learning_now: boolean;
  total_lessons: number;
  completed_lessons: number;
  progress: number;
  last_activity: string | null;
  next_lesson: string | null;
}

export interface KidProgress {
  kid: {
    id: string;
    name: string;
    age: number;
    age_group: string | null;
    grade: string | null;
    avatar: string | null;
    joined: string;
    last_login: string | null;
    last_activity_date: string | null;
    leaderboard_opt_in: boolean;
    username: string | null;
    has_pin: boolean;
    consent_ok: boolean;
  };
  time_spent: { total_seconds: number; last_30_days_seconds: number; learning_days: number };
  level: { level: number; points: number; points_in_level: number; points_per_level: number; points_to_next: number; streak_days: number };
  totals: {
    lessons_completed: number;
    lessons_this_week: number;
    lessons_last_week: number;
    projects_made: number;
    projects_handed_in: number;
    average_mark: number | null;
    average_quiz_percent: number | null;
  };
  courses: ProgressCourse[];
  recent: { lesson: string; course_name: string | null; points_earned: number; completed_at: string | null }[];
  quizzes: { lesson: string; score: number; total: number; created_at: string }[];
  projects: {
    id: string; title: string; kind: "web" | "blocks"; lesson: string | null; submitted_at: string | null;
    marks: number | null; feedback: string | null; reviewed_at: string | null; updated_at: string;
  }[];
  hand_ins: { lesson: string; status: string; marks: number | null; feedback: string | null; submitted_at: string; reviewed_at: string | null }[];
  badges: { name: string; icon: string; earned: boolean; needed: number; earned_at?: string }[];
  calendar: { day: string; lessons_completed: number; points_earned: number }[];
  screen_time: {
    limit_minutes: number | null;
    today: { limit_minutes: number | null; used_seconds: number; remaining_seconds: number | null; locked: boolean } | null;
    last_7_days: { day: string; seconds: number }[];
  };
}

export const fetchKidProgress = async (kidId: string): Promise<KidProgress> =>
  (await api.get<{ data: KidProgress }>(`/kids/${kidId}/progress`)).data.data;
