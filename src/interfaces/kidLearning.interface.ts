// src/interfaces/kidLearning.interface.ts

export interface KidCourse {
  enrollment_id: string;
  course_id: string;
  name: string;
  enrolled_at: string;
  status: string;
  progress: number;
  completed_lessons: number;
  total_lessons: number;
}

export interface GitHubSubmission {
  status: 'pending' | 'approved' | 'needs_fix';
  github_url: string;
  tutor_feedback: string | null;
  graded_points: number;
  submitted_at: string;
  reviewed_at: string | null;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  lesson_type: 'notes' | 'coding' | 'scratch';
  notes: string;
  language: string;
  starter_code: string;
  solution_code: string;
  order_index: number;
  assignment?: string | null;
  completed: boolean;
  points_earned: number;
  code_submitted: string | null;
  completed_at: string | null;
  github_submission: GitHubSubmission | null;
}

export interface ModuleWithLessons {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
}

export interface CourseContent {
  enrollment_id: string;
  course_name: string;
  modules: ModuleWithLessons[];
}

export interface KidDashboardStats {
  kid: {
    name: string;
    age: number;
    grade: string;
    avatar: string;
    total_points: number;
    streak_days: number;
  };
  stats: {
    total_courses: number;
    completed_lessons: number;
    total_lessons: number;
    total_points: number;
    level: number;
    points_to_next_level: number;
    streak_days: number;
    lessons_this_week: number;   // ✅ added
  };
  recent_achievements: Array<{
    name: string;
    earned_at: string;
    points_earned: number;
  }>;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  total_points: number;
  streak_days: number;
  lessons_completed: number;
}

export interface Achievement {
  name: string;
  icon: string;
  earned: boolean;
  needed?: number;
}

export interface SubmitLessonResponse {
  status: string;
  data: {
    progress: {
      id: string;
      completed: boolean;
      points_earned: number;
      code_submitted: string;
    };
    submission?: GitHubSubmission;
    points_earned: number;
    message: string;
  };
}