/**
 * Parent gate (client side).
 *
 * The server asks the parent to re-enter their password (or an SMS code) before sensitive actions:
 * payments, changing a child's PIN or screen time, exporting or deleting data. It answers
 * 403 { code: "PARENT_GATE_REQUIRED" }. api.ts catches that, calls askForGate() which opens the
 * dialog, then repeats the request with the 10-minute token in the X-Parent-Gate header.
 * Pages therefore need no special code: they just call the API.
 */
let token: string | null = null;
let expiresAt = 0;

export const getGateToken = (): string | null => (token && Date.now() < expiresAt ? token : null);

export const setGateToken = (t: string, expiresInSeconds: number) => {
  token = t;
  expiresAt = Date.now() + Math.max(0, expiresInSeconds - 30) * 1000; // 30 s safety margin
};

export const clearGateToken = () => {
  token = null;
  expiresAt = 0;
};

type Handler = () => Promise<void>;
let handler: Handler | null = null;
let inFlight: Promise<void> | null = null;

export const registerGateHandler = (h: Handler) => {
  handler = h;
  return () => {
    if (handler === h) handler = null;
  };
};

/** Opens the dialog (once, even if several requests need it at the same time). */
export const askForGate = (): Promise<void> => {
  if (!handler) return Promise.reject(new Error("The confirmation window is not available."));
  inFlight ??= handler().finally(() => {
    inFlight = null;
  });
  return inFlight;
};
