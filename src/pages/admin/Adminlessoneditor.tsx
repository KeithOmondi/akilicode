import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import Editor from "@monaco-editor/react";
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  Save,
  Code2,
  FileText,
  Eye,
  EyeOff,
  RotateCcw,
} from "lucide-react";
import type { AppDispatch, RootState } from "../../store/store";
import {
  getLessonById,
  updateLesson,
  getCourseCurriculum,
  resetCourseState,
} from "../../store/slices/courseSlice";
import type { LessonLanguage } from "../../interfaces/course.interface";

// ─── Language Config ──────────────────────────────────────────────────────────

type LangConfig = { monacoLang: string; label: string; defaultStarter: string };

const LANGUAGE_CONFIG: Record<LessonLanguage, LangConfig> = {
  javascript: {
    monacoLang: "javascript",
    label: "JavaScript",
    defaultStarter: `// Welcome to the code editor!\n// Try writing your first JavaScript code below.\n\nconsole.log("Hello, World!");\n`,
  },
  python: {
    monacoLang: "python",
    label: "Python",
    defaultStarter: `# Welcome to the code editor!\n# Try writing your first Python code below.\n\nprint("Hello, World!")\n`,
  },
  html: {
    monacoLang: "html",
    label: "HTML / CSS",
    defaultStarter: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <title>My Page</title>\n  <style>\n    body { font-family: sans-serif; padding: 20px; }\n  </style>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>\n`,
  },
  scratch: {
    monacoLang: "plaintext",
    label: "Scratch",
    defaultStarter: `// Scratch lesson — describe the blocks here.\n// e.g. When [Green Flag] clicked → Move 10 steps\n`,
  },
};

// ─── Tab Button ───────────────────────────────────────────────────────────────

