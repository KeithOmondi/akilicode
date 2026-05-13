import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutKid } from "../../store/slices/kidSlice"; // Updated import
import { getMyEnrollments } from "../../store/slices/enrollmentSlice";
import type { Enrollment } from "../../interfaces/enrollment.interface";
import { BookOpen, Gamepad2, Trophy, Star, Clock, LogOut, Sparkles } from "lucide-react";

const KidDashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentKid } = useAppSelector((state) => state.kid);
  const { enrollments, loading: enrollmentsLoading } = useAppSelector((state) => state.enrollment);

  useEffect(() => {
    // Only fetch if a kid is logged in. 
    // ProtectedRoutes handles the redirect if currentKid is null.
    if (currentKid) {
      dispatch(getMyEnrollments());
    }
  }, [currentKid, dispatch]);

  const handleLogout = () => {
    // logoutKid now clears Redux state AND localStorage automatically
    dispatch(logoutKid());
    navigate("/kid/login");
  };

  // If the session hasn't been verified yet, the ProtectedRoutes spinner shows.
  // This return is a safety fallback.
  if (!currentKid) return null;

  const getCourseId = (enrollment: Enrollment): string => {
    const enrollmentWithCourseId = enrollment as Enrollment & { course_id?: string };
    return enrollmentWithCourseId.course_id || enrollment.id;
  };

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
            <div className="flex items-center gap-2 bg-purple-100 px-3 py-1.5 rounded-full">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-bold text-purple-800">Level 5</span>
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
              {currentKid.name?.[0]?.toUpperCase() || "👧"}
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
            { icon: <BookOpen size={20} />, label: "Courses", value: enrollments.length, color: "purple" },
            { icon: <Trophy size={20} />, label: "Badges", value: "12", color: "orange" },
            { icon: <Star size={20} />, label: "Points", value: "2,450", color: "yellow" },
            { icon: <Clock size={20} />, label: "Hours Learned", value: "24", color: "blue" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 text-center shadow-md border border-purple-100 transform transition hover:scale-105">
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center mx-auto mb-2 text-${stat.color}-600`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-black text-gray-800">{stat.value}</div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Enrolled Courses */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
            <BookOpen size={20} />
            My Courses
          </h2>
          
          {enrollmentsLoading ? (
            <div className="flex justify-center p-12">
               <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-600" />
            </div>
          ) : enrollments.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-purple-100">
              <p className="text-gray-500">No courses yet! Ask your parent to enroll you.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="bg-white rounded-2xl p-5 border-2 border-purple-100 hover:border-orange-300 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
                  onClick={() => {
                    const courseId = getCourseId(enrollment);
                    navigate(`/kid/course/${courseId}`);
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BookOpen size={24} className="text-purple-600" />
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">
                      {enrollment.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1 group-hover:text-purple-700">{enrollment.course_name}</h3>
                  <p className="text-xs text-gray-500 mb-3 font-medium">Progress: 60%</p>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-orange-500 rounded-full transition-all duration-1000" style={{ width: "60%" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Achievements Section (Keep current achievement mapping) */}
      </div>
    </div>
  );
};

export default KidDashboard;