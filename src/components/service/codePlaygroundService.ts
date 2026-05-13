import api from "../../api/api";
import type {
  CodeSnippet,
  CodeExecution,
  CodePlaygroundSession,
  CodeExecutionResult,
  SnippetStats,
  CreateSnippetPayload,
  UpdateSnippetPayload,
  GetSnippetsParams,
  ExecuteCodePayload,
  SaveSessionPayload,
  ShareLinkResponse,
} from "../../interfaces/codePlayground.interface";

// ── Snippets ──────────────────────────────────────────────────────────────────

const createSnippet = async (data: CreateSnippetPayload): Promise<CodeSnippet> => {
  const res = await api.post<{ success: boolean; data: CodeSnippet }>("/playground/snippets", data);
  return res.data.data;
};

const getSnippets = async (params?: GetSnippetsParams): Promise<CodeSnippet[]> => {
  const res = await api.get<{ success: boolean; data: CodeSnippet[] }>("/playground/snippets", { params });
  return res.data.data;
};

const getSnippetById = async (id: string): Promise<CodeSnippet> => {
  const res = await api.get<{ success: boolean; data: CodeSnippet }>(`/playground/snippets/${id}`);
  return res.data.data;
};

const updateSnippet = async (id: string, data: UpdateSnippetPayload): Promise<CodeSnippet> => {
  const res = await api.put<{ success: boolean; data: CodeSnippet }>(`/playground/snippets/${id}`, data);
  return res.data.data;
};

const deleteSnippet = async (id: string): Promise<void> => {
  await api.delete(`/playground/snippets/${id}`);
};

const toggleFavorite = async (id: string): Promise<CodeSnippet> => {
  const res = await api.post<{ success: boolean; data: CodeSnippet }>(`/playground/snippets/${id}/favorite`);
  return res.data.data;
};

// ── Execution ─────────────────────────────────────────────────────────────────

const executeCode = async (payload: ExecuteCodePayload): Promise<CodeExecutionResult> => {
  const res = await api.post<{ success: boolean; data: CodeExecutionResult }>("/playground/execute", payload);
  return res.data.data;
};

const getExecutionHistory = async (snippetId: string, limit = 10): Promise<CodeExecution[]> => {
  const res = await api.get<{ success: boolean; data: CodeExecution[] }>(
    `/playground/executions/${snippetId}`,
    { params: { limit } }
  );
  return res.data.data;
};

// ── Session ───────────────────────────────────────────────────────────────────

const saveSession = async (payload: SaveSessionPayload): Promise<CodePlaygroundSession> => {
  const res = await api.post<{ success: boolean; data: CodePlaygroundSession; sessionToken: string }>(
    "/playground/session",
    payload
  );
  return res.data.data;
};

const getSession = async (): Promise<CodePlaygroundSession | null> => {
  const res = await api.get<{ success: boolean; data: CodePlaygroundSession | null }>("/playground/session");
  return res.data.data;
};

// ── Search & Stats ────────────────────────────────────────────────────────────

const searchSnippets = async (query: string): Promise<CodeSnippet[]> => {
  const res = await api.get<{ success: boolean; data: CodeSnippet[] }>("/playground/search", {
    params: { q: query },
  });
  return res.data.data;
};

const getStats = async (): Promise<SnippetStats> => {
  const res = await api.get<{ success: boolean; data: SnippetStats }>("/playground/stats");
  return res.data.data;
};

// ── Share ─────────────────────────────────────────────────────────────────────

const generateShareLink = async (id: string): Promise<ShareLinkResponse> => {
  const res = await api.post<{ success: boolean; data: ShareLinkResponse }>(
    `/playground/snippets/${id}/share`
  );
  return res.data.data;
};

const getSharedSnippet = async (token: string): Promise<CodeSnippet> => {
  const res = await api.get<{ success: boolean; data: CodeSnippet }>(`/playground/shared/${token}`);
  return res.data.data;
};

export const codePlaygroundService = {
  createSnippet,
  getSnippets,
  getSnippetById,
  updateSnippet,
  deleteSnippet,
  toggleFavorite,
  executeCode,
  getExecutionHistory,
  saveSession,
  getSession,
  searchSnippets,
  getStats,
  generateShareLink,
  getSharedSnippet,
};