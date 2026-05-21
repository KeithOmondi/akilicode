// src/components/kid/KidAchievement.tsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { getDashboardStats, getAchievements } from "../../store/slices/kidLearningSlice";
import { Loader2, Award, Star, Trophy, Calendar, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

const KidAchievement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { dashboardStats, achievements, loading, error } = useSelector(
    (state: RootState) => state.kidLearning
  );
  const { currentKid } = useSelector((state: RootState) => state.kid);

  useEffect(() => {
    dispatch(getDashboardStats());
    dispatch(getAchievements());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  if (loading && !dashboardStats) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  const stats = dashboardStats?.stats;
  const kidName = currentKid?.name || "Coder";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black font-serif text-purple-900">
          My <span className="text-orange-500">Achievements</span>
        </h1>
        <p className="text-gray-500 font-extrabold mt-1">
          {kidName}, here’s your progress and earned badges!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
          <div className="flex items-center justify-between mb-2">
            <Trophy size={24} className="text-yellow-500" />
            <span className="text-xs font-bold text-purple-400 uppercase">Points</span>
          </div>
          <p className="text-2xl font-black text-gray-800">{stats?.total_points?.toLocaleString() || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Level {stats?.level || 1}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
          <div className="flex items-center justify-between mb-2">
            <Star size={24} className="text-purple-500" />
            <span className="text-xs font-bold text-purple-400 uppercase">Lessons</span>
          </div>
          <p className="text-2xl font-black text-gray-800">
            {stats?.completed_lessons || 0} / {stats?.total_lessons || 0}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-orange-500 h-1.5 rounded-full"
              style={{
                width: stats?.total_lessons
                  ? ((stats.completed_lessons || 0) / stats.total_lessons) * 100 + "%"
                  : "0%",
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
          <div className="flex items-center justify-between mb-2">
            <Calendar size={24} className="text-green-500" />
            <span className="text-xs font-bold text-purple-400 uppercase">Streak</span>
          </div>
          <p className="text-2xl font-black text-gray-800">{stats?.streak_days || 0} days</p>
          <p className="text-xs text-gray-500 mt-1">Keep coding daily!</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={24} className="text-blue-500" />
            <span className="text-xs font-bold text-purple-400 uppercase">Next Level</span>
          </div>
          <p className="text-2xl font-black text-gray-800">{stats?.points_to_next_level || 100} pts</p>
          <p className="text-xs text-gray-500 mt-1">to reach Level {(stats?.level || 1) + 1}</p>
        </div>
      </div>

      {/* Badges Section */}
      <div>
        <h2 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
          <Award size={20} className="text-orange-500" />
          Badges Earned
        </h2>
        {achievements.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-purple-200">
            <Award size={48} className="mx-auto text-purple-200 mb-3" />
            <p className="text-gray-400 font-bold text-sm uppercase tracking-wider">
              No badges yet
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Complete lessons to earn your first badge!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((badge, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-2xl p-4 border transition-all ${
                  badge.earned
                    ? "border-orange-200 shadow-md hover:shadow-lg"
                    : "border-gray-100 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                      badge.earned
                        ? "bg-gradient-to-br from-orange-100 to-purple-100"
                        : "bg-gray-100"
                    }`}
                  >
                    {badge.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{badge.name}</h3>
                    {badge.earned ? (
                      <p className="text-[10px] text-green-600 font-black uppercase">Earned</p>
                    ) : (
                      <p className="text-[10px] text-gray-400 font-black uppercase">
                        Need {badge.needed} more
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly progress note */}
      {dashboardStats?.stats?.lessons_this_week !== undefined && (
        <div className="mt-8 bg-purple-50 rounded-xl p-4 text-center">
          <p className="text-sm text-purple-800 font-bold">
            📅 You completed {dashboardStats.stats.lessons_this_week} lessons this week!
          </p>
          {dashboardStats.stats.lessons_this_week >= 5 && (
            <p className="text-xs text-purple-600 mt-1">🔥 Amazing streak – keep it up!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default KidAchievement;