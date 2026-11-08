import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, ShieldCheck, CheckCircle2, Circle, ArrowRightCircle, Clock, Flame, Loader2, Star, Trophy, Award, MessageSquare, Hourglass } from "lucide-react";
import { fetchKidProgress, type KidProgress } from "../../lib/kidProgressApi";
import { avatarOf } from "../../lib/avatars";
import { groupLabel } from "../../lib/ageGroups";

const day = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "—";
const ago = (d: string | null | undefined) => {
  if (!d) return "never";
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  return days <= 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`;
};
const minutes = (s: number) => (s < 60 ? `${s}s` : `${Math.round(s / 60)} min`);
const hours = (s: number) => (s < 3600 ? minutes(s) : `${Math.floor(s / 3600)} h ${Math.round((s % 3600) / 60)} min`);
const money = (n: string | number | null | undefined) => `KES ${Number(n ?? 0).toLocaleString("en-KE")}`;
const kindName = { notes: "Reading", coding: "Web coding", scratch: "Blocks" } as const;

const Card = ({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) => (
  <section className="bg-white border border-purple-100 rounded-2xl p-5 sm:p-6">
    <h2 className="flex items-center gap-2 text-lg font-black text-purple-900 mb-4">{icon}{title}</h2>
    {children}
  </section>
);
const Empty = ({ children }: { children: ReactNode }) => <p className="text-sm text-gray-500 font-medium">{children}</p>;
const Bar = ({ value, tone = "bg-purple-600" }: { value: number; tone?: string }) => (
  <div className="h-2.5 rounded-full bg-purple-100 overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
    <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
  </div>
);
const Tile = ({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) => (
  <div className="bg-white border border-purple-100 rounded-2xl p-4">
    <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">{label}</p>
    <p className="text-2xl font-black text-purple-900 mt-1">{value}</p>
    {hint && <p className="text-xs font-medium text-gray-500 mt-0.5">{hint}</p>}
  </div>
);

const courseState = (c: KidProgress["courses"][number]) => {
  if (c.learning_now) return c.payment_status === "trial" ? { text: "Free trial", cls: "bg-purple-100 text-purple-700" } : { text: "Learning", cls: "bg-green-100 text-green-700" };
  if (c.trial_ends_at) return { text: "Trial ended: pay to continue", cls: "bg-amber-100 text-amber-800" };
  if (c.status === "completed") return { text: "Completed", cls: "bg-blue-100 text-blue-700" };
  return { text: "Waiting for payment", cls: "bg-amber-100 text-amber-800" };
};

/** A parent's full picture of one child: level, streak, courses, work, marks, badges, activity and screen time. */
const ParentKidProgress = () => {
  const { kidId } = useParams();
  const [data, setData] = useState<KidProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [tries, setTries] = useState(0);
  const [now] = useState(() => Date.now());
  useEffect(() => {
    if (!kidId) return;
    let alive = true;
    fetchKidProgress(kidId)
      .then((d) => alive && (setData(d), setError(null)))
      .catch((e) => alive && setError((e as { response?: { data?: { message?: string } } }).response?.data?.message ?? "We could not load this page."));
    return () => {
      alive = false;
    };
  }, [kidId, tries]);
  const load = () => {
    setError(null);
    setTries((n) => n + 1);
  };

  const back = (
    <Link to="/parent/kids" className="inline-flex items-center gap-1.5 text-sm font-bold text-purple-700 hover:underline mb-4">
      <ArrowLeft size={16} aria-hidden="true" /> My Kids
    </Link>
  );

  if (error) {
    return (
      <div className="p-6 lg:p-10 max-w-5xl">
        {back}
        <div role="alert" className="bg-white border border-red-100 rounded-2xl p-8 text-center">
          <p className="font-bold text-gray-700 mb-3">{error}</p>
          <button onClick={load} className="px-4 py-2 rounded-xl bg-purple-700 text-white font-bold">Try again</button>
        </div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="p-6 lg:p-10 max-w-5xl" role="status" aria-label="Loading progress">
        {back}
        <Loader2 className="animate-spin text-purple-600" />
      </div>
    );
  }

  const { kid, level, totals, time_spent, courses, recent, quizzes, projects, hand_ins, badges, calendar, screen_time } = data;
  const activeDays = new Map(calendar.map((c) => [c.day, c]));
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now - (29 - i) * 86400000);
    const key = new Date(d.getTime() + 3 * 3600000).toISOString().slice(0, 10); // Nairobi calendar day
    return { key, entry: activeDays.get(key) };
  });
  const weekMax = Math.max(1, ...screen_time.last_7_days.map((d) => d.seconds));
  const stillNeeded = badges.filter((b) => !b.earned);
  const quizBadge = (q: { score: number; total: number }) => (q.total ? Math.round((q.score / q.total) * 100) : 0);

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-5xl space-y-5">
      <div>{back}</div>

      {/* Who */}
      <header className="bg-white border border-purple-100 rounded-2xl p-5 sm:p-6 flex flex-wrap items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center text-4xl" aria-hidden="true">{avatarOf(kid)}</div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-purple-900 truncate">{kid.name}</h1>
          <p className="text-sm font-medium text-gray-500">
            {kid.age} years{kid.age_group ? ` · ${groupLabel(kid.age_group)}` : ""}{kid.grade ? ` · ${kid.grade}` : ""} · joined {day(kid.joined)}
          </p>
          <p className="text-xs font-bold text-gray-400 mt-1">Last learned {ago(kid.last_activity_date)} · last signed in {ago(kid.last_login)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-black uppercase tracking-wider text-gray-400">Level</p>
          <p className="text-4xl font-black text-orange-500">{level.level}</p>
        </div>
      </header>

      {/* Level bar */}
      <div className="bg-white border border-purple-100 rounded-2xl p-5">
        <div className="flex justify-between text-sm font-bold text-purple-900 mb-2">
          <span>{level.points} points</span>
          <span>{level.points_to_next} more for level {level.level + 1}</span>
        </div>
        <Bar value={(level.points_in_level / level.points_per_level) * 100} tone="bg-orange-500" />
        <p className="text-xs font-medium text-gray-500 mt-2">Each lesson finished is 10 points, and every 100 points is a new level.</p>
      </div>

      {/* Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Tile label="Streak" value={<span className="inline-flex items-center gap-1"><Flame size={20} className="text-orange-500" aria-hidden="true" />{level.streak_days}</span>} hint={level.streak_days === 1 ? "day in a row" : "days in a row"} />
        <Tile label="Lessons done" value={totals.lessons_completed} hint={`${totals.lessons_this_week} in the last 7 days`} />
        <Tile label="Projects" value={totals.projects_made} hint={`${totals.projects_handed_in} handed in`} />
        <Tile label="Average mark" value={totals.average_mark === null ? "—" : `${totals.average_mark}/100`} hint={totals.average_quiz_percent === null ? "no quizzes yet" : `quizzes ${totals.average_quiz_percent}%`} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Tile label="This week" value={`${totals.lessons_this_week} lessons`} hint={`last week: ${totals.lessons_last_week}${totals.lessons_this_week > totals.lessons_last_week ? " (more!)" : ""}`} />
        <Tile label="Time learning" value={hours(time_spent.total_seconds)} hint={`${hours(time_spent.last_30_days_seconds)} in the last 30 days`} />
        <Tile label="Learning days" value={time_spent.learning_days} hint={time_spent.learning_days ? `about ${minutes(Math.round(time_spent.total_seconds / time_spent.learning_days))} a day` : "none yet"} />
        <Tile label="Quizzes" value={totals.average_quiz_percent === null ? "—" : `${totals.average_quiz_percent}%`} hint="average score" />
      </div>

      {/* Courses */}
      <Card title="Courses" icon={<BookOpen size={20} aria-hidden="true" />}>
        {courses.length === 0 ? (
          <Empty>{kid.name} is not enrolled in a course yet. <Link to="/parent/programs" className="font-bold text-purple-700 underline">Enrol {kid.name}</Link></Empty>
        ) : (
          <ul className="space-y-5">
            {courses.map((c) => {
              const st = courseState(c);
              return (
                <li key={c.enrollment_id}>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <p className="font-black text-purple-900">{c.course_name}</p>
                    <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${st.cls}`}>{st.text}</span>
                  </div>
                  <Bar value={c.progress} tone="bg-green-500" />
                  <p className="text-xs font-medium text-gray-500 mt-1.5">
                    {c.completed_lessons} of {c.total_lessons} lessons ({c.progress}%)
                    {c.next_lesson && c.progress < 100 ? ` · next: ${c.next_lesson}` : ""}
                    {c.progress >= 100 ? " · all lessons done 🎉" : ""}
                    {c.last_activity ? ` · last lesson ${ago(c.last_activity)}` : " · not started yet"}
                  </p>
                  <p className="text-xs font-medium text-gray-500 mt-1">
                    {money(c.fee_amount)} {c.billing_cycle === "once-off" ? "once-off" : c.billing_cycle ?? ""}
                    {Number(c.total_paid) > 0 ? ` · paid so far ${money(c.total_paid)}` : ""}
                    {c.next_payment_date && c.payment_status !== "trial" ? ` · next payment ${day(c.next_payment_date)}` : ""}
                    {c.last_payment_date ? ` · last paid ${day(c.last_payment_date)}` : ""}
                    {c.pay_ref ? ` · reference ${c.pay_ref}` : ""}
                  </p>
                  {c.modules.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs font-black text-purple-700 select-none">Lesson by lesson ({c.completed_lessons}/{c.total_lessons})</summary>
                      <div className="mt-2 space-y-3">
                        {c.modules.map((m, mi) => {
                          let nextShown = false;
                          return (
                            <div key={mi}>
                              <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-1">{m.module}</p>
                              <ul className="space-y-1">
                                {m.lessons.map((l, li) => {
                                  const isNext = !l.done && !nextShown;
                                  if (isNext) nextShown = true;
                                  return (
                                    <li key={li} className={`flex items-center gap-2 text-sm rounded-lg px-2 py-1.5 ${isNext ? "bg-orange-50" : ""}`}>
                                      {l.done ? <CheckCircle2 size={16} className="text-green-600 shrink-0" aria-label="Done" /> : isNext ? <ArrowRightCircle size={16} className="text-orange-500 shrink-0" aria-label="Up next" /> : <Circle size={16} className="text-gray-300 shrink-0" aria-label="Not done yet" />}
                                      <span className={`flex-1 min-w-0 truncate ${l.done ? "text-gray-800 font-semibold" : "text-gray-600"}`}>{l.title}</span>
                                      <span className="text-[10px] font-bold text-gray-400 shrink-0">{kindName[l.type] ?? ""}{l.has_assignment ? " · assignment" : ""}</span>
                                      {l.quiz && <span className="text-[10px] font-black text-purple-700 shrink-0">quiz {l.quiz.score}/{l.quiz.total}</span>}
                                      {l.done && <span className="text-[10px] font-medium text-gray-400 shrink-0 hidden sm:inline">{day(l.completed_at)}</span>}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  )}
                  {c.trial_ends_at && c.learning_now && <p className="text-xs font-bold text-purple-700 mt-1 flex items-center gap-1"><Hourglass size={12} aria-hidden="true" /> Free trial ends {day(c.trial_ends_at)}</p>}
                  {!c.learning_now && c.status !== "completed" && <Link to="/parent/programs" className="inline-block mt-1.5 text-xs font-black text-orange-700 underline">Go to payments</Link>}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent lessons */}
        <Card title="Recently finished" icon={<Star size={20} aria-hidden="true" />}>
          {recent.length === 0 ? (
            <Empty>No lessons finished yet.</Empty>
          ) : (
            <ul className="divide-y divide-purple-50">
              {recent.map((r, i) => (
                <li key={i} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 truncate">{r.lesson}</p>
                    <p className="text-xs text-gray-500 font-medium truncate">{r.course_name ?? ""} · {day(r.completed_at)}</p>
                  </div>
                  <span className="text-xs font-black text-orange-600 shrink-0">+{r.points_earned}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Quizzes */}
        <Card title="Quiz results" icon={<Award size={20} aria-hidden="true" />}>
          {quizzes.length === 0 ? (
            <Empty>No quizzes taken yet. A lesson is finished by passing its quiz (70%).</Empty>
          ) : (
            <ul className="divide-y divide-purple-50">
              {quizzes.map((q, i) => (
                <li key={i} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 truncate">{q.lesson}</p>
                    <p className="text-xs text-gray-500 font-medium">{day(q.created_at)}</p>
                  </div>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full shrink-0 ${quizBadge(q) >= 70 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800"}`}>
                    {q.score}/{q.total} · {quizBadge(q)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Projects and marks */}
      <Card title="Projects, marks and teacher feedback" icon={<MessageSquare size={20} aria-hidden="true" />}>
        {projects.length === 0 && hand_ins.length === 0 ? (
          <Empty>No projects yet. {kid.name} can start one from “Make” in their own space.</Empty>
        ) : (
          <ul className="space-y-3">
            {projects.map((p) => (
              <li key={p.id} className="rounded-xl border border-purple-50 p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-gray-800">{p.title} <span className="text-xs font-medium text-gray-400">· {p.kind === "blocks" ? "blocks" : "web page"}{p.lesson ? ` · ${p.lesson}` : ""}</span></p>
                  {p.reviewed_at ? (
                    <span className="text-xs font-black px-2.5 py-1 rounded-full bg-green-100 text-green-700">Marked: {p.marks}/100</span>
                  ) : p.submitted_at ? (
                    <span className="text-xs font-black px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">Handed in, waiting for marks</span>
                  ) : (
                    <span className="text-xs font-black px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">In progress</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Changed {day(p.updated_at)}{p.submitted_at ? ` · handed in ${day(p.submitted_at)}` : ""}</p>
                {p.feedback && <p className="mt-2 text-sm text-gray-700 bg-purple-50 rounded-lg px-3 py-2"><span className="font-black text-purple-800">Teacher: </span>{p.feedback}</p>}
              </li>
            ))}
            {hand_ins.map((h, i) => (
              <li key={`h${i}`} className="rounded-xl border border-purple-50 p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-gray-800">{h.lesson} <span className="text-xs font-medium text-gray-400">· assignment</span></p>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full ${h.reviewed_at ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                    {h.reviewed_at && h.marks !== null ? `Marked: ${h.marks}/100` : "Handed in, waiting for marks"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Handed in {day(h.submitted_at)}</p>
                {h.feedback && <p className="mt-2 text-sm text-gray-700 bg-purple-50 rounded-lg px-3 py-2"><span className="font-black text-purple-800">Teacher: </span>{h.feedback}</p>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Badges */}
      <Card title="Badges" icon={<Trophy size={20} aria-hidden="true" />}>
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {badges.map((b) => (
            <li key={b.name} className={`rounded-xl border p-3 text-center ${b.earned ? "border-orange-200 bg-orange-50" : "border-gray-100 bg-gray-50 opacity-70"}`}>
              <p className={`text-3xl ${b.earned ? "" : "grayscale"}`} aria-hidden="true">{b.icon}</p>
              <p className="text-xs font-black text-gray-800 mt-1">{b.name}</p>
              <p className="text-[11px] font-medium text-gray-500">{b.earned ? "Earned" : `${b.needed} more lesson${b.needed === 1 ? "" : "s"}`}</p>
            </li>
          ))}
        </ul>
        {stillNeeded.length === 0 && <p className="text-xs font-bold text-orange-700 mt-3">Every badge earned. Well done, {kid.name}!</p>}
      </Card>

      {/* Activity */}
      <Card title="Last 30 days" icon={<Flame size={20} aria-hidden="true" />}>
        <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}>
          {last30.map((d) => (
            <div
              key={d.key}
              title={`${day(d.key)}: ${d.entry ? `${d.entry.lessons_completed} lesson${d.entry.lessons_completed === 1 ? "" : "s"}, ${d.entry.points_earned} points` : "no lessons"}`}
              className={`aspect-square rounded-md ${d.entry ? (d.entry.lessons_completed >= 2 ? "bg-green-600" : "bg-green-400") : "bg-purple-100"}`}
            />
          ))}
        </div>
        <p className="text-xs font-medium text-gray-500 mt-3">
          {calendar.length === 0 ? "No learning days in the last 30 days." : `${calendar.length} learning day${calendar.length === 1 ? "" : "s"} in the last 30. Darker means more lessons that day.`}
        </p>
      </Card>

      {/* Account and safety */}
      <Card title="Account and safety" icon={<ShieldCheck size={20} aria-hidden="true" />}>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div className="flex justify-between gap-3"><dt className="text-gray-500 font-medium">Sign-in name</dt><dd className="font-bold text-gray-800">{kid.username ?? "not set up yet"}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-gray-500 font-medium">PIN</dt><dd className="font-bold text-gray-800">{kid.has_pin ? "set" : "not set"}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-gray-500 font-medium">Your consent</dt><dd className={`font-bold ${kid.consent_ok ? "text-green-700" : "text-red-700"}`}>{kid.consent_ok ? "confirmed" : "needs your confirmation"}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-gray-500 font-medium">Shown on leaderboard</dt><dd className="font-bold text-gray-800">{kid.leaderboard_opt_in ? "yes" : "no"}</dd></div>
        </dl>
        <p className="text-xs font-medium text-gray-500 mt-3">Change any of these from the “…” menu next to {kid.name} on the <Link to="/parent/kids" className="font-bold text-purple-700 underline">My Kids</Link> page.</p>
      </Card>

      {/* Screen time */}
      <Card title="Screen time" icon={<Clock size={20} aria-hidden="true" />}>
        <p className="text-sm font-bold text-gray-800">
          Today: {minutes(screen_time.today?.used_seconds ?? 0)}
          {screen_time.limit_minutes ? ` of ${screen_time.limit_minutes} min allowed${screen_time.today?.locked ? " (limit reached)" : ""}` : " (no daily limit set)"}
        </p>
        <div className="flex items-end gap-2 h-24 mt-4" aria-label="Minutes per day, last 7 days">
          {screen_time.last_7_days.length === 0 ? (
            <Empty>No time recorded this week.</Empty>
          ) : (
            screen_time.last_7_days.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                <div className="w-full rounded-t-md bg-purple-500" style={{ height: `${Math.max(6, (d.seconds / weekMax) * 100)}%` }} title={`${day(d.day)}: ${minutes(d.seconds)}`} />
                <span className="text-[10px] font-bold text-gray-400">{new Date(d.day + "T00:00:00").toLocaleDateString("en-KE", { weekday: "short" })}</span>
              </div>
            ))
          )}
        </div>
        <p className="text-xs font-medium text-gray-500 mt-3">Change the daily limit and break reminders in {kid.name}'s settings on the <Link to="/parent/kids" className="font-bold text-purple-700 underline">My Kids</Link> page.</p>
      </Card>
    </div>
  );
};

export default ParentKidProgress;
