// src/components/kid/KidBadges.tsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { getAchievements } from "../../store/slices/kidLearningSlice";
import { Loader2, Award, Lock } from "lucide-react";
import toast from "react-hot-toast";

const KidBadges = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { achievements, loading, error } = useSelector(
    (state: RootState) => state.kidLearning
  );
  const { currentKid } = useSelector((state: RootState) => state.kid);

  useEffect(() => {
    dispatch(getAchievements());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  if (loading && achievements.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  const earnedBadges = achievements.filter((b) => b.earned);
  const lockedBadges = achievements.filter((b) => !b.earned);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black font-serif text-purple-900">
          My <span className="text-orange-500">Badges</span>
        </h1>
        <p className="text-gray-500 font-extrabold mt-1">
          {currentKid?.name}, here are all your achievements!
        </p>
      </div>

      {/* Stats summary */}
      <div className="bg-gradient-to-r from-purple-50 to-orange-50 rounded-2xl p-4 mb-8 border border-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award size={28} className="text-purple-500" />
            <div>
              <p className="text-sm font-black text-purple-900 uppercase tracking-wider">
                Badges Earned
              </p>
              <p className="text-2xl font-black text-purple-700">
                {earnedBadges.length} / {achievements.length}
              </p>
            </div>
          </div>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-orange-500 h-2 rounded-full"
              style={{ width: `${(earnedBadges.length / achievements.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
            <Award size={20} className="text-yellow-500" />
            Earned
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {earnedBadges.map((badge, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-4 text-center border border-purple-100 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                  {badge.icon}
                </div>
                <p className="font-black text-gray-800 text-sm">{badge.name}</p>
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mt-1">
                  Earned
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges (upcoming) */}
      {lockedBadges.length > 0 && (
        <div>
          <h2 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
            <Lock size={18} className="text-gray-400" />
            Upcoming Badges
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {lockedBadges.map((badge, idx) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-200 opacity-70"
              >
                <div className="text-4xl mb-3 grayscale">{badge.icon}</div>
                <p className="font-black text-gray-500 text-sm">{badge.name}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                  Need {badge.needed} more
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {achievements.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-purple-200">
          <Award size={48} className="mx-auto text-purple-200 mb-4" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
            No badges available yet
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Complete lessons to earn your first badge!
          </p>
        </div>
      )}
    </div>
  );
};

export default KidBadges;