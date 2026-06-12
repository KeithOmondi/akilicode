import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Plus,
  BookOpen,
  Trash2,
  ChevronRight,
  Loader2,
  CheckCircle2,
  X,
  GripVertical,
  Code2,
  FileText,
} from "lucide-react";
import type { AppDispatch, RootState } from "../../store/store";
import {
  getCourseCurriculum,
  createLesson,
  deleteLesson,
  resetCourseState,
} from "../../store/slices/courseSlice";
import type {
  Lesson,
  LessonLanguage,
  ModuleWithLessons,
} from "../../interfaces/course.interface";

// ─── Shared Styles (gray theme, high contrast) ───────────────────────────────

const inputClass =
  "w-full bg-gray-900/60 border border-gray-700 rounded-xl py-3 px-4 text-white placeholder:text-gray-500 outline-none focus:border-orange-500 focus:bg-gray-900 transition-all text-sm";

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
      {label}
    </label>
    {children}
    {error && (
      <p className="text-[11px] text-rose-400 font-semibold">{error}</p>
    )}
  </div>
);

// ─── Language Badge (adjusted for gray bg) ────────────────────────────────────

const LANGUAGE_STYLES: Record<string, { label: string; color: string }> = {
  javascript: {
    label: "JS",
    color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  },
  python: {
    label: "PY",
    color: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  },
  html: {
    label: "HTML",
    color: "bg-orange-500/10 border-orange-500/20 text-orange-400",
  },
  scratch: {
    label: "Scratch",
    color: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  },
};

const LanguageBadge = ({ language }: { language?: LessonLanguage }) => {
  if (!language)
    return (
      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-gray-700 bg-gray-800 text-gray-400 uppercase tracking-wider">
        Notes Only
      </span>
    );
  const style = LANGUAGE_STYLES[language] ?? {
    label: language,
    color: "bg-gray-800 border-gray-700 text-gray-400",
  };
  return (
    <span
      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${style.color}`}
    >
      {style.label}
    </span>
  );
};

// ─── Add Lesson Modal (gray theme) ───────────────────────────────────────────

interface LessonFormData {
  title: string;
  language: LessonLanguage | "";
  assignment: string;
  order_index: string;
}

const LANGUAGE_OPTIONS: { value: LessonLanguage; label: string }[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "html", label: "HTML / CSS" },
  { value: "scratch", label: "Scratch" },
];

interface AddLessonModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: LessonFormData) => Promise<void>;
  submitting: boolean;
  nextOrder: number;
}

const AddLessonModalContent = ({
  onClose,
  onSubmit,
  submitting,
  nextOrder,
}: Omit<AddLessonModalProps, "open">) => {
  const [form, setForm] = useState<LessonFormData>({
    title: "",
    language: "",
    assignment: "",
    order_index: String(nextOrder),
  });
  type FormErrors = Partial<Record<keyof LessonFormData, string>>;
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await onSubmit(form);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch {
      /* handled in parent */
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
      }}
      onClick={(e) => {
        if (e.currentTarget === e.target) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="border-b border-gray-800 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              New <span className="text-orange-500">Lesson</span>
            </h2>
            <p className="text-gray-400 text-xs font-medium mt-0.5">
              Notes, starter code, and assignment are added after creation
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-800 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-all border border-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-5">
          <Field label="Lesson Title" error={errors.title}>
            <input
              type="text"
              placeholder="e.g. What is a Variable?"
              value={form.title}
              onChange={(e) => {
                setForm((p) => ({ ...p, title: e.target.value }));
                if (errors.title) setErrors((p) => ({ ...p, title: "" }));
              }}
              className={inputClass}
              autoFocus
            />
          </Field>

          <Field label="Language (optional)">
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      language: p.language === opt.value ? "" : opt.value,
                    }))
                  }
                  className={`py-3 px-4 rounded-xl border font-bold text-sm transition-all ${
                    form.language === opt.value
                      ? "bg-orange-500/20 border-orange-500/40 text-orange-400"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, language: "" }))}
                className={`py-3 px-4 rounded-xl border font-bold text-sm transition-all col-span-2 ${
                  form.language === ""
                    ? "bg-gray-700 border-gray-500 text-gray-200"
                    : "bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-500"
                }`}
              >
                Notes Only (No Code Editor)
              </button>
            </div>
          </Field>

          <Field label="Assignment (coding task description)">
            <textarea
              placeholder="Describe what the student should build and how to submit their GitHub repository..."
              value={form.assignment}
              onChange={(e) => setForm((p) => ({ ...p, assignment: e.target.value }))}
              rows={3}
              className={inputClass}
            />
            <p className="text-[10px] text-gray-500 font-mono -mt-1">
              This can be left empty and filled later in the lesson editor.
            </p>
          </Field>

          <Field label="Order">
            <input
              type="number"
              placeholder="0"
              value={form.order_index}
              onChange={(e) =>
                setForm((p) => ({ ...p, order_index: e.target.value }))
              }
              className={inputClass}
              min={0}
            />
          </Field>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl border border-gray-700 text-gray-400 font-bold text-sm uppercase tracking-wider hover:bg-gray-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || success}
              className={`flex-1 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                success
                  ? "bg-green-600 text-white"
                  : "bg-orange-500 hover:bg-orange-600 text-white shadow-lg active:scale-95 disabled:opacity-60"
              }`}
            >
              {success ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>Added!</span>
                </>
              ) : submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus size={18} strokeWidth={3} />
                  <span>Add Lesson</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddLessonModal = (props: AddLessonModalProps) => {
  if (!props.open) return null;
  return (
    <AddLessonModalContent
      key={props.nextOrder}
      onClose={props.onClose}
      onSubmit={props.onSubmit}
      submitting={props.submitting}
      nextOrder={props.nextOrder}
    />
  );
};

