import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  getCourseContent,
  getLesson,
  submitLesson,
  clearCurrentCourse,
} from "../../store/slices/kidLearningSlice";
import {
  ChevronLeft,
  ChevronRight,
  Code2,
  CheckCircle,
  Circle,
  Star,
  Trophy,
  Clock,
  BookOpen,
  Send,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import type { Lesson, ModuleWithLessons } from "../../interfaces/kidLearning.interface";

interface KidUser {
  total_points: number;
}

const DEFAULT_CODE = "# Write your code here\nprint('Hello, World!')";

const KidCourseView = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { currentCourse, currentLesson, loading, submitting } = useAppSelector(
    (state) => state.kidLearning
  );
  const { currentKid } = useAppSelector((state) => state.kid) as { currentKid: KidUser | null };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // 1. Initial load — redirect if no kid session, fetch course, cleanup on unmount
  useEffect(() => {
    if (!currentKid) {
      navigate("/kid/login");
      return;
    }
    if (courseId) {
      dispatch(getCourseContent(courseId));
    }
    return () => {
      dispatch(clearCurrentCourse());
    };
  }, [courseId, dispatch, currentKid, navigate]);

  // 2. Fetch lesson content when a lesson is selected
  useEffect(() => {
    if (selectedLesson) {
      dispatch(getLesson(selectedLesson.id));
    }
  }, [selectedLesson, dispatch]);

  // 3. REMOVED the third useEffect that called setCode/setOutput synchronously.
  //    Instead, code and output are reset inside handleSelectLesson (the only
  //    place that triggers a lesson change), so no effect is needed at all.

  const handleSelectLesson = useCallback((lesson: Lesson) => {
    setSelectedLesson(lesson);
    setSidebarOpen(false);
    // Reset editor state here — co-located with the action that causes the change
    setCode(lesson.starter_code || DEFAULT_CODE);
    setOutput("");
  }, []);

  const handleRunCode = useCallback(() => {
    setIsRunning(true);
    setOutput("");

    setTimeout(() => {
      try {
        setOutput("> Code executed successfully!\n> Output will appear here.\n\n> Great job! Keep learning!");
        toast.success("Code executed successfully!");
      } catch {
        setOutput("Error: Something went wrong. Check your code and try again.");
        toast.error("Code execution failed");
      } finally {
        setIsRunning(false);
      }
    }, 1500);
  }, []);

  const handleSubmitCode = useCallback(async () => {
    if (!currentLesson) return;

    try {
      const result = await dispatch(
        submitLesson({ lessonId: currentLesson.id, code_submitted: code })
      ).unwrap();

      toast.success(result.message || `Great job! You earned ${result.points_earned} points! 🎉`);
      setOutput(`✅ Lesson Completed!\n\nPoints Earned: ${result.points_earned}\n\nKeep up the great work! 🚀`);
    } catch {
      toast.error("Failed to submit lesson. Please try again.");
    }
  }, [currentLesson, code, dispatch]);

  const allLessons = useMemo(
    () => currentCourse?.modules?.flatMap((m: ModuleWithLessons) => m.lessons) || [],
    [currentCourse]
  );

  const getNextLesson = useCallback(() => {
    const idx = allLessons.findIndex((l: Lesson) => l.id === currentLesson?.id);
    return idx !== -1 && idx < allLessons.length - 1 ? allLessons[idx + 1] : null;
  }, [allLessons, currentLesson?.id]);

  const getPrevLesson = useCallback(() => {
    const idx = allLessons.findIndex((l: Lesson) => l.id === currentLesson?.id);
    return idx > 0 ? allLessons[idx - 1] : null;
  }, [allLessons, currentLesson?.id]);

  const nextLesson = getNextLesson();
  const prevLesson = getPrevLesson();

  const completedCount = allLessons.filter((l: Lesson) => l.completed).length;
  const progressPercent = allLessons.length > 0 ? (completedCount / allLessons.length) * 100 : 0;
  const kidPoints = currentKid?.total_points || 0;
  const kidLevel = Math.floor(kidPoints / 100) + 1;

  if (loading && !currentCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-orange-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your course...</p>
        </div>
      </div>
    );
  }

  if (!currentCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-orange-50">
        <div className="text-center">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Course not found</h2>
          <p className="text-gray-500 mb-4">You may not be enrolled in this course.</p>
          <Link to="/kid/dashboard" className="text-purple-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-purple-100 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-purple-50 text-purple-600"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/kid/dashboard" className="flex items-center gap-2">
              <Code2 size={20} className="text-purple-600" />
              <span className="font-bold text-purple-900 hidden sm:inline">AkiliCode</span>
            </Link>
            <div className="hidden md:block h-6 w-px bg-gray-200" />
            <h1 className="text-sm font-semibold text-gray-700 line-clamp-1">
              {currentCourse.course?.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Trophy size={14} className="text-yellow-500" />
                <span className="text-sm font-semibold text-gray-600">{kidPoints} pts</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={14} className="text-purple-500" />
                <span className="text-sm font-semibold text-gray-600">Level {kidLevel}</span>
              </div>
            </div>
            <div className="w-32 bg-gray-200 rounded-full h-2 hidden sm:block">
              <div
                className="bg-gradient-to-r from-purple-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-57px)]">
        <aside
          className={`
            fixed lg:relative inset-y-0 left-0 z-30 w-80 bg-white border-r border-purple-100
            transform transition-transform duration-300 ease-in-out overflow-y-auto
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="p-4 border-b border-purple-100 sticky top-0 bg-white">
            <h2 className="font-bold text-gray-800">Course Content</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-purple-500 to-orange-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{completedCount}/{allLessons.length}</span>
            </div>
          </div>

          <div className="p-3">
            {currentCourse.modules?.map((module: ModuleWithLessons) => (
              <div key={module.id} className="mb-4">
                <div className="font-semibold text-gray-700 text-sm mb-2 px-2">
                  {module.title}
                </div>
                <div className="space-y-1">
                  {module.lessons?.map((lesson: Lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => handleSelectLesson(lesson)}
                      className={`
                        w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2
                        ${selectedLesson?.id === lesson.id
                          ? "bg-gradient-to-r from-purple-50 to-orange-50 text-purple-700"
                          : "hover:bg-gray-50 text-gray-600"
                        }
                      `}
                    >
                      {lesson.completed ? (
                        <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle size={16} className="text-gray-300 flex-shrink-0" />
                      )}
                      <span className="text-sm flex-1">{lesson.title}</span>
                      {lesson.completed && <Star size={12} className="text-yellow-500" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          {!currentLesson ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="text-center max-w-md">
                <BookOpen size={64} className="mx-auto text-purple-200 mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Welcome to {currentCourse.course?.title}!
                </h2>
                <p className="text-gray-500 mb-4">
                  Select a lesson from the sidebar to start learning.
                </p>
                {currentCourse.modules?.[0]?.lessons?.[0] && (
                  <button
                    onClick={() => handleSelectLesson(currentCourse.modules[0].lessons[0])}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                  >
                    Start First Lesson →
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 max-w-5xl mx-auto">
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <span>{currentCourse.course?.title}</span>
                  <ChevronRight size={14} />
                  <span>{currentLesson.title}</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800">{currentLesson.title}</h1>
                {currentLesson.completed && (
                  <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    <CheckCircle size={12} />
                    Completed! +{currentLesson.points_earned} points
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: currentLesson.notes || "<p>No content available for this lesson.</p>",
                  }}
                />
              </div>

              <div className="bg-gray-900 rounded-xl overflow-hidden mb-6">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    <Code2 size={16} className="text-purple-400" />
                    <span className="text-sm text-gray-300">Code Editor</span>
                    {currentLesson.language && (
                      <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded">
                        {currentLesson.language}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRunCode}
                      disabled={isRunning}
                      className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition flex items-center gap-1"
                    >
                      {isRunning ? <Loader2 size={14} className="animate-spin" /> : "Run"}
                    </button>
                    <button
                      onClick={handleSubmitCode}
                      disabled={submitting || currentLesson.completed}
                      className="px-3 py-1 text-sm bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white rounded-lg transition flex items-center gap-1 disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <>
                          <Send size={12} />
                          Submit
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={currentLesson.completed}
                  className="w-full h-64 bg-gray-900 text-green-400 font-mono text-sm p-4 outline-none resize-none"
                  style={{ fontFamily: "'Courier New', monospace" }}
                  spellCheck={false}
                />
              </div>

              {output && (
                <div className="bg-gray-800 rounded-xl overflow-hidden mb-6">
                  <div className="px-4 py-2 bg-gray-700 border-b border-gray-600">
                    <span className="text-sm text-gray-300 flex items-center gap-2">
                      <Clock size={14} />
                      Output
                    </span>
                  </div>
                  <pre className="text-gray-300 font-mono text-sm p-4 whitespace-pre-wrap">
                    {output}
                  </pre>
                </div>
              )}

              <div className="flex justify-between gap-4">
                <button
                  onClick={() => prevLesson && handleSelectLesson(prevLesson)}
                  disabled={!prevLesson}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  <ChevronLeft size={16} />
                  Previous Lesson
                </button>

                {!currentLesson.completed && (
                  <button
                    onClick={handleSubmitCode}
                    disabled={submitting}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-orange-600 transition flex items-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={16} />
                        Submit & Continue
                      </>
                    )}
                  </button>
                )}

                {currentLesson.completed && nextLesson && (
                  <button
                    onClick={() => handleSelectLesson(nextLesson)}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
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