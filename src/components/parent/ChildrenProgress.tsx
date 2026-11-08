import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Flame } from "lucide-react";
import { fetchKidProgress, type KidProgress } from "../../lib/kidProgressApi";
import { avatarOf } from "../../lib/avatars";

/** One card per child on the dashboard: level, streak, how far through their courses, and a link to the full page. */
const ChildrenProgress = ({ kids }: { kids: { id: string; name: string; avatar?: string }[] }) => {
  const [data, setData] = useState<Record<string, KidProgress | "error">>({});

  useEffect(() => {
    let alive = true;
    kids.forEach((k) =>
      fetchKidProgress(k.id)
        .then((p) => alive && setData((d) => ({ ...d, [k.id]: p })))
        .catch(() => alive && setData((d) => ({ ...d, [k.id]: "error" })))
    );
    return () => {
      alive = false;
    };
  }, [kids]);

  if (kids.length === 0) return null;
  return (
    <section className="mb-12" aria-labelledby="kids-progress">
      <h3 id="kids-progress" className="text-2xl font-serif font-black text-slate-900 mb-1">How your children are doing</h3>
      <p className="text-sm text-slate-400 font-medium mb-5">Tap a child to see lessons, marks, badges and screen time.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {kids.map((k, i) => {
          const p = data[k.id];
          const done = p && p !== "error" ? p.courses.reduce((s, c) => s + c.completed_lessons, 0) : 0;
          const total = p && p !== "error" ? p.courses.filter((c) => c.learning_now).reduce((s, c) => s + c.total_lessons, 0) : 0;
          return (
            <Link key={k.id} to={`/parent/kids/${k.id}`} className="group bg-white border border-slate-100 rounded-2xl p-5 hover:border-purple-300 transition-colors block">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl" aria-hidden="true">{avatarOf(k, i)}</span>
                <p className="font-black text-slate-900 text-lg flex-1 truncate">{k.name}</p>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-purple-600" aria-hidden="true" />
              </div>
              {p === undefined ? (
                <div className="mt-4 h-10 animate-pulse rounded-lg bg-slate-100" role="status" aria-label="Loading" />
              ) : p === "error" ? (
                <p className="mt-4 text-sm font-medium text-slate-500">Could not load. Tap to try again.</p>
              ) : (
                <>
                  <div className="mt-4 flex items-center gap-4 text-sm font-bold text-slate-700">
                    <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">Level {p.level.level}</span>
                    <span>{p.level.points} pts</span>
                    <span className="inline-flex items-center gap-1"><Flame size={14} className="text-orange-500" aria-hidden="true" />{p.level.streak_days}</span>
                  </div>
                  <p className="mt-3 text-xs font-medium text-slate-500">
                    {p.courses.length === 0 ? "Not enrolled in a course yet" : `${done} lessons finished${total ? ` of ${total} available now` : ""}`}
                  </p>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default ChildrenProgress;
