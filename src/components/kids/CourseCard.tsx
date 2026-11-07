import { ChevronRight } from "lucide-react";
import type { KidCourse } from "../../interfaces/kidLearning.interface";

/** One colour per course, in rotation, so children can tell their courses apart at a glance. */
const THEMES = [
  { top: "bg-brand-600", emoji: "🧩" },
  { top: "bg-orange-500", emoji: "🎨" },
  { top: "bg-emerald-500", emoji: "🐍" },
  { top: "bg-sky-500", emoji: "🌐" },
] as const;

const CourseCard = ({ course, index, onOpen, className = "" }: { course: KidCourse; index: number; onOpen: () => void; className?: string }) => {
  const theme = THEMES[index % THEMES.length];
  const pct = Math.min(100, Math.max(0, course.progress ?? 0));
  const action = pct === 0 ? "Start" : pct >= 100 ? "Play again" : "Continue";

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`kid-card kid-card-press text-left overflow-hidden flex flex-col ${className}`}
      aria-label={`${course.name}: ${course.completed_lessons} of ${course.total_lessons} lessons done. ${action}.`}
    >
      <div className={`${theme.top} h-20 flex items-center justify-center text-5xl`} aria-hidden="true">{theme.emoji}</div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-black text-lg text-brand-900 leading-snug mb-3 line-clamp-2">{course.name}</h3>
        <div className="h-3 rounded-full bg-brand-50 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-kid-grass transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-sm font-bold text-slate-600">
          {course.completed_lessons} of {course.total_lessons} lessons
        </p>
        <span className="mt-4 inline-flex items-center justify-center gap-1 rounded-2xl bg-brand-600 text-white font-black h-12 px-4">
          {action} <ChevronRight size={18} aria-hidden="true" />
        </span>
      </div>
    </button>
  );
};

export default CourseCard;
