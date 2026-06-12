import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Plus,
  BookOpen,
  Layers,
  Trash2,
  ChevronRight,
  Loader2,
  CheckCircle2,
  X,
  GripVertical,
} from "lucide-react";
import type { AppDispatch, RootState } from "../../store/store";
import {
  getCourseCurriculum,
  createModule,
  deleteModule,
  resetCourseState,
} from "../../store/slices/courseSlice";
import type { Module } from "../../interfaces/course.interface";

// ─── Shared Styles (improved contrast) ───────────────────────────────────────

const inputClass =
  "w-full bg-purple-950/30 border border-purple-700/50 rounded-xl py-3 px-4 text-white placeholder:text-gray-400 outline-none focus:border-orange-500 focus:bg-purple-950/50 transition-all text-sm";

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

// ─── Add Module Modal (improved contrast) ─────────────────────────────────────

interface ModuleFormData {
  title: string;
  description: string;
  order_index: string;
}

interface AddModuleModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ModuleFormData) => Promise<void>;
  submitting: boolean;
  nextOrder: number;
}

const AddModuleModalContent = ({
  onClose,
  onSubmit,
  submitting,
  nextOrder,
}: Omit<AddModuleModalProps, "open">) => {
  const [form, setForm] = useState<ModuleFormData>({
    title: "",
    description: "",
    order_index: String(nextOrder),
  });
  const [errors, setErrors] = useState<Partial<ModuleFormData>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const setField =
    (field: keyof ModuleFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

  const validate = (): boolean => {
    const newErrors: Partial<ModuleFormData> = {};
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
      <div className="relative w-full max-w-lg bg-[#0d0520] border border-purple-700/50 rounded-3xl shadow-2xl">
        <div className="border-b border-purple-800/50 px-8 py-6 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              New <span className="text-orange-500">Module</span>
            </h2>
            <p className="text-gray-400 text-xs font-medium mt-0.5">
              Add a week or topic block to this course
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-purple-900/30 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-all border border-purple-700/50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-5">
          <Field label="Module Title" error={errors.title}>
            <input
              type="text"
              placeholder="e.g. Week 1: Introduction to Coding"
              value={form.title}
              onChange={setField("title")}
              className={inputClass}
              autoFocus
            />
          </Field>

          <Field label="Description (optional)">
            <textarea
              placeholder="What will kids learn in this module?"
              value={form.description}
              onChange={setField("description")}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </Field>

          <Field label="Order">
            <input
              type="number"
              placeholder="0"
              value={form.order_index}
              onChange={setField("order_index")}
              className={inputClass}
              min={0}
            />
          </Field>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl border border-purple-700/50 text-gray-300 font-bold text-sm uppercase tracking-wider hover:bg-purple-900/30 transition-all"
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
                  <span>Add Module</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddModuleModal = (props: AddModuleModalProps) => {
  if (!props.open) return null;
  return (
    <AddModuleModalContent
      key={props.nextOrder}
      onClose={props.onClose}
      onSubmit={props.onSubmit}
      submitting={props.submitting}
      nextOrder={props.nextOrder}
    />
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminCourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentCurriculum, loading, error } = useSelector(
    (s: RootState) => s.course
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) dispatch(getCourseCurriculum(courseId));
    return () => {
      dispatch(resetCourseState());
    };
  }, [dispatch, courseId]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleAddModule = async (formData: ModuleFormData) => {
    if (!courseId) return;
    setSubmitting(true);
    try {
      await dispatch(
        createModule({
          course_id: courseId,
          title: formData.title,
          description: formData.description || undefined,
          order_index: Number(formData.order_index) || 0,
        })
      ).unwrap();
      toast.success("Module added!");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to add module");
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!window.confirm("Delete this module and all its lessons?")) return;
    setDeletingId(moduleId);
    try {
      await dispatch(deleteModule(moduleId)).unwrap();
      toast.success("Module deleted");
    } catch {
      toast.error("Failed to delete module");
    } finally {
      setDeletingId(null);
    }
  };

  const course = currentCurriculum;
  const modules = currentCurriculum?.modules ?? [];
  const nextOrder = modules.length;

  if (loading && !currentCurriculum) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">
            Loading curriculum...
          </span>
        </div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="p-6 lg:p-10 min-h-screen bg-[#0d0520]">
      <button
        onClick={() => navigate("/admin/courses")}
        className="flex items-center gap-2 text-gray-400 hover:text-orange-400 font-bold text-sm mb-8 transition-colors group"
      >
        <ArrowLeft
          size={16}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Back to Courses
      </button>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-purple-900/30 border border-purple-700/50 overflow-hidden flex-shrink-0">
            {course.image_url ? (
              <img
                src={course.image_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen size={24} className="text-gray-500" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20 uppercase tracking-wider">
                {course.category}
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
                  course.is_active
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-gray-800 border-gray-700 text-gray-400"
                }`}
              >
                {course.is_active ? "Active" : "Draft"}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {course.title}
            </h1>
            <p className="text-gray-400 text-sm mt-1 max-w-xl">
              {course.description}
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-4 rounded-2xl flex items-center gap-2 transition-all shadow-lg active:scale-95 whitespace-nowrap"
        >
          <Plus size={18} strokeWidth={3} />
          <span>ADD MODULE</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Modules", value: modules.length, IconComponent: Layers },
          {
            label: "Total Lessons",
            value: modules.reduce((acc, m) => acc + m.lessons.length, 0),
            IconComponent: BookOpen,
          },
          {
            label: "Price",
            value: `KSH ${Number(course.price).toLocaleString()}`,
            IconComponent: null,
          },
        ].map(({ label, value, IconComponent }) => (
          <div
            key={label}
            className="bg-purple-950/20 border border-purple-800/50 rounded-2xl p-5"
          >
            <p className="text-[11px] font-bold text-orange-400 uppercase tracking-wider mb-1">
              {label}
            </p>
            <div className="flex items-center gap-2">
              {IconComponent && (
                <IconComponent size={16} className="text-gray-400" />
              )}
              <p className="text-2xl font-bold text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {modules.length === 0 ? (
          <div className="bg-purple-950/10 border border-purple-800/50 rounded-2xl py-20 text-center">
            <Layers size={40} className="mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">
              No modules yet
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Add your first module to start building the curriculum
            </p>
          </div>
        ) : (
          modules.map((mod: Module & { lessons: unknown[] }, idx) => (
            <div
              key={mod.id}
              className="group bg-purple-950/20 border border-purple-800/50 hover:border-purple-600 rounded-2xl p-5 transition-all"
            >
              <div className="flex items-center gap-4">
                <GripVertical
                  size={16}
                  className="text-gray-600 flex-shrink-0"
                />

                <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-500 font-bold text-xs">
                    {idx + 1}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate group-hover:text-orange-400 transition-colors">
                    {mod.title}
                  </p>
                  {mod.description && (
                    <p className="text-gray-400 text-xs mt-0.5 truncate">
                      {mod.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold flex-shrink-0">
                  <span className="flex items-center gap-1">
                    <BookOpen size={13} />
                    {mod.lessons.length}{" "}
                    {mod.lessons.length === 1 ? "lesson" : "lessons"}
                  </span>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() =>
                      navigate(`/admin/courses/${courseId}/modules/${mod.id}`)
                    }
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-800/30 hover:bg-purple-700/50 text-gray-300 hover:text-white font-bold text-xs transition-all"
                  >
                    <span>Open</span>
                    <ChevronRight size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteModule(mod.id)}
                    disabled={deletingId === mod.id}
                    className="p-2 rounded-xl hover:bg-rose-500/10 text-rose-500/50 hover:text-rose-400 transition-all disabled:opacity-40"
                  >
                    {deletingId === mod.id ? (
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

      <AddModuleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddModule}
        submitting={submitting}
        nextOrder={nextOrder}
      />
    </div>
  );
};

export default AdminCourseDetail;