import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutKid } from "../../store/slices/kidSlice";
import {
  getMyCourses,
  getDashboardStats,
  getLeaderboard,
  getAchievements,
} from "../../store/slices/kidLearningSlice";
import { BookOpen, Gamepad2, Trophy, Star, Clock, LogOut, Sparkles, Medal, Flame } from "lucide-react";

const KidDashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { currentKid } = useAppSelector((state) => state.kid);
  const { courses, dashboardStats, leaderboard, achievements, loading } = useAppSelector(
    (state) => state.kidLearning
  );

  useEffect(() => {
    if (!currentKid) return;
    dispatch(getMyCourses());
    dispatch(getDashboardStats());
    dispatch(getLeaderboard(10));
    dispatch(getAchievements());
  }, [currentKid, dispatch]);

  const handleLogout = () => {
    dispatch(logoutKid());
    navigate("/");
  };

  if (!currentKid) return null;

  // All values from the nested stats/kid objects — no hardcoding
  const kidPoints   = dashboardStats?.stats.total_points ?? 0;
  const kidLevel    = dashboardStats?.stats.level ?? 1;
  const streakDays  = dashboardStats?.stats.streak_days ?? 0;
  //const hoursLearned = dashboardStats?.stats.completed_lessons ?? 0; // proxy until backend adds hours
  const totalBadges = achievements.filter((a) => a.earned).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-orange-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-orange-500 rounded-xl flex items-center justify-center">
              <Gamepad2 size={20} className="text-white" />
            </div>
            <span className="font-black text-purple-900 uppercase tracking-tight">AkiliCode</span>
          </div>
          <div className="flex items-center gap-4">
            {streakDays > 0 && (
              <div className="flex items-center gap-1 bg-orange-100 px-3 py-1.5 rounded-full">
                <Flame size={14} className="text-orange-500" />
                <span className="text-sm font-bold text-orange-700">{streakDays}d streak</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-purple-100 px-3 py-1.5 rounded-full">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-bold text-purple-800">Level {kidLevel}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 rounded-full transition-colors group"
              title="Logout"
            >
              <LogOut size={18} className="text-purple-600 group-hover:text-red-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-orange-500 text-white px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl shadow-inner border border-white/30">
              {dashboardStats?.kid.avatar
                ? <img src={dashboardStats.kid.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
                : currentKid.name?.[0]?.toUpperCase() || "👧"
              }
            </div>
            <div>
              <h1 className="text-2xl font-bold">Hey, {currentKid.name}! 👋</h1>
              <p className="text-purple-100 flex items-center gap-1">
                <Sparkles size={14} />
                Ready for your coding adventure today?
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <BookOpen size={20} />, label: "Courses",       value: dashboardStats?.stats.total_courses ?? courses.length, color: "purple" },
            { icon: <Trophy  size={20} />, label: "Badges",         value: totalBadges,                                           color: "orange" },
            { icon: <Star    size={20} />, label: "Points",         value: kidPoints.toLocaleString(),                            color: "yellow" },
            { icon: <Clock   size={20} />, label: "Lessons Done",   value: dashboardStats?.stats.completed_lessons ?? 0,          color: "blue"   },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 text-center shadow-md border border-purple-100 transform transition hover:scale-105"
            >
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center mx-auto mb-2 text-${stat.color}-600`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-black text-gray-800">{stat.value}</div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* My Courses */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
            <BookOpen size={20} />
            My Courses
          </h2>

          {loading && courses.length === 0 ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-600" />
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-purple-100">
              <p className="text-gray-500">No courses yet! Ask your parent to enroll you.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {courses.map((course) => {
                // progress is 0–100 from the interface
                const pct = course.progress ?? 0;
                return (
                  <div
                    key={course.enrollment_id}
                    className="bg-white rounded-2xl p-5 border-2 border-purple-100 hover:border-orange-300 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
                    onClick={() => navigate(`/kid/course/${course.enrollment_id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BookOpen size={24} className="text-purple-600" />
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">
                        {course.status}
                      </span>
                    </div>
                    {/* interface field is 'name', not 'title' */}
                    <h3 className="font-bold text-gray-800 mb-1 group-hover:text-purple-700">{course.name}</h3>
                    <p className="text-xs text-gray-500 mb-1 font-medium">
                      {course.completed_lessons} / {course.total_lessons} lessons
                    </p>
                    <p className="text-xs text-gray-400 mb-3">Progress: {pct}%</p>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-orange-500 rounded-full transition-all duration-1000"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Achievements — only show earned ones */}
        {achievements.some((a) => a.earned) && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
              <Medal size={20} />
              My Badges
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {achievements
                .filter((badge) => badge.earned)
                .map((badge, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-4 text-center shadow-md border border-purple-100 flex flex-col items-center gap-2"
                  >
                    {badge.icon ? (
                      // icon is a string — could be an emoji or a URL; render both gracefully
                      badge.icon.startsWith("http") ? (
                        <img src={badge.icon} alt={badge.name} className="w-12 h-12 object-contain" />
                      ) : (
                        <span className="text-4xl">{badge.icon}</span>
                      )
                    ) : (
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Trophy size={24} className="text-yellow-500" />
                      </div>
                    )}
                    <p className="text-xs font-bold text-gray-700 text-center leading-tight">{badge.name}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
              <Trophy size={20} />
              Leaderboard
            </h2>
            <div className="bg-white rounded-2xl border border-purple-100 shadow-md overflow-hidden">
              {leaderboard.map((entry, idx) => {
                const isMe = entry.id === currentKid.id;
                // Use entry.rank if provided, else fall back to idx+1
                const rank = entry.rank ?? idx + 1;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 px-5 py-3 border-b border-gray-50 last:border-0 ${
                      isMe ? "bg-purple-50" : ""
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                        rank === 1
                          ? "bg-yellow-400 text-white"
                          : rank === 2
                          ? "bg-gray-300 text-white"
                          : rank === 3
                          ? "bg-orange-400 text-white"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {entry.name}
                        {isMe && (
                          <span className="ml-2 text-purple-500 text-xs font-bold">(You)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">{entry.lessons_completed} lessons · {entry.streak_days}d streak</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold text-gray-700">{entry.total_points.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default KidDashboard;