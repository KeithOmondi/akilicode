// src/components/kid/KidLeaderboard.tsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { getLeaderboard } from "../../store/slices/kidLearningSlice";
import { Loader2, Trophy, Star, Calendar, Award, Crown } from "lucide-react";
import toast from "react-hot-toast";

const KidLeaderboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { leaderboard, loading, error } = useSelector(
    (state: RootState) => state.kidLearning
  );
  const { currentKid } = useSelector((state: RootState) => state.kid);

  useEffect(() => {
    dispatch(getLeaderboard(20)); // Fetch top 20
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  if (loading && leaderboard.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  // Medal colors for top 3
  const medalColors = {
    1: { bg: "bg-yellow-100", text: "text-yellow-700", icon: <Crown size={18} className="text-yellow-500" /> },
    2: { bg: "bg-gray-200", text: "text-gray-600", icon: <Trophy size={18} className="text-gray-500" /> },
    3: { bg: "bg-amber-100", text: "text-amber-700", icon: <Award size={18} className="text-amber-500" /> },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black font-serif text-purple-900">
          Leader<span className="text-orange-500">board</span>
        </h1>
        <p className="text-gray-500 font-extrabold mt-1">
          See where you rank among all young coders!
        </p>
      </div>

      {/* Current user's rank card */}
      {currentKid && (() => {
        const myRank = leaderboard.findIndex((entry) => entry.id === currentKid.id) + 1;
        const myEntry = leaderboard.find((entry) => entry.id === currentKid.id);
        if (myRank > 0 && myEntry) {
          return (
            <div className="bg-gradient-to-r from-purple-50 to-orange-50 rounded-2xl p-4 mb-6 border border-purple-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center font-black text-purple-700">
                    #{myRank}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{myEntry.name}</p>
                    <p className="text-xs text-purple-600">Your current rank</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500" />
                    {myEntry.total_points.toLocaleString()} pts
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} className="text-purple-500" />
                    {myEntry.streak_days} day streak
                  </span>
                </div>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Leaderboard table */}
      <div className="bg-white rounded-2xl border border-purple-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-50 border-b border-purple-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-black text-purple-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-5 py-3 text-left text-xs font-black text-purple-500 uppercase tracking-wider">
                  Coder
                </th>
                <th className="px-5 py-3 text-right text-xs font-black text-purple-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-5 py-3 text-right text-xs font-black text-purple-500 uppercase tracking-wider hidden sm:table-cell">
                  Lessons
                </th>
                <th className="px-5 py-3 text-right text-xs font-black text-purple-500 uppercase tracking-wider hidden md:table-cell">
                  Streak
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    No data yet. Complete lessons to appear on the leaderboard!
                  </td>
                </tr>
              ) : (
                leaderboard.map((entry) => {
                  const isCurrentUser = entry.id === currentKid?.id;
                  const medal = medalColors[entry.rank as keyof typeof medalColors];
                  return (
                    <tr
                      key={entry.id}
                      className={`transition-colors ${
                        isCurrentUser ? "bg-purple-50/30" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {medal ? (
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${medal.bg}`}>
                              {medal.icon}
                            </div>
                          ) : (
                            <span className="font-bold text-gray-400 text-sm w-7 text-center">
                              {entry.rank}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-orange-400 flex items-center justify-center text-white text-xs font-bold">
                            {entry.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{entry.name}</p>
                            {isCurrentUser && (
                              <span className="text-[10px] font-black text-purple-500">You</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Star size={14} className="text-yellow-500" />
                          <span className="font-bold text-gray-700">
                            {entry.total_points.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right hidden sm:table-cell">
                        <span className="text-gray-600">{entry.lessons_completed}</span>
                      </td>
                      <td className="px-5 py-4 text-right hidden md:table-cell">
                        <div className="flex items-center justify-end gap-1">
                          <Calendar size={14} className="text-purple-400" />
                          <span className="text-gray-600">{entry.streak_days} days</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Encouragement footer */}
      <div className="mt-6 text-center text-xs text-gray-400">
        {leaderboard.length > 0 && currentKid && (() => {
          const myRank = leaderboard.findIndex((e) => e.id === currentKid.id) + 1;
          if (myRank > 0) {
            return <p>🏆 Keep coding to climb the ranks! You're currently #{myRank}.</p>;
          }
          return <p>🌟 Complete your first lesson to appear on the leaderboard!</p>;
        })()}
      </div>
    </div>
  );
};

export default KidLeaderboard;