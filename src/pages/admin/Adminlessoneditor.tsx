import { sanitizeHtml } from "../../lib/sanitize";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  Save,
  FileText,
  Eye,
  EyeOff,
  RotateCcw,
  ClipboardList,
  HelpCircle,
  Plus,
  Trash2,
  Edit3,
  X,
  CheckCircle2,
} from "lucide-react";
import type { AppDispatch, RootState } from "../../store/store";
import {
  getLessonById,
  updateLesson,
  getCourseCurriculum,
  resetCourseState,
  getLessonQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from "../../store/slices/courseSlice";
import type { LessonLanguage, Question } from "../../interfaces/course.interface";

// ─── Language Config ──────────────────────────────────────────────────────────
type LangConfig = { label: string };

const LANGUAGE_CONFIG: Record<LessonLanguage, LangConfig> = {
  javascript: { label: "JavaScript" },
  python: { label: "Python" },
  html: { label: "HTML / CSS" },
  scratch: { label: "Scratch" },
};

// ─── Tab Button ──────────────────────────────────────────────────────────────
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
    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
      active
        ? "bg-brand-100 border-brand-500/40 text-brand-700"
        : "bg-ink-100 border-ink-200 text-ink-500 hover:border-ink-500 hover:text-ink-700"
    }`}
  >
    <Icon size={14} />
    {label}
  </button>
);

// ─── Markdown Preview ─────────────────────────────────────────────────────────
const renderMarkdown = (text: string): string => {
  if (!text) return "";
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

const PREVIEW_CLASSES = `
  flex-1 min-h-[400px] bg-white border border-ink-200 rounded-2xl p-6 overflow-y-auto
  prose prose-invert prose-sm max-w-none
  [&_h1]:text-ink-900 [&_h1]:font-bold [&_h1]:text-xl [&_h1]:mb-3
  [&_h2]:text-ink-900 [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mb-2
  [&_h3]:text-brand-700 [&_h3]:font-bold [&_h3]:text-base [&_h3]:mb-2
  [&_p]:text-ink-700 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:mb-3
  [&_strong]:text-ink-900 [&_strong]:font-bold
  [&_em]:text-ink-700 [&_em]:italic
  [&_code]:bg-ink-100 [&_code]:text-orange-300 [&_code]:px-1.5 [&_code]:py-0.5
  [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
  [&_ul]:text-ink-700 [&_ul]:text-sm [&_ul]:pl-4 [&_ul]:mb-3
  [&_li]:mb-1
`.trim();

const TEXTAREA_CLASSES = `
  flex-1 min-h-[400px] bg-white border border-ink-200 rounded-2xl p-6
  text-ink-700 placeholder:text-ink-500 outline-none focus:border-brand-500
  transition-all text-sm font-mono leading-relaxed resize-none
`.trim();

const PreviewToggle = ({
  previewing,
  onToggle,
}: {
  previewing: boolean;
  onToggle: () => void;
}) => (
  <button
    onClick={onToggle}
    className="flex items-center gap-1.5 text-ink-500 hover:text-brand-700 font-bold text-xs transition-colors flex-shrink-0"
  >
    {previewing ? <EyeOff size={13} /> : <Eye size={13} />}
    {previewing ? "Edit" : "Preview"}
  </button>
);

// ─── Question Modal (no effect, uses key to reset) ────────────────────────────
interface QuestionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { question: string; options: string[]; answer: number; order_index: number }) => Promise<void>;
  initialData?: Question | null;
  submitting: boolean;
  nextOrder: number;
}

const QuestionModal = ({ open, onClose, onSubmit, initialData, submitting, nextOrder }: QuestionModalProps) => {
  // Because the parent uses a `key` prop, this component is remounted when `open` changes,
  // so we can safely initialise state with the current props – no effect needed.
  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        question: initialData.question,
        optionA: initialData.options[0] ?? "",
        optionB: initialData.options[1] ?? "",
        optionC: initialData.options[2] ?? "",
        optionD: initialData.options[3] ?? "",
        answer: initialData.answer,
        order_index: initialData.order_index,
      };
    }
    return {
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      answer: 0,
      order_index: nextOrder,
    };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.question.trim()) newErrors.question = "Question is required";
    if (!form.optionA.trim()) newErrors.optionA = "Option A is required";
    if (!form.optionB.trim()) newErrors.optionB = "Option B is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const options = [form.optionA, form.optionB, form.optionC, form.optionD].filter((o) => o.trim() !== "");
    try {
      await onSubmit({ question: form.question, options, answer: form.answer, order_index: form.order_index });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch {
      // error handled in parent
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-2xl bg-white border border-ink-200 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-ink-200 px-8 py-5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-ink-900">{initialData ? "Edit Question" : "New Question"}</h2>
          <button onClick={onClose} className="text-ink-500 hover:text-ink-900"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="text-brand-700 text-xs font-bold uppercase">Question</label>
            <textarea
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              className="w-full bg-ink-100 border border-ink-200 rounded-xl p-3 text-ink-900"
              rows={3}
              required
            />
            {errors.question && <p className="text-red-700 text-xs mt-1">{errors.question}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(["A", "B", "C", "D"] as const).map((letter) => {
              const field = `option${letter}` as keyof typeof form;
              return (
                <div key={letter}>
                  <label className="text-ink-500 text-xs font-bold">Option {letter}</label>
                  <input
                    type="text"
                    value={form[field] as string}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="w-full bg-ink-100 border border-ink-200 rounded-xl p-2 text-ink-900"
                    required={letter === "A" || letter === "B"}
                  />
                </div>
              );
            })}
          </div>
          <div>
            <label className="text-ink-500 text-xs font-bold">Correct Answer</label>
            <select
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: Number(e.target.value) })}
              className="w-full bg-ink-100 border border-ink-200 rounded-xl p-2 text-ink-900"
            >
              {["A", "B", "C", "D"].map((letter, idx) => (
                <option key={idx} value={idx}>Option {letter}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-ink-500 text-xs font-bold">Order</label>
            <input
              type="number"
              value={form.order_index}
              onChange={(e) => setForm({ ...form, order_index: Number(e.target.value) })}
              className="w-full bg-ink-100 border border-ink-200 rounded-xl p-2 text-ink-900"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-ink-200 rounded-xl text-ink-500">Cancel</button>
            <button type="submit" disabled={submitting || success} className="flex-1 py-3 bg-brand-600 rounded-xl text-white font-bold disabled:opacity-60">
              {success
                ? <><CheckCircle2 size={18} className="inline mr-2" />Saved!</>
                : submitting
                  ? <><Loader2 size={18} className="animate-spin inline mr-2" />Saving...</>
                  : <><Plus size={18} className="inline mr-2" />{initialData ? "Update" : "Create"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
type ActiveTab = "notes" | "assignment" | "questions";

const AdminLessonEditor = () => {
  const { courseId, moduleId, lessonId } = useParams<{
    courseId: string;
    moduleId: string;
    lessonId: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentLesson, currentCurriculum, loading, error, currentLessonQuestions } = useSelector(
    (s: RootState) => s.course
  );

  const [notes, setNotes] = useState("");
  const [assignment, setAssignment] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("notes");
  const [previewNotes, setPreviewNotes] = useState(false);
  const [previewAssignment, setPreviewAssignment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  const safeLessonId = lessonId!;
  const safeCourseId = courseId!;
  const safeModuleId = moduleId!;

  // ─── Data fetching ────────────────────────────────────────────────────────
  useEffect(() => {
    if (safeLessonId) {
      dispatch(getLessonById(safeLessonId));
      dispatch(getLessonQuestions(safeLessonId));
    }
    return () => { dispatch(resetCourseState()); };
  }, [dispatch, safeLessonId]);

  useEffect(() => {
    if (safeCourseId && !currentCurriculum) {
      dispatch(getCourseCurriculum(safeCourseId));
    }
  }, [dispatch, safeCourseId, currentCurriculum]);

  // ─── Sync local state when a new lesson loads ─────────────────────────────
  const lastSeenLessonId = useRef<string | null>(null);
  useEffect(() => {
    if (currentLesson && currentLesson.id !== lastSeenLessonId.current) {
      lastSeenLessonId.current = currentLesson.id;
      setNotes(currentLesson.notes ?? "");
      setAssignment(currentLesson.assignment ?? "");
      setDirty(false);
    }
  }, [currentLesson]);

  // ─── Error toast ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // ─── Keyboard shortcut & save ────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!safeLessonId) return;
    setSaving(true);
    try {
      await dispatch(
        updateLesson({ lessonId: safeLessonId, data: { notes: notes || undefined, assignment: assignment || undefined } })
      ).unwrap();
      toast.success("Lesson saved!");
      setDirty(false);
    } catch {
      toast.error("Failed to save lesson");
    } finally {
      setSaving(false);
    }
  }, [dispatch, safeLessonId, notes, assignment]);

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

  const handleReset = useCallback(() => {
    if (!currentLesson) return;
    setNotes(currentLesson.notes ?? "");
    setAssignment(currentLesson.assignment ?? "");
    setDirty(false);
    toast("Reset to last saved version", { icon: "↩️" });
  }, [currentLesson]);

  // ─── Question handlers ────────────────────────────────────────────────────
  const handleAddQuestion = async (data: { question: string; options: string[]; answer: number; order_index: number }) => {
    if (!safeLessonId) return;
    setSubmittingQuestion(true);
    try {
      await dispatch(addQuestion({ lessonId: safeLessonId, questionData: data })).unwrap();
      toast.success("Question added");
      dispatch(getLessonQuestions(safeLessonId));
      setQuestionModalOpen(false);
    } catch {
      toast.error("Failed to add question");
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleUpdateQuestion = async (data: { question: string; options: string[]; answer: number; order_index: number }) => {
    if (!editingQuestion) return;
    setSubmittingQuestion(true);
    try {
      await dispatch(updateQuestion({ questionId: editingQuestion.id, questionData: data })).unwrap();
      toast.success("Question updated");
      dispatch(getLessonQuestions(safeLessonId));
      setQuestionModalOpen(false);
      setEditingQuestion(null);
    } catch {
      toast.error("Failed to update question");
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Delete this question?")) return;
    try {
      await dispatch(deleteQuestion(questionId)).unwrap();
      toast.success("Question deleted");
      dispatch(getLessonQuestions(safeLessonId));
    } catch {
      toast.error("Failed to delete question");
    }
  };

  const lesson = currentLesson;
  const langConfig = lesson?.language ? LANGUAGE_CONFIG[lesson.language] : null;
  const currentModule = currentCurriculum?.modules.find((m) => m.id === safeModuleId);
  const nextOrder = currentLessonQuestions?.length ?? 0;

  if (loading && !currentLesson) {
    return (
      <div className="flex items-center justify-center h-64 bg-transparent">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-ink-500 font-bold text-[10px] uppercase tracking-wider">Loading lesson...</span>
        </div>
      </div>
    );
  }
  if (!lesson) return null;

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 lg:px-10 py-5 border-b border-ink-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={() => navigate("/admin/courses")} className="text-ink-500 hover:text-brand-700 font-bold text-xs hidden sm:block">Courses</button>
          <ChevronRight size={12} className="text-gray-700 hidden sm:block" />
          <button onClick={() => navigate(`/admin/courses/${safeCourseId}`)} className="text-ink-500 hover:text-brand-700 font-bold text-xs hidden sm:block truncate max-w-[100px]">{currentCurriculum?.title ?? "Course"}</button>
          <ChevronRight size={12} className="text-gray-700 hidden sm:block" />
          <button onClick={() => navigate(`/admin/courses/${safeCourseId}/modules/${safeModuleId}`)} className="text-ink-500 hover:text-brand-700 font-bold text-xs truncate max-w-[100px]">{currentModule?.title ?? "Module"}</button>
          <ChevronRight size={12} className="text-gray-700" />
          <span className="text-ink-900 font-bold text-xs truncate max-w-[140px]">{lesson.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-ink-200 text-ink-500 hover:text-ink-700 font-bold text-xs">
              <RotateCcw size={13} /><span className="hidden sm:inline">Reset</span>
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider ${
              dirty ? "bg-brand-600 hover:bg-brand-700 text-white shadow-lg" : "bg-ink-100 border border-ink-200 text-ink-500 cursor-not-allowed"
            }`}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{saving ? "Saving..." : dirty ? "Save" : "Saved"}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 lg:p-10 flex flex-col gap-6">
        {/* Lesson Meta */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <button onClick={() => navigate(`/admin/courses/${safeCourseId}/modules/${safeModuleId}`)} className="flex items-center gap-2 text-ink-500 hover:text-brand-700 font-bold text-sm mb-3 group">
              <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" /> Back to Module
            </button>
            <h1 className="text-2xl font-bold text-ink-900">{lesson.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              {lesson.language ? (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg border bg-brand-50 border-brand-200 text-brand-700 uppercase tracking-wider">{langConfig?.label}</span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg border bg-ink-100 border-ink-200 text-ink-500 uppercase tracking-wider">Notes Only</span>
              )}
              <span className="text-ink-500 text-[10px] font-bold">· Ctrl+S to save</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <TabButton active={activeTab === "notes"} onClick={() => setActiveTab("notes")} icon={FileText} label="Notes" />
          <TabButton active={activeTab === "assignment"} onClick={() => setActiveTab("assignment")} icon={ClipboardList} label="Assignment" />
          <TabButton active={activeTab === "questions"} onClick={() => setActiveTab("questions")} icon={HelpCircle} label="Questions" />
        </div>

        {/* Notes Tab */}
        {activeTab === "notes" && (
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex justify-between items-center">
              <p className="text-[11px] font-bold text-brand-700 uppercase tracking-wider">Lesson Notes (Markdown)</p>
              <PreviewToggle previewing={previewNotes} onToggle={() => setPreviewNotes((v) => !v)} />
            </div>
            {previewNotes ? (
              <div className={PREVIEW_CLASSES} dangerouslySetInnerHTML={{ __html: sanitizeHtml(renderMarkdown(notes) || "<p class='text-ink-500'>Nothing to preview yet.</p>") }} />
            ) : (
              <textarea
                value={notes}
                onChange={(e) => { setNotes(e.target.value); setDirty(true); }}
                placeholder="# Lesson Title\n\nWrite your lesson notes here."
                className={TEXTAREA_CLASSES}
              />
            )}
          </div>
        )}

        {/* Assignment Tab */}
        {activeTab === "assignment" && (
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[11px] font-bold text-brand-700 uppercase tracking-wider">Assignment (Markdown)</p>
                <p className="text-[10px] text-ink-500">Optional task description for students</p>
              </div>
              <PreviewToggle previewing={previewAssignment} onToggle={() => setPreviewAssignment((v) => !v)} />
            </div>
            {previewAssignment ? (
              <div className={PREVIEW_CLASSES} dangerouslySetInnerHTML={{ __html: sanitizeHtml(renderMarkdown(assignment) || "<p class='text-ink-500'>No assignment yet.</p>") }} />
            ) : (
              <textarea
                value={assignment}
                onChange={(e) => { setAssignment(e.target.value); setDirty(true); }}
                placeholder="# Assignment Title\n\nDescribe what the student should do..."
                className={TEXTAREA_CLASSES}
              />
            )}
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === "questions" && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[11px] font-bold text-brand-700 uppercase tracking-wider">Quiz Questions</p>
                <p className="text-[10px] text-ink-500">Multiple‑choice questions for this lesson</p>
              </div>
              <button
                onClick={() => { setEditingQuestion(null); setQuestionModalOpen(true); }}
                className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold"
              >
                <Plus size={14} /> Add Question
              </button>
            </div>

            {!currentLessonQuestions || currentLessonQuestions.length === 0 ? (
              <div className="bg-white border border-ink-200 rounded-2xl py-16 text-center">
                <HelpCircle size={40} className="mx-auto text-ink-500 mb-3" />
                <p className="text-ink-500 font-bold text-xs">No questions yet</p>
                <p className="text-ink-500 text-xs mt-1">Click "Add Question" to create a quiz</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentLessonQuestions.map((q, idx) => (
                  <div key={q.id} className="bg-white border border-ink-200 rounded-2xl p-4 group hover:border-ink-500 transition-all">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-brand-700 font-bold text-xs bg-brand-50 px-2 py-0.5 rounded">Q{idx + 1}</span>
                          <span className="text-ink-500 text-[10px]">Order: {q.order_index}</span>
                        </div>
                        <p className="text-ink-900 text-sm font-medium mb-2">{q.question}</p>
                        <div className="space-y-1 ml-3">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <span className={`text-xs font-bold ${optIdx === q.answer ? "text-emerald-700" : "text-ink-500"}`}>{String.fromCharCode(65 + optIdx)}.</span>
                              <span className={`text-xs ${optIdx === q.answer ? "text-emerald-300" : "text-ink-500"}`}>{opt}</span>
                              {optIdx === q.answer && <span className="text-[10px] text-emerald-700 ml-2">✓ Correct</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingQuestion(q); setQuestionModalOpen(true); }} className="p-1.5 hover:bg-ink-200 rounded-lg text-ink-500 hover:text-ink-900">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDeleteQuestion(q.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-700 hover:text-red-700">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {dirty && (
          <div className="flex items-center gap-2 text-brand-700/80 text-xs font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            Unsaved changes — press Ctrl+S or click Save
          </div>
        )}
      </div>

      <QuestionModal
        key={questionModalOpen ? "open" : "closed"}  // 🔑 forces remount when open changes
        open={questionModalOpen}
        onClose={() => { setQuestionModalOpen(false); setEditingQuestion(null); }}
        onSubmit={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
        initialData={editingQuestion}
        submitting={submittingQuestion}
        nextOrder={nextOrder}
      />
    </div>
  );
};

export default AdminLessonEditor;