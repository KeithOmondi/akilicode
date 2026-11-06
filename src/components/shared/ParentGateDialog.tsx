import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck, Loader2 } from "lucide-react";
import api from "../../api/api";
import { registerGateHandler, setGateToken } from "../../api/parentGate";
import { useAppSelector } from "../../store/hooks";
import { ModalOverlay } from "./ModalOverlay";

/**
 * "Please confirm it is you" — opens by itself whenever the server asks for the parent gate
 * (see api/parentGate.ts). Parents with a password type it; parents who signed up with a phone
 * number get a text-message code. Mount ONCE, inside the Redux provider and the router.
 */
type Resolver = { resolve: () => void; reject: (e: Error) => void };

const ParentGateDialog = () => {
  const { t } = useTranslation();
  const user = useAppSelector((s) => s.auth.user);
  const [open, setOpen] = useState(false);
  const resolver = useRef<Resolver | null>(null);

  const [mode, setMode] = useState<"password" | "code">("password");
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);

  const hasEmail = !!user?.email;
  const hasPhone = !!user?.phone;

  const finish = useCallback((ok: boolean) => {
    setOpen(false);
    setSecret("");
    setError(null);
    setCodeSent(false);
    const r = resolver.current;
    resolver.current = null;
    if (!r) return;
    if (ok) r.resolve();
    else r.reject(new Error("cancelled"));
  }, []);

  useEffect(
    () =>
      registerGateHandler(
        () =>
          new Promise<void>((resolve, reject) => {
            resolver.current = { resolve, reject };
            const phoneOnly = !hasEmail && hasPhone;
            setMode(phoneOnly ? "code" : "password");
            setOpen(true);
            if (phoneOnly) {
              // phone-only parents: text the code right away
              api.post("/auth/parent-gate/otp").then(() => setCodeSent(true)).catch(() => setError(t("gate.codeFailed")));
            }
          }),
      ),
    [hasEmail, hasPhone, t],
  );

  const sendCode = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.post("/auth/parent-gate/otp");
      setCodeSent(true);
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } }).response?.data?.message ?? t("gate.codeFailed"));
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<{ data: { gateToken: string; expiresInSeconds: number } }>(
        "/auth/parent-gate",
        mode === "password" ? { password: secret } : { code: secret.trim() },
      );
      setGateToken(res.data.data.gateToken, res.data.data.expiresInSeconds);
      finish(true);
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? t("gate.failed"));
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <ModalOverlay onClose={() => finish(false)} title={t("gate.title")} subtitle={t("gate.subtitle")}>
      <form onSubmit={submit} className="p-6 space-y-4">
        <div className="flex items-center gap-3 text-purple-700">
          <ShieldCheck size={28} aria-hidden="true" />
          <p className="text-sm text-slate-600">{t("gate.explain")}</p>
        </div>

        <div>
          <label htmlFor="gate-secret" className="block text-xs font-black text-purple-900 uppercase tracking-wider mb-1.5">
            {mode === "password" ? t("gate.password") : t("gate.code")}
          </label>
          <input
            id="gate-secret"
            autoFocus
            required
            type={mode === "password" ? "password" : "text"}
            inputMode={mode === "code" ? "numeric" : undefined}
            autoComplete={mode === "code" ? "one-time-code" : "current-password"}
            maxLength={mode === "code" ? 6 : 72}
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? "gate-error" : undefined}
            className="w-full px-4 py-3.5 rounded-2xl border-2 border-purple-100 bg-purple-50/30 focus:bg-white focus:border-orange-500 outline-none text-lg"
          />
          {mode === "code" && codeSent && <p className="text-xs text-slate-500 mt-1.5">{t("gate.codeSent")}</p>}
          {error && (
            <p id="gate-error" role="alert" className="text-sm font-bold text-red-600 mt-2">
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={busy || !secret}
          className="w-full bg-purple-700 hover:bg-purple-800 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {busy ? <Loader2 className="animate-spin" size={20} /> : t("gate.confirm")}
        </button>

        <div className="flex justify-between text-sm">
          {hasEmail && hasPhone ? (
            <button
              type="button"
              className="text-purple-700 font-bold underline underline-offset-2"
              onClick={() => {
                setSecret("");
                setError(null);
                const next = mode === "password" ? "code" : "password";
                setMode(next);
                if (next === "code" && !codeSent) void sendCode();
              }}
            >
              {mode === "password" ? t("gate.useCode") : t("gate.usePassword")}
            </button>
          ) : (
            <span />
          )}
          {mode === "code" && (
            <button type="button" disabled={busy} className="text-purple-700 font-bold underline underline-offset-2" onClick={sendCode}>
              {t("gate.resend")}
            </button>
          )}
          <button type="button" className="text-slate-500 font-bold" onClick={() => finish(false)}>
            {t("common.cancel")}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
};

export default ParentGateDialog;
