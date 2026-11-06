import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Download, Loader2, Trash2, ShieldAlert } from "lucide-react";
import api from "../../api/api";
import { useAppDispatch } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";

/** Download everything we hold about this parent and their children, or delete the account for good. */
const AccountDataCard = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<"export" | "delete" | null>(null);
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState("");

  const errMsg = (e: unknown) => (e as { response?: { data?: { message?: string } } }).response?.data?.message ?? t("common.somethingWrong");

  const download = async () => {
    setBusy("export");
    try {
      const res = await api.get("/auth/me/export", { responseType: "blob" });
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "akili-my-data.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    setBusy("delete");
    try {
      await api.delete("/auth/me", { data: { confirm: "DELETE" } });
      toast.success(t("account.deleted"));
      await dispatch(logout());
      navigate("/", { replace: true });
    } catch (e) {
      toast.error(errMsg(e));
      setBusy(null);
    }
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 mt-6" aria-labelledby="acc-data-title">
      <h2 id="acc-data-title" className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <ShieldAlert size={20} className="text-purple-600" aria-hidden="true" /> {t("account.dataTitle")}
      </h2>
      <p className="text-sm text-gray-600 mt-1 mb-4">{t("account.dataHelp")}</p>
      <div className="flex flex-wrap gap-3">
        <button onClick={download} disabled={busy !== null} className="px-4 py-2.5 rounded-xl border-2 border-purple-200 text-purple-800 font-bold text-sm flex items-center gap-2 disabled:opacity-50">
          {busy === "export" ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />} {t("account.download")}
        </button>
        {!open && (
          <button onClick={() => setOpen(true)} className="px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-bold text-sm flex items-center gap-2">
            <Trash2 size={16} /> {t("account.delete")}
          </button>
        )}
      </div>
      {open && (
        <div className="mt-4 border-2 border-red-200 bg-red-50 rounded-2xl p-4">
          <p className="text-sm text-red-800 font-bold mb-2">{t("account.deleteWarning")}</p>
          <label htmlFor="acc-del" className="block text-xs font-black uppercase tracking-wider text-red-900 mb-1">{t("account.typeDelete")}</label>
          <input id="acc-del" value={word} onChange={(e) => setWord(e.target.value)} autoComplete="off" className="border-2 border-red-200 rounded-xl px-3 py-2 bg-white outline-none mb-3" />
          <div className="flex gap-2">
            <button disabled={word !== "DELETE" || busy === "delete"} onClick={remove} className="px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm disabled:opacity-50">
              {busy === "delete" ? <Loader2 className="animate-spin" size={16} /> : t("account.deleteForever")}
            </button>
            <button onClick={() => { setOpen(false); setWord(""); }} className="px-4 py-2.5 rounded-xl text-slate-600 font-bold text-sm">{t("common.cancel")}</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default AccountDataCard;
