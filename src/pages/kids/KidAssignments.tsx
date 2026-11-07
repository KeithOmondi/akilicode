import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ClipboardList, Loader2, PencilLine, Send } from "lucide-react";
import toast from "react-hot-toast";
import { projectsApi, errorText, type AssignmentItem } from "../../lib/projectsApi";

const due = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short" }) : null);

const state = (a: AssignmentItem) =>
  a.reviewed_at ? ({ label: `Marked: ${a.marks} / 100`, tone: "ds-badge-ok" } as const)
  : a.submitted_at ? ({ label: "Handed in", tone: "ds-badge-info" } as const)
  : a.project_id ? ({ label: "Working on it", tone: "ds-badge-warn" } as const)
  : ({ label: "To do", tone: "ds-badge-warn" } as const);

/** "Tasks": every assignment in the child's courses, and a button that opens the editor for it. */
const KidAssignments = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<AssignmentItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    projectsApi.assignments().then((a) => alive && setItems(a)).catch((e) => alive && setError(errorText(e, "We could not load your assignments.")));
    return () => {
      alive = false;
    };
  }, []);

  const open = async (a: AssignmentItem) => {
    setOpening(a.lesson_id);
    try {
      const p = await projectsApi.openForLesson(a.lesson_id);
      navigate(`/kid/make/${p.id}`);
    } catch (e) {
      toast.error(errorText(e));
      setOpening(null);
    }
  };

  const byCourse = (items ?? []).reduce<Record<string, AssignmentItem[]>>((acc, a) => {
    (acc[a.course_title] ||= []).push(a);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-3xl font-black text-brand-900">My assignments</h1>
      <p className="text-slate-600 font-bold mt-1 mb-6">Things to make and do. Open the editor to build them.</p>

      {error ? (
        <div role="alert" className="kid-card p-8 text-center">
          <p className="font-bold text-slate-600">{error}</p>
        </div>
      ) : items === null ? (
        <div className="space-y-4" role="status" aria-label="Loading your assignments">
          {[0, 1].map((i) => <div key={i} className="animate-pulse bg-brand-100/70 rounded-3xl h-36" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="kid-card p-10 text-center">
          <p className="text-6xl" aria-hidden="true">📋</p>
          <p className="mt-3 text-xl font-black text-brand-900">No assignments yet</p>
          <p className="text-slate-600 font-bold mt-1">When a lesson gives you something to make, it will show up here.</p>
        </div>
      ) : (
        Object.entries(byCourse).map(([course, list]) => (
          <section key={course} className="mb-8" aria-label={course}>
            <h2 className="text-sm font-black uppercase tracking-widest text-brand-700 mb-3">{course}</h2>
            <ul className="space-y-4">
              {list.map((a) => {
                const s = state(a);
                const done = Boolean(a.submitted_at);
                return (
                  <li key={a.lesson_id} className="kid-card p-5">
                    <div className="flex items-start gap-3">
                      <span className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0" aria-hidden="true"><ClipboardList size={22} /></span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-black text-brand-900 text-lg">{a.lesson_title}</h3>
                        <p className="text-slate-700 mt-1 leading-relaxed">{a.assignment}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className={`ds-badge ${s.tone}`}>{s.label}</span>
                          {due(a.assignment_due_date) && <span className="text-xs font-bold text-slate-500">Due {due(a.assignment_due_date)}</span>}
                        </div>
                        {a.feedback && (
                          <p className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-900"><strong>Teacher says:</strong> {a.feedback}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button onClick={() => open(a)} disabled={opening === a.lesson_id} className={`ds-btn ${done ? "ds-btn-secondary" : "ds-btn-primary"} !min-h-[3rem]`}>
                        {opening === a.lesson_id ? <Loader2 className="animate-spin" size={18} /> : done ? <CheckCircle2 size={18} aria-hidden="true" /> : a.project_id ? <PencilLine size={18} aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
                        {done ? "See my work" : a.project_id ? "Keep going" : a.lesson_type === "scratch" ? "Start with blocks" : "Start in the editor"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
};

export default KidAssignments;
