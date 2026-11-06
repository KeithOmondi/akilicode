import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Loader2, Phone, KeyRound, User as UserIcon } from "lucide-react";
import api from "../../api/api";
import { useAppDispatch } from "../../store/hooks";
import { sessionStarted } from "../../store/slices/authSlice";
import type { AuthResponse } from "../../interfaces/auth.interface";

/**
 * Sign up / log in with a phone number and a 6-digit text-message code.
 * mode="login":  phone -> code
 * mode="signup": phone -> code + name + accept terms  (creates a parent account)
 */
const field =
  "w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-purple-50 bg-purple-50/30 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium text-slate-700";
const label = "block text-[11px] font-black text-purple-900 uppercase tracking-wider mb-1.5 ml-1";

const RESEND_SECONDS = 60;

const PhoneAuth = ({ mode }: { mode: "login" | "signup" }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const id = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);

  const messageOf = (e: unknown, fallback: string) =>
    (e as { response?: { data?: { message?: string } } }).response?.data?.message ?? fallback;

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    try {
      await api.post("/auth/otp/request", { phone, purpose: mode });
      setStep("code");
      setWait(RESEND_SECONDS);
      toast.success(t("phoneAuth.sent"));
    } catch (err) {
      toast.error(messageOf(err, t("phoneAuth.sendFailed")));
    } finally {
      setBusy(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post<AuthResponse>("/auth/otp/verify", {
        phone,
        purpose: mode,
        code: code.trim(),
        ...(mode === "signup" ? { name, accept_terms: terms } : {}),
      });
      dispatch(sessionStarted(res.data));
      navigate("/parent/dashboard", { replace: true });
    } catch (err) {
      toast.error(messageOf(err, t("phoneAuth.verifyFailed")));
    } finally {
      setBusy(false);
    }
  };

  if (step === "phone") {
    return (
      <form onSubmit={sendCode} className="space-y-5">
        <div>
          <label htmlFor="pa-phone" className={label}>{t("phoneAuth.phone")}</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" size={18} aria-hidden="true" />
            <input
              id="pa-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              placeholder="0712 345 678"
              className={field}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1.5 ml-1">{t("phoneAuth.hint")}</p>
        </div>
        <button
          type="submit"
          disabled={busy || phone.trim().length < 9}
          className="w-full bg-purple-700 hover:bg-purple-800 text-white font-black py-4 rounded-2xl shadow-lg shadow-purple-200 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {busy ? <Loader2 className="animate-spin" size={20} /> : t("phoneAuth.sendCode")}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verify} className="space-y-5">
      <p className="text-sm text-slate-600">{t("phoneAuth.enterCode", { phone })}</p>
      <div>
        <label htmlFor="pa-code" className={label}>{t("phoneAuth.code")}</label>
        <div className="relative">
          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" size={18} aria-hidden="true" />
          <input
            id="pa-code"
            autoFocus
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="\d{6}"
            placeholder="123456"
            className={`${field} tracking-[0.4em] text-lg`}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
        </div>
      </div>

      {mode === "signup" && (
        <>
          <div>
            <label htmlFor="pa-name" className={label}>{t("phoneAuth.name")}</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" size={18} aria-hidden="true" />
              <input id="pa-name" required minLength={2} autoComplete="name" className={field} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <label className="flex items-start gap-3 text-sm text-slate-600">
            <input type="checkbox" className="mt-1 h-5 w-5" checked={terms} onChange={(e) => setTerms(e.target.checked)} required />
            <span>
              {t("phoneAuth.acceptPrefix")} <Link to="/legal" target="_blank" className="text-purple-700 font-bold underline">{t("phoneAuth.terms")}</Link>
            </span>
          </label>
        </>
      )}

      <button
        type="submit"
        disabled={busy || code.length !== 6 || (mode === "signup" && (!terms || name.trim().length < 2))}
        className="w-full bg-purple-700 hover:bg-purple-800 text-white font-black py-4 rounded-2xl shadow-lg shadow-purple-200 flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {busy ? <Loader2 className="animate-spin" size={20} /> : mode === "signup" ? t("phoneAuth.createAccount") : t("phoneAuth.signIn")}
      </button>

      <div className="flex justify-between text-sm">
        <button type="button" className="text-slate-500 font-bold" onClick={() => { setStep("phone"); setCode(""); }}>
          {t("phoneAuth.changeNumber")}
        </button>
        <button type="button" disabled={wait > 0 || busy} className="text-purple-700 font-bold disabled:text-slate-400" onClick={() => sendCode()}>
          {wait > 0 ? t("phoneAuth.resendIn", { s: wait }) : t("phoneAuth.resend")}
        </button>
      </div>
    </form>
  );
};

export default PhoneAuth;
