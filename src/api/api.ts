import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import { askForGate, getGateToken } from "./parentGate";

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _gateRetry?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => { accessToken = token; };
export const getAccessToken = () => accessToken;

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ── REQUEST INTERCEPTOR ───────────────────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const gate = getGateToken();
    if (gate) config.headers["X-Parent-Gate"] = gate;

    const isKidPath = window.location.pathname.startsWith("/kid");

    if (isKidPath) {
      // Always read kid token fresh from localStorage — avoids stale parent token
      const kidToken = localStorage.getItem("kid_accessToken");
      if (kidToken) {
        config.headers["Authorization"] = `Bearer ${kidToken}`;
        return config;
      }
    }

    // Parent / admin — use in-memory token
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ── RESPONSE INTERCEPTOR ──────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest;
    const isRefreshCall   = originalRequest.url?.includes("/auth/refresh");
    const isKidPath       = window.location.pathname.startsWith("/kid");

    const body = error.response?.data as { code?: string; message?: string } | undefined;

    // The server wants the parent to confirm it is them: ask, then repeat the request once.
    if (error.response?.status === 403 && body?.code === "PARENT_GATE_REQUIRED" && !originalRequest._gateRetry) {
      originalRequest._gateRetry = true;
      try {
        await askForGate();
      } catch {
        return Promise.reject(error);
      }
      const token = getGateToken();
      if (token) originalRequest.headers["X-Parent-Gate"] = token;
      return api(originalRequest);
    }

    // The parent's daily limit is used up: tell the screen-time guard (see ScreenTimeGuard.tsx).
    if (error.response?.status === 403 && body?.code === "SCREEN_TIME_UP") {
      window.dispatchEvent(new CustomEvent("akili:screen-time-up"));
    }

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshCall) {
      originalRequest._retry = true;

      if (isKidPath) {
        const isAuthCall =
          originalRequest.url?.includes("/kids/me") ||
          originalRequest.url?.includes("/kids/login");

        if (isAuthCall) {
          setAccessToken(null);
          localStorage.removeItem("kid_accessToken");
          window.location.href = "/kid/login";
        }

        return Promise.reject(error);
      }

      // Parent/Admin refresh
      try {
        const res      = await api.get("/auth/refresh");
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

    return Promise.reject(error);
  },
);

export default api;