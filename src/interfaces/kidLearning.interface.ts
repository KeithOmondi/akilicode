export interface KidCourse {
  id: string;
  enrollment_id: string;
  title: string;
  description: string;
  duration: string;
  image: string;
  category: string;
  enrolled_at: string;
  status: string;
  progress: number;
  completed_lessons: number;
  total_lessons: number;
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
  module_title: string;
  course_id: string;
  course_title: string;
  completed: boolean;
  points_earned: number;
  code_submitted: string;
  completed_at: string;
}

export interface ModuleWithLessons {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
  lesson_count: number;
}

export interface CourseContent {
  course: {
    id: string;
    title: string;
    description: string;
    price: number;
    duration: string;
    category: string;
    image_url: string;
  };
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
    completed_courses: number;
    completed_lessons: number;
    total_lessons: number;
    total_points: number;
    level: number;
    points_to_next_level: number;
    streak_days: number;
  };
  recent_achievements: Array<{
    type: string;
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
  message: string;
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