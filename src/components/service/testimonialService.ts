import api from "../../api/api";
import type { 
  Testimonial, 
  TestimonialStats, 
  CreateTestimonialDTO,
  CanLeaveResponse,
  AdminTestimonialsResponse
} from "../../interfaces/testimonial.interface";

export const testimonialService = {
  // Public
  getTestimonials: async (params?: { limit?: number; featured?: boolean; rating?: number }) => {
    const response = await api.get<{ status: string; data: { testimonials: Testimonial[] } }>('/testimonials', { params });
    return response.data.data.testimonials;
  },
  
  getStats: async () => {
    const response = await api.get<{ status: string; data: { stats: TestimonialStats } }>('/testimonials/stats');
    return response.data.data.stats;
  },
  
  // Parent
  canLeaveTestimonial: async (kidId: string) => {
    const response = await api.get<{ status: string; data: CanLeaveResponse }>(`/testimonials/check/${kidId}`);
    return response.data.data;
  },
  
  createTestimonial: async (data: CreateTestimonialDTO) => {
    const response = await api.post<{ status: string; data: { testimonial: Testimonial } }>('/testimonials', data);
    return response.data.data.testimonial;
  },
  
  getMyTestimonials: async () => {
    const response = await api.get<{ status: string; data: { testimonials: Testimonial[] } }>('/testimonials/my');
    return response.data.data.testimonials;
  },
  
  updateTestimonial: async (testimonialId: string, data: Partial<CreateTestimonialDTO>) => {
    const response = await api.patch<{ status: string; data: { testimonial: Testimonial } }>(`/testimonials/${testimonialId}`, data);
    return response.data.data.testimonial;
  },
  
  deleteMyTestimonial: async (testimonialId: string) => {
    await api.delete(`/testimonials/${testimonialId}`);
  },
  
  // Admin
  getAllTestimonials: async (params?: { status?: string; rating?: number; limit?: number; offset?: number }) => {
    const response = await api.get<{ status: string; data: AdminTestimonialsResponse }>('/testimonials/admin/all', { params });
    return response.data.data;
  },
  
  approveTestimonial: async (testimonialId: string, admin_note?: string) => {
    const response = await api.patch<{ status: string; data: { testimonial: Testimonial } }>(`/testimonials/admin/${testimonialId}/approve`, { admin_note });
    return response.data.data.testimonial;
  },
  
  rejectTestimonial: async (testimonialId: string, admin_note: string) => {
    const response = await api.patch<{ status: string; data: { testimonial: Testimonial } }>(`/testimonials/admin/${testimonialId}/reject`, { admin_note });
    return response.data.data.testimonial;
  },
  
  toggleFeatured: async (testimonialId: string) => {
    const response = await api.patch<{ status: string; data: { testimonial: Testimonial } }>(`/testimonials/admin/${testimonialId}/feature`);
    return response.data.data.testimonial;
  },
  
  deleteTestimonial: async (testimonialId: string) => {
    await api.delete(`/testimonials/admin/${testimonialId}`);
  }
};