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
  ChevronRight
} from "lucide-react";
import type { AppDispatch, RootState } from "../../store/store";
import { getAllCourses } from "../../store/slices/courseSlice";
import type { Course } from "../../interfaces/course.interface";

const ParentCourses = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { courses, loading } = useSelector((s: RootState) => s.course);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    dispatch(getAllCourses());
  }, [dispatch]);

  const categories = ["All", ...new Set(courses.map((c) => c.category))];

  const filteredCourses = courses.filter((c: Course) => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || c.category === activeCategory;
    return matchesSearch && matchesCategory && c.is_active;
  });

  return (
    <div className="min-h-screen bg-transparent text-slate-900 p-6 lg:p-12 relative">
      {/* --- Hero Header --- */}
      <header className="relative mb-12 py-12 border-b border-slate-100">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-orange-600 text-xs font-bold uppercase tracking-widest">Course Catalog</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-serif font-black text-slate-900 tracking-tight leading-tight mb-6">
            Compare & Choose the <br />
            <span className="text-orange-500">Perfect Path.</span>
          </h1>
        </div>
      </header>

      {/* --- Controls: Search & Category Tabs --- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by course title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-serif"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
          <Filter size={16} className="text-slate-400 mr-2 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                activeCategory === cat
                  ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200"
                  : "bg-white text-slate-500 border-slate-100 hover:border-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* --- Course Table --- */}
      <div className="bg-white border border-slate-100 rounded-[0.5rem] overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-bold text-[10px] uppercase tracking-[0.2em]">Syncing Catalog</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Course Information</th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Price</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCourses.map((course) => (
                  <tr 
                    key={course.id} 
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedCourse(course)}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
                          {course.image_url ? (
                            <img src={course.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <BookOpen size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-serif font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                            {course.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                             <div className="flex items-center gap-0.5">
                               <Star size={10} className="text-yellow-400 fill-yellow-400" />
                               <span className="text-[10px] font-bold text-slate-500">4.9</span>
                             </div>
                             <span className="text-[10px] text-slate-300">•</span>
                             <span className="text-[10px] font-medium text-slate-400 line-clamp-1 max-w-[200px]">
                                {course.description}
                             </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-tighter rounded-lg">
                        {course.category}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock size={14} />
                        <span className="text-sm font-bold">{course.duration}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <p className="font-serif italic font-bold text-slate-900">
                        Ksh. {Number(course.price).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-900 group-hover:bg-orange-500 group-hover:border-orange-500 group-hover:text-white transition-all shadow-sm">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCourses.length === 0 && (
              <div className="py-20 text-center">
                <p className="font-serif italic text-slate-400">No courses match your search criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- Course Detail Modal (Logic remains the same, styling matches table) --- */}
      {selectedCourse && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setSelectedCourse(null)}
        >
          <div 
            className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[40px] shadow-2xl relative animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedCourse(null)}
              className="absolute top-6 right-6 z-10 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-600" />
            </button>

            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-2/5 h-64 lg:h-auto relative bg-slate-100">
                {selectedCourse.image_url ? (
                  <img src={selectedCourse.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <BookOpen size={80} />
                  </div>
                )}
              </div>

              <div className="lg:w-3/5 p-8 lg:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                    {selectedCourse.category}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                    <Clock size={14} /> {selectedCourse.duration}
                  </span>
                </div>

                <h2 className="text-3xl font-serif font-black text-slate-900 mb-4 leading-tight">
                  {selectedCourse.title}
                </h2>

                <div className="flex items-center gap-6 mb-8">
                  <div className="flex items-center gap-1.5 font-bold text-slate-600">
                    <Star size={18} className="text-yellow-400 fill-yellow-400" />
                    <span>4.9</span>
                  </div>
                  <div className="w-1 h-1 bg-slate-300 rounded-full" />
                  <div className="font-serif italic text-2xl text-slate-900 font-bold">
                    Ksh. {Number(selectedCourse.price).toLocaleString()}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Course Syllabus & Details</h4>
                    <p className="text-slate-600 leading-relaxed font-medium font-serif">
                      {selectedCourse.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-50">
                    {["Expert Instructors", "Lifetime Access", "Certification", "Weekly Projects"].map((perk) => (
                      <div key={perk} className="flex items-center gap-2 text-slate-600">
                        <CheckCircle2 size={16} className="text-orange-500" />
                        <span className="text-xs font-bold">{perk}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <button className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-orange-500/20 active:scale-[0.98]">
                      Enroll Child
                    </button>
                    <button className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-[0.98]">
                      Syllabus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentCourses;