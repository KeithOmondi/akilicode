import api from "../api/api";

export interface ProjectSummary {
  id: string;
  title: string;
  /** 'web' = HTML, CSS and JavaScript; 'blocks' = Scratch-style block coding */
  kind: "web" | "blocks";
  lesson_id: string | null;
  submitted_at: string | null;
  marks: number | null;
  reviewed_at: string | null;
  updated_at: string;
}

export interface Project extends ProjectSummary {
  html: string;
  css: string;
  js: string;
  /** Saved blocks (block projects only) */
  blocks?: object | null;
  feedback: string | null;
  /** From the lesson, when this project belongs to an assignment. */
  assignment?: string | null;
  lesson_title?: string | null;
}

export interface AssignmentItem {
  lesson_id: string;
  lesson_title: string;
  lesson_type?: "notes" | "coding" | "scratch";
  assignment: string;
  assignment_due_date: string | null;
  course_title: string;
  module_title: string;
  enrollment_id: string;
  project_id: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  marks: number | null;
  feedback: string | null;
}

export interface HandedInProject {
  id: string;
  title: string;
  kind: "web" | "blocks";
  blocks: object | null;
  html: string;
  css: string;
  js: string;
  submitted_at: string;
  marks: number | null;
  feedback: string | null;
  reviewed_at: string | null;
  kid_name: string;
  kid_age: number | null;
  lesson_title: string | null;
  assignment: string | null;
  course_title: string | null;
}

export const errorText = (e: unknown, fallback = "Something went wrong. Please try again.") =>
  (e as { response?: { data?: { message?: string } } }).response?.data?.message ?? fallback;

export const projectsApi = {
  assignments: async () => (await api.get<{ data: { assignments: AssignmentItem[] } }>("/kid/projects/assignments")).data.data.assignments,
  kinds: async () => (await api.get<{ data: { kinds: ("web" | "blocks")[] } }>("/kid/projects/kinds")).data.data.kinds,
  list: async () => (await api.get<{ data: { projects: ProjectSummary[] } }>("/kid/projects")).data.data.projects,
  get: async (id: string) => (await api.get<{ data: { project: Project } }>(`/kid/projects/${id}`)).data.data.project,
  create: async (kind: "web" | "blocks" = "web", title?: string) => (await api.post<{ data: { project: Project } }>("/kid/projects", { kind, ...(title ? { title } : {}) })).data.data.project,
  openForLesson: async (lessonId: string) => (await api.post<{ data: { project: Project } }>(`/kid/projects/for-lesson/${lessonId}`)).data.data.project,
  save: async (id: string, body: { title?: string; html?: string; css?: string; js?: string; blocks?: object }) =>
    (await api.put<{ data: { project: ProjectSummary } }>(`/kid/projects/${id}`, body)).data.data.project,
  submit: async (id: string) => (await api.post<{ data: { project: ProjectSummary } }>(`/kid/projects/${id}/submit`)).data.data.project,
  unsubmit: async (id: string) => (await api.post<{ data: { project: ProjectSummary } }>(`/kid/projects/${id}/unsubmit`)).data.data.project,
  remove: async (id: string) => { await api.delete(`/kid/projects/${id}`); },

  // admin
  adminList: async (status: "submitted" | "reviewed" | "all") =>
    (await api.get<{ data: { projects: HandedInProject[] } }>("/admin/projects", { params: { status } })).data.data.projects,
  adminReview: async (id: string, marks: number, feedback: string) =>
    (await api.patch(`/admin/projects/${id}/review`, { marks, feedback: feedback || undefined })).data,
};
