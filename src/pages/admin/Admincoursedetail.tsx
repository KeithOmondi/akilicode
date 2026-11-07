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
import api from "../../api/api";
import AgeGroupPicker from "../../components/admin/AgeGroupPicker";

// ─── Shared Styles (improved contrast) ───────────────────────────────────────

const inputClass =
  "w-full bg-ink-100 border border-ink-200 rounded-xl py-3 px-4 text-ink-900 placeholder:text-ink-500 outline-none focus:border-brand-500 focus:bg-white transition-all text-sm";

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
    <label className="text-[11px] font-bold text-brand-700 uppercase tracking-wider">
      {label}
    </label>
    {children}
    {error && (
      <p className="text-[11px] text-red-700 font-semibold">{error}</p>
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
      <div className="relative w-full max-w-lg bg-transparent border border-ink-200 rounded-3xl shadow-2xl">
        <div className="border-b border-ink-200 px-8 py-6 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-xl font-bold text-ink-900 tracking-tight">
              New <span className="text-brand-700">Module</span>
            </h2>
            <p className="text-ink-500 text-xs font-medium mt-0.5">
              Add a week or topic block to this course
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand-50 hover:bg-red-50 text-ink-500 hover:text-red-700 transition-all border border-ink-200"
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
              className="flex-1 py-4 rounded-2xl border border-ink-200 text-ink-700 font-bold text-sm uppercase tracking-wider hover:bg-ink-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || success}
              className={`flex-1 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                success
                  ? "bg-green-600 text-white"
                  : "bg-brand-600 hover:bg-brand-700 text-white shadow-lg active:scale-95 disabled:opacity-60"
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

/** Who the course is for and where it sits in the learning path. Saved straight away with its own button. */
const CourseSettings = ({ courseId, initialGroups, initialOrder }: { courseId: string; initialGroups: string[]; initialOrder: number }) => {
  const [groups, setGroups] = useState<string[]>(initialGroups);
  const [order, setOrder] = useState(String(initialOrder));
  const [saving, setSaving] = useState(false);
  const changed = JSON.stringify([...groups].sort()) !== JSON.stringify([...initialGroups].sort()) || Number(order) !== initialOrder;

  const save = async () => {
    setSaving(true);
    try {
      await api.patch(`/courses/${courseId}`, { age_groups: groups, path_order: Number(order) || 0 });
      toast.success("Course settings saved");
    } catch {
      toast.error("Could not save the course settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white border border-ink-200 rounded-2xl p-5 mb-6" aria-label="Course settings">
      <div className="grid md:grid-cols-[1fr_14rem] gap-6">
        <AgeGroupPicker label="Which age groups is this course for?" value={groups} onChange={setGroups} />
        <label className="text-sm font-semibold text-ink-700">Place in the path
          <input type="number" min={0} max={100} value={order} onChange={(e) => setOrder(e.target.value)} className="adm-input w-full mt-2" />
          <span className="block text-xs font-normal text-ink-500 mt-1">1 = start here. Parents see courses in this order.</span>
        </label>
      </div>
      <div className="mt-4 flex justify-end">
        <button onClick={save} disabled={!changed || saving} className="ds-btn ds-btn-primary ds-btn-sm">{saving ? "Saving…" : "Save settings"}</button>
      </div>
    </section>
  );
};

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
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-ink-500 font-bold text-[10px] uppercase tracking-wider">
            Loading curriculum...
          </span>
        </div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="">
      <button
        onClick={() => navigate("/admin/courses")}
        className="flex items-center gap-2 text-ink-500 hover:text-brand-700 font-bold text-sm mb-8 transition-colors group"
      >
        <ArrowLeft
          size={16}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Back to Courses
      </button>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-ink-200 overflow-hidden flex-shrink-0">
            {course.image_url ? (
              <img
                src={course.image_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen size={24} className="text-ink-500" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200 uppercase tracking-wider">
                {course.category}
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
                  course.is_active
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-ink-100 border-ink-200 text-ink-500"
                }`}
              >
                {course.is_active ? "Active" : "Draft"}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-ink-900 tracking-tight">
              {course.title}
            </h1>
            <p className="text-ink-500 text-sm mt-1 max-w-xl">
              {course.description}
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-4 rounded-2xl flex items-center gap-2 transition-all shadow-lg active:scale-95 whitespace-nowrap"
        >
          <Plus size={18} strokeWidth={3} />
          <span>ADD MODULE</span>
        </button>
      </div>

      <CourseSettings
        key={course.id}
        courseId={course.id}
        initialGroups={course.age_groups ?? []}
        initialOrder={course.path_order ?? 0}
      />

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
            className="bg-ink-100 border border-ink-200 rounded-2xl p-5"
          >
            <p className="text-[11px] font-bold text-brand-700 uppercase tracking-wider mb-1">
              {label}
            </p>
            <div className="flex items-center gap-2">
              {IconComponent && (
                <IconComponent size={16} className="text-ink-500" />
              )}
              <p className="text-2xl font-bold text-ink-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {modules.length === 0 ? (
          <div className="bg-ink-100 border border-ink-200 rounded-2xl py-20 text-center">
            <Layers size={40} className="mx-auto text-ink-500 mb-3" />
            <p className="text-ink-500 font-bold text-xs uppercase tracking-wider">
              No modules yet
            </p>
            <p className="text-ink-500 text-xs mt-1">
              Add your first module to start building the curriculum
            </p>
          </div>
        ) : (
          modules.map((mod: Module & { lessons: unknown[] }, idx) => (
            <div
              key={mod.id}
              className="group bg-ink-100 border border-ink-200 hover:border-ink-200 rounded-2xl p-5 transition-all"
            >
              <div className="flex items-center gap-4">
                <GripVertical
                  size={16}
                  className="text-ink-500 flex-shrink-0"
                />

                <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-700 font-bold text-xs">
                    {idx + 1}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-ink-900 font-bold text-sm truncate group-hover:text-brand-700 transition-colors">
                    {mod.title}
                  </p>
                  {mod.description && (
                    <p className="text-ink-500 text-xs mt-0.5 truncate">
                      {mod.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-ink-500 text-xs font-bold flex-shrink-0">
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
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-800/30 hover:bg-ink-100 text-ink-700 hover:text-ink-900 font-bold text-xs transition-all"
                  >
                    <span>Open</span>
                    <ChevronRight size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteModule(mod.id)}
                    disabled={deletingId === mod.id}
                    className="p-2 rounded-xl hover:bg-red-50 text-red-700 hover:text-red-700 transition-all disabled:opacity-40"
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