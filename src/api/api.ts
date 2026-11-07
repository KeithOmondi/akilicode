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

type Kind = "parent" | "kid";

// ── Tokens ────────────────────────────────────────────────────────────────────
// Parent/admin: kept in memory only (renewed from an HttpOnly cookie).
// Child: kept in localStorage so a page refresh keeps them signed in; also renewed from their own cookie.
let accessToken: string | null = null;
const KID_KEY = "kid_accessToken";

const timers: Partial<Record<Kind, ReturnType<typeof setTimeout>>> = {};

/** Seconds-since-epoch expiry of a JWT, or null when it cannot be read. */
const tokenExpiry = (token: string): number | null => {
  try {
    const body = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const exp = (JSON.parse(atob(body)) as { exp?: number }).exp;
    return typeof exp === "number" ? exp : null;
  } catch {
    return null;
  }
};

/** Renew a minute BEFORE the token expires, so the person never meets an expired token at all. */
const scheduleRefresh = (kind: Kind, token: string | null) => {
  if (timers[kind]) clearTimeout(timers[kind]);
  delete timers[kind];
  if (!token) return;
  const exp = tokenExpiry(token);
  if (!exp) return;
  const delay = Math.max(5_000, exp * 1000 - Date.now() - 60_000);
  timers[kind] = setTimeout(() => {
    refreshNow(kind).catch(() => undefined); // a failure here is handled by the next real request
  }, Math.min(delay, 2_000_000_000));
};

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  scheduleRefresh("parent", token);
};
export const getAccessToken = () => accessToken;

export const setKidAccessToken = (token: string | null) => {
  if (token) localStorage.setItem(KID_KEY, token);
  else localStorage.removeItem(KID_KEY);
  scheduleRefresh("kid", token);
};

// ── Renewing a session ────────────────────────────────────────────────────────

/** The server said the session is really over (cookie missing, expired or revoked). */
export class SessionEnded extends Error {}

const inflight: Partial<Record<Kind, Promise<string>>> = {};

/**
 * Ask the server for a fresh token. Everyone who needs one at the same moment shares ONE request
 * (ten requests failing together used to start ten renewals and sign people out by accident).
 * Only a 401/403 means "your session is over". A network error or a sleeping server does not.
 */
export const refreshNow = (kind: Kind): Promise<string> => {
  const existing = inflight[kind];
  if (existing) return existing;

  const run = (async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}${kind === "kid" ? "/kids/refresh" : "/auth/refresh"}`, {
        withCredentials: true,
        timeout: 25_000,
      });
      const token = res.data.accessToken as string;
      if (!token) throw new SessionEnded();
      if (kind === "kid") setKidAccessToken(token);
      else setAccessToken(token);
      return token;
    } catch (e) {
      const status = (e as AxiosError).response?.status;
      if (status === 401 || status === 403) throw new SessionEnded();
      throw e;
    } finally {
      delete inflight[kind];
    }
  })();
  inflight[kind] = run;
  return run;
};

/**
 * The session is over. Do NOT reload the page: tell the app, which clears the person's state and lets the
 * route guards send them to the sign-in page WITH the page they were on remembered (they come back to it).
 */
const endSession = (kind: Kind) => {
  if (kind === "kid") setKidAccessToken(null);
  else setAccessToken(null);
  window.dispatchEvent(new CustomEvent("akili:session-ended", { detail: { kind } }));
};

// When the tab wakes up (laptop opened, phone unlocked), renew early if the token is about to expire.
if (typeof document !== "undefined") {
  const wake = () => {
    if (document.visibilityState === "hidden") return;
    (["parent", "kid"] as Kind[]).forEach((kind) => {
      const token = kind === "kid" ? localStorage.getItem(KID_KEY) : accessToken;
      if (!token) return;
      const exp = tokenExpiry(token);
      if (exp && exp * 1000 - Date.now() < 120_000) refreshNow(kind).catch(() => undefined);
    });
  };
  document.addEventListener("visibilitychange", wake);
  window.addEventListener("online", wake);
}

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
      // Always read the kid token fresh from localStorage: it may have just been renewed.
      const kidToken = localStorage.getItem(KID_KEY);
      if (kidToken) {
        config.headers["Authorization"] = `Bearer ${kidToken}`;
        return config;
      }
    }

    // Parent / admin: the in-memory token
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
    // A 401 from these calls means "wrong password / wrong code", NOT "your session expired".
    const isAuthCall = /\/(auth\/(refresh|login|register|otp\/|forgot-password|reset-password|parent-gate)|kids\/(refresh|login|picker\/login|logout))/.test(originalRequest.url ?? "");
    const isKidPath = window.location.pathname.startsWith("/kid");

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

    // Token expired: renew it quietly and repeat the request, so the person notices nothing.
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthCall) {
      originalRequest._retry = true;
      const kind: Kind = isKidPath ? "kid" : "parent";
      try {
        const token = await refreshNow(kind);
        originalRequest.headers["Authorization"] = `Bearer ${token}`;
        return api(originalRequest);
      } catch (e) {
        if (e instanceof SessionEnded) endSession(kind);
        // Any other failure (no network, server waking up) is NOT a sign-out: just report this one request.
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
