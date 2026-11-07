import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CodeMirror from "@uiw/react-codemirror";
import { html as htmlLang } from "@codemirror/lang-html";
import { css as cssLang } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { ArrowLeft, CheckCircle2, ClipboardList, Eye, Loader2, Play, Send, Undo2, Code2 } from "lucide-react";
import toast from "react-hot-toast";
import CodePreview from "../../components/kids/CodePreview";
import { newRunId } from "../../lib/sandbox";
import { projectsApi, errorText, type Project } from "../../lib/projectsApi";

type Tab = "html" | "css" | "js";
const TABS: { id: Tab; label: string; hint: string }[] = [
  { id: "html", label: "HTML", hint: "The things on your page" },
  { id: "css", label: "CSS", hint: "How it looks" },
  { id: "js", label: "JavaScript", hint: "What it does" },
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

  const dirty = useRef(false);
  const latest = useRef({ code, title });
  useEffect(() => {
    latest.current = { code, title };
  }, [code, title]);

  const locked = Boolean(project?.submitted_at);

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
        <div className={view === "page" ? "hidden lg:block" : ""}>
          <div className="flex items-center gap-1 mb-2 overflow-x-auto" role="tablist" aria-label="Files">
            {TABS.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} title={t.hint}
                className={`px-4 h-11 rounded-t-2xl font-black text-sm whitespace-nowrap ${tab === t.id ? "bg-white border-2 border-b-0 border-brand-100 text-brand-700" : "text-slate-500 hover:text-brand-700"}`}>
                {t.label}
              </button>
            ))}
            <span className="hidden sm:inline ml-auto text-xs text-slate-500 font-semibold pr-1">{TABS.find((t) => t.id === tab)?.hint}</span>
          </div>
          <div className="rounded-2xl rounded-tl-none border-2 border-brand-100 overflow-hidden bg-white">
            <CodeMirror
              key={tab}
              value={code[tab]}
              height={isPhone() ? "13rem" : "22rem"}
              extensions={[...EXTENSIONS[tab]]}
              editable={!locked}
              readOnly={locked}
              onChange={edit}
              basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: true, autocompletion: true }}
              style={{ fontSize: "15px" }}
              aria-label={`${tab.toUpperCase()} code`}
            />
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
        <div className={view === "code" ? "hidden lg:block" : ""}>
          <p className="mb-2 h-11 flex items-end text-sm font-black text-slate-600">My page</p>
          <CodePreview html={code.html} css={code.css} js={code.js} runId={runId} />
          <p className="mt-2 text-xs text-slate-500">For your safety your page cannot load things from the internet. Pictures must be written inside your code.</p>
        </div>
      </div>
    </div>
  );
};

export default KidEditor;
