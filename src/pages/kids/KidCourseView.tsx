// src/components/kid/KidCourseView.tsx
import { sanitizeHtml } from "../../lib/sanitize";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  getMyCourses,
  getCourseContent,
  getLesson,
  clearCurrentCourse,
  getLessonQuestions,
  submitLessonQuiz,
} from "../../store/slices/kidLearningSlice";
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
  HelpCircle,
  ClipboardList,
} from "lucide-react";
import toast from "react-hot-toast";
import type {
  Lesson,
  ModuleWithLessons,
} from "../../interfaces/kidLearning.interface";

// ─── Markdown Renderer ───────────────────────────────────────────────────────
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

// ─── Simple Multiple‑Choice Quiz Component ──────────────────────────────────
interface QuizProps {
  lessonId: string;
  enrollmentId?: string;
  onComplete: () => void;
}

const Quiz = ({ lessonId, enrollmentId, onComplete }: QuizProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentKid } = useSelector((s: RootState) => s.kid);
  const { quizQuestions, quizSubmitting, quizResult } = useSelector(
    (s: RootState) => s.kidLearning
  );

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  // Fetch questions when the component mounts
  useEffect(() => {
    if (lessonId && !quizQuestions) {
      dispatch(getLessonQuestions(lessonId));
    }
  }, [dispatch, lessonId, quizQuestions]);

  const handleAnswerSelect = (questionId: string, selectedIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selectedIndex }));
  };

  const handleSubmit = async () => {
    if (!currentKid || !lessonId) return;
    const answerArray = Object.entries(answers).map(([questionId, selectedIndex]) => ({
      questionId,
      selectedIndex,
    }));
    try {
      await dispatch(
        submitLessonQuiz({
          lessonId,
          enrollmentId,
          answers: answerArray,
        })
      ).unwrap();
      setSubmitted(true);
      toast.success("Quiz submitted!");
      onComplete(); // notify parent to refresh lesson status
    } catch {
      toast.error("Failed to submit quiz. Please try again.");
    }
  };

  if (quizSubmitting) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin text-violet-500" size={32} />
      </div>
    );
  }

  if (submitted && quizResult) {
    const passed = quizResult.passed;
    return (
      <div className="bg-white rounded-2xl border shadow-sm p-6 text-center">
        {passed ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-2">Great job!</h3>
            <p className="text-gray-600 mb-2">
              You scored {quizResult.score} / {quizResult.total} (
              {quizResult.percentage}%)
            </p>
            <p className="text-green-600 font-bold text-sm">
              {quizResult.lessonCompleted ? `Lesson completed! 🎉${quizResult.pointsEarned ? ` +${quizResult.pointsEarned} stars` : ''}` : 'Well done! 🎉'}
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle size={32} className="text-red-500" />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-2">Not yet</h3>
            <p className="text-gray-600 mb-2">
              You scored {quizResult.score} / {quizResult.total} (
              {quizResult.percentage}%)
            </p>
            <p className="text-orange-600 font-bold text-sm">
              You need at least 70% to pass. Review the notes and try again.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setAnswers({});
                dispatch(getLessonQuestions(lessonId)); // refetch to reset
              }}
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-xl font-bold text-sm"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    );
  }

  if (!quizQuestions) {
    return (
      <div className="text-center py-8">
        <Loader2 className="animate-spin text-violet-500 mx-auto" size={32} />
        <p className="text-gray-500 text-sm mt-2">Loading quiz...</p>
      </div>
    );
  }

  if (quizQuestions.length === 0) {
    return (
      <div className="text-center py-8 bg-yellow-50 rounded-2xl">
        <p className="text-yellow-700">No quiz questions for this lesson.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden mt-8">
      <div className="px-6 py-4 bg-violet-50 border-b border-violet-100">
        <h3 className="font-black text-violet-800 flex items-center gap-2">
          <HelpCircle size={18} /> Quiz
        </h3>
        <p className="text-xs text-violet-600 mt-0.5">
          Answer the questions below. You need 70% to pass.
        </p>
      </div>
      <div className="p-6 space-y-6">
        {quizQuestions.map((q, idx) => (
          <div key={q.id} className="border-b border-gray-100 pb-4 last:border-0">
            <p className="font-bold text-gray-800 mb-3">
              {idx + 1}. {q.question}
            </p>
            <div className="space-y-2 ml-4">
              {q.options.map((opt, optIdx) => (
                <label
                  key={optIdx}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={optIdx}
                    checked={answers[q.id] === optIdx}
                    onChange={() => handleAnswerSelect(q.id, optIdx)}
                    className="w-4 h-4 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length !== quizQuestions.length}
          className="w-full py-3 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl font-black text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
        >
          Submit Quiz
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
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

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [searchParams] = useSearchParams();
  const wantedLesson = searchParams.get("lesson");

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
    }
  }, [selectedLesson, enrollmentId, dispatch]);

  // Once the course has loaded, open the lesson the child asked for (or their next unfinished one).
  // (Derived during render, as React recommends, instead of in an effect.)
  if (!selectedLesson && currentCourse?.modules) {
    const all = currentCourse.modules.flatMap((m: ModuleWithLessons) => m.lessons);
    const target = all.find((l) => l.id === wantedLesson) ?? all.find((l) => !l.completed) ?? all[0];
    if (target) setSelectedLesson(target);
  }

  const handleSelectLesson = useCallback((lesson: Lesson) => {
    setSelectedLesson(lesson);
    setSidebarOpen(false);
  }, []);

  const handleQuizComplete = useCallback(async () => {
    // Refresh lesson data to update completion status
    if (enrollmentId && selectedLesson) {
      await dispatch(getLesson({ enrollmentId, lessonId: selectedLesson.id }));
      // Also refresh course content to update progress bar
      dispatch(getCourseContent(enrollmentId));
      dispatch(getMyCourses()); // update dashboard list
    }
  }, [dispatch, enrollmentId, selectedLesson]);

  const allLessons = useMemo(
    () =>
      currentCourse?.modules?.flatMap((m: ModuleWithLessons) => m.lessons) ?? [],
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

  return (
    <div className="min-h-screen bg-[#faf8ff] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-violet-100 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
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
        {/* Sidebar overlay */}
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
                            className={isActive ? "text-green-300" : "text-green-500"}
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
                      <BookOpen size={13} className="text-violet-300 flex-shrink-0" />
                      <span className="flex-1 line-clamp-1 font-medium">{c.name}</span>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {!currentLesson ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-100 to-orange-100 flex items-center justify-center mx-auto mb-6">
                  <GraduationCap size={36} className="text-violet-500" />
                </div>
                <h2 className="text-2xl font-black font-serif text-gray-800 mb-2 tracking-tight">
                  Welcome to {courseName}!
                </h2>
                <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                  Pick a lesson from the sidebar to start your journey.
                </p>
                {currentCourse.modules?.[0]?.lessons?.[0] && (
                  <button
                    onClick={() => handleSelectLesson(currentCourse.modules[0].lessons[0])}
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
                <Link to="/kid/dashboard" className="hover:text-violet-600">
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

              {/* Lesson Title & Status */}
              <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-serif font-black text-gray-900 tracking-tight mb-3">
                  {currentLesson.title}
                </h1>
                <div className="flex items-center gap-2">
                  {currentLesson.completed && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full text-xs font-black">
                      <CheckCircle size={12} />
                      Completed · +{currentLesson.points_earned ?? 0} points
                    </span>
                  )}
                </div>
              </div>

              {/* Notes */}
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
                      [&_h1]:text-2xl [&_h1]:font-black [&_h1]:text-gray-900 [&_h1]:mb-4 [&_h1]:mt-2
                      [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-violet-700 [&_h2]:mb-3 [&_h2]:mt-6
                      [&_h3]:text-base [&_h3]:font-black [&_h3]:text-orange-500 [&_h3]:mb-2 [&_h3]:mt-5
                      [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-3 [&_p]:text-[15px]
                      [&_strong]:text-gray-900 [&_strong]:font-black
                      [&_em]:text-gray-500 [&_em]:italic
                      [&_code]:bg-violet-50 [&_code]:text-violet-700 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-sm [&_code]:font-mono
                      [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-2
                      [&_li]:text-gray-700 [&_li]:text-[15px] [&_li]:leading-relaxed [&_li]:list-disc
                      [&_blockquote]:border-l-4 [&_blockquote]:border-orange-400 [&_blockquote]:pl-5 [&_blockquote]:py-1 [&_blockquote]:italic [&_blockquote]:text-gray-600
                      [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-violet-100 [&_hr]:my-8"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(renderMarkdown(currentLesson.notes)),
                    }}
                  />
                </div>
              )}

              {/* Assignment: something to do away from the screen. Shown to the child and read by the parent. */}
              {currentLesson.assignment && (
                <div className="mb-6 rounded-2xl border-2 border-amber-200 bg-amber-50 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList size={18} className="text-amber-600" />
                    <span className="text-xs font-black text-amber-700 uppercase tracking-widest">Your assignment</span>
                  </div>
                  <p className="text-gray-800 text-[15px] leading-relaxed">{currentLesson.assignment}</p>
                  <p className="mt-3 text-xs text-amber-800 font-semibold">Show it to a grown-up when you are done. 🎉</p>
                </div>
              )}

              {/* Quiz – only if lesson not completed */}
              {!currentLesson.completed && (
                <Quiz
                  lessonId={currentLesson.id}
                  enrollmentId={enrollmentId}
                  onComplete={handleQuizComplete}
                />
              )}

              {/* Lesson Navigation */}
              <div className="flex justify-between gap-4 mt-12 pt-6 border-t border-gray-100">
                <button
                  onClick={() => prevLesson && handleSelectLesson(prevLesson)}
                  disabled={!prevLesson}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 disabled:opacity-30 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-semibold"
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                {nextLesson && (
                  <button
                    onClick={() => handleSelectLesson(nextLesson)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl font-black text-sm hover:shadow-lg hover:shadow-violet-200 transition-all active:scale-95"
                  >
                    Next Lesson <ChevronRight size={16} />
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