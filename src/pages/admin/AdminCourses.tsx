import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  BookOpen,
  Clock,
  Edit3,
  Trash2,
  Eye,
  X,
  Upload,
  ChevronDown,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import type { AppDispatch, RootState } from "../../store/store";
import { getAllCourses, createCourse, resetCourseState } from "../../store/slices/courseSlice";
import type { Course } from "../../interfaces/course.interface";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  price: string;
  duration: string;
  image_url: string;
  is_active: boolean;
}

const INITIAL_FORM: CourseFormData = {
  title: "",
  description: "",
  category: "",
  price: "",
  duration: "",
  image_url: "",
  is_active: true,
};

const CATEGORY_OPTIONS = [
  "Coding & Logic",
  "AI & Digital Literacy",
  "Public Speaking",
  "Kitchen Chemistry",
  "Financial Literacy",
  "Maker Skills",
  "Creative Arts",
  "Other",
];

// ─── Field Component ─────────────────────────────────────────────────────────

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
    {error && <p className="text-[11px] text-red-700 font-semibold">{error}</p>}
  </div>
);

const inputClass =
  "w-full bg-white border border-ink-200 rounded-xl py-3 px-4 text-ink-900 placeholder:text-ink-500 outline-none focus:border-brand-500 focus:bg-white transition-all text-sm";

// ─── Add Course Modal ─────────────────────────────────────────────────────────

interface AddCourseModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CourseFormData) => Promise<void>;
  submitting: boolean;
}

