import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Blockly from "blockly/core";
import { ArrowLeft, CheckCircle2, ClipboardList, Code2, Eye, Loader2, Send, Undo2 } from "lucide-react";
import toast from "react-hot-toast";
import BlockWorkspace, { type WorkspaceState } from "../../components/scratch/BlockWorkspace";
import StagePreview from "../../components/scratch/StagePreview";
import { compileBlocks, STARTER_STATE } from "../../lib/scratch/blocks";
import { newRunId } from "../../lib/sandbox";
import { projectsApi, errorText, type Project } from "../../lib/projectsApi";

/**
 * The block editor ("Scratch" for our learners), laid out like Scratch itself:
 * a purple menu bar on top, the block palette and coding area on the left, and on the right the stage
 * with its green flag and stop buttons and the sprite below it.
 * Saved automatically. Assignment projects can be handed in; once handed in they are read-only until taken back.
 */
const PURPLE = "#855cd6";

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

  const barButton = "h-9 px-3 rounded-lg text-sm font-bold flex items-center gap-1.5 text-white hover:bg-white/15 disabled:opacity-60";

  return (
    <div>
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

      <div className="rounded-2xl overflow-hidden border-2 shadow-sm bg-white" style={{ borderColor: PURPLE }}>
        {/* ── menu bar ── */}
        <div className="flex items-center gap-1.5 sm:gap-3 px-2 sm:px-3 h-14 text-white" style={{ background: PURPLE }}>
          <button onClick={() => navigate(project.lesson_id ? "/kid/assignments" : "/kid/make")} className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/15 shrink-0" aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <label className="flex-1 min-w-0 max-w-md">
            <span className="sr-only">Name of your project</span>
            <input
              value={title}
              disabled={locked}
              onChange={(e) => { dirty.current = true; setSave("saving"); setChanges((c) => c + 1); setTitle(e.target.value.slice(0, 80)); }}
              className="w-full h-9 px-3 rounded-lg bg-white/20 placeholder-white/70 font-bold text-white outline-none focus:bg-white focus:text-slate-800 truncate disabled:opacity-100"
            />
          </label>
          <span className="text-xs font-bold text-white/85 shrink-0 hidden sm:block w-16" aria-live="polite">
            {locked ? "" : save === "saving" ? "Saving…" : save === "error" ? "Not saved" : "Saved ✓"}
          </span>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button onClick={toggleCode} aria-pressed={showCode} className={`${barButton} ${showCode ? "bg-white/20" : ""}`}>
              <Code2 size={16} aria-hidden="true" /> <span className="hidden sm:inline">{showCode ? "Hide code" : "See the code"}</span>
            </button>
            {project.lesson_id && !handedIn && (
              confirmHandIn ? (
                <div className="flex items-center gap-1">
                  <button className="h-9 px-3 rounded-lg bg-white text-sm font-black flex items-center gap-1.5 disabled:opacity-60" style={{ color: PURPLE }} onClick={handIn} disabled={busy}>
                    {busy ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} aria-hidden="true" />} Yes, hand in
                  </button>
                  <button className={barButton} onClick={() => setConfirmHandIn(false)}>Not yet</button>
                </div>
              ) : (
                <button className="h-9 px-3 rounded-lg bg-white text-sm font-black flex items-center gap-1.5" style={{ color: PURPLE }} onClick={() => setConfirmHandIn(true)}>
                  <Send size={16} aria-hidden="true" /> Hand in
                </button>
              )
            )}
            {handedIn && !marked && (
              <button className={barButton} onClick={takeBack} disabled={busy}>
                <Undo2 size={16} aria-hidden="true" /> <span className="hidden sm:inline">Take it back to change it</span>
              </button>
            )}
          </div>
        </div>

        {/* phone: blocks or stage */}
        <div className="lg:hidden grid grid-cols-2 bg-white border-b border-slate-200" role="tablist" aria-label="Blocks or stage">
          {([["blocks", "Code", Code2], ["stage", "Stage", Eye]] as const).map(([v, label, Icon]) => (
            <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)}
              className={`h-11 font-bold flex items-center justify-center gap-2 border-b-4 ${view === v ? "text-[#855cd6] border-[#855cd6]" : "text-slate-500 border-transparent"}`}>
              <Icon size={18} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_29rem]" style={{ background: "#e5f0ff" }}>
          {/* ── code area ── */}
          <div className={`min-w-0 bg-white ${view === "stage" ? "hidden lg:block" : ""}`}>
            <div className="hidden lg:flex h-10 items-end bg-[#e5f0ff] px-2">
              <span className="h-9 px-5 rounded-t-lg bg-white font-bold text-sm flex items-center gap-2 border-t-4" style={{ color: PURPLE, borderColor: PURPLE }}>
                <Code2 size={16} aria-hidden="true" /> Code
              </span>
            </div>
            <BlockWorkspace
              initialState={startState}
              readOnly={locked}
              onChange={onChange}
              onReady={(w) => { ws.current = w; }}
              height="min(36rem, 66vh)"
            />
            {showCode && (
              <div className="bg-ink-900 text-slate-100 overflow-hidden">
                <p className="px-4 py-2 bg-black/30 text-xs font-black uppercase tracking-widest text-slate-300">Your blocks as JavaScript</p>
                <pre className="p-3 text-[12px] leading-relaxed overflow-auto max-h-60 font-mono whitespace-pre-wrap break-words">{code || "(no blocks yet)"}</pre>
              </div>
            )}
          </div>

          {/* ── stage and sprite ── */}
          <div className={`min-w-0 p-3 flex flex-col gap-3 ${view === "blocks" ? "hidden lg:flex" : ""}`}>
            <div className="flex items-center gap-2">
              <button onClick={flag} className="w-11 h-11 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xl hover:bg-emerald-50" aria-label="Start: green flag" title="Start (green flag)">
                🏁
              </button>
              <button onClick={stop} className="w-11 h-11 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-red-50" aria-label="Stop" title="Stop">
                <span className="w-5 h-5 bg-[#ec5959] border-2 border-[#d94848]" style={{ clipPath: "polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%)" }} aria-hidden="true" />
              </button>
              <span className="ml-auto text-xs font-bold text-slate-500 hidden sm:block">Press the flag to run</span>
            </div>
            <StagePreview code={code} runId={runId} />
            <div className="rounded-xl bg-white border border-slate-200 p-3">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg border-2 flex items-center justify-center text-3xl bg-[#e9eef2]" style={{ borderColor: PURPLE }} aria-hidden="true">🐱</div>
                <div>
                  <p className="text-xs font-bold text-slate-500">Sprite</p>
                  <p className="font-black text-slate-800">Cat</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500">Blocks that are not joined under a 🏁, key or click block do not run.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScratchStudio;
