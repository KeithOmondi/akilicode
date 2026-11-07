import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Clock, Download, KeyRound, Loader2, ShieldCheck, Trash2, Trophy, Layers } from "lucide-react";
import { AGE_GROUPS, groupById } from "../../lib/ageGroups";
import api from "../../api/api";
import { useAppDispatch } from "../../store/hooks";
import { getMyKids } from "../../store/slices/kidSlice";
import type { IKid } from "../../interfaces/kid.interface";
import { ModalOverlay } from "../shared/ModalOverlay";
import ConsentPanel, { type ConsentValue } from "./ConsentPanel";

/**
 * Everything a parent controls about ONE child, in one place:
 * PIN · daily screen time and breaks · leaderboard visibility · consent · download or delete all data.
 * Sensitive actions ask the parent to confirm it is them (handled centrally in api/api.ts).
 */
const messageOf = (e: unknown, fallback: string) =>
  (e as { response?: { data?: { message?: string } } }).response?.data?.message ?? fallback;

const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <section className="border-t border-purple-50 pt-5 first:border-0 first:pt-0">
    <h3 className="flex items-center gap-2 font-black text-purple-900 mb-3">{icon}{title}</h3>
    {children}
  </section>
);

const btn = "px-4 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50";

interface Today {
  limit_minutes: number | null;
  used_seconds: number;
}