const AddCourseModal = ({ open, onClose, onSubmit, submitting }: AddCourseModalProps) => {
  const [form, setForm] = useState<CourseFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<CourseFormData>>({});
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node))
        setCategoryOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && open) onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const set =
    (field: keyof CourseFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

  const validate = (): boolean => {
    const newErrors: Partial<CourseFormData> = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (!form.category) newErrors.category = "Please select a category";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
      newErrors.price = "Enter a valid amount";
    if (!form.duration.trim()) newErrors.duration = "Duration is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await onSubmit(form);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose(); }, 1200);
    } catch { /* Handled in parent */ }
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-ink-200 rounded-3xl shadow-2xl">
        <div className="sticky top-0 z-10 bg-white border-b border-ink-200 px-8 py-6 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-ink-900 tracking-tight">
              New <span className="text-brand-700">Course</span>
            </h2>
            <p className="text-ink-500 text-xs font-medium mt-0.5">
              Add a new class to the 2026 curriculum
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-ink-100 hover:bg-red-50 text-ink-500 hover:text-red-700 transition-all border border-ink-200"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
          <Field label="Course Title" error={errors.title}>
            <input
              type="text"
              placeholder="e.g. AI Prompt Engineering for Kids"
              value={form.title}
              onChange={set("title")}
              className={inputClass}
            />
          </Field>

          <Field label="Description" error={errors.description}>
            <textarea
              placeholder="What will the students achieve?..."
              value={form.description}
              onChange={set("description")}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Category" error={errors.category}>
              <div ref={categoryRef} className="relative">
                <button
                  type="button"
                  onClick={() => setCategoryOpen((v) => !v)}
                  className={`${inputClass} flex items-center justify-between`}
                >
                  <span className={form.category ? "text-ink-900" : "text-ink-500"}>
                    {form.category || "Select a category"}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-ink-500 transition-transform ${categoryOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {categoryOpen && (
                  <div className="absolute z-20 top-full mt-2 w-full bg-ink-100 border border-ink-200 rounded-2xl overflow-hidden shadow-xl">
                    {CATEGORY_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({ ...prev, category: opt }));
                          setErrors((prev) => ({ ...prev, category: "" }));
                          setCategoryOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                          form.category === opt
                            ? "bg-brand-100 text-brand-700"
                            : "text-ink-700 hover:bg-ink-200"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Field>

            <Field label="Price (Ksh)" error={errors.price}>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-brand-700">
                  KSH
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={form.price}
                  onChange={set("price")}
                  className={`${inputClass} pl-12`}
                />
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Duration" error={errors.duration}>
              <div className="relative">
                <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" />
                <input
                  type="text"
                  placeholder="e.g. 12 Weeks"
                  value={form.duration}
                  onChange={set("duration")}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </Field>

            <Field label="Status">
              <div className="flex items-center gap-3 h-[46px] px-4 bg-white border border-ink-200 rounded-xl">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? "bg-brand-600" : "bg-ink-200"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_active ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
                <span className={`text-sm font-medium ${form.is_active ? "text-brand-700" : "text-ink-500"}`}>
                  {form.is_active ? "Active" : "Draft"}
                </span>
              </div>
            </Field>
          </div>

          <Field label="Thumbnail URL">
            <div className="relative">
              <Upload size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" />
              <input
                type="url"
                placeholder="https://..."
                value={form.image_url}
                onChange={set("image_url")}
                className={`${inputClass} pl-10`}
              />
            </div>
          </Field>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl border border-ink-200 text-ink-500 font-bold text-sm uppercase tracking-wider hover:bg-ink-100 transition-all"
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
                <><CheckCircle2 size={18} /><span>Created!</span></>
              ) : submitting ? (
                <><Loader2 size={18} className="animate-spin" /><span>Saving...</span></>
              ) : (
                <><Plus size={18} strokeWidth={3} /><span>Publish Course</span></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminCourses = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { courses, loading, error } = useSelector((s: RootState) => s.course);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getAllCourses());
    return () => { dispatch(resetCourseState()); };
  }, [dispatch]);

  useEffect(() => { if (error) toast.error(error); }, [error]);

  const categories = ["All", ...new Set(courses.map((c) => c.category))];
  const filteredCourses = courses.filter((c: Course) => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateCourse = async (formData: CourseFormData) => {
    setSubmitting(true);
    try {
      await dispatch(createCourse({ ...formData, price: Number(formData.price) })).unwrap();
      toast.success("Course published successfully!");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to create course");
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-ink-900 tracking-tight">
            Course <span className="text-brand-700">Inventory</span>
          </h1>
          <p className="text-ink-500 text-sm font-medium mt-1">
            Manage and audit the 2026 curriculum.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-4 rounded-2xl flex items-center gap-2 transition-all shadow-lg active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          <span>CREATE NEW COURSE</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" size={18} />
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-ink-200 rounded-2xl py-4 pl-12 pr-4 text-ink-900 placeholder:text-ink-500 outline-none focus:border-brand-500 transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap border ${
                activeCategory === cat
                  ? "bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-200"
                  : "bg-white border-ink-200 text-ink-700 hover:border-ink-500"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-ink-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-ink-200 bg-white">
                <th className="px-6 py-5 text-[11px] font-bold text-brand-700 uppercase tracking-wider">Course Info</th>
                <th className="px-6 py-5 text-[11px] font-bold text-brand-700 uppercase tracking-wider">Category</th>
                <th className="px-6 py-5 text-[11px] font-bold text-brand-700 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-5 text-[11px] font-bold text-brand-700 uppercase tracking-wider">Price (Ksh)</th>
                <th className="px-6 py-5 text-[11px] font-bold text-brand-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-[11px] font-bold text-brand-700 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
                      <span className="text-ink-500 font-bold text-[10px] uppercase tracking-wider">Syncing...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <BookOpen size={40} className="mx-auto text-ink-500 mb-3" />
                    <p className="text-ink-500 font-bold text-xs uppercase tracking-wider">No matches found</p>
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course: Course) => (
                  <tr key={course.id} className="hover:bg-ink-100 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-ink-100 overflow-hidden flex-shrink-0 border border-ink-200">
                          {course.image_url ? (
                            <img src={course.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen size={16} className="text-ink-500" />
                            </div>
                          )}
                        </div>
                        <div className="max-w-[240px]">
                          <div className="text-ink-900 font-bold text-sm truncate group-hover:text-brand-700 transition-colors">
                            {course.title}
                          </div>
                          <div className="text-ink-500 text-[11px] truncate mt-0.5">
                            {course.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                        {course.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-ink-700 font-bold text-xs">
                        <Clock size={14} className="text-ink-500" />
                        {course.duration}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-ink-900">
                        {Number(course.price).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                        course.is_active
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-ink-100 border-ink-200 text-ink-500"
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          course.is_active
                            ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                            : "bg-ink-500"
                        }`} />
                        <span className="text-[10px] font-bold uppercase tracking-tight">
                          {course.is_active ? "Active" : "Draft"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/admin/courses/${course.id}`)}
                          className="p-2 hover:bg-ink-200 text-ink-500 hover:text-ink-900 rounded-lg transition-all"
                          title="Edit curriculum"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/courses/${course.id}`)}
                          className="p-2 hover:bg-ink-200 text-ink-500 hover:text-ink-900 rounded-lg transition-all"
                          title="View curriculum"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="p-2 hover:bg-red-50 text-red-700 hover:text-red-700 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>  {/* ✅ Missing closing table tag added */}
        </div>
      </div>

      <AddCourseModal
        key={modalOpen ? "open" : "closed"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateCourse}
        submitting={submitting}
      />
    </div>
  );
};

export default AdminCourses;