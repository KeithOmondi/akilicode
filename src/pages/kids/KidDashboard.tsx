import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame, Star, Trophy } from "lucide-react";
import api from "../../api/api";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getAchievements, getMyCourses } from "../../store/slices/kidLearningSlice";
import type { CourseContent, KidCourse } from "../../interfaces/kidLearning.interface";
import CourseCard from "../../components/kids/CourseCard";

/**
 * Kid home. One question answered above everything else: "what do I do next?"
 * Big green button -> the next lesson. Everything else is secondary.
 */
type Mission =
  | { kind: "lesson"; enrollmentId: string; lessonId: string; lessonTitle: string; courseName: string; number: number; total: number }
  | { kind: "done" }
  | { kind: "none" };

/** Picks the course the child is furthest into (that isn't finished) and finds its first unfinished lesson. */
const useMission = (courses: KidCourse[], ready: boolean): Mission | null => {
  const [fetched, setFetched] = useState<Mission | null>(null);

  const open = useMemo(
    () => courses.filter((c) => (c.progress ?? 0) < 100).sort((x, y) => (y.progress ?? 0) - (x.progress ?? 0)),
    [courses],
  );
  // answers that need no network call
  const immediate = useMemo<Mission | null>(
    () => (!ready ? null : courses.length === 0 ? { kind: "none" } : open.length === 0 ? { kind: "done" } : null),
    [ready, courses.length, open.length],
  );
  const target = open[0];

  useEffect(() => {
    if (!ready || immediate || !target) return;
    let alive = true;
    api
      .get<{ data: CourseContent }>(`/learning/courses/${target.enrollment_id}/content`)
      .then((res) => {
        if (!alive) return;
        const lessons = res.data.data.modules.flatMap((m) => m.lessons);
        const i = lessons.findIndex((l) => !l.completed);
        setFetched(
          i === -1
            ? { kind: "done" }
            : { kind: "lesson", enrollmentId: target.enrollment_id, lessonId: lessons[i].id, lessonTitle: lessons[i].title, courseName: target.name, number: i + 1, total: lessons.length },
        );
      })
      // if the lesson list can't be loaded, still offer a way in: open the course
      .catch(() => alive && setFetched({ kind: "lesson", enrollmentId: target.enrollment_id, lessonId: "", lessonTitle: target.name, courseName: target.name, number: 0, total: 0 }));
    return () => {
      alive = false;
    };
  }, [ready, immediate, target]);

  return immediate ?? fetched;
};

const Skeleton = ({ className }: { className: string }) => <div className={`animate-pulse bg-brand-100/70 rounded-3xl ${className}`} />;

const KidDashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentKid } = useAppSelector((s) => s.kid);
  const { courses, dashboardStats, achievements = [], loading, error } = useAppSelector((s) => s.kidLearning);
  const [loadedOnce, setLoadedOnce] = useState(false);

  useEffect(() => {
    if (!currentKid) return;
    dispatch(getMyCourses()).finally(() => setLoadedOnce(true));
    dispatch(getAchievements());
  }, [currentKid, dispatch]);

  const mission = useMission(courses, loadedOnce && !loading);

  if (!currentKid) return null;

  const stats = dashboardStats?.stats;
  const earned = achievements.filter((a) => a.earned);
  const level = stats?.level ?? 1;
  const toNext = stats?.points_to_next_level ?? 0;
  const points = stats?.total_points ?? 0;
  const levelPct = toNext > 0 ? Math.round((points / (points + toNext)) * 100) : 100;
  const streak = stats?.streak_days ?? 0;

  return (
    <div className="space-y-8">
      {/* ── What's next ─────────────────────────────────────────────── */}
      <section aria-labelledby="mission-title" className="rounded-[2rem] bg-brand-600 text-white p-6 sm:p-8 shadow-[0_6px_0_var(--color-brand-900)] relative overflow-hidden">
        <div className="absolute -right-4 -top-4 text-[7rem] opacity-20 select-none" aria-hidden="true">🚀</div>
        {!mission ? (
          <div className="space-y-3 animate-pulse" role="status" aria-label="Loading your next lesson">
            <div className="h-4 w-32 bg-white/30 rounded" />
            <div className="h-8 w-3/4 bg-white/30 rounded" />
            <div className="h-16 w-full sm:w-72 bg-white/30 rounded-2xl mt-4" />
          </div>
        ) : mission.kind === "lesson" ? (
          <>
            <p className="font-black text-brand-100 uppercase tracking-widest text-xs">Your next mission</p>
            <h1 id="mission-title" className="text-2xl sm:text-3xl font-black mt-1 leading-tight">{mission.lessonTitle}</h1>
            {mission.total > 0 && <p className="text-brand-100 font-bold mt-1">{mission.courseName} · lesson {mission.number} of {mission.total}</p>}
            <button
              onClick={() => navigate(`/kid/course/${mission.enrollmentId}${mission.lessonId ? `?lesson=${mission.lessonId}` : ""}`)}
              className="ds-btn ds-btn-next mt-6 w-full sm:w-auto"
            >
              Let’s go! ▶
            </button>
          </>
        ) : mission.kind === "done" ? (
          <>
            <h1 id="mission-title" className="text-3xl font-black">You finished everything! 🎉</h1>
            <p className="text-brand-100 font-bold mt-2">Amazing work. Look at your badges, or play a lesson again.</p>
            <Link to="/kid/badges" className="ds-btn ds-btn-next mt-6 w-full sm:w-auto">See my badges</Link>
          </>
        ) : (
          <>
            <h1 id="mission-title" className="text-3xl font-black">Your adventure is waiting 🔑</h1>
            <p className="text-brand-100 font-bold mt-2">Ask your grown-up to unlock your first course. Then your missions will show up right here.</p>
          </>
        )}
      </section>

      {/* ── Three things that matter ────────────────────────────────── */}
      <section aria-label="My progress" className="grid grid-cols-3 gap-3">
        <div className="kid-card p-3 sm:p-4 text-center">
          <div className="mx-auto w-11 h-11 rounded-full bg-brand-100 flex items-center justify-center" aria-hidden="true"><Trophy size={22} className="text-brand-600" /></div>
          <p className="font-black text-brand-900 text-xl mt-1">Level {level}</p>
          <div className="h-2.5 rounded-full bg-brand-50 mt-2 overflow-hidden" role="progressbar" aria-valuenow={levelPct} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to next level">
            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${levelPct}%` }} />
          </div>
          {toNext > 0 && <p className="text-[11px] sm:text-xs font-bold text-slate-500 mt-1">{toNext} to next level</p>}
        </div>
        <div className="kid-card p-3 sm:p-4 text-center">
          <div className="mx-auto w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center" aria-hidden="true"><Flame size={22} className="text-orange-500" /></div>
          <p className="font-black text-brand-900 text-xl mt-1">{streak} {streak === 1 ? "day" : "days"}</p>
          <p className="text-[11px] sm:text-xs font-bold text-slate-500 mt-1">{streak > 0 ? "Come back tomorrow to keep it!" : "Start your streak today!"}</p>
        </div>
        <div className="kid-card p-3 sm:p-4 text-center">
          <div className="mx-auto w-11 h-11 rounded-full bg-yellow-100 flex items-center justify-center" aria-hidden="true"><Star size={22} className="text-yellow-500 fill-yellow-400" /></div>
          <p className="font-black text-brand-900 text-xl mt-1">{points.toLocaleString()}</p>
          <p className="text-[11px] sm:text-xs font-bold text-slate-500 mt-1">stars collected</p>
        </div>
      </section>

      {/* ── My courses ──────────────────────────────────────────────── */}
      <section aria-labelledby="courses-title">
        <div className="flex items-end justify-between mb-3">
          <h2 id="courses-title" className="text-xl font-black text-brand-900">My courses</h2>
          {courses.length > 2 && <Link to="/kid/my-courses" className="font-black text-brand-600 text-sm">See all</Link>}
        </div>
        {error && courses.length === 0 ? (
          <div role="alert" className="kid-card p-6 text-center">
            <p className="font-bold text-slate-600 mb-3">Oops, we couldn’t load your courses.</p>
            <button className="ds-btn ds-btn-primary" onClick={() => dispatch(getMyCourses())}>Try again</button>
          </div>
        ) : !loadedOnce || (loading && courses.length === 0) ? (
          <div className="grid grid-cols-2 gap-4"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>
        ) : courses.length === 0 ? (
          <div className="kid-card p-8 text-center">
            <p className="text-5xl mb-2" aria-hidden="true">📚</p>
            <p className="font-black text-brand-900 text-lg">No courses yet</p>
            <p className="text-slate-600 font-bold mt-1">Ask your grown-up to unlock one for you.</p>
          </div>
        ) : (
          <ul className="flex gap-4 overflow-x-auto scroll-snap-x pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible">
            {courses.slice(0, 6).map((c, i) => (
              <li key={c.enrollment_id} className="shrink-0 w-64 sm:w-auto flex">
                <CourseCard className="w-full" course={c} index={i} onOpen={() => navigate(`/kid/course/${c.enrollment_id}`)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── My badges ───────────────────────────────────────────────── */}
      <section aria-labelledby="badges-title">
        <div className="flex items-end justify-between mb-3">
          <h2 id="badges-title" className="text-xl font-black text-brand-900">My badges</h2>
          <Link to="/kid/badges" className="font-black text-brand-600 text-sm">See all</Link>
        </div>
        {earned.length === 0 ? (
          <div className="kid-card p-5 flex items-center gap-4">
            <div className="text-4xl grayscale opacity-60" aria-hidden="true">🏅</div>
            <p className="font-bold text-slate-600">Finish your first lesson to win your first badge!</p>
          </div>
        ) : (
          <ul className="flex gap-3 overflow-x-auto scroll-snap-x pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {earned.slice(0, 6).map((b) => (
              <li key={b.name} className="kid-card kid-pop shrink-0 w-28 p-3 text-center">
                {b.icon?.startsWith("http") ? <img src={b.icon} alt="" className="w-12 h-12 mx-auto object-contain" /> : <span className="text-4xl block" aria-hidden="true">{b.icon || "🏆"}</span>}
                <p className="mt-1 text-xs font-black text-brand-900 leading-tight">{b.name}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default KidDashboard;
