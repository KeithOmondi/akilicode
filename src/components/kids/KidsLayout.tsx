import { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Award, BookOpen, CalendarDays, ClipboardList, Code2, Flame, Home, LogOut, Star, Trophy } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutKid } from "../../store/slices/kidSlice";
import { getDashboardStats } from "../../store/slices/kidLearningSlice";
import { avatarOf } from "../../lib/avatars";
import ScreenTimeGuard from "./ScreenTimeGuard";

/**
 * The shell around every kid screen.
 *  - phone:   slim top bar + big bottom tab bar (thumb-friendly, like a game)
 *  - desktop: the same tabs as a slim rail on the left
 *  - lessons: no chrome at all (the lesson page is full-screen so nothing distracts)
 * Only 5 places to go on a phone, each with a big icon and one word.
 */
const NAV = [
  { to: "/kid/dashboard", label: "Home", icon: Home },
  { to: "/kid/my-courses", label: "Learn", icon: BookOpen },
  { to: "/kid/assignments", label: "Tasks", icon: ClipboardList },
  { to: "/kid/make", label: "Make", icon: Code2 },
  { to: "/kid/badges", label: "Badges", icon: Award },
] as const;

/** Reached from the desktop rail and from the links at the bottom of Home. */
const NAV_MORE = [
  { to: "/kid/leaderboard", label: "My Best", icon: Trophy },
  { to: "/kid/calendar", label: "Calendar", icon: CalendarDays },
] as const;

const KidsLayout = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const { currentKid, loading } = useAppSelector((s) => s.kid);
  const stats = useAppSelector((s) => s.kidLearning.dashboardStats);

  useEffect(() => {
    if (!loading && !currentKid) navigate("/kid/login");
  }, [currentKid, loading, navigate]);

  useEffect(() => {
    if (currentKid) dispatch(getDashboardStats());
  }, [currentKid, dispatch]);

  const leave = () => {
    dispatch(logoutKid());
    navigate("/kid/login", { replace: true });
  };

  if (loading) {
    return (
      <div data-mood="kid" className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="text-center" role="status">
          <div className="text-6xl animate-bounce" aria-hidden="true">🚀</div>
          <p className="mt-3 text-brand-700 font-black text-lg">Getting ready…</p>
        </div>
      </div>
    );
  }
  if (!currentKid) return null;

  // Lessons use the whole screen.
  if (pathname.startsWith("/kid/course/")) {
    return (
      <div data-mood="kid" className="bg-canvas min-h-screen">
        <ScreenTimeGuard />
        {children || <Outlet />}
      </div>
    );
  }

  const points = stats?.stats.total_points ?? 0;
  const streak = stats?.stats.streak_days ?? 0;

  return (
    <div data-mood="kid" className="min-h-screen bg-canvas text-ink-900">
      <a href="#kid-main" className="skip-link">Skip to main content</a>
      <ScreenTimeGuard />

      {/* top bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b-2 border-brand-100 lg:pl-24">
        <div className="max-w-5xl mx-auto h-16 px-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-brand-100 flex items-center justify-center text-2xl shrink-0" aria-hidden="true">
            {avatarOf(currentKid)}
          </div>
          <p className="font-black text-brand-900 text-lg truncate flex-1">Hi, {currentKid.name}!</p>

          <div className="flex items-center gap-2" aria-label="Your progress">
            <span className="flex items-center gap-1.5 bg-orange-100 text-orange-700 font-black rounded-full px-3 h-9" title="Days in a row">
              <Flame size={18} aria-hidden="true" /> {streak}
              <span className="sr-only">day streak</span>
            </span>
            <span className="flex items-center gap-1.5 bg-yellow-100 text-yellow-800 font-black rounded-full px-3 h-9" title="Your points">
              <Star size={18} className="fill-yellow-400 text-yellow-500" aria-hidden="true" /> {points.toLocaleString()}
              <span className="sr-only">points</span>
            </span>
          </div>
          <button
            onClick={leave}
            aria-label="Say goodbye and log out"
            className="w-11 h-11 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* desktop rail */}
      <nav aria-label="Main" className="hidden lg:flex fixed left-0 top-0 bottom-0 w-24 flex-col items-center gap-2 pt-24 bg-white border-r-2 border-brand-100 z-20">
        {[...NAV, ...NAV_MORE].map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `w-20 py-3 rounded-2xl flex flex-col items-center gap-1 font-black text-xs transition-colors ${
                isActive ? "bg-brand-600 text-white shadow-md" : "text-slate-500 hover:bg-brand-50 hover:text-brand-700"
              }`
            }
          >
            <Icon size={26} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <main id="kid-main" className="lg:pl-24 pb-28 lg:pb-10">
        <div className="max-w-5xl mx-auto px-4 py-6">{children || <Outlet />}</div>
      </main>

      {/* phone tab bar */}
      <nav aria-label="Main" className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t-2 border-brand-100 safe-bottom pt-2">
        <ul className="max-w-md mx-auto grid grid-cols-5 gap-1 px-2">
          {NAV.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 py-1.5 rounded-2xl font-black text-[11px] min-h-[56px] justify-center transition-colors ${
                    isActive ? "bg-brand-100 text-brand-700" : "text-slate-500"
                  }`
                }
              >
                <Icon size={24} aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default KidsLayout;
