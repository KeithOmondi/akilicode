import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Trophy, Star, Flame, TrendingUp } from "lucide-react";
import api from "../../api/api";
import { avatarOf } from "../../lib/avatars";

/**
 * "My best" first: a child is only ever compared with their own past.
 * A friends ranking appears ONLY if their parent switched it on, and then shows nicknames only.
 */
interface Entry { rank: number; name: string; avatar: string | null; total_points: number; is_me: boolean }
interface Data {
  opted_in: boolean;
  personal_best: { total_points: number; streak_days: number; this_week_points: number; best_week_points: number; is_best_week: boolean };
  leaderboard: Entry[];
}

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <div className="bg-white rounded-2xl border-2 border-purple-100 p-5 text-center">
    <div className="mx-auto w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2" aria-hidden="true">{icon}</div>
    <div className="text-3xl font-black text-purple-900">{value}</div>
    <div className="text-sm font-bold text-slate-500">{label}</div>
  </div>
);

const KidLeaderboard = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<Data | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api.get<{ data: Data }>("/kids/leaderboard").then((r) => setData(r.data.data)).catch(() => setFailed(true));
  }, []);

  if (failed) return <p role="alert" className="text-center py-20 text-red-600 font-bold">{t("common.somethingWrong")}</p>;
  if (!data) {
    return <div className="flex justify-center py-20" role="status"><Loader2 className="animate-spin text-purple-500" size={32} /></div>;
  }

  const pb = data.personal_best;
  const toBeat = Math.max(0, pb.best_week_points - pb.this_week_points);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black font-serif text-purple-900 mb-1">
        {t("best.title1")} <span className="text-orange-500">{t("best.title2")}</span>
      </h1>
      <p className="text-slate-500 mb-6">{t("best.subtitle")}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Stat icon={<Star size={20} />} label={t("best.points")} value={pb.total_points.toLocaleString()} />
        <Stat icon={<Flame size={20} />} label={t("best.streak")} value={pb.streak_days} />
        <Stat icon={<TrendingUp size={20} />} label={t("best.thisWeek")} value={pb.this_week_points} />
        <Stat icon={<Trophy size={20} />} label={t("best.bestWeek")} value={pb.best_week_points} />
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-orange-500 text-white p-5 font-bold text-lg mb-8">
        {pb.is_best_week
          ? t("best.isBest")
          : pb.best_week_points === 0
            ? t("best.startNow")
            : t("best.toBeat", { n: toBeat })}
      </div>

      {data.opted_in && data.leaderboard.length > 0 && (
        <section aria-labelledby="friends-title">
          <h2 id="friends-title" className="text-xl font-black text-purple-900 mb-3">{t("best.friends")}</h2>
          <ol className="space-y-2">
            {data.leaderboard.map((e) => (
              <li key={e.rank} className={`flex items-center gap-3 rounded-2xl p-3 border-2 ${e.is_me ? "border-orange-300 bg-orange-50" : "border-purple-100 bg-white"}`}>
                <span className="w-8 text-center font-black text-purple-700">{e.rank}</span>
                <span className="text-3xl" aria-hidden="true">{avatarOf(e, e.rank)}</span>
                <span className="flex-1 font-bold text-purple-900 truncate">{e.name}{e.is_me ? ` (${t("best.you")})` : ""}</span>
                <span className="font-black text-orange-600">{e.total_points.toLocaleString()}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
      {!data.opted_in && <p className="text-sm text-slate-400 text-center">{t("best.askParent")}</p>}
    </div>
  );
};

export default KidLeaderboard;
