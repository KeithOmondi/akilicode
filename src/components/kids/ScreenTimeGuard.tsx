import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../api/api";
import { useAppDispatch } from "../../store/hooks";
import { logoutKid } from "../../store/slices/kidSlice";

/**
 * Counts a child's active time and enforces the limits the parent chose.
 *  - about once a minute, while the page is visible and the child is active, tells the server
 *    ("heartbeat"); the server does the real counting, so this cannot be cheated by editing the page
 *  - when the daily limit is used up: full-screen "all done for today" (lessons also refuse on the server)
 *  - every N minutes (parent's setting): a friendly "time for a break" reminder
 */
interface Status {
  limit_minutes: number | null;
  used_seconds: number;
  remaining_seconds: number | null;
  locked: boolean;
  break_every_minutes: number;
  break_due: boolean;
}

const BEAT_MS = 60_000;
const IDLE_AFTER_MS = 2 * 60_000;

const ScreenTimeGuard = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status | null>(null);
  const [lockedByServer, setLockedByServer] = useState(false);
  const [breakDismissedAt, setBreakDismissedAt] = useState<number>(-1); // used_seconds when dismissed
  const lastActivity = useRef(0);
  const lastBeat = useRef(0);
  useEffect(() => {
    lastActivity.current = Date.now();
    lastBeat.current = Date.now();
  }, []);

  const apply = useCallback((s: Status | undefined) => s && setStatus(s), []);

  // initial status
  useEffect(() => {
    api.get<{ data: { screen_time: Status } }>("/kids/me/screen-time").then((r) => apply(r.data.data.screen_time)).catch(() => undefined);
  }, [apply]);

  // the server can also tell us "screen time up" on any lesson request
  useEffect(() => {
    const on = () => setLockedByServer(true);
    window.addEventListener("akili:screen-time-up", on);
    return () => window.removeEventListener("akili:screen-time-up", on);
  }, []);

  // remember when the child last touched the screen
  useEffect(() => {
    const touch = () => { lastActivity.current = Date.now(); };
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, touch));
  }, []);

  // heartbeat
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      const active = document.visibilityState === "visible" && now - lastActivity.current < IDLE_AFTER_MS;
      const seconds = Math.round((now - lastBeat.current) / 1000);
      lastBeat.current = now;
      if (!active) return;
      api
        .post<{ data: { screen_time: Status } }>("/kids/me/heartbeat", { seconds: Math.min(seconds, 120) })
        .then((r) => apply(r.data.data.screen_time))
        .catch(() => undefined);
    }, BEAT_MS);
    return () => clearInterval(id);
  }, [apply]);

  const leave = () => {
    dispatch(logoutKid());
    navigate("/kid/login", { replace: true });
  };

  const locked = lockedByServer || status?.locked;

  if (locked) {
    return (
      <div role="alertdialog" aria-modal="true" aria-labelledby="st-title" className="fixed inset-0 z-[100] bg-gradient-to-br from-indigo-900 to-purple-900 text-white flex items-center justify-center p-6 text-center">
        <div className="max-w-sm">
          <div className="text-7xl mb-4" aria-hidden="true">🌙</div>
          <h1 id="st-title" className="text-3xl font-black mb-3">{t("screenTime.doneTitle")}</h1>
          <p className="text-lg text-indigo-100 mb-8">{t("screenTime.doneBody")}</p>
          <button onClick={leave} className="bg-orange-400 hover:bg-orange-500 text-white font-black text-xl px-8 py-4 rounded-2xl">
            {t("screenTime.bye")}
          </button>
        </div>
      </div>
    );
  }

  const breakDue = !!status?.break_due && status.used_seconds !== breakDismissedAt;
  if (breakDue) {
    return (
      <div role="alertdialog" aria-modal="true" aria-labelledby="br-title" className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl max-w-sm w-full p-8 text-center shadow-2xl">
          <div className="text-6xl mb-3" aria-hidden="true">🧘</div>
          <h2 id="br-title" className="text-2xl font-black text-purple-900 mb-2">{t("screenTime.breakTitle")}</h2>
          <p className="text-slate-600 mb-6">{t("screenTime.breakBody")}</p>
          <button
            autoFocus
            onClick={() => setBreakDismissedAt(status!.used_seconds)}
            className="bg-green-500 hover:bg-green-600 text-white font-black text-lg px-8 py-4 rounded-2xl w-full"
          >
            {t("screenTime.tookBreak")}
          </button>
        </div>
      </div>
    );
  }

  // small reminder when 10 minutes or less remain
  if (status?.remaining_seconds != null && status.remaining_seconds <= 600) {
    const mins = Math.max(1, Math.ceil(status.remaining_seconds / 60));
    return (
      <div role="status" className="fixed bottom-4 left-4 z-40 bg-white border-2 border-orange-300 text-orange-700 font-bold rounded-full px-4 py-2 shadow-lg text-sm">
        ⏳ {t("screenTime.left", { count: mins })}
      </div>
    );
  }
  return null;
};

export default ScreenTimeGuard;
