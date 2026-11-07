import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CodeMirror, { EditorView, keymap } from "@uiw/react-codemirror";
import { indentWithTab } from "@codemirror/commands";
import { html as htmlLang } from "@codemirror/lang-html";
import { css as cssLang } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { ArrowLeft, CheckCircle2, ClipboardList, Eye, Loader2, Play, Send, Undo2, Code2, WrapText, Wand2 } from "lucide-react";
import toast from "react-hot-toast";
import CodePreview from "../../components/kids/CodePreview";
import { newRunId } from "../../lib/sandbox";
import { projectsApi, errorText, type Project } from "../../lib/projectsApi";
import { EDITOR_THEMES, FONT_MAX, FONT_MIN, loadPrefs, savePrefs, themeById, type EditorPrefs } from "../../lib/editorTheme";
import { formatCode } from "../../lib/formatCode";

// Block projects open in the block studio (a separate download: Blockly is large).
const ScratchStudio = lazy(() => import("./ScratchStudio"));

type Tab = "html" | "css" | "js";
const TABS: { id: Tab; file: string; hint: string; dot: string; name: string }[] = [
  { id: "html", file: "index.html", name: "HTML", hint: "The things on your page", dot: "#e44d26" },
  { id: "css", file: "style.css", name: "CSS", hint: "How it looks", dot: "#42a5f5" },
  { id: "js", file: "script.js", name: "JavaScript", hint: "What it does", dot: "#f7df1e" },
];
/** Phones get a shorter editor so the Run button is not hidden behind the tab bar. */
const isPhone = () => typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
const EXTENSIONS = { html: [htmlLang()], css: [cssLang()], js: [javascript()] } as const;

/**
 * The coding editor: three files (HTML, CSS, JavaScript), a live preview, saved automatically.
 * Assignment projects can be handed in; once handed in they are read-only until taken back.
 */
