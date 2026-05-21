// src/components/kid/KidMyCourses.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { getMyCourses } from "../../store/slices/kidLearningSlice";
import { BookOpen, ChevronRight, Loader2, GraduationCap } from "lucide-react";
import toast from "react-hot-toast";

const KidMyCourses = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { courses, loading, error } = useSelector((s: RootState) => s.kidLearning);
  const { currentKid } = useSelector((s: RootState) => s.kid);

  useEffect(() => {
    dispatch(getMyCourses());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  if (loading && courses.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black font-serif text-purple-900">
          My <span className="text-orange-500">Courses</span>
        </h1>
        <p className="text-gray-500 font-extrabold mt-1">
          Hey {currentKid?.name || "there"}, here are all your enrolled courses!
        </p>
      </div>

      {courses.length === 0 && !loading ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-purple-200">
          <GraduationCap size={48} className="mx-auto text-purple-100 mb-4" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
            No courses yet
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Ask your parent to enroll you in a course!
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((course) => {
            const pct = course.progress ?? 0;
            return (
              <div
                key={course.enrollment_id}
                onClick={() => navigate(`/kid/course/${course.enrollment_id}`)}
                className="bg-white rounded-2xl p-6 border-2 border-purple-100 hover:border-orange-300 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen size={24} className="text-purple-600" />
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">
                    {course.status}
                  </span>
                </div>
                <h3 className="font-black text-gray-800 text-lg mb-1 group-hover:text-purple-700 transition-colors">
                  {course.name}
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{course.completed_lessons} / {course.total_lessons} lessons</span>
                    <span className="font-bold text-purple-700">{pct}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-orange-500 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Enrolled {new Date(course.enrolled_at).toLocaleDateString("en-KE", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                  <div className="flex items-center gap-1 text-purple-600 text-sm font-bold group-hover:gap-2 transition-all">
                    {pct === 0 ? "Start" : pct === 100 ? "Review" : "Continue"}
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KidMyCourses;