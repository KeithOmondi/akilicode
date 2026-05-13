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
  DockerHealthStatus,
  SystemStatus,
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

// ── Docker & System Health ────────────────────────────────────────────────────

const getDockerHealth = async (): Promise<DockerHealthStatus> => {
  const res = await api.get<{ success: boolean; data: DockerHealthStatus }>("/playground/docker/health");
  return res.data.data;
};

const getSystemStatus = async (): Promise<SystemStatus> => {
  const res = await api.get<{ success: boolean; data: SystemStatus }>("/playground/status");
  return res.data.data;
};

// ── Admin Routes ──────────────────────────────────────────────────────────────

const killAllExecutions = async (): Promise<void> => {
  await api.delete("/playground/admin/executions/kill-all");
};

const getDockerStats = async (): Promise<{ activeExecutions: number; dockerEnabled: boolean }> => {
  const res = await api.get("/playground/admin/docker/stats");
  return res.data.data;
};

const cleanupDockerContainers = async (): Promise<void> => {
  await api.post("/playground/admin/docker/cleanup");
};

export const codePlaygroundService = {
  // Snippets
  createSnippet,
  getSnippets,
  getSnippetById,
  updateSnippet,
  deleteSnippet,
  toggleFavorite,
  
  // Execution
  executeCode,
  getExecutionHistory,
  
  // Session
  saveSession,
  getSession,
  
  // Search & Stats
  searchSnippets,
  getStats,
  
  // Share
  generateShareLink,
  getSharedSnippet,
  
  // Docker & System
  getDockerHealth,
  getSystemStatus,
  
  // Admin
  killAllExecutions,
  getDockerStats,
  cleanupDockerContainers,
};