const KidEditor = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [code, setCode] = useState({ html: "", css: "", js: "" });
  const [title, setTitle] = useState("");
  const [tab, setTab] = useState<Tab>("html");
  const [view, setView] = useState<"code" | "page">("code"); // phones show one at a time
  const [runId, setRunId] = useState("");
  const [save, setSave] = useState<"saved" | "saving" | "error">("saved");
  const [busy, setBusy] = useState(false);
  const [confirmHandIn, setConfirmHandIn] = useState(false);
  const [prefs, setPrefsState] = useState<EditorPrefs>(loadPrefs);
  const [pos, setPos] = useState({ ln: 1, col: 1 });
  const [tidying, setTidying] = useState(false);

  const updatePrefs = (next: EditorPrefs) => {
    setPrefsState(next);
    savePrefs(next);
  };

  const dirty = useRef(false);
  const latest = useRef({ code, title });
  useEffect(() => {
    latest.current = { code, title };
  }, [code, title]);

  const locked = Boolean(project?.submitted_at);
  const dark = themeById(prefs.theme).dark;

  // Load
  useEffect(() => {
    let alive = true;
    projectsApi
      .get(id)
      .then((p) => {
        if (!alive) return;
        setProject(p);
        setCode({ html: p.html, css: p.css, js: p.js });
        setTitle(p.title);
        setRunId(newRunId());
      })
      .catch((e) => alive && setLoadError(errorText(e, "We could not open that project.")));
    return () => {
      alive = false;
    };
  }, [id]);

  const run = useCallback(() => {
    setRunId(newRunId());
    setView("page");
  }, []);

  // Autosave 1.2 s after the last change.
  useEffect(() => {
    if (!project || locked || !dirty.current) return;
    const t = setTimeout(async () => {
      setSave("saving");
      try {
        const { code: c, title: ti } = latest.current;
        await projectsApi.save(id, { title: ti.trim() || "My project", ...c });
        dirty.current = false;
        setSave("saved");
      } catch {
        setSave("error");
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [code, title, project, locked, id]);

  // Page and style changes show up by themselves; JavaScript only runs when you press Run.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const t = setTimeout(() => setRunId(newRunId()), 900);
    return () => clearTimeout(t);
  }, [code.html, code.css]);

  // Ctrl/Cmd + Enter runs the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        run();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run]);

  const edit = (value: string) => {
    dirty.current = true;
    setSave("saving");
    setCode((c) => ({ ...c, [tab]: value }));
  };

  /** Lay the current file out neatly, like Format Document in VS Code. */
  const tidy = async () => {
    setTidying(true);
    try {
      const out = await formatCode(tab, code[tab]);
      if (out !== code[tab]) {
        dirty.current = true;
        setSave("saving");
        setCode((c) => ({ ...c, [tab]: out }));
      }
      toast.success("Tidied up ✨");
    } catch (e) {
      toast.error(`Could not tidy this yet: ${(e as Error).message}`);
    } finally {
      setTidying(false);
    }
  };

  const handIn = async () => {
    setBusy(true);
    try {
      // make sure the latest work is saved first
      await projectsApi.save(id, { title: title.trim() || "My project", ...code });
      dirty.current = false;
      const p = await projectsApi.submit(id);
      setProject((cur) => (cur ? { ...cur, ...p } : cur));
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
      const p = await projectsApi.unsubmit(id);
      setProject((cur) => (cur ? { ...cur, ...p } : cur));
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  if (loadError) {
    return (
      <div className="kid-card p-8 text-center" role="alert">
        <p className="font-bold text-slate-600 mb-4">{loadError}</p>
        <Link to="/kid/make" className="ds-btn ds-btn-primary">Back to my projects</Link>
      </div>
    );
  }
  if (!project) {
    return (
      <div className="flex justify-center py-20" role="status" aria-label="Opening your project">
        <Loader2 className="animate-spin text-brand-600" size={40} />
      </div>
    );
  }

  if (project.kind === "blocks") {
    return (
      <Suspense fallback={<div className="flex justify-center py-20" role="status" aria-label="Opening your blocks"><Loader2 className="animate-spin text-brand-600" size={40} /></div>}>
        <ScratchStudio project={project} />
      </Suspense>
    );
  }

  const handedIn = Boolean(project.submitted_at);
  const marked = Boolean(project.reviewed_at);

  return (
    <div>
      {/* top row */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(project.lesson_id ? "/kid/assignments" : "/kid/make")} className="w-11 h-11 rounded-full bg-white border-2 border-brand-100 flex items-center justify-center text-brand-700 shrink-0" aria-label="Go back">
          <ArrowLeft size={20} />
        </button>
        <label className="flex-1 min-w-0">
          <span className="sr-only">Name of your project</span>
          <input
            value={title}
            disabled={locked}
            onChange={(e) => { dirty.current = true; setSave("saving"); setTitle(e.target.value.slice(0, 80)); }}
            className="w-full text-xl sm:text-2xl font-black text-brand-900 bg-transparent outline-none border-b-2 border-transparent focus:border-brand-300 truncate disabled:opacity-100"
          />
        </label>
        <span className="text-xs font-bold text-slate-500 shrink-0 w-20 text-right" aria-live="polite">
          {locked ? "" : save === "saving" ? "Saving…" : save === "error" ? "Not saved" : "Saved ✓"}
        </span>
      </div>

      {/* assignment */}
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

      {/* phone: switch between code and page */}
      <div className="lg:hidden grid grid-cols-2 gap-2 mb-3" role="tablist" aria-label="Code or page">
        {([["code", "Code", Code2], ["page", "My page", Eye]] as const).map(([v, label, Icon]) => (
          <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)}
            className={`h-12 rounded-2xl font-black flex items-center justify-center gap-2 ${view === v ? "bg-brand-600 text-white" : "bg-white border-2 border-brand-100 text-brand-700"}`}>
            <Icon size={18} aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* code */}
        <div className={`min-w-0 ${view === "page" ? "hidden lg:block" : ""}`}>
          {/* VS Code style: file tabs, a small toolbar, the editor, and a status bar */}
          <div className="rounded-2xl overflow-hidden border-2" style={{ borderColor: dark ? "#3c3c3c" : "#d4d4d4" }}>
            <div className="flex items-end gap-px overflow-x-auto" style={{ background: dark ? "#252526" : "#ececec" }} role="tablist" aria-label="Files">
              {TABS.map((t) => (
                <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} title={t.hint}
                  className="px-4 h-10 text-[13px] font-semibold whitespace-nowrap flex items-center gap-2 border-t-2"
                  style={tab === t.id
                    ? { background: dark ? "#1e1e1e" : "#ffffff", color: dark ? "#ffffff" : "#1e1e1e", borderTopColor: "#007acc" }
                    : { background: "transparent", color: dark ? "#9d9d9d" : "#616161", borderTopColor: "transparent" }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: t.dot }} aria-hidden="true" />
                  {t.file}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-2 py-1.5 text-xs" style={{ background: dark ? "#333333" : "#f3f3f3", color: dark ? "#d4d4d4" : "#333333" }} role="toolbar" aria-label="Editor settings">
              <label className="flex items-center gap-1.5">
                <span className="sr-only">Colour theme</span>
                <select
                  value={prefs.theme}
                  onChange={(e) => updatePrefs({ ...prefs, theme: e.target.value })}
                  className="h-8 rounded-md px-2 font-semibold text-xs"
                  style={{ background: dark ? "#3c3c3c" : "#ffffff", color: dark ? "#f0f0f0" : "#1e1e1e", border: "1px solid " + (dark ? "#555" : "#c8c8c8") }}
                >
                  <optgroup label="Dark">
                    {EDITOR_THEMES.filter((t) => t.dark).map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </optgroup>
                  <optgroup label="Light">
                    {EDITOR_THEMES.filter((t) => !t.dark).map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </optgroup>
                </select>
              </label>

              <div className="flex items-center gap-1" role="group" aria-label="Text size">
                <button onClick={() => updatePrefs({ ...prefs, fontSize: Math.max(FONT_MIN, prefs.fontSize - 1) })} disabled={prefs.fontSize <= FONT_MIN} aria-label="Smaller text" className="w-8 h-8 rounded-md font-black disabled:opacity-40 hover:bg-white/10">A−</button>
                <span className="w-6 text-center font-semibold tabular-nums" aria-live="polite">{prefs.fontSize}</span>
                <button onClick={() => updatePrefs({ ...prefs, fontSize: Math.min(FONT_MAX, prefs.fontSize + 1) })} disabled={prefs.fontSize >= FONT_MAX} aria-label="Bigger text" className="w-8 h-8 rounded-md font-black disabled:opacity-40 hover:bg-white/10">A+</button>
              </div>

              <button onClick={() => updatePrefs({ ...prefs, wrap: !prefs.wrap })} aria-pressed={prefs.wrap} title="Wrap long lines" className={`h-8 px-2 rounded-md flex items-center gap-1.5 font-semibold ${prefs.wrap ? "bg-[#007acc] text-white" : "hover:bg-white/10"}`}>
                <WrapText size={15} aria-hidden="true" /> Wrap
              </button>

              <button onClick={tidy} disabled={locked || tidying} title="Lay this file out neatly" className="h-8 px-2 rounded-md flex items-center gap-1.5 font-semibold hover:bg-white/10 disabled:opacity-40">
                {tidying ? <Loader2 className="animate-spin" size={15} /> : <Wand2 size={15} aria-hidden="true" />} Tidy
              </button>
            </div>

            <CodeMirror
              key={tab}
              value={code[tab]}
              height={isPhone() ? "13rem" : "24rem"}
              maxWidth="100%"
              theme={themeById(prefs.theme).extension}
              extensions={[...EXTENSIONS[tab], keymap.of([indentWithTab]), ...(prefs.wrap ? [EditorView.lineWrapping] : [])]}
              editable={!locked}
              readOnly={locked}
              onChange={edit}
              onStatistics={(d) => setPos({ ln: d.line.number, col: d.selectionAsSingle.head - d.line.from + 1 })}
              basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true, autocompletion: true, bracketMatching: true, closeBrackets: true, indentOnInput: true }}
              style={{ fontSize: prefs.fontSize + "px" }}
              aria-label={`${tab.toUpperCase()} code`}
            />

            <div className="flex items-center gap-x-4 gap-y-0.5 flex-wrap px-3 py-1 text-[11px] font-semibold text-white" style={{ background: "#007acc" }} aria-label="Editor status">
              <span>Ln {pos.ln}, Col {pos.col}</span>
              <span>Spaces: 2</span>
              <span>{TABS.find((t) => t.id === tab)?.name}</span>
              <span className="ml-auto">{themeById(prefs.theme).label}</span>
              {locked && <span>Read only (handed in)</span>}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button onClick={run} className="ds-btn ds-btn-next !min-h-[3.25rem] !text-lg !px-6">
              <Play size={20} aria-hidden="true" /> Run
            </button>
            <span className="hidden sm:inline text-xs text-slate-500 font-semibold">or press Ctrl + Enter</span>

            {project.lesson_id && !handedIn && (
              confirmHandIn ? (
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-600">Hand it in?</span>
                  <button className="ds-btn ds-btn-primary !min-h-[2.75rem]" onClick={handIn} disabled={busy}>
                    {busy ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} aria-hidden="true" />} Yes, hand in
                  </button>
                  <button className="ds-btn ds-btn-ghost !min-h-[2.75rem]" onClick={() => setConfirmHandIn(false)}>Not yet</button>
                </div>
              ) : (
                <button className="ds-btn ds-btn-secondary ml-auto !min-h-[3.25rem]" onClick={() => setConfirmHandIn(true)}>
                  <Send size={18} aria-hidden="true" /> Hand in
                </button>
              )
            )}
            {handedIn && !marked && (
              <button className="ds-btn ds-btn-secondary ml-auto !min-h-[3.25rem]" onClick={takeBack} disabled={busy}>
                <Undo2 size={18} aria-hidden="true" /> Take it back to change it
              </button>
            )}
          </div>
        </div>

        {/* page */}
        <div className={`min-w-0 ${view === "code" ? "hidden lg:block" : ""}`}>
          <p className="mb-2 h-11 flex items-end text-sm font-black text-slate-600">My page</p>
          <CodePreview html={code.html} css={code.css} js={code.js} runId={runId} />
          <p className="mt-2 text-xs text-slate-500">For your safety your page cannot load things from the internet. Pictures must be written inside your code.</p>
        </div>
      </div>
    </div>
  );
};

export default KidEditor;
