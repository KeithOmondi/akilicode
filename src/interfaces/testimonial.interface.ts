export interface Testimonial {
  id: string;
  parent_id: string;
  parent_name: string;
  parent_email?: string;
  kid_id: string;
  kid_name: string;
  course_name?: string;
  rating: number;
  title?: string;
  content: string;
  child_name?: string;
  child_age?: number;
  achievement?: string;
  is_verified: boolean;
  is_featured: boolean;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  created_at: string;
  updated_at?: string;
}

export interface TestimonialStats {
  total_testimonials: number;
  average_rating: number;
  five_star_count: number;
  four_star_count: number;
  three_star_count: number;
  two_star_count: number;
  one_star_count: number;
}

export interface TestimonialsListResponse {
  testimonials: Testimonial[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    page?: number;
    pages?: number;
  };
}

export interface CreateTestimonialDTO {
  kid_id: string;
  rating: number;
  title?: string;
  content: string;
  child_name?: string;
  child_age?: number;
  achievement?: string;
}

export interface UpdateTestimonialDTO {
  rating?: number;
  title?: string;
  content?: string;
  achievement?: string;
}

export interface CanLeaveResponse {
  canLeave: boolean;
  reason?: string;
  enrollmentId?: string;
  courseName?: string;
}

export interface TestimonialFilters {
  status?: 'pending' | 'approved' | 'rejected';
  rating?: number;
  is_featured?: boolean;
  limit?: number;
  offset?: number;
}

export interface AdminTestimonialsResponse {
  testimonials: Testimonial[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}