const ChildSettingsModal = ({ kid, onClose }: { kid: IKid; onClose: () => void }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [busy, setBusy] = useState<string | null>(null);
  const run = useCallback(
    async (key: string, fn: () => Promise<void>) => {
      setBusy(key);
      try { await fn(); } catch (e) { if ((e as Error).message !== "cancelled") toast.error(messageOf(e, t("common.somethingWrong"))); } finally { setBusy(null); }
    },
    [t],
  );
  const refresh = () => dispatch(getMyKids());

  // ── PIN ──
  const [pin, setPin] = useState("");
  const savePin = () => run("pin", async () => {
    await api.put(`/kids/${kid.id}/pin`, { pin });
    toast.success(t("child.pinSaved"));
    setPin("");
    refresh();
  });

  // ── screen time ──
  const [limit, setLimit] = useState<string>(kid.screen_time_daily_minutes != null ? String(kid.screen_time_daily_minutes) : "");
  const [breakEvery, setBreakEvery] = useState<number>(kid.break_every_minutes ?? 30);
  const [today, setToday] = useState<Today | null>(null);
  useEffect(() => {
    api.get<{ data: { today: Today } }>(`/kids/${kid.id}/screen-time`).then((r) => setToday(r.data.data.today)).catch(() => undefined);
  }, [kid.id]);
  const saveTime = () => run("time", async () => {
    await api.put(`/kids/${kid.id}/screen-time`, {
      daily_limit_minutes: limit === "" ? null : Math.min(1440, Math.max(0, Number(limit))),
      break_every_minutes: breakEvery,
    });
    toast.success(t("child.timeSaved"));
    refresh();
  });

  // ── leaderboard ──
  const [lb, setLb] = useState(!!kid.leaderboard_opt_in);
  const saveLb = (v: boolean) => run("lb", async () => {
    await api.put(`/kids/${kid.id}/leaderboard`, { opt_in: v });
    setLb(v);
    refresh();
  });

  // ── consent ──
  const [consent, setConsent] = useState<ConsentValue | null>(null);
  const acceptConsent = () => run("consent", async () => {
    await api.post(`/kids/${kid.id}/consent`, { consent });
    toast.success(t("child.consentSaved"));
    refresh();
  });

  // ── export / delete ──
  const download = () => run("export", async () => {
    const res = await api.get(`/kids/${kid.id}/export`, { responseType: "blob" });
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `akili-${kid.name.toLowerCase().replace(/\W+/g, "-")}-data.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
  const [group, setGroup] = useState<string>(kid.age_group ?? "");
  const saveGroup = () => run("group", async () => {
    await api.patch(`/kids/${kid.id}`, { age_group: group });
    await dispatch(getMyKids());
    toast.success("Learning group saved. Their lessons now match it.");
  });
  const [confirmName, setConfirmName] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const remove = () => run("delete", async () => {
    await api.delete(`/kids/${kid.id}`, { data: { confirm_name: confirmName } });
    toast.success(t("child.deleted"));
    await refresh();
    onClose();
  });

  const usedMin = today ? Math.round(today.used_seconds / 60) : null;

  return (
    <ModalOverlay onClose={onClose} title={t("child.settingsTitle", { name: kid.name })} subtitle={t("child.settingsSubtitle")}>
      <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
        {kid.needs_consent && (
          <Section icon={<ShieldCheck size={18} />} title={t("child.consentNeeded")}>
            <ConsentPanel onChange={setConsent} />
            <button disabled={!consent || busy === "consent"} onClick={acceptConsent} className={`${btn} mt-3 bg-purple-700 text-white`}>
              {busy === "consent" ? <Loader2 className="animate-spin" size={16} /> : t("child.acceptConsent")}
            </button>
          </Section>
        )}

        <Section icon={<Layers size={18} />} title="Learning group">
          <p className="text-sm text-gray-600 mb-3">The lessons {kid.name} sees depend on this group. {groupById(group)?.start}</p>
          <div className="flex flex-wrap gap-2 items-center">
            <label className="sr-only" htmlFor="child-group">Learning group</label>
            <select id="child-group" value={group} onChange={(e) => setGroup(e.target.value)} className="border-2 border-purple-100 rounded-xl px-3 py-2.5 bg-white font-semibold text-sm">
              {AGE_GROUPS.map((g) => <option key={g.id} value={g.id}>{g.emoji} Ages {g.range} · {g.name}</option>)}
            </select>
            <button className={`${btn} bg-purple-600 text-white`} onClick={saveGroup} disabled={busy !== null || !group || group === kid.age_group}>
              {busy === "group" ? <Loader2 className="animate-spin" size={16} /> : "Save"}
            </button>
          </div>
        </Section>

        <Section icon={<KeyRound size={18} />} title={t("child.pinTitle")}>
          {kid.pin_reset_required && <p className="bg-orange-50 text-orange-800 font-bold rounded-xl p-3 mb-3 text-sm">{t("child.pinMustChange")}</p>}
          <div className="flex gap-2">
            <input
              aria-label={t("child.pinTitle")}
              inputMode="numeric" maxLength={4} type="password" autoComplete="off" placeholder="••••"
              value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="w-28 text-center tracking-[0.4em] text-lg border-2 border-purple-100 rounded-xl px-3 py-2 outline-none focus:border-orange-400"
            />
            <button disabled={pin.length !== 4 || busy === "pin"} onClick={savePin} className={`${btn} bg-purple-700 text-white`}>
              {busy === "pin" ? <Loader2 className="animate-spin" size={16} /> : t("common.save")}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">{t("child.pinHelp")}</p>
        </Section>

        <Section icon={<Clock size={18} />} title={t("child.timeTitle")}>
          {usedMin !== null && <p className="text-sm text-slate-600 mb-3">{t("child.usedToday", { min: usedMin })}</p>}
          <label className="block text-xs font-black uppercase tracking-wider text-purple-900 mb-1" htmlFor="cs-limit">{t("child.dailyLimit")}</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {[30, 60, 90, 120].map((m) => (
              <button key={m} type="button" onClick={() => setLimit(String(m))}
                className={`${btn} border-2 ${limit === String(m) ? "border-orange-400 bg-orange-50 text-orange-700" : "border-purple-100 text-purple-800"}`}>{m} min</button>
            ))}
            <button type="button" onClick={() => setLimit("")}
              className={`${btn} border-2 ${limit === "" ? "border-orange-400 bg-orange-50 text-orange-700" : "border-purple-100 text-purple-800"}`}>{t("child.noLimit")}</button>
          </div>
          <input id="cs-limit" type="number" min={0} max={1440} value={limit} onChange={(e) => setLimit(e.target.value)}
            placeholder={t("child.noLimit")} className="w-40 border-2 border-purple-100 rounded-xl px-3 py-2 outline-none focus:border-orange-400" />
          <label className="block text-xs font-black uppercase tracking-wider text-purple-900 mt-4 mb-1" htmlFor="cs-break">{t("child.breakEvery")}</label>
          <select id="cs-break" value={breakEvery} onChange={(e) => setBreakEvery(Number(e.target.value))}
            className="border-2 border-purple-100 rounded-xl px-3 py-2 bg-white">
            {[15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m} min</option>)}
          </select>
          <div><button disabled={busy === "time"} onClick={saveTime} className={`${btn} mt-4 bg-purple-700 text-white`}>
            {busy === "time" ? <Loader2 className="animate-spin" size={16} /> : t("common.save")}
          </button></div>
        </Section>

        <Section icon={<Trophy size={18} />} title={t("child.leaderboardTitle")}>
          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input type="checkbox" className="mt-0.5 h-5 w-5" checked={lb} disabled={busy === "lb"} onChange={(e) => saveLb(e.target.checked)} />
            <span>{t("child.leaderboardHelp")}</span>
          </label>
        </Section>

        <Section icon={<Download size={18} />} title={t("child.dataTitle")}>
          <p className="text-sm text-slate-600 mb-3">{t("child.dataHelp")}</p>
          <button disabled={busy === "export"} onClick={download} className={`${btn} border-2 border-purple-200 text-purple-800 mr-2`}>
            {busy === "export" ? <Loader2 className="animate-spin" size={16} /> : t("child.download")}
          </button>
          {!showDelete ? (
            <button onClick={() => setShowDelete(true)} className={`${btn} text-red-600 hover:bg-red-50`}>
              <Trash2 size={14} className="inline mr-1" />{t("child.deleteAll")}
            </button>
          ) : (
            <div className="mt-4 border-2 border-red-200 bg-red-50 rounded-2xl p-4">
              <p className="text-sm text-red-800 font-bold mb-2">{t("child.deleteWarning", { name: kid.name })}</p>
              <input aria-label={t("child.typeName")} placeholder={kid.name} value={confirmName} onChange={(e) => setConfirmName(e.target.value)}
                className="w-full border-2 border-red-200 rounded-xl px-3 py-2 mb-3 outline-none bg-white" />
              <div className="flex gap-2">
                <button disabled={confirmName.trim().toLowerCase() !== kid.name.trim().toLowerCase() || busy === "delete"} onClick={remove}
                  className={`${btn} bg-red-600 text-white`}>{busy === "delete" ? <Loader2 className="animate-spin" size={16} /> : t("child.deleteForever")}</button>
                <button onClick={() => { setShowDelete(false); setConfirmName(""); }} className={`${btn} text-slate-600`}>{t("common.cancel")}</button>
              </div>
            </div>
          )}
        </Section>
      </div>
    </ModalOverlay>
  );
};

export default ChildSettingsModal;
