// api.ts
import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ── In-memory token store (never localStorage — XSS risk) ─────────────────
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => { accessToken = token; };
export const getAccessToken = () => accessToken;

// ──────────────────────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// REQUEST INTERCEPTOR — attach access token to every request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// RESPONSE INTERCEPTOR — on 401, refresh once then retry
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest;
    const isRefreshCall = originalRequest.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshCall) {
      originalRequest._retry = true;
      try {
        const res = await api.get("/auth/refresh");
        const newToken = res.data.accessToken;
        setAccessToken(newToken);
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        setAccessToken(null);
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 500) {
      console.error("Server Error: Please try again later.");
    }

    return Promise.reject(error);
  },
);

export default api;