const TabButton = ({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all border ${
      active
        ? "bg-orange-500/15 border-orange-500/30 text-orange-400"
        : "bg-purple-950/20 border-purple-800/30 text-purple-500 hover:border-purple-600 hover:text-purple-300"
    }`}
  >
    <Icon size={14} />
    {label}
  </button>
);

// ─── Markdown Preview ─────────────────────────────────────────────────────────

const renderMarkdown = (text: string): string => {
  return text
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/^(?!<[h|u|l|p])(.+)$/gm, "<p>$1</p>")
    .replace(/<p><\/p>/g, "");
};

// ─── Main Component ───────────────────────────────────────────────────────────

type ActiveTab = "notes" | "starter" | "solution";

const AdminLessonEditor = () => {
  const { courseId, moduleId, lessonId } = useParams<{
    courseId: string;
    moduleId: string;
    lessonId: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentLesson, currentCurriculum, loading, error } = useSelector(
    (s: RootState) => s.course
  );

  // ── Editor State ───────────────────────────────────────────────────────────
  const [notes, setNotes] = useState("");
  const [starterCode, setStarterCode] = useState("");
  const [solutionCode, setSolutionCode] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("notes");
  const [previewNotes, setPreviewNotes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // ── Load lesson & curriculum ───────────────────────────────────────────────
  useEffect(() => {
    if (lessonId) dispatch(getLessonById(lessonId));
    if (courseId && !currentCurriculum) dispatch(getCourseCurriculum(courseId));
    return () => {
      dispatch(resetCourseState());
    };
  }, [dispatch, lessonId, courseId, currentCurriculum]);

  // ── Populate fields when lesson loads ─────────────────────────────────────
  // Use a ref to track which lesson we last initialised from so we only
  // populate once per lesson identity — avoids synchronous setState in effect.
  const initialisedForLesson = useRef<string | null>(null);

  useEffect(() => {
    if (currentLesson && currentLesson.id !== initialisedForLesson.current) {
      initialisedForLesson.current = currentLesson.id;
      setNotes(currentLesson.notes ?? "");
      setStarterCode(
        currentLesson.starter_code ??
          (currentLesson.language
            ? LANGUAGE_CONFIG[currentLesson.language]?.defaultStarter ?? ""
            : "")
      );
      setSolutionCode(currentLesson.solution_code ?? "");
      setDirty(false);
    }
  }, [currentLesson]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // ── Dirty tracking ─────────────────────────────────────────────────────────
  const markDirty = useCallback(() => setDirty(true), []);

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!lessonId) return;
    setSaving(true);
    try {
      await dispatch(
        updateLesson({
          lessonId,
          data: {
            notes: notes || undefined,
            starter_code: starterCode || undefined,
            solution_code: solutionCode || undefined,
          },
        })
      ).unwrap();
      toast.success("Lesson saved!");
      setDirty(false);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to save lesson");
    } finally {
      setSaving(false);
    }
  }, [dispatch, lessonId, notes, starterCode, solutionCode]);

  // ── Reset to last saved ────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    if (!currentLesson) return;
    setNotes(currentLesson.notes ?? "");
    setStarterCode(currentLesson.starter_code ?? "");
    setSolutionCode(currentLesson.solution_code ?? "");
    setDirty(false);
    toast("Reset to last saved version", { icon: "↩️" });
  }, [currentLesson]);

  // ── Keyboard shortcut: Ctrl+S / Cmd+S ────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (dirty && !saving) handleSave();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [dirty, saving, handleSave]);

  const lesson = currentLesson;
  const langConfig = lesson?.language ? LANGUAGE_CONFIG[lesson.language] : null;
  const monacoLang = langConfig?.monacoLang ?? "plaintext";
  const currentModule = currentCurriculum?.modules.find(
    (m) => m.id === moduleId
  );

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading && !currentLesson) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-purple-500 font-black text-[10px] uppercase tracking-widest">
            Loading lesson...
          </span>
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <div className="flex flex-col h-full">
      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 lg:px-10 py-5 border-b border-purple-900/20 bg-[#080218]/60 backdrop-blur-sm sticky top-0 z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => navigate("/admin/courses")}
            className="text-purple-600 hover:text-purple-400 font-bold text-xs transition-colors hidden sm:block"
          >
            Courses
          </button>
          <ChevronRight size={12} className="text-purple-800 hidden sm:block" />
          <button
            onClick={() => navigate(`/admin/courses/${courseId}`)}
            className="text-purple-600 hover:text-purple-400 font-bold text-xs transition-colors hidden sm:block truncate max-w-[100px]"
          >
            {currentCurriculum?.title ?? "Course"}
          </button>
          <ChevronRight size={12} className="text-purple-800 hidden sm:block" />
          <button
            onClick={() =>
              navigate(`/admin/courses/${courseId}/modules/${moduleId}`)
            }
            className="text-purple-600 hover:text-purple-400 font-bold text-xs transition-colors truncate max-w-[100px]"
          >
            {currentModule?.title ?? "Module"}
          </button>
          <ChevronRight size={12} className="text-purple-800" />
          <span className="text-white font-bold text-xs truncate max-w-[140px]">
            {lesson.title}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {dirty && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-purple-800/30 text-purple-500 hover:text-purple-300 font-bold text-xs transition-all"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
              dirty
                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg active:scale-95"
                : "bg-purple-950/20 border border-purple-800/30 text-purple-600 cursor-not-allowed"
            } disabled:opacity-60`}
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            <span>{saving ? "Saving..." : dirty ? "Save" : "Saved"}</span>
          </button>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 p-6 lg:p-10 flex flex-col gap-6">
        {/* Lesson Meta */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <button
              onClick={() =>
                navigate(`/admin/courses/${courseId}/modules/${moduleId}`)
              }
              className="flex items-center gap-2 text-purple-500 hover:text-orange-400 font-bold text-sm mb-3 transition-colors group"
            >
              <ArrowLeft
                size={15}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Back to Module
            </button>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {lesson.title}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              {lesson.language ? (
                <span className="text-[10px] font-black px-2.5 py-1 rounded-lg border bg-orange-500/10 border-orange-500/20 text-orange-400 uppercase tracking-widest">
                  {langConfig?.label}
                </span>
              ) : (
                <span className="text-[10px] font-black px-2.5 py-1 rounded-lg border bg-purple-900/20 border-purple-800/30 text-purple-500 uppercase tracking-widest">
                  Notes Only
                </span>
              )}
              <span className="text-purple-700 text-[10px] font-bold uppercase tracking-widest">
                · Ctrl+S to save
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <TabButton
            active={activeTab === "notes"}
            onClick={() => setActiveTab("notes")}
            icon={FileText}
            label="Notes"
          />
          {lesson.language && (
            <>
              <TabButton
                active={activeTab === "starter"}
                onClick={() => setActiveTab("starter")}
                icon={Code2}
                label="Starter Code"
              />
              <TabButton
                active={activeTab === "solution"}
                onClick={() => setActiveTab("solution")}
                icon={Code2}
                label="Solution"
              />
            </>
          )}
        </div>

        {/* ── Notes Tab ───────────────────────────────────────────────────── */}
        {activeTab === "notes" && (
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black text-purple-500 uppercase tracking-widest">
                Lesson Notes (Markdown)
              </p>
              <button
                onClick={() => setPreviewNotes((v) => !v)}
                className="flex items-center gap-1.5 text-purple-500 hover:text-orange-400 font-bold text-xs transition-colors"
              >
                {previewNotes ? <EyeOff size={13} /> : <Eye size={13} />}
                {previewNotes ? "Edit" : "Preview"}
              </button>
            </div>

            {previewNotes ? (
              <div
                className="flex-1 min-h-[400px] bg-purple-950/10 border border-purple-900/20 rounded-2xl p-6 overflow-y-auto prose prose-invert prose-sm max-w-none
                  [&_h1]:text-white [&_h1]:font-black [&_h1]:text-xl [&_h1]:mb-3
                  [&_h2]:text-white [&_h2]:font-black [&_h2]:text-lg [&_h2]:mb-2
                  [&_h3]:text-orange-400 [&_h3]:font-black [&_h3]:text-base [&_h3]:mb-2
                  [&_p]:text-purple-300 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:mb-3
                  [&_strong]:text-white [&_strong]:font-black
                  [&_em]:text-purple-300 [&_em]:italic
                  [&_code]:bg-purple-900/40 [&_code]:text-orange-300 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
                  [&_ul]:text-purple-300 [&_ul]:text-sm [&_ul]:pl-4 [&_ul]:mb-3
                  [&_li]:mb-1"
                dangerouslySetInnerHTML={{
                  __html:
                    renderMarkdown(notes) ||
                    "<p class='text-purple-700'>Nothing to preview yet — write some notes first.</p>",
                }}
              />
            ) : (
              <textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  markDirty();
                }}
                placeholder={`# Lesson Title\n\nWrite your lesson notes here using Markdown.\n\n## What you'll learn\n- Variables store information\n- Use \`let\` to create a variable\n\n## Example\n\`let name = "Alex";\``}
                className="flex-1 min-h-[400px] bg-purple-950/10 border border-purple-900/20 rounded-2xl p-6 text-purple-200 placeholder:text-purple-800 outline-none focus:border-orange-500/40 transition-all text-sm font-mono leading-relaxed resize-none"
              />
            )}
          </div>
        )}

        {/* ── Starter Code Tab ─────────────────────────────────────────────── */}
        {activeTab === "starter" && lesson.language && (
          <div className="flex flex-col gap-3 flex-1">
            <p className="text-[11px] font-black text-purple-500 uppercase tracking-widest">
              Starter Code — shown to the student when they open the lesson
            </p>
            <div className="flex-1 min-h-[400px] rounded-2xl overflow-hidden border border-purple-900/20">
              <Editor
                height="400px"
                language={monacoLang}
                value={starterCode}
                onChange={(val) => {
                  setStarterCode(val ?? "");
                  markDirty();
                }}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  fontFamily: "JetBrains Mono, Fira Code, monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 20, bottom: 20 },
                  lineNumbers: "on",
                  roundedSelection: true,
                  automaticLayout: true,
                  tabSize: 2,
                }}
              />
            </div>
          </div>
        )}

        {/* ── Solution Code Tab ────────────────────────────────────────────── */}
        {activeTab === "solution" && lesson.language && (
          <div className="flex flex-col gap-3 flex-1">
            <p className="text-[11px] font-black text-purple-500 uppercase tracking-widest">
              Solution Code — admin reference only, not shown to students
            </p>
            <div className="flex-1 min-h-[400px] rounded-2xl overflow-hidden border border-purple-900/20">
              <Editor
                height="400px"
                language={monacoLang}
                value={solutionCode}
                onChange={(val) => {
                  setSolutionCode(val ?? "");
                  markDirty();
                }}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  fontFamily: "JetBrains Mono, Fira Code, monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 20, bottom: 20 },
                  lineNumbers: "on",
                  roundedSelection: true,
                  automaticLayout: true,
                  tabSize: 2,
                }}
              />
            </div>
          </div>
        )}

        {/* Unsaved changes indicator */}
        {dirty && (
          <div className="flex items-center gap-2 text-orange-400/70 text-xs font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            Unsaved changes — press Ctrl+S or click Save
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLessonEditor;