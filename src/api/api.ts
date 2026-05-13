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
// api.ts
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest;
    const isRefreshCall = originalRequest.url?.includes("/auth/refresh");
    
    // Check if the user is currently in the kid section
    const isKidPath = window.location.pathname.startsWith("/kid");

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshCall) {
      originalRequest._retry = true;

      // 1. If it's a kid path, we don't call /auth/refresh. 
      // Instead, we let the KidProtectedRoute handle the "not logged in" state.
      if (isKidPath) {
        setAccessToken(null);
        localStorage.removeItem("accessToken");
        // Redirect to Kid Login specifically
        window.location.href = "/kid/login"; 
        return Promise.reject(error);
      }

      // 2. Parent/Admin Refresh Logic
      try {
        const res = await api.get("/auth/refresh");
        const newToken = res.data.accessToken;
        setAccessToken(newToken);
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        setAccessToken(null);
        window.location.href = "/login"; // Parent login
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;