import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Blocks, Code2, Globe, Loader2, Trash2 } from "lucide-react";
import { useAppSelector } from "../../store/hooks";
import toast from "react-hot-toast";
import { projectsApi, errorText, type ProjectSummary } from "../../lib/projectsApi";

const when = (d: string) => new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short" });

/** "Make": all of the child's coding projects, and a button to start a new one. */
const KidMake = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState<"web" | "blocks" | null>(null);
  const group = useAppSelector((st) => st.kid.currentKid?.age_group);
  // What the parent enrolled the child in decides what they can make: a Scratch course means blocks, a web course means web pages.
  // Until we know (or if the courses do not say), offer both.
  const [kinds, setKinds] = useState<("web" | "blocks")[]>(["blocks", "web"]);
  useEffect(() => {
    let alive = true;
    projectsApi.kinds().then((k) => alive && k.length && setKinds(k)).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  const showBlocks = kinds.includes("blocks");
  const showWeb = kinds.includes("web");
  const both = showBlocks && showWeb;
  // With both on offer, younger groups start with blocks and older ones with web pages.
  const blocksFirst = group === "4-6" || group === "7-9" || group === "10-12" || !group;

  const load = () => {
    setError(null);
    projectsApi.list().then(setProjects).catch((e) => setError(errorText(e, "We could not load your projects.")));
  };
  useEffect(() => {
    let alive = true;
    projectsApi.list().then((p) => alive && setProjects(p)).catch((e) => alive && setError(errorText(e, "We could not load your projects.")));
    return () => {
      alive = false;
    };
  }, []);

  const create = async (kind: "web" | "blocks") => {
    setCreating(kind);
    try {
      const p = await projectsApi.create(kind);
      navigate(`/kid/make/${p.id}`);
    } catch (e) {
      toast.error(errorText(e));
      setCreating(null);
    }
  };

  const remove = async (p: ProjectSummary) => {
    if (!window.confirm(`Delete "${p.title}"? You cannot get it back.`)) return;
    try {
      await projectsApi.remove(p.id);
      setProjects((list) => (list ? list.filter((x) => x.id !== p.id) : list));
    } catch (e) {
      toast.error(errorText(e));
    }
  };

  const free = (projects ?? []).filter((p) => !p.lesson_id);
  const fromAssignments = (projects ?? []).filter((p) => p.lesson_id);

  return (
    <div>
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-brand-900">Make</h1>
          <p className="text-slate-600 font-bold mt-1">{both ? "Snap blocks together, or build web pages with HTML, CSS and JavaScript." : showBlocks ? "Snap blocks together and bring your sprites to life." : "Build web pages with HTML, CSS and JavaScript."}</p>
        </div>
        <div className={`flex gap-2 flex-wrap ${blocksFirst ? "" : "flex-row-reverse"}`}>
          {showBlocks && <button onClick={() => create("blocks")} disabled={creating !== null} className="ds-btn ds-btn-next !min-h-[3.5rem] !text-lg !px-6">
            {creating === "blocks" ? <Loader2 className="animate-spin" size={20} /> : <Blocks size={22} aria-hidden="true" />} New blocks project
          </button>}
          {showWeb && <button onClick={() => create("web")} disabled={creating !== null} className={`ds-btn ${both ? "ds-btn-secondary" : "ds-btn-next"} !min-h-[3.5rem] !text-lg !px-6`}>
            {creating === "web" ? <Loader2 className="animate-spin" size={20} /> : <Globe size={22} aria-hidden="true" />} New web page
          </button>}
        </div>
      </div>

      {error ? (
        <div role="alert" className="kid-card p-8 text-center mt-6">
          <p className="font-bold text-slate-600 mb-3">{error}</p>
          <button className="ds-btn ds-btn-primary" onClick={load}>Try again</button>
        </div>
      ) : projects === null ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6" role="status" aria-label="Loading your projects">
          {[0, 1, 2].map((i) => <div key={i} className="animate-pulse bg-brand-100/70 rounded-3xl h-32" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="kid-card p-10 text-center mt-6">
          <p className="text-6xl" aria-hidden="true">🧑‍💻</p>
          <p className="mt-3 text-xl font-black text-brand-900">Make your first page!</p>
          <p className="text-slate-600 font-bold mt-1">{both ? "Pick “New blocks project” or “New web page” to start." : showBlocks ? "Press “New blocks project” to start." : "Press “New web page” to start."} We give you something to play with.</p>
        </div>
      ) : (
        <>
          {fromAssignments.length > 0 && (
            <section className="mt-6" aria-labelledby="mk-assign">
              <h2 id="mk-assign" className="text-lg font-black text-brand-900 mb-3">My assignments</h2>
              <Cards items={fromAssignments} onDelete={remove} />
            </section>
          )}
          {free.length > 0 && (
            <section className="mt-6" aria-labelledby="mk-free">
              <h2 id="mk-free" className="text-lg font-black text-brand-900 mb-3">My own projects</h2>
              <Cards items={free} onDelete={remove} />
            </section>
          )}
        </>
      )}

      <p className="mt-8 text-sm font-bold text-slate-600">
        Looking for your homework? <Link to="/kid/assignments" className="text-brand-700 underline">See my assignments</Link>
      </p>
    </div>
  );
};

const Cards = ({ items, onDelete }: { items: ProjectSummary[]; onDelete: (p: ProjectSummary) => void }) => (
  <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {items.map((p) => (
      <li key={p.id} className="kid-card p-4 flex flex-col">
        <Link to={`/kid/make/${p.id}`} className="flex items-start gap-3 flex-1">
          <span className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0" aria-hidden="true">{p.kind === "blocks" ? <Blocks size={24} /> : <Code2 size={24} />}</span>
          <span className="min-w-0">
            <span className="block font-black text-brand-900 truncate">{p.title}</span>
            <span className="block text-xs font-bold text-slate-500">Changed {when(p.updated_at)}</span>
            {p.reviewed_at ? (
              <span className="ds-badge ds-badge-ok mt-1">Marked: {p.marks} / 100</span>
            ) : p.submitted_at ? (
              <span className="ds-badge ds-badge-info mt-1">Handed in</span>
            ) : null}
          </span>
        </Link>
        {!p.submitted_at && (
          <button onClick={() => onDelete(p)} aria-label={`Delete ${p.title}`} className="self-end mt-2 w-10 h-10 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center">
            <Trash2 size={18} />
          </button>
        )}
      </li>
    ))}
  </ul>
);

export default KidMake;
