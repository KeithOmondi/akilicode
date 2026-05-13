
import api from '../../api/api';
import type {
  BlogPostListResponse,
  BlogPostResponse,
  CategoriesResponse,
  TagsResponse,
  CreateBlogPostDTO,
  BlogCategory
} from '../../interfaces/blog.interface';

export const blogService = {
  // Public endpoints
  getPosts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    search?: string;
  }) => {
    const response = await api.get<BlogPostListResponse>('/blog/posts', { params });
    return response.data.data;
  },

  getPostBySlug: async (slug: string) => {
    const response = await api.get<BlogPostResponse>(`/blog/posts/${slug}`);
    return response.data.data.post;
  },

  getRelatedPosts: async (postId: string, limit?: number) => {
    const response = await api.get(`/blog/posts/${postId}/related`, { params: { limit } });
    return response.data.data.posts;
  },

  getCategories: async () => {
    const response = await api.get<CategoriesResponse>('/blog/categories');
    return response.data.data.categories;
  },

  getTags: async () => {
    const response = await api.get<TagsResponse>('/blog/tags');
    return response.data.data.tags;
  },

  // Admin endpoints
  createPost: async (data: CreateBlogPostDTO) => {
    const response = await api.post<BlogPostResponse>('/blog/posts', data);
    return response.data.data.post;
  },

  getAllPosts: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get<BlogPostListResponse>('/blog/admin/posts', { params });
    return response.data.data;
  },

  updatePost: async (postId: string, data: Partial<CreateBlogPostDTO>) => {
    const response = await api.patch<BlogPostResponse>(`/blog/posts/${postId}`, data);
    return response.data.data.post;
  },

  deletePost: async (postId: string) => {
    await api.delete(`/blog/posts/${postId}`);
  },

  createCategory: async (data: { name: string; description?: string }) => {
    const response = await api.post<{ status: string; data: { category: BlogCategory } }>(
      '/blog/categories',
      data
    );
    return response.data.data.category;
  }
};