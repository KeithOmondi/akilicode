import { useEffect } from "react";
import { Lock } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getAchievements } from "../../store/slices/kidLearningSlice";
import type { Achievement } from "../../interfaces/kidLearning.interface";

const Icon = ({ badge, dim }: { badge: Achievement; dim?: boolean }) =>
  badge.icon?.startsWith("http") ? (
    <img src={badge.icon} alt="" className={`w-16 h-16 mx-auto object-contain ${dim ? "grayscale opacity-40" : ""}`} />
  ) : (
    <span className={`text-6xl block leading-none ${dim ? "grayscale opacity-40" : ""}`} aria-hidden="true">{badge.icon || "🏆"}</span>
  );

const KidBadges = () => {
  const dispatch = useAppDispatch();
  const { achievements, loading, error } = useAppSelector((s) => s.kidLearning);

  useEffect(() => {
    dispatch(getAchievements());
  }, [dispatch]);

  const earned = achievements.filter((b) => b.earned);
  const locked = achievements.filter((b) => !b.earned);

  return (
    <div>
      <h1 className="text-3xl font-black text-brand-900">My badges</h1>
      <p className="text-slate-600 font-bold mt-1 mb-6">
        {achievements.length > 0 ? `You have ${earned.length} of ${achievements.length}. Keep going!` : "Win badges by finishing lessons."}
      </p>

      {error && achievements.length === 0 ? (
        <div role="alert" className="kid-card p-8 text-center">
          <p className="font-bold text-slate-600 mb-3">Oops, we couldn’t load your badges.</p>
          <button className="ds-btn ds-btn-primary" onClick={() => dispatch(getAchievements())}>Try again</button>
        </div>
      ) : loading && achievements.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" role="status" aria-label="Loading your badges">
          {[0, 1, 2, 3].map((i) => <div key={i} className="animate-pulse bg-brand-100/70 rounded-3xl h-40" />)}
        </div>
      ) : (
        <>
          {earned.length === 0 ? (
            <div className="kid-card p-8 text-center mb-8">
              <p className="text-5xl grayscale opacity-60" aria-hidden="true">🏅</p>
              <p className="font-black text-brand-900 text-lg mt-2">No badges yet</p>
              <p className="text-slate-600 font-bold">Finish a lesson to win your first one!</p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {earned.map((b) => (
                <li key={b.name} className="kid-card kid-pop p-5 text-center">
                  <Icon badge={b} />
                  <p className="mt-2 font-black text-brand-900 leading-tight">{b.name}</p>
                  <p className="text-xs font-black text-emerald-600 mt-1">You got it! ✓</p>
                </li>
              ))}
            </ul>
          )}

          {locked.length > 0 && (
            <section aria-labelledby="next-badges">
              <h2 id="next-badges" className="text-xl font-black text-brand-900 mb-3">Coming up</h2>
              <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {locked.map((b) => (
                  <li key={b.name} className="rounded-3xl border-2 border-dashed border-brand-200 bg-white/60 p-5 text-center">
                    <Icon badge={b} dim />
                    <p className="mt-2 font-black text-slate-500 leading-tight">{b.name}</p>
                    <p className="text-xs font-black text-brand-600 mt-1 flex items-center justify-center gap-1">
                      <Lock size={12} aria-hidden="true" />
                      {b.needed ? `${b.needed} more ${b.needed === 1 ? "lesson" : "lessons"}` : "Locked"}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default KidBadges;
