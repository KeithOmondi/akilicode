export interface KidCourse {
  enrollment_id: string;
  course_id: string;
  name: string;             // was 'title' — controller now returns 'name'
  enrolled_at: string;
  status: string;
  progress: number;
  completed_lessons: number;
  total_lessons: number;
  // removed: id, title, description, duration, image, category (no longer from courses table)
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  notes: string;
  language: string;
  starter_code: string;
  solution_code: string;
  order_index: number;
  completed: boolean;
  points_earned: number;
  code_submitted: string | null;
  completed_at: string | null;
  // removed: module_title, course_id, course_title (not returned by controller)
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
  course_name: string;      // replaces nested course object
  modules: ModuleWithLessons[];
  // removed: course object (no longer querying courses table)
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
    // removed: completed_courses (dropped from controller)
  };
  recent_achievements: Array<{
    name: string;
    earned_at: string;
    points_earned: number;
    // removed: type (dropped from controller)
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
    };
    points_earned: number;
    message: string;
  };
}