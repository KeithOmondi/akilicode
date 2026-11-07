import { useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, Pencil, Check, X } from "lucide-react";
import api from "../../api/api";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { userUpdated } from "../../store/slices/authSlice";
import AccountDataCard from "../../components/parent/AccountDataCard";

const errMsg = (e: unknown, fallback: string) =>
  (e as { response?: { data?: { message?: string } } }).response?.data?.message ?? fallback;

/** Only things that really work live here: change your name, change your password, download or delete your data. */
const ParentSettings = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [savingName, setSavingName] = useState(false);

  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const saveName = async () => {
    setSavingName(true);
    try {
      const res = await api.patch("/auth/me", { name });
      dispatch(userUpdated({ name: res.data.data.user.name }));
      toast.success("Your name has been updated.");
      setEditing(false);
    } catch (e) {
      toast.error(errMsg(e, "Could not save your name."));
    } finally {
      setSavingName(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) return toast.error("The new passwords do not match.");
    setSavingPw(true);
    try {
      await api.patch("/auth/update-password", { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success("Password changed.");
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (e2) {
      toast.error(errMsg(e2, "Could not change the password. Check your current password."));
    } finally {
      setSavingPw(false);
    }
  };

  if (!user) return null;
  const hasPassword = Boolean(user.email); // phone-only parents sign in with an SMS code, so they have no password

  return (
    <div className="max-w-3xl mx-auto py-6 px-1 sm:px-4">
      <h1 className="text-2xl font-extrabold text-ink-900">Settings</h1>
      <p className="text-ink-700 mt-1 mb-6">Your account, your password and your data.</p>

      <section className="bg-white rounded-2xl border border-ink-200 p-6" aria-labelledby="prof-title">
        <div className="flex items-center justify-between">
          <h2 id="prof-title" className="text-lg font-bold text-ink-900">Your details</h2>
          {!editing && (
            <button className="ds-btn ds-btn-secondary ds-btn-sm" onClick={() => { setName(user.name); setEditing(true); }}>
              <Pencil size={14} /> Edit name
            </button>
          )}
        </div>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-sm font-semibold text-ink-500">Name</dt>
            {editing ? (
              <div className="mt-1 flex gap-2">
                <input className="adm-input flex-1" value={name} onChange={(e) => setName(e.target.value)} aria-label="Your name" autoFocus />
                <button className="ds-btn ds-btn-primary ds-btn-sm" disabled={savingName || name.trim().length < 2} onClick={saveName}>
                  {savingName ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />} Save
                </button>
                <button className="ds-btn ds-btn-ghost ds-btn-sm" onClick={() => setEditing(false)} aria-label="Cancel"><X size={14} /></button>
              </div>
            ) : (
              <dd className="font-semibold text-ink-900">{user.name}</dd>
            )}
          </div>
          <div><dt className="text-sm font-semibold text-ink-500">Email</dt><dd className="text-ink-900">{user.email || "Not added"}</dd></div>
          <div><dt className="text-sm font-semibold text-ink-500">Phone</dt><dd className="text-ink-900">{user.phone || "Not added"}</dd></div>
        </dl>
        <p className="mt-4 text-sm text-ink-500">Your email and phone are how you sign in, so they cannot be changed here. Message us if you need to change them.</p>
      </section>

      {hasPassword && (
        <form onSubmit={savePassword} className="bg-white rounded-2xl border border-ink-200 p-6 mt-6" aria-labelledby="pw-title">
          <h2 id="pw-title" className="text-lg font-bold text-ink-900">Change password</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {([["currentPassword", "Current password", "current-password"], ["newPassword", "New password", "new-password"], ["confirm", "Repeat new password", "new-password"]] as const).map(([key, label, ac]) => (
              <label key={key} className="block text-sm font-semibold text-ink-700">
                {label}
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete={ac}
                  required
                  className="adm-input w-full mt-1"
                  value={pw[key]}
                  onChange={(e) => setPw({ ...pw, [key]: e.target.value })}
                />
              </label>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <button type="button" className="text-sm font-semibold text-ink-700 inline-flex items-center gap-1.5" onClick={() => setShowPw(!showPw)}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />} {showPw ? "Hide" : "Show"} passwords
            </button>
            <button className="ds-btn ds-btn-primary ds-btn-sm" disabled={savingPw}>
              {savingPw && <Loader2 className="animate-spin" size={14} />} Change password
            </button>
          </div>
        </form>
      )}

      <AccountDataCard />
    </div>
  );
};

export default ParentSettings;
