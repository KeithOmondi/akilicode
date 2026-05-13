// interfaces/codePlayground.interface.ts

export type PlaygroundLanguage = 'javascript' | 'python' | 'html' | 'css' | 'cpp' | 'c' | 'java' | 'typescript';

export interface CodeSnippet {
  id: string;
  user_id?: string | null;
  name: string;
  code: string;
  language: PlaygroundLanguage;
  description?: string;
  is_favorite: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
  last_executed_at?: string | null;
  execution_count: number;
  shared: boolean;
  share_token?: string | null;
}

export interface CodeExecution {
  id: string;
  snippet_id?: string | null;
  code: string;
  language: string;
  output?: string | null;
  error?: string | null;
  execution_time_ms?: number | null;
  executed_at: string;
  success: boolean;
}

export interface CodePlaygroundSession {
  id: string;
  user_id?: string | null;
  current_code: string;
  current_language: string;
  cursor_position?: number;
  selected_lines?: number[];
  font_size?: number;
  is_dark_mode: boolean;
  last_updated: string;
  session_token: string;
}

export interface CodeExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTimeMs?: number;
  memoryUsed?: number;
  type?: 'html' | 'css';  // For special rendering
  warning?: string;
}

export interface SnippetStats {
  total: number;
  by_language: Record<PlaygroundLanguage, number>;
  favorites: number;
  total_executions: number;
}

export interface CreateSnippetPayload {
  name: string;
  code: string;
  language: PlaygroundLanguage;
  description?: string;
  tags?: string[];
  shared?: boolean;
}

export interface UpdateSnippetPayload {
  name?: string;
  code?: string;
  description?: string;
  is_favorite?: boolean;
  tags?: string[];
  shared?: boolean;
}

export interface GetSnippetsParams {
  language?: PlaygroundLanguage;
  favorite?: boolean;
  limit?: number;
  offset?: number;
}

export interface ExecuteCodePayload {
  code: string;
  language: PlaygroundLanguage;
  snippetId?: string | null;
}

export interface SaveSessionPayload {
  current_code: string;
  current_language: string;
  cursor_position?: number;
  selected_lines?: number[];
  font_size?: number;
  is_dark_mode?: boolean;
}

export interface ShareLinkResponse {
  shareUrl: string;
  shareToken: string;
}

export interface DockerHealthStatus {
  status: 'healthy' | 'unhealthy' | 'unavailable' | 'disabled';
  activeExecutions?: number;
  dockerEnabled: boolean;
  timestamp?: string;
}

export interface SystemStatus {
  dockerEnabled: boolean;
  nodeVersion: string;
  environment: string;
}