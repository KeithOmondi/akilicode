import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Blockly from "blockly/core";
import { ArrowLeft, CheckCircle2, ClipboardList, Code2, Eye, Flag, Loader2, Send, Square, Undo2 } from "lucide-react";
import toast from "react-hot-toast";
import BlockWorkspace, { type WorkspaceState } from "../../components/scratch/BlockWorkspace";
import StagePreview from "../../components/scratch/StagePreview";
import { compileBlocks, STARTER_STATE } from "../../lib/scratch/blocks";
import { newRunId } from "../../lib/sandbox";
import { projectsApi, errorText, type Project } from "../../lib/projectsApi";

/**
 * The block editor ("Scratch" for our learners): drag blocks, press the flag, watch the stage.
 * Saved automatically. Assignment projects can be handed in; once handed in they are read-only until taken back.
 */
const ScratchStudio = ({ project: initial }: { project: Project }) => {
  const navigate = useNavigate();
  const [project, setProject] = useState<Project>(initial);
  const [title, setTitle] = useState(initial.title);
  const [runId, setRunId] = useState("");
  const [code, setCode] = useState("");
  const [save, setSave] = useState<"saved" | "saving" | "error">("saved");
  const [view, setView] = useState<"blocks" | "stage">("blocks"); // phones show one at a time
  const [showCode, setShowCode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmHandIn, setConfirmHandIn] = useState(false);
  const [changes, setChanges] = useState(0);
  // What the block editor is (re)built from. Updated only when the editor is rebuilt (locked / unlocked).
  const [startState, setStartState] = useState<WorkspaceState>((initial.blocks as WorkspaceState | null) ?? STARTER_STATE);

  const ws = useRef<Blockly.WorkspaceSvg | null>(null);
  const state = useRef<WorkspaceState>((initial.blocks as WorkspaceState | null) ?? STARTER_STATE);
  const dirty = useRef(false);

  const locked = Boolean(project.submitted_at);
  const handedIn = locked;
  const marked = Boolean(project.reviewed_at);

  const latest = (): WorkspaceState => (ws.current ? Blockly.serialization.workspaces.save(ws.current) : state.current);

  const onChange = (next: WorkspaceState) => {
    state.current = next;
    dirty.current = true;
    setSave("saving");
    setChanges((c) => c + 1);
  };

  // Autosave 1.2 s after the last change.
  useEffect(() => {
    if (!dirty.current || locked) return;
    const t = setTimeout(async () => {
      try {
        await projectsApi.save(project.id, { title: title.trim() || "My blocks", blocks: state.current });
        dirty.current = false;
        setSave("saved");
      } catch {
        setSave("error");
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [changes, title, locked, project.id]);

  const flag = () => {
    try {
      setCode(compileBlocks(latest()));
      setRunId(newRunId());
      setView("stage");
    } catch {
      toast.error("Something is not right with the blocks. Check that they are joined to a 🏁 block.");
    }
  };
  const stop = () => setRunId("");

  const toggleCode = () => {
    if (!showCode) {
      try {
        setCode(compileBlocks(latest()));
      } catch {
        /* shown as empty */
      }
    }
    setShowCode((v) => !v);
  };

  const handIn = async () => {
    setBusy(true);
    try {
      await projectsApi.save(project.id, { title: title.trim() || "My blocks", blocks: latest() });
      dirty.current = false;
      const p = await projectsApi.submit(project.id);
      setStartState(latest());
      setProject((cur) => ({ ...cur, ...p }));
      setSave("saved");
      setConfirmHandIn(false);
      toast.success("Handed in! Your teacher will look at it. 🎉");
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(false);
    }
  };
  const takeBack = async () => {
    setBusy(true);
    try {
      const p = await projectsApi.unsubmit(project.id);
      setStartState(state.current);
      setProject((cur) => ({ ...cur, ...p }));
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(project.lesson_id ? "/kid/assignments" : "/kid/make")} className="w-11 h-11 rounded-full bg-white border-2 border-brand-100 flex items-center justify-center text-brand-700 shrink-0" aria-label="Go back">
          <ArrowLeft size={20} />
        </button>
        <label className="flex-1 min-w-0">
          <span className="sr-only">Name of your project</span>
          <input
            value={title}
            disabled={locked}
            onChange={(e) => { dirty.current = true; setSave("saving"); setChanges((c) => c + 1); setTitle(e.target.value.slice(0, 80)); }}
            className="w-full text-xl sm:text-2xl font-black text-brand-900 bg-transparent outline-none border-b-2 border-transparent focus:border-brand-300 truncate disabled:opacity-100"
          />
        </label>
        <span className="text-xs font-bold text-slate-500 shrink-0 w-20 text-right" aria-live="polite">
          {locked ? "" : save === "saving" ? "Saving…" : save === "error" ? "Not saved" : "Saved ✓"}
        </span>
      </div>

      {project.assignment && (
        <section className="mb-4 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 sm:p-5" aria-label="Your assignment">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList size={18} className="text-amber-600" aria-hidden="true" />
            <span className="text-xs font-black text-amber-700 uppercase tracking-widest">Your assignment{project.lesson_title ? `: ${project.lesson_title}` : ""}</span>
          </div>
          <p className="text-gray-800 leading-relaxed">{project.assignment}</p>
          {handedIn && !marked && <p className="mt-3 text-sm font-bold text-emerald-700 flex items-center gap-1.5"><CheckCircle2 size={16} aria-hidden="true" /> Handed in. Your teacher will look at it.</p>}
          {marked && (
            <div className="mt-3 rounded-xl bg-white border border-amber-200 p-3">
              <p className="font-black text-emerald-700">Marked: {project.marks} / 100</p>
              {project.feedback && <p className="text-gray-700 mt-1">{project.feedback}</p>}
            </div>
          )}
        </section>
      )}

      {/* phone: blocks or stage */}
      <div className="lg:hidden grid grid-cols-2 gap-2 mb-3" role="tablist" aria-label="Blocks or stage">
        {([["blocks", "Blocks", Code2], ["stage", "Stage", Eye]] as const).map(([v, label, Icon]) => (
          <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)}
            className={`h-12 rounded-2xl font-black flex items-center justify-center gap-2 ${view === v ? "bg-brand-600 text-white" : "bg-white border-2 border-brand-100 text-brand-700"}`}>
            <Icon size={18} aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_24rem] gap-4">
        <div className={`min-w-0 ${view === "stage" ? "hidden lg:block" : ""}`}>
          <BlockWorkspace
            initialState={startState}
            readOnly={locked}
            onChange={onChange}
            onReady={(w) => { ws.current = w; }}
            height="min(32rem, 58vh)"
          />
          {showCode && (
            <div className="mt-3 rounded-2xl bg-ink-900 text-slate-100 overflow-hidden">
              <p className="px-4 py-2 bg-black/30 text-xs font-black uppercase tracking-widest text-slate-300">Your blocks as JavaScript</p>
              <pre className="p-3 text-[12px] leading-relaxed overflow-auto max-h-60 font-mono whitespace-pre-wrap break-words">{code || "(no blocks yet)"}</pre>
            </div>
          )}
        </div>

        <div className={`min-w-0 ${view === "blocks" ? "hidden lg:block" : ""}`}>
          <div className="flex items-center gap-2 mb-2">
            <button onClick={flag} className="ds-btn ds-btn-next !min-h-[3rem] !text-base !px-5" aria-label="Start: green flag">
              <Flag size={18} aria-hidden="true" /> Start
            </button>
            <button onClick={stop} className="ds-btn ds-btn-secondary !min-h-[3rem]" aria-label="Stop">
              <Square size={16} aria-hidden="true" /> Stop
            </button>
            <button onClick={toggleCode} aria-pressed={showCode} className="ml-auto h-10 px-3 rounded-xl text-xs font-black text-brand-700 bg-white border-2 border-brand-100">
              {showCode ? "Hide code" : "See the code"}
            </button>
          </div>
          <StagePreview code={code} runId={runId} />
          <p className="mt-2 text-xs text-slate-500">Blocks that are not joined under a 🏁, key or click block do not run.</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {project.lesson_id && !handedIn && (
          confirmHandIn ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-600">Hand it in?</span>
              <button className="ds-btn ds-btn-primary !min-h-[2.75rem]" onClick={handIn} disabled={busy}>
                {busy ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} aria-hidden="true" />} Yes, hand in
              </button>
              <button className="ds-btn ds-btn-ghost !min-h-[2.75rem]" onClick={() => setConfirmHandIn(false)}>Not yet</button>
            </div>
          ) : (
            <button className="ds-btn ds-btn-secondary !min-h-[3.25rem]" onClick={() => setConfirmHandIn(true)}>
              <Send size={18} aria-hidden="true" /> Hand in
            </button>
          )
        )}
        {handedIn && !marked && (
          <button className="ds-btn ds-btn-secondary !min-h-[3.25rem]" onClick={takeBack} disabled={busy}>
            <Undo2 size={18} aria-hidden="true" /> Take it back to change it
          </button>
        )}
      </div>
    </div>
  );
};

export default ScratchStudio;