// ─── Main Component (gray background) ─────────────────────────────────────────

const AdminModuleDetail = () => {
  const { courseId, moduleId } = useParams<{
    courseId: string;
    moduleId: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentCurriculum, loading, error } = useSelector(
    (s: RootState) => s.course
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (courseId && !currentCurriculum) dispatch(getCourseCurriculum(courseId));
    return () => {
      dispatch(resetCourseState());
    };
  }, [dispatch, courseId, currentCurriculum]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const currentModule: ModuleWithLessons | undefined =
    currentCurriculum?.modules.find((m) => m.id === moduleId);

  const lessons: Lesson[] = currentModule?.lessons ?? [];
  const nextOrder = lessons.length;

  const handleAddLesson = async (formData: LessonFormData) => {
    if (!moduleId) return;
    setSubmitting(true);
    try {
      await dispatch(
        createLesson({
          module_id: moduleId,
          title: formData.title,
          language: formData.language || undefined,
          assignment: formData.assignment || undefined,
          order_index: Number(formData.order_index) || 0,
        })
      ).unwrap();
      toast.success("Lesson added!");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to add lesson");
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm("Delete this lesson?")) return;
    setDeletingId(lessonId);
    try {
      await dispatch(deleteLesson(lessonId)).unwrap();
      toast.success("Lesson deleted");
    } catch {
      toast.error("Failed to delete lesson");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && !currentCurriculum) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">
            Loading module...
          </span>
        </div>
      </div>
    );
  }

  if (!currentModule) return null;

  return (
    <div className="p-6 lg:p-10 bg-gray-950 min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={() => navigate("/admin/courses")}
          className="text-gray-400 hover:text-orange-400 font-bold text-sm transition-colors"
        >
          Courses
        </button>
        <ChevronRight size={14} className="text-gray-600" />
        <button
          onClick={() => navigate(`/admin/courses/${courseId}`)}
          className="text-gray-400 hover:text-orange-400 font-bold text-sm transition-colors truncate max-w-[160px]"
        >
          {currentCurriculum?.title}
        </button>
        <ChevronRight size={14} className="text-gray-600" />
        <span className="text-white font-bold text-sm truncate max-w-[160px]">
          {currentModule.title}
        </span>
      </div>

      {/* Back */}
      <button
        onClick={() => navigate(`/admin/courses/${courseId}`)}
        className="flex items-center gap-2 text-gray-400 hover:text-orange-400 font-bold text-sm mb-6 transition-colors group"
      >
        <ArrowLeft
          size={16}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Back to Course
      </button>

      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
        <div>
          <p className="text-[11px] font-bold text-orange-400 uppercase tracking-wider mb-2">
            Module
          </p>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {currentModule.title}
          </h1>
          {currentModule.description && (
            <p className="text-gray-400 text-sm mt-1 max-w-xl">
              {currentModule.description}
            </p>
          )}
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-4 rounded-2xl flex items-center gap-2 transition-all shadow-lg active:scale-95 whitespace-nowrap"
        >
          <Plus size={18} strokeWidth={3} />
          <span>ADD LESSON</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
          <p className="text-[11px] font-bold text-orange-400 uppercase tracking-wider mb-1">
            Lessons
          </p>
          <p className="text-2xl font-bold text-white">{lessons.length}</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
          <p className="text-[11px] font-bold text-orange-400 uppercase tracking-wider mb-1">
            With Code Editor
          </p>
          <p className="text-2xl font-bold text-white">
            {lessons.filter((l) => l.language).length}
          </p>
        </div>
      </div>

      {/* Lessons List */}
      <div className="flex flex-col gap-3">
        {lessons.length === 0 ? (
          <div className="bg-gray-900/30 border border-gray-800 rounded-2xl py-20 text-center">
            <BookOpen size={40} className="mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">
              No lessons yet
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Add your first lesson to this module
            </p>
          </div>
        ) : (
          lessons.map((lesson: Lesson, idx) => (
            <div
              key={lesson.id}
              className="group bg-gray-900/30 border border-gray-800 hover:border-gray-600 rounded-2xl p-5 transition-all"
            >
              <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                <GripVertical
                  size={16}
                  className="text-gray-600 flex-shrink-0"
                />
                <div className="w-8 h-8 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-400 font-bold text-xs">
                    {idx + 1}
                  </span>
                </div>
                <div className="flex-shrink-0">
                  {lesson.language ? (
                    <Code2 size={16} className="text-orange-400" />
                  ) : (
                    <FileText size={16} className="text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate group-hover:text-orange-400 transition-colors">
                    {lesson.title}
                  </p>
                  {lesson.notes && (
                    <p className="text-gray-500 text-xs mt-0.5 truncate">
                      {lesson.notes.slice(0, 80)}...
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <LanguageBadge language={lesson.language} />
                  {lesson.assignment && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-wider">
                      Assignment
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() =>
                      navigate(
                        `/admin/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-bold text-xs transition-all"
                  >
                    <span>Edit</span>
                    <ChevronRight size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteLesson(lesson.id)}
                    disabled={deletingId === lesson.id}
                    className="p-2 rounded-xl hover:bg-rose-500/10 text-rose-500/50 hover:text-rose-400 transition-all disabled:opacity-40"
                  >
                    {deletingId === lesson.id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AddLessonModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddLesson}
        submitting={submitting}
        nextOrder={nextOrder}
      />
    </div>
  );
};

export default AdminModuleDetail;