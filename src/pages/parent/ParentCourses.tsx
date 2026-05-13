import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Search, 
  BookOpen, 
  Clock, 
  Star, 
  X,
  CheckCircle2,
  Filter,
  ChevronRight,
  Sparkles,
  Rocket,
  Trophy,
  Users,
  Award,
  PlayCircle,
  Heart,
  TrendingUp
} from "lucide-react";
import type { AppDispatch, RootState } from "../../store/store";
import { getAllCourses } from "../../store/slices/courseSlice";
import type { Course } from "../../interfaces/course.interface";
import { Link } from "react-router-dom";

const ParentCourses = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { courses, loading } = useSelector((s: RootState) => s.course);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getAllCourses());
  }, [dispatch]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (selectedCourse) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedCourse]);

  const categories = ["All", ...new Set(courses.map((c) => c.category))];

  const filteredCourses = courses.filter((c: Course) => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || c.category === activeCategory;
    return matchesSearch && matchesCategory && c.is_active;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Programming": "bg-purple-100 text-purple-700 border-purple-200",
      "Game Development": "bg-orange-100 text-orange-700 border-orange-200",
      "Web Design": "bg-blue-100 text-blue-700 border-blue-200",
      "Robotics": "bg-green-100 text-green-700 border-green-200",
      "AI & Machine Learning": "bg-pink-100 text-pink-700 border-pink-200"
    };
    return colors[category] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const stats = [
    { icon: <Users size={16} />, value: "10,000+", label: "Active Students" },
    { icon: <Trophy size={16} />, value: "94%", label: "Success Rate" },
    { icon: <Award size={16} />, value: "500+", label: "Certificates" },
    { icon: <Heart size={16} />, value: "98%", label: "Parent Satisfaction" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 py-8 px-4 lg:px-8">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse animation-delay-4000" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero Section */}
        <div className="mb-12 text-center lg:text-left lg:flex lg:justify-between lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-200 to-orange-200 text-purple-800 text-xs font-bold mb-4 animate-pulse">
              <Sparkles size={12} />
              <span>COURSE CATALOG</span>
              <Sparkles size={12} />
            </div>
            <h1 className="text-4xl font-serif lg:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-purple-900 to-purple-600 bg-clip-text text-transparent">
                Find the Perfect
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
                Coding Adventure
              </span>
            </h1>
            <p className="text-gray-600 font-serif text-lg max-w-2xl">
              Discover exciting courses that will spark your child's creativity and build future-ready skills
            </p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 lg:mt-0">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-3 text-center shadow-md border border-purple-100">
                <div className="text-purple-600 flex justify-center mb-1">{stat.icon}</div>
                <div className="text-lg font-black text-gray-800">{stat.value}</div>
                <div className="text-[10px] text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search for courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              <Filter size={16} className="text-gray-400 ml-2 lg:ml-0 shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeCategory === cat
                      ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Course Grid - Card Layout */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-orange-500 rounded-full animate-spin" />
              <Rocket className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-orange-500 animate-bounce" size={24} />
            </div>
            <p className="mt-4 text-gray-500 font-semibold">Loading amazing courses...</p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-500">
                Found <span className="font-bold text-purple-600">{filteredCourses.length}</span> courses
              </p>
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-green-500" />
                <span className="text-xs text-gray-500">Updated weekly</span>
              </div>
            </div>

            {/* Course Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-purple-100 cursor-pointer"
                  onClick={() => setSelectedCourse(course)}
                  onMouseEnter={() => setHoveredCourse(course.id)}
                  onMouseLeave={() => setHoveredCourse(null)}
                >
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-100 to-orange-100">
                    {course.image_url ? (
                      <img 
                        src={course.image_url} 
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={48} className="text-purple-300" />
                      </div>
                    )}
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(course.category)}`}>
                        {course.category}
                      </span>
                    </div>
                    {/* Duration Badge */}
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                      <Clock size={12} className="text-white" />
                      <span className="text-white text-xs font-semibold">{course.duration}</span>
                    </div>
                    {/* Hover Overlay */}
                    {hoveredCourse === course.id && (
                      <div className="absolute inset-0 bg-purple-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="px-6 py-2 bg-white text-purple-600 rounded-full font-bold text-sm hover:scale-105 transition-transform">
                          Quick View
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-0.5">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      </div>
                      <span className="text-xs font-semibold text-gray-600">4.9</span>
                      <span className="text-xs text-gray-400">(2,345 reviews)</span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div>
                        <span className="text-xs text-gray-400">Monthly</span>
                        <p className="text-2xl font-black text-purple-700">
                          KES {Number(course.price).toLocaleString()}
                        </p>
                      </div>
                      <button className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all flex items-center justify-center">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                  <Search size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No courses found matching your criteria</p>
                <button 
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-purple-600 font-semibold hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Course Detail Modal - HIGHEST Z-INDEX */}
      {selectedCourse && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setSelectedCourse(null)}
        >
          <div 
            className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedCourse(null)}
              className="absolute top-6 right-6 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-gray-100 rounded-full transition-all flex items-center justify-center shadow-md"
            >
              <X size={20} className="text-gray-600" />
            </button>

            <div className="flex flex-col lg:flex-row">
              {/* Image Side */}
              <div className="lg:w-2/5 relative bg-gradient-to-br from-purple-600 to-orange-500 p-8 flex flex-col items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                    {selectedCourse.image_url ? (
                      <img src={selectedCourse.image_url} alt="" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <BookOpen size={40} className="text-white" />
                    )}
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full mb-3">
                    <PlayCircle size={14} className="text-white" />
                    <span className="text-white text-xs font-semibold">Interactive Course</span>
                  </div>
                  <h3 className="text-white text-2xl font-bold mb-2">{selectedCourse.title}</h3>
                  <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
                    <Clock size={14} />
                    <span>{selectedCourse.duration}</span>
                    <span>•</span>
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span>4.9 rating</span>
                  </div>
                </div>
              </div>

              {/* Content Side */}
              <div className="lg:w-3/5 p-8">
                <div className="mb-6">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold mb-3 ${getCategoryColor(selectedCourse.category)}`}>
                    {selectedCourse.category}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Course Details
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedCourse.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {["Expert Instructors", "Lifetime Access", "Certificate", "Hands-on Projects", "24/7 Support", "Parent Dashboard"].map((perk, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-orange-50 rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xs text-gray-500">Course Fee</span>
                      <p className="text-3xl font-black text-purple-700">
                        KES {Number(selectedCourse.price).toLocaleString()}
                      </p>
                      <span className="text-xs text-gray-400">per month</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">First lesson</span>
                      <p className="text-xl font-bold text-green-600">FREE</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Link 
                      to="/parent/kids" 
                      onClick={() => setSelectedCourse(null)}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white rounded-xl font-bold text-sm transition-all text-center"
                    >
                      Enroll Your Child
                    </Link>
                    <button className="px-6 py-3 border-2 border-purple-200 text-purple-600 rounded-xl font-bold text-sm hover:bg-purple-50 transition-all">
                      View Syllabus
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                  <span>✓ 30-day money-back guarantee</span>
                  <span>✓ Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes animation-delay-2000 {
          0%, 100% { animation-delay: 0s; }
          50% { animation-delay: 2s; }
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ParentCourses;