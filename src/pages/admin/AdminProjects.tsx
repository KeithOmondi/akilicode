import { lazy, Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Code2, Loader2 } from "lucide-react";
import { PageHeader, StatusBadge, EmptyState } from "../../components/admin/ui";
import { dateShort } from "../../components/admin/format";
import CodePreview from "../../components/kids/CodePreview";
import { newRunId } from "../../lib/sandbox";
import { projectsApi, errorText, type HandedInProject } from "../../lib/projectsApi";

// Block projects need Blockly, which is large: it is only downloaded when a block project is opened.
const BlockWorkspace = lazy(() => import("../../components/scratch/BlockWorkspace"));
const StagePreview = lazy(() => import("../../components/scratch/StagePreview"));

type Filter = "submitted" | "reviewed";

/** Handed-in coding work: read the code, run it safely, give marks and feedback. */
const AdminProjects = () => {
  const [filter, setFilter] = useState<Filter>("submitted");
  const [items, setItems] = useState<HandedInProject[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [runId, setRunId] = useState("");
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [codeTab, setCodeTab] = useState<"html" | "css" | "js">("html");
  const [blocksCode, setBlocksCode] = useState("");
  const [spriteIdx, setSpriteIdx] = useState(0);

  const load = (f: Filter) => {
    setItems(null);
    projectsApi.adminList(f).then(setItems).catch((e) => { toast.error(errorText(e)); setItems([]); });
  };
  useEffect(() => {
    let alive = true;
    projectsApi.adminList("submitted").then((p) => alive && setItems(p)).catch((e) => { toast.error(errorText(e)); if (alive) setItems([]); });
    return () => {
      alive = false;
    };
  }, []);

  const choose = (f: Filter) => {
    setFilter(f);
    setOpenId(null);
    load(f);
  };

  const open = (p: HandedInProject) => {
    setOpenId(p.id);
    setRunId(newRunId());
    setMarks(p.marks === null ? "" : String(p.marks));
    setFeedback(p.feedback ?? "");
    setCodeTab("html");
    setSpriteIdx(0);
    setBlocksCode("");
    if (p.kind === "blocks") {
      // turn the child's blocks into the code the stage runs
      import("../../lib/scratch/blocks").then((m) => { m.setSpriteChoices(m.normalizeProject(p.blocks).sprites); setBlocksCode(m.compileBlocks(p.blocks)); }).catch(() => toast.error("Could not read these blocks."));
    }
  };

  const current = items?.find((p) => p.id === openId) ?? null;
  // A block project is one or more sprites; old projects are a single workspace.
  const sprites: { name: string; emoji: string; blocks: object | null }[] = Array.isArray((current?.blocks as { sprites?: unknown } | null)?.sprites)
    ? ((current!.blocks as { sprites: { name: string; emoji: string; blocks: object | null }[] }).sprites)
    : [{ name: "Cat", emoji: "🐱", blocks: (current?.blocks as object | null) ?? null }];
  const sprite = sprites[Math.min(spriteIdx, sprites.length - 1)];

  const save = async () => {
    if (!current) return;
    const m = Number(marks);
    if (marks === "" || !Number.isInteger(m) || m < 0 || m > 100) return toast.error("Marks must be a whole number from 0 to 100.");
    setSaving(true);
    try {
      await projectsApi.adminReview(current.id, m, feedback.trim());
      toast.success("Saved. The child can see it now.");
      setOpenId(null);
      load(filter);
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Handed-in work" subtitle="Coding assignments children have handed in. Run them safely, then mark them." />

      <div className="inline-flex rounded-xl bg-ink-100 p-1 mb-4" role="tablist" aria-label="Filter">
        {([["submitted", "To mark"], ["reviewed", "Marked"]] as const).map(([f, label]) => (
          <button key={f} role="tab" aria-selected={filter === f} onClick={() => choose(f)}
            className={`px-4 h-9 rounded-lg text-sm font-bold ${filter === f ? "bg-white shadow-sm text-brand-700" : "text-ink-700"}`}>{label}</button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[22rem_1fr] gap-6">
        <div className="adm-card self-start">
          {items === null ? (
            <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-brand-600" /></div>
          ) : items.length === 0 ? (
            <EmptyState icon={<Code2 size={22} />} title={filter === "submitted" ? "Nothing to mark" : "Nothing marked yet"} text={filter === "submitted" ? "New work shows up here when a child hands it in." : undefined} />
          ) : (
            <ul className="divide-y divide-ink-100">
              {items.map((p) => (
                <li key={p.id}>
                  <button onClick={() => open(p)} className={`w-full text-left p-4 hover:bg-ink-100/60 ${openId === p.id ? "bg-brand-50" : ""}`}>
                    <p className="font-bold text-ink-900">{p.kid_name}{p.kid_age ? <span className="font-semibold text-ink-500"> · age {p.kid_age}</span> : null}</p>
                    <p className="text-sm text-ink-700 truncate">{p.lesson_title ?? p.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-ink-500">{dateShort(p.submitted_at)}</span>
                      {p.reviewed_at && <StatusBadge status="completed" label={`${p.marks} / 100`} />}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          {!current ? (
            <div className="adm-card"><EmptyState icon={<Code2 size={22} />} title="Choose a project" text="Pick one on the left to read the code and see the page." /></div>
          ) : (
            <div className="space-y-4">
              <div className="adm-card adm-card-pad">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">{current.course_title}</p>
                <h2 className="text-lg font-extrabold">{current.lesson_title ?? current.title}</h2>
                {current.assignment && <p className="mt-2 text-ink-700">{current.assignment}</p>}
              </div>

              {current.kind === "blocks" ? (
                <div className="grid xl:grid-cols-2 gap-4">
                  <Suspense fallback={<div className="adm-card p-10 flex justify-center"><Loader2 className="animate-spin text-brand-600" /></div>}>
                    <div>
                      {sprites.length > 1 && (
                        <div className="flex flex-wrap gap-2 mb-2" role="group" aria-label="Sprites">
                          {sprites.map((sp, i) => (
                            <button key={i} onClick={() => setSpriteIdx(i)} aria-pressed={i === spriteIdx} className={`ds-btn ds-btn-sm ${i === spriteIdx ? "ds-btn-primary" : "ds-btn-secondary"}`}>{sp.emoji} {sp.name}</button>
                          ))}
                        </div>
                      )}
                      <BlockWorkspace key={`${current.id}-${spriteIdx}`} initialState={sprite.blocks} readOnly height="26rem" />
                    </div>
                    <div>
                      <StagePreview code={blocksCode} runId={runId} />
                      <button className="ds-btn ds-btn-secondary ds-btn-sm mt-2" onClick={() => setRunId(newRunId())}>Start again</button>
                    </div>
                  </Suspense>
                </div>
              ) : (
                <div className="grid xl:grid-cols-2 gap-4">
                  <div className="adm-card overflow-hidden">
                    <div className="flex border-b border-ink-200" role="tablist" aria-label="Files">
                      {(["html", "css", "js"] as const).map((t) => (
                        <button key={t} role="tab" aria-selected={codeTab === t} onClick={() => setCodeTab(t)}
                          className={`px-4 h-10 text-sm font-bold uppercase ${codeTab === t ? "text-brand-700 border-b-2 border-brand-600" : "text-ink-500"}`}>{t}</button>
                      ))}
                    </div>
                    <pre className="p-4 text-[13px] leading-relaxed overflow-auto max-h-96 bg-ink-900 text-slate-100 font-mono whitespace-pre-wrap break-words">{current[codeTab] || "(empty)"}</pre>
                  </div>
                  <div>
                    <CodePreview html={current.html} css={current.css} js={current.js} runId={runId} heightClass="h-80" />
                    <button className="ds-btn ds-btn-secondary ds-btn-sm mt-2" onClick={() => setRunId(newRunId())}>Run again</button>
                  </div>
                </div>
              )}

              <div className="adm-card adm-card-pad grid sm:grid-cols-[8rem_1fr] gap-4">
                <label className="text-sm font-semibold text-ink-700">Marks (0 to 100)
                  <input className="adm-input w-full mt-1" inputMode="numeric" value={marks} onChange={(e) => setMarks(e.target.value.replace(/\D/g, "").slice(0, 3))} />
                </label>
                <label className="text-sm font-semibold text-ink-700">Feedback for the child
                  <textarea className="adm-input w-full mt-1 !py-2 min-h-[5rem]" maxLength={2000} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Say what they did well and one thing to try next." />
                </label>
                <div className="sm:col-span-2 flex justify-end">
                  <button className="ds-btn ds-btn-primary" onClick={save} disabled={saving}>
                    {saving && <Loader2 className="animate-spin" size={16} />} {current.reviewed_at ? "Update marks" : "Save marks"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminProjects;
