import { useEffect, useState, useRef } from "react";
import { X, ChevronDown, Upload, Clock, Loader2, CheckCircle2, Plus } from "lucide-react";

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  price: string;
  duration: string;
  image_url: string;
  is_active: boolean;
}

interface AddCourseModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CourseFormData) => Promise<void>;
  submitting: boolean;
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

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-black text-purple-400 uppercase tracking-widest">
      {label}
    </label>
    {children}
    {error && <p className="text-[11px] text-rose-400 font-semibold">{error}</p>}
  </div>
);

const inputClass =
  "w-full bg-purple-950/20 border border-purple-800/30 rounded-xl py-3 px-4 text-white placeholder:text-purple-700 outline-none focus:border-orange-500/60 focus:bg-purple-950/30 transition-all text-sm";

export const AddCourseModal = ({ open, onClose, onSubmit, submitting }: AddCourseModalProps) => {
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

  const set = (field: keyof CourseFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      setTimeout(() => { 
        setSuccess(false); 
        setForm(INITIAL_FORM);
        onClose(); 
      }, 1200);
    } catch { /* Handled by Thunk wrapper logic */ }
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0d0520] border border-purple-800/30 rounded-[32px] shadow-2xl scrollbar-hide">
        <div className="sticky top-0 z-10 bg-[#0d0520] border-b border-purple-900/30 px-8 py-6 flex items-center justify-between rounded-t-[32px]">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              New <span className="text-orange-500">Course</span>
            </h2>
            <p className="text-purple-500 text-xs font-semibold mt-0.5">
              Add a new class to the 2026 curriculum
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-purple-950/40 hover:bg-rose-500/20 text-purple-500 hover:text-rose-400 transition-all border border-purple-800/30"
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
                  <span className={form.category ? "text-white" : "text-purple-700"}>
                    {form.category || "Select a category"}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-purple-500 transition-transform ${categoryOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {categoryOpen && (
                  <div className="absolute z-20 top-full mt-2 w-full bg-[#130830] border border-purple-800/40 rounded-2xl overflow-hidden shadow-xl">
                    {CATEGORY_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({ ...prev, category: opt }));
                          setErrors((prev) => ({ ...prev, category: "" }));
                          setCategoryOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                          form.category === opt
                            ? "bg-orange-500/15 text-orange-400"
                            : "text-purple-300 hover:bg-purple-900/30"
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
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-orange-500">
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
                <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500" />
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
              <div className="flex items-center gap-3 h-[46px] px-4 bg-purple-950/20 border border-purple-800/30 rounded-xl">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? "bg-orange-500" : "bg-purple-900"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_active ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
                <span className={`text-sm font-bold ${form.is_active ? "text-orange-400" : "text-purple-600"}`}>
                  {form.is_active ? "Active" : "Draft"}
                </span>
              </div>
            </Field>
          </div>

          <Field label="Thumbnail URL">
            <div className="relative">
              <Upload size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500" />
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
              className="flex-1 py-4 rounded-2xl border border-purple-800/40 text-purple-400 font-black text-sm uppercase tracking-wider hover:bg-purple-900/20 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || success}
              className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                success
                  ? "bg-green-500 text-white"
                  : "bg-orange-500 hover:bg-orange-600 text-white shadow-lg active:scale-95 disabled:opacity-60"
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