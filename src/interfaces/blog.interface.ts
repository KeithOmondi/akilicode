export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  post_count?: number;
  created_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  post_count?: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  author_id: string;
  author_name: string;
  author_email?: string;
  category_id?: string;
  category_name?: string;
  category_slug?: string;
  status: 'draft' | 'published' | 'archived';
  view_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  tags: BlogTag[];
}

export interface BlogPostListResponse {
  status: string;
  data: {
    posts: BlogPost[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface BlogPostResponse {
  status: string;
  data: {
    post: BlogPost;
  };
}

export interface CategoriesResponse {
  status: string;
  data: {
    categories: BlogCategory[];
  };
}

export interface TagsResponse {
  status: string;
  data: {
    tags: BlogTag[];
  };
}

export interface CreateBlogPostDTO {
  title: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  category_id?: string;
  status: 'draft' | 'published';
  tags?: string[];
}