import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  getMyCourses,
  getCourseContent,
  getLesson,
  submitLesson,
  clearCurrentCourse,
} from "../../store/slices/kidLearningSlice";
import {
  getSubmissionByLesson,
  submitAssignment,
  clearSubmissionMessage,
} from "../../store/slices/submissionSlice";
import {
  ChevronLeft,
  ChevronRight,
  Code2,
  CheckCircle,
  Circle,
  Star,
  Trophy,
  BookOpen,
  Loader2,
  Menu,
  X,
  AlertCircle,
  GraduationCap,
  ClipboardList,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import type {
  Lesson,
  ModuleWithLessons,
} from "../../interfaces/kidLearning.interface";
import { FaGithub } from "react-icons/fa";

// ─── Markdown Renderer ────────────────────────────────────────────────────────

const renderMarkdown = (text: string): string => {
  return text
    .replace(/^---$/gm, "<hr />")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/^(?!<[hulpbhr])(.+)$/gm, "<p>$1</p>")
    .replace(/<p><\/p>/g, "");
};

// ─── Main Component ───────────────────────────────────────────────────────────

const KidCourseView = () => {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { currentKid } = useSelector((state: RootState) => state.kid);
  const {
    courses,
    currentCourse,
    currentLesson,
    dashboardStats,
    loading,
    error,
  } = useSelector((state: RootState) => state.kidLearning);

  const {
    currentSubmission,
    submitting: submissionSubmitting,
    error: submissionError,
  } = useSelector((state: RootState) => state.submissions);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [completingNotes, setCompletingNotes] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!currentKid) navigate("/kid/login");
  }, [currentKid, navigate]);

  useEffect(() => {
    dispatch(getMyCourses());
  }, [dispatch]);

  useEffect(() => {
    if (!enrollmentId) return;
    dispatch(getCourseContent(enrollmentId));
    return () => {
      dispatch(clearCurrentCourse());
    };
  }, [enrollmentId, dispatch]);

  useEffect(() => {
    if (selectedLesson && enrollmentId) {
      dispatch(getLesson({ enrollmentId, lessonId: selectedLesson.id }));
      dispatch(getSubmissionByLesson(selectedLesson.id));
    }
  }, [selectedLesson, enrollmentId, dispatch]);

  useEffect(() => {
    if (submissionError) {
      toast.error(submissionError);
      dispatch(clearSubmissionMessage());
    }
  }, [submissionError, dispatch]);

  const handleSelectLesson = useCallback((lesson: Lesson) => {
    setSelectedLesson(lesson);
    setSidebarOpen(false);
    setGithubUrl("");
  }, []);

  const handleSubmitGithub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim()) return toast.error("Please paste your GitHub repo URL");
    if (!selectedLesson || !enrollmentId) return;
    try {
      await dispatch(
        submitAssignment({
          lesson_id: selectedLesson.id,
          enrollment_id: enrollmentId,
          github_url: githubUrl,
        })
      ).unwrap();
      toast.success("Assignment submitted! Your tutor will review it soon. 🎉");
      setGithubUrl("");
      dispatch(getSubmissionByLesson(selectedLesson.id));
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Submission failed");
    }
  };

  const handleCompleteNotesLesson = async () => {
    if (!currentLesson || !enrollmentId) return;
    setCompletingNotes(true);
    try {
      await dispatch(
        submitLesson({
          enrollmentId,
          lessonId: currentLesson.id,
          code_submitted: undefined,
        })
      ).unwrap();
      toast.success("Lesson completed! 🎉");
      dispatch(getLesson({ enrollmentId, lessonId: currentLesson.id }));
      dispatch(getSubmissionByLesson(currentLesson.id));
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to complete lesson");
    } finally {
      setCompletingNotes(false);
    }
  };

  const allLessons = useMemo(
    () =>
      currentCourse?.modules?.flatMap((m: ModuleWithLessons) => m.lessons) ??
      [],
    [currentCourse]
  );

  const nextLesson = useMemo(() => {
    const idx = allLessons.findIndex((l) => l.id === currentLesson?.id);
    return idx !== -1 && idx < allLessons.length - 1
      ? allLessons[idx + 1]
      : null;
  }, [allLessons, currentLesson?.id]);

  const prevLesson = useMemo(() => {
    const idx = allLessons.findIndex((l) => l.id === currentLesson?.id);
    return idx > 0 ? allLessons[idx - 1] : null;
  }, [allLessons, currentLesson?.id]);

  const completedCount = allLessons.filter((l) => l.completed).length;
  const progressPercent =
    allLessons.length > 0 ? (completedCount / allLessons.length) * 100 : 0;

  const kidPoints = dashboardStats?.stats.total_points ?? 0;
  const kidLevel = dashboardStats?.stats.level ?? 1;
  const courseName = currentCourse?.course_name ?? "";

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading && !currentCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8ff]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-orange-400 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Code2 size={28} className="text-white" />
          </div>
          <p className="text-violet-400 font-semibold text-sm">
            Loading your course...
          </p>
        </div>
      </div>
    );
  }

  if (error && !currentCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8ff]">
        <div className="text-center max-w-sm bg-white rounded-2xl p-8 shadow-sm border border-red-100">
          <AlertCircle size={40} className="mx-auto text-red-400 mb-3" />
          <h2 className="text-lg font-bold text-gray-800 mb-2">
            Course unavailable
          </h2>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <Link
            to="/kid/dashboard"
            className="text-violet-600 hover:underline font-semibold text-sm"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!currentCourse) return null;

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#faf8ff] font-sans">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-violet-100 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-violet-50 text-violet-600 transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/kid/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-orange-500 flex items-center justify-center">
                <Code2 size={16} className="text-white" />
              </div>
              <span className="font-black text-violet-900 hidden sm:inline tracking-tight">
                AkiliCode
              </span>
            </Link>
            <div className="hidden md:block h-5 w-px bg-violet-100" />
            <h1 className="text-sm font-semibold text-gray-600 line-clamp-1 hidden md:block max-w-[240px]">
              {courseName}
            </h1>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                <Trophy size={13} className="text-amber-500" />
                <span className="text-sm font-black text-amber-700">
                  {kidPoints.toLocaleString()} pts
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-full">
                <Star size={13} className="text-violet-500" />
                <span className="text-sm font-black text-violet-700">
                  Level {kidLevel}
                </span>
              </div>
            </div>

            {/* Progress pill */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
              <div className="w-24 bg-gray-200 rounded-full h-1.5 hidden sm:block">
                <div
                  className="bg-gradient-to-r from-violet-500 to-orange-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-gray-500">
                {completedCount}/{allLessons.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-57px)]">

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`
            fixed lg:relative inset-y-0 left-0 z-30 w-72 bg-white border-r border-violet-100
            transform transition-transform duration-300 ease-in-out overflow-y-auto flex flex-col
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          {/* Sidebar header */}
          <div className="p-4 border-b border-violet-50 sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-black font-serif text-gray-800 text-sm tracking-tight">
                Course Content
              </h2>
              <span className="text-[10px] font-bold text-violet-500 bg-violet-50 px-2 py-0.5 rounded-full">
                {completedCount}/{allLessons.length} done
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-violet-500 to-orange-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Module list */}
          <div className="p-3 flex-1">
            {currentCourse.modules?.map((module, mIdx) => (
              <div key={module.id} className="mb-5">
                <div className="flex items-center gap-2 px-2 mb-2">
                  <span className="text-[10px] font-black text-violet-400 bg-violet-50 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0">
                    {mIdx + 1}
                  </span>
                  <span className="font-bold text-gray-700 text-xs leading-tight">
                    {module.title}
                  </span>
                </div>
                <div className="space-y-0.5 pl-1">
                  {module.lessons.map((lesson) => {
                    const isActive = selectedLesson?.id === lesson.id;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => handleSelectLesson(lesson)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-2.5 group ${
                          isActive
                            ? "bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-md shadow-violet-200"
                            : "hover:bg-violet-50 text-gray-600"
                        }`}
                      >
                        {lesson.completed ? (
                          <CheckCircle
                            size={15}
                            className={
                              isActive ? "text-green-300" : "text-green-500"
                            }
                          />
                        ) : (
                          <Circle
                            size={15}
                            className={
                              isActive
                                ? "text-violet-300"
                                : "text-gray-300 group-hover:text-violet-300"
                            }
                          />
                        )}
                        <span
                          className={`text-xs flex-1 leading-tight font-medium ${
                            isActive ? "text-white" : ""
                          }`}
                        >
                          {lesson.title}
                        </span>
                        {lesson.completed && !isActive && (
                          <Star size={11} className="text-amber-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Other enrolled courses */}
          {courses.length > 1 && (
            <div className="p-3 border-t border-violet-50">
              <p className="text-[10px] font-serif font-black text-gray-400 uppercase tracking-widest px-2 mb-2">
                My Other Courses
              </p>
              <div className="space-y-1">
                {courses
                  .filter((c) => c.enrollment_id !== enrollmentId)
                  .map((c) => (
                    <Link
                      key={c.enrollment_id}
                      to={`/kid/course/${c.enrollment_id}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-violet-50 text-gray-500 text-xs transition-colors"
                    >
                      <BookOpen
                        size={13}
                        className="text-violet-300 flex-shrink-0"
                      />
                      <span className="flex-1 line-clamp-1 font-medium">
                        {c.name}
                      </span>
                      <ExternalLink size={11} className="text-gray-300" />
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </aside>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          {!currentLesson ? (
            /* Welcome screen */
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-100 to-orange-100 flex items-center justify-center mx-auto mb-6">
                  <GraduationCap size={36} className="text-violet-500" />
                </div>
                <h2 className="text-2xl font-black font-serif text-gray-800 mb-2 tracking-tight">
                  Welcome to {courseName}!
                </h2>
                <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                  Pick a lesson from the sidebar to start your journey. Each
                  lesson builds on the last — start from the top!
                </p>
                {currentCourse.modules?.[0]?.lessons?.[0] && (
                  <button
                    onClick={() =>
                      handleSelectLesson(
                        currentCourse.modules[0].lessons[0]
                      )
                    }
                    className="px-8 py-3 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-2xl font-black text-sm hover:shadow-lg hover:shadow-violet-200 transition-all active:scale-95"
                  >
                    Start First Lesson →
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 lg:p-10 max-w-4xl mx-auto pb-20">

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 font-medium">
                <Link
                  to="/kid/dashboard"
                  className="hover:text-violet-600 transition-colors"
                >
                  Dashboard
                </Link>
                <ChevronRight size={12} />
                <span className="text-gray-400 line-clamp-1 max-w-[120px]">
                  {courseName}
                </span>
                <ChevronRight size={12} />
                <span className="text-gray-600 line-clamp-1 max-w-[160px]">
                  {currentLesson.title}
                </span>
              </div>

              {/* Lesson title */}
              <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-serif font-black text-gray-900 tracking-tight mb-3">
                  {currentLesson.title}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  {currentLesson.completed && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full text-xs font-black">
                      <CheckCircle size={12} />
                      Completed · +{currentLesson.points_earned ?? 0} points
                    </span>
                  )}
                  {currentLesson.lesson_type === "coding" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200 text-orange-600 rounded-full text-xs font-black">
                      <Code2 size={12} />
                      Coding Assignment
                    </span>
                  )}
                </div>
              </div>

              {/* ── Notes ─────────────────────────────────────────────────── */}
              {currentLesson.notes && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                  <div className="px-6 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                    <BookOpen size={14} className="text-violet-400" />
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      Lesson Notes
                    </span>
                  </div>
                  <div
                    className="p-6 lg:p-8
                      [&_h1]:text-2xl [&_h1]:font-black [&_h1]:text-gray-900 [&_h1]:mb-4 [&_h1]:mt-2 [&_h1]:tracking-tight
                      [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-violet-700 [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:tracking-tight
                      [&_h3]:text-base [&_h3]:font-black [&_h3]:text-orange-500 [&_h3]:mb-2 [&_h3]:mt-5
                      [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-3 [&_p]:text-[15px]
                      [&_strong]:text-gray-900 [&_strong]:font-black
                      [&_em]:text-gray-500 [&_em]:italic
                      [&_code]:bg-violet-50 [&_code]:text-violet-700 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-sm [&_code]:font-mono [&_code]:border [&_code]:border-violet-100
                      [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-2
                      [&_li]:text-gray-700 [&_li]:text-[15px] [&_li]:leading-relaxed [&_li]:list-disc
                      [&_blockquote]:border-l-4 [&_blockquote]:border-orange-400 [&_blockquote]:pl-5 [&_blockquote]:py-1 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-5 [&_blockquote]:bg-orange-50/50 [&_blockquote]:rounded-r-xl
                      [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-violet-100 [&_hr]:my-8
                      [&_table]:w-full [&_table]:border-collapse [&_table]:mb-4
                      [&_th]:bg-violet-50 [&_th]:text-violet-700 [&_th]:font-black [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:border [&_th]:border-violet-100
                      [&_td]:px-4 [&_td]:py-2 [&_td]:border [&_td]:border-gray-100 [&_td]:text-gray-700 [&_td]:text-sm"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(currentLesson.notes),
                    }}
                  />
                </div>
              )}

              {/* ── Coding Assignment ──────────────────────────────────────── */}
              {(currentLesson.lesson_type === "coding" ||
                currentLesson.lesson_type === "scratch") &&
                currentLesson.assignment && (
                  <div className="space-y-5">
                    {/* Assignment description */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
                      <div className="px-6 py-3 bg-amber-100/60 border-b border-amber-200 flex items-center gap-2">
                        <ClipboardList size={14} className="text-amber-600" />
                        <span className="text-xs font-black text-amber-700 uppercase tracking-widest">
                          Your Assignment
                        </span>
                      </div>
                      <div className="p-6 text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap">
                        {currentLesson.assignment}
                      </div>
                    </div>

                    {/* Starter code */}
                    {currentLesson.starter_code && (
                      <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-lg">
                        <div className="bg-gray-800 px-5 py-2.5 flex items-center gap-2">
                          <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/60" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                            <div className="w-3 h-3 rounded-full bg-green-500/60" />
                          </div>
                          <span className="text-xs font-mono text-gray-400 ml-2">
                            Starter Code
                          </span>
                        </div>
                        <pre className="bg-gray-900 p-5 text-sm font-mono text-gray-200 overflow-x-auto leading-relaxed">
                          <code>{currentLesson.starter_code}</code>
                        </pre>
                      </div>
                    )}

                    {/* GitHub submission */}
                    {!currentLesson.completed &&
                      currentSubmission?.status !== "reviewed" && (
                        <div className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden">
                          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                            <FaGithub size={15} className="text-gray-700" />
                            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
                              Submit Your Work
                            </span>
                          </div>
                          <div className="p-6">
                            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                              Once you've completed the assignment in VS Code
                              and pushed it to GitHub, paste your repository
                              link below.
                            </p>
                            <form
                              onSubmit={handleSubmitGithub}
                              className="flex flex-col sm:flex-row gap-3"
                            >
                              <input
                                type="url"
                                placeholder="https://github.com/your-username/your-repo"
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all font-mono"
                                required
                              />
                              <button
                                type="submit"
                                disabled={submissionSubmitting}
                                className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-black text-sm px-6 py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex-shrink-0"
                              >
                                {submissionSubmitting ? (
                                  <Loader2
                                    className="animate-spin"
                                    size={16}
                                  />
                                ) : (
                                  <FaGithub size={16} />
                                )}
                                {submissionSubmitting
                                  ? "Submitting..."
                                  : "Submit for Review"}
                              </button>
                            </form>

                            {currentSubmission?.status === "submitted" && (
                              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl flex items-center gap-2 text-sm font-medium">
                                <CheckCircle size={15} />
                                Assignment submitted! Waiting for your tutor to
                                review it.
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    {/* Review result */}
                    {currentSubmission?.status === "reviewed" && (
                      <div className="bg-gradient-to-br from-violet-50 to-orange-50 border border-violet-100 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                            <Trophy size={18} className="text-violet-600" />
                          </div>
                          <div>
                            <p className="font-black text-gray-800 text-lg">
                              {currentSubmission.marks ?? 0}/100
                              {(currentSubmission.marks ?? 0) >= 80 && " 🎉"}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">
                              Tutor Score
                            </p>
                          </div>
                        </div>
                        {currentSubmission.feedback && (
                          <div className="bg-white rounded-xl p-4 border border-violet-100">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                              Feedback
                            </p>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {currentSubmission.feedback}
                            </p>
                          </div>
                        )}
                        {!currentLesson.completed && (
                          <p className="text-xs text-green-600 font-bold mt-3 flex items-center gap-1">
                            <CheckCircle size={12} />
                            Lesson marked as completed!
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

              {/* ── Notes-only completion button ──────────────────────────── */}
              {!currentLesson.assignment && !currentLesson.completed && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={handleCompleteNotesLesson}
                    disabled={completingNotes}
                    className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-lg shadow-green-200 hover:shadow-xl transition-all active:scale-95 disabled:opacity-60"
                  >
                    {completingNotes ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <CheckCircle size={18} />
                    )}
                    {completingNotes
                      ? "Completing..."
                      : "Mark Lesson as Completed"}
                  </button>
                </div>
              )}

              {/* ── Lesson navigation ─────────────────────────────────────── */}
              <div className="flex justify-between gap-4 mt-12 pt-6 border-t border-gray-100">
                <button
                  onClick={() => prevLesson && handleSelectLesson(prevLesson)}
                  disabled={!prevLesson}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 disabled:opacity-30 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-semibold"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                {!currentLesson.assignment &&
                  !currentLesson.completed &&
                  nextLesson && (
                    <button
                      onClick={() => handleSelectLesson(nextLesson)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl font-black text-sm hover:shadow-lg hover:shadow-violet-200 transition-all active:scale-95"
                    >
                      Next Lesson
                      <ChevronRight size={16} />
                    </button>
                  )}

                {currentLesson.assignment &&
                  currentSubmission?.status === "reviewed" &&
                  nextLesson && (
                    <button
                      onClick={() => handleSelectLesson(nextLesson)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl font-black text-sm hover:shadow-lg hover:shadow-violet-200 transition-all active:scale-95"
                    >
                      Next Lesson
                      <ChevronRight size={16} />
                    </button>
                  )}

                {currentLesson.completed && nextLesson && (
                  <button
                    onClick={() => handleSelectLesson(nextLesson)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl font-black text-sm hover:shadow-lg hover:shadow-violet-200 transition-all active:scale-95"
                  >
                    Next Lesson
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default KidCourseView;