import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Blockly from "blockly/core";
import { ArrowLeft, Brush, CheckCircle2, ClipboardList, Code2, Eye, Image as ImageIcon, Loader2, Plus, Send, Trash2, Undo2, X } from "lucide-react";
import toast from "react-hot-toast";
import BlockWorkspace from "../../components/scratch/BlockWorkspace";
import StagePreview from "../../components/scratch/StagePreview";
import SpritePicker from "../../components/scratch/SpritePicker";
import PaintEditor from "../../components/scratch/PaintEditor";
import CostumeImage from "../../components/scratch/CostumeImage";
import { compileBlocks, normalizeProject, MAX_COSTUMES, MAX_SPRITES, setCostumeChoices, setSpriteChoices, type Costume, type ProjectState, type SpriteData } from "../../lib/scratch/blocks";
import { costumesOf, pictureFromFile, resolveCostumes, type LibrarySprite } from "../../lib/scratch/spriteAssets";
import type { StageCostume } from "../../lib/scratch/runtime";
import { newRunId } from "../../lib/sandbox";
import { projectsApi, errorText, type Project } from "../../lib/projectsApi";

/**
 * The block editor ("Scratch" for our learners), laid out like Scratch itself and sized to fit the screen:
 * a purple menu bar, the block palette and coding area (or the costumes) on the left, and on the right the stage
 * with its flag and stop buttons and the list of sprites. Each sprite has its own costumes and its own blocks.
 * Saved automatically. Assignment projects can be handed in; once handed in they are read-only until taken back.
 */
const PURPLE = "#855cd6";

type SpriteMeta = Omit<SpriteData, "blocks">;
type View = "blocks" | "costumes" | "stage";
/** What the paint editor is doing: a new sprite, a new costume, or changing an existing costume. */
type Painting = { for: "sprite" } | { for: "costume" } | { for: "edit"; costumeId: string; src: string };

const nextCostumeId = (list: Costume[]) => {
  let k = list.length + 1;
  while (list.some((c) => c.id === `c${k}`)) k++;
  return `c${k}`;
};

const ScratchStudio = ({ project: initial }: { project: Project }) => {
  const navigate = useNavigate();
  const [project, setProject] = useState<Project>(initial);
  const [title, setTitle] = useState(initial.title);
  const [runId, setRunId] = useState("");
  const [code, setCode] = useState("");
  const [stageCostumes, setStageCostumes] = useState<StageCostume[][]>([]);
  const [save, setSave] = useState<"saved" | "saving" | "error">("saved");
  const [view, setView] = useState<View>("blocks"); // phones show one at a time; desktop: blocks or costumes on the left
  const [showCode, setShowCode] = useState(false);
  const [showTask, setShowTask] = useState(false);
  const [taskSeen, setTaskSeen] = useState(false); // until it is opened once, the Assignment button stands out
  const [busy, setBusy] = useState(false);
  const [confirmHandIn, setConfirmHandIn] = useState(false);
  const [changes, setChanges] = useState(0);
  const [picker, setPicker] = useState<null | "sprite" | "costume">(null);
  const [painting, setPainting] = useState<Painting | null>(null);

  // The sprites (names, costumes) live in state; each sprite's blocks live in a ref so typing never re-renders.
  const [first] = useState(() => normalizeProject(initial.blocks));
  const [sprites, setSprites] = useState<SpriteMeta[]>(first.sprites.map((s) => ({ id: s.id, name: s.name, costumes: s.costumes, start: s.start })));
  const [activeId, setActiveId] = useState(first.sprites[0].id);
  const blocksOf = useRef<Record<string, object | null>>(Object.fromEntries(first.sprites.map((s) => [s.id, s.blocks])));
  // The block editor is rebuilt (n changes) when we switch sprite or lock/unlock; it starts from `blocks`.
  const [mount, setMount] = useState<{ n: number; blocks: object | null }>({ n: 0, blocks: first.sprites[0].blocks });
  const rebuild = (id: string) => setMount((m) => ({ n: m.n + 1, blocks: blocksOf.current[id] ?? null }));

  const ws = useRef<Blockly.WorkspaceSvg | null>(null);
  const dirty = useRef(false);

  const locked = Boolean(project.submitted_at);
  const handedIn = locked;
  const marked = Boolean(project.reviewed_at);
  const active = sprites.find((s) => s.id === activeId) ?? sprites[0];

  // The "touching ..." and "switch costume to ..." blocks list these.
  setSpriteChoices(sprites);
  setCostumeChoices(active.costumes);

  /** Read the blocks on screen into the saved copy, then return the whole project. */
  const snapshot = (): ProjectState => {
    if (ws.current && !locked) blocksOf.current[activeId] = Blockly.serialization.workspaces.save(ws.current);
    return { v: 3, sprites: sprites.map((s) => ({ ...s, blocks: blocksOf.current[s.id] ?? null })) };
  };
  // The autosave sends the newest snapshot; keep a ref so the timer never uses an old one.
  const snapshotRef = useRef(snapshot);
  useEffect(() => {
    snapshotRef.current = snapshot;
  });

  const touched = () => {
    dirty.current = true;
    setSave("saving");
    setChanges((c) => c + 1);
  };
  const onChange = (next: object) => {
    blocksOf.current[activeId] = next;
    touched();
  };

  // Autosave 1.2 s after the last change.
  useEffect(() => {
    if (!dirty.current || locked) return;
    const t = setTimeout(async () => {
      try {
        await projectsApi.save(project.id, { title: title.trim() || "My blocks", blocks: snapshotRef.current() });
        dirty.current = false;
        setSave("saved");
      } catch (e) {
        setSave("error");
        toast.error(errorText(e), { id: "scratch-save" });
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [changes, title, locked, project.id]);

  const compile = () => compileBlocks(snapshot());
  const isPhone = () => window.matchMedia("(max-width: 1023px)").matches;

  const flag = async () => {
    try {
      const proj = snapshot();
      const generated = compileBlocks(proj);
      const pictures = await resolveCostumes(proj);
      setCode(generated);
      setStageCostumes(pictures);
      setRunId(newRunId());
      if (isPhone()) setView("stage");
    } catch {
      toast.error("Something is not right with the blocks. Check that they are joined to a 🏁 block.");
    }
  };
  const stop = () => setRunId("");

  const toggleCode = () => {
    if (!showCode) {
      try {
        setCode(compile());
      } catch {
        /* shown as empty */
      }
    }
    setShowCode((v) => !v);
  };

  // ── sprites ──
  const pick = (id: string) => {
    if (id === activeId) return;
    snapshot(); // keeps the blocks of the sprite we are leaving
    setActiveId(id);
    rebuild(id);
  };
  const makeSprite = (baseName: string, costumes: Costume[]) => {
    if (sprites.length >= MAX_SPRITES) return toast.error(`You can have ${MAX_SPRITES} sprites.`);
    snapshot();
    let name = baseName;
    for (let n = 2; sprites.some((s) => s.name === name); n++) name = `${baseName}${n}`;
    let k = sprites.length + 1;
    while (sprites.some((sp) => sp.id === `s${k}`)) k++;
    const id = `s${k}`;
    blocksOf.current[id] = null;
    setSprites((cur) => [...cur, { id, name, costumes, start: 0 }]);
    setActiveId(id);
    rebuild(id);
    setView((v) => (v === "costumes" ? v : "blocks"));
    touched();
    toast(`${name} added. Give it some blocks! Start with a 🏁 block.`, { icon: "✨" });
  };
  const removeSprite = () => {
    if (sprites.length < 2) return;
    const left = sprites.filter((s) => s.id !== activeId);
    delete blocksOf.current[activeId];
    setSprites(left);
    setActiveId(left[0].id);
    rebuild(left[0].id);
    touched();
  };
  const renameSprite = (name: string) => {
    setSprites((cur) => cur.map((s) => (s.id === activeId ? { ...s, name: name.slice(0, 20) } : s)));
    touched();
  };

  // ── costumes ──
  const changeActive = (fn: (s: SpriteMeta) => SpriteMeta) => {
    setSprites((cur) => cur.map((s) => (s.id === activeId ? fn(s) : s)));
    touched();
  };
  const addCostumes = (pictures: { name: string; src: string }[]) => {
    if (active.costumes.length + pictures.length > MAX_COSTUMES) return toast.error(`A sprite can have ${MAX_COSTUMES} costumes.`);
    changeActive((s) => {
      const list = [...s.costumes];
      for (const p of pictures) list.push({ id: nextCostumeId(list), name: p.name.slice(0, 30), src: p.src });
      return { ...s, costumes: list, start: list.length - 1 };
    });
  };
  const pickCostumeFromLibrary = (entry: LibrarySprite) => {
    setPicker(null);
    const list = costumesOf(entry);
    addCostumes(list.map((c) => ({ name: c.name, src: c.src })));
    setView("costumes");
  };
  const deleteCostume = (id: string) => {
    if (active.costumes.length < 2) return;
    changeActive((s) => {
      const list = s.costumes.filter((c) => c.id !== id);
      return { ...s, costumes: list, start: Math.min(s.start ?? 0, list.length - 1) };
    });
  };
  const renameCostume = (id: string, name: string) => changeActive((s) => ({ ...s, costumes: s.costumes.map((c) => (c.id === id ? { ...c, name: name.slice(0, 30) } : c)) }));
  const chooseCostume = (index: number) => changeActive((s) => ({ ...s, start: index }));

  const onPainted = (picture: string) => {
    const p = painting;
    setPainting(null);
    setPicker(null);
    if (!p) return;
    if (p.for === "sprite") makeSprite("My sprite", [{ id: "c1", name: "My sprite", src: picture }]);
    else if (p.for === "costume") {
      addCostumes([{ name: `costume${active.costumes.length + 1}`, src: picture }]);
      setView("costumes");
    } else changeActive((s) => ({ ...s, costumes: s.costumes.map((c) => (c.id === p.costumeId ? { ...c, src: picture } : c)) }));
  };
  const onUploaded = async (file: File) => {
    const mode = picker;
    try {
      const picture = await pictureFromFile(file);
      setPicker(null);
      const name = file.name.replace(/\.[^.]+$/, "").slice(0, 20) || "My picture";
      if (mode === "sprite") makeSprite(name, [{ id: "c1", name, src: picture }]);
      else {
        addCostumes([{ name, src: picture }]);
        setView("costumes");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not use that picture.");
    }
  };

  const handIn = async () => {
    setBusy(true);
    try {
      await projectsApi.save(project.id, { title: title.trim() || "My blocks", blocks: snapshot() });
      dirty.current = false;
      const p = await projectsApi.submit(project.id);
      setProject((cur) => ({ ...cur, ...p }));
      rebuild(activeId);
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
      setProject((cur) => ({ ...cur, ...p }));
      rebuild(activeId);
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const barButton = "h-9 px-3 rounded-lg text-sm font-bold flex items-center gap-1.5 text-white hover:bg-white/15 disabled:opacity-60";
  const startCostume = active.costumes[active.start ?? 0] ?? active.costumes[0];
  const canAddSprite = !locked && sprites.length < MAX_SPRITES;
  const costumesView = view === "costumes";

  const tabClass = (on: boolean) =>
    `h-9 px-4 rounded-t-lg font-bold text-sm flex items-center gap-2 border-t-4 ${on ? "bg-white" : "bg-transparent text-slate-500 border-transparent hover:bg-white/60"}`;

  const spritePanel = (
    <div className="rounded-xl bg-white border border-slate-200 p-2.5 min-h-0 flex flex-col gap-2">
      <div className="flex items-center gap-2 min-h-9">
        <span className="text-xs font-bold text-slate-500 shrink-0">Sprite</span>
        <input
          value={active.name}
          disabled={locked}
          onChange={(e) => renameSprite(e.target.value)}
          aria-label="Name of this sprite"
          className="min-w-0 flex-1 h-8 px-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-800 disabled:bg-slate-50"
        />
        {!locked && sprites.length > 1 && (
          <button onClick={removeSprite} className="h-8 w-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 shrink-0" aria-label={`Delete ${active.name}`} title="Delete this sprite">
            <Trash2 size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2 overflow-y-auto">
        {sprites.map((s) => (
          <button
            key={s.id}
            onClick={() => pick(s.id)}
            aria-pressed={s.id === activeId}
            aria-label={`Sprite ${s.name}`}
            title={s.name}
            className={`w-14 h-14 rounded-lg p-1 flex items-center justify-center bg-[#e9eef2] border-2 ${s.id === activeId ? "border-[#855cd6]" : "border-transparent hover:border-[#c9b6f0]"}`}
          >
            <CostumeImage src={(s.costumes[s.start ?? 0] ?? s.costumes[0]).src} />
          </button>
        ))}
        {canAddSprite && (
          <button onClick={() => setPicker("sprite")} aria-label="Add a sprite" title="Add a sprite"
            className="w-14 h-14 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ background: PURPLE }}>
            <Plus size={24} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );

  const costumesPanel = (
    <div className="flex-1 min-h-0 flex bg-[#f9f9f9]">
      <div className="w-28 sm:w-32 shrink-0 overflow-y-auto bg-white border-r border-slate-200 p-2 flex flex-col gap-2" role="list" aria-label="Costumes">
        {active.costumes.map((c, i) => {
          const on = i === (active.start ?? 0);
          return (
            <button key={c.id} role="listitem" onClick={() => chooseCostume(i)} aria-pressed={on}
              className={`relative rounded-lg p-1.5 border-2 flex flex-col items-center gap-1 ${on ? "border-[#855cd6] bg-[#f4efff]" : "border-slate-200 bg-white hover:border-[#c9b6f0]"}`}>
              <span className="absolute top-1 left-1.5 text-[10px] font-bold text-slate-500">{i + 1}</span>
              <span className="w-16 h-16 flex items-center justify-center"><CostumeImage src={c.src} /></span>
              <span className="text-[11px] font-semibold text-slate-600 truncate max-w-full">{c.name}</span>
            </button>
          );
        })}
        {!locked && active.costumes.length < MAX_COSTUMES && (
          <button onClick={() => setPicker("costume")} aria-label="Add a costume" title="Add a costume" className="h-12 rounded-lg text-white flex items-center justify-center shadow-sm" style={{ background: PURPLE }}>
            <Plus size={22} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="flex-1 min-w-0 p-4 flex flex-col items-center gap-3 overflow-y-auto">
        <div className="w-full max-w-sm aspect-[4/3] rounded-xl border-2 flex items-center justify-center p-6" style={{ borderColor: "#cfc3ee", backgroundImage: "conic-gradient(#f0f0f0 25%, #fff 0 50%, #f0f0f0 0 75%, #fff 0)", backgroundSize: "20px 20px" }}>
          <div className="w-full h-full flex items-center justify-center [&>img]:max-h-full"><CostumeImage src={startCostume.src} /></div>
        </div>
        <label className="w-full max-w-sm flex items-center gap-2 text-sm font-bold text-slate-600">
          Costume name
          <input value={startCostume.name} disabled={locked} onChange={(e) => renameCostume(startCostume.id, e.target.value)} className="flex-1 min-w-0 h-9 px-2 rounded-lg border border-slate-200 font-bold text-slate-800 disabled:bg-slate-50" />
        </label>
        {!locked && (
          <div className="w-full max-w-sm flex flex-wrap gap-2">
            <button onClick={() => setPainting({ for: "edit", costumeId: startCostume.id, src: startCostume.src })} className="h-10 px-4 rounded-lg bg-white border-2 border-[#855cd6] text-[#855cd6] font-bold flex items-center gap-2 hover:bg-[#f4efff]">
              <Brush size={16} aria-hidden="true" /> Edit in paint
            </button>
            {active.costumes.length > 1 && (
              <button onClick={() => deleteCostume(startCostume.id)} className="h-10 px-4 rounded-lg bg-white border-2 border-red-200 text-red-600 font-bold flex items-center gap-2 hover:bg-red-50">
                <Trash2 size={16} aria-hidden="true" /> Delete
              </button>
            )}
          </div>
        )}
        <p className="text-xs text-slate-500 max-w-sm text-center">The costume you pick here is the one your sprite wears when the 🏁 is pressed. Use the “switch costume” and “next costume” blocks to change it while the program runs.</p>
      </div>
    </div>
  );

  return (
    <div className="lg:h-[calc(100dvh-10rem)] lg:min-h-[30rem] flex flex-col rounded-2xl overflow-hidden border-2 shadow-sm bg-white relative" style={{ borderColor: PURPLE }}>
      {/* ── menu bar ── */}
      <div className="flex items-center gap-1.5 sm:gap-3 px-2 sm:px-3 h-14 shrink-0 text-white" style={{ background: PURPLE }}>
        <button onClick={() => navigate(project.lesson_id ? "/kid/assignments" : "/kid/make")} className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/15 shrink-0" aria-label="Go back">
          <ArrowLeft size={20} />
        </button>
        <label className="flex-1 min-w-0 max-w-md">
          <span className="sr-only">Name of your project</span>
          <input
            value={title}
            disabled={locked}
            onChange={(e) => { touched(); setTitle(e.target.value.slice(0, 80)); }}
            className="w-full h-9 px-3 rounded-lg bg-white/20 placeholder-white/70 font-bold text-white outline-none focus:bg-white focus:text-slate-800 truncate disabled:opacity-100"
          />
        </label>
        <span className="text-xs font-bold text-white/85 shrink-0 hidden sm:block w-16" aria-live="polite">
          {locked ? "" : save === "saving" ? "Saving…" : save === "error" ? "Not saved" : "Saved ✓"}
        </span>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {project.assignment && (
            <button onClick={() => { setShowTask((v) => !v); setTaskSeen(true); }} aria-pressed={showTask} className={`${barButton} ${showTask ? "bg-white/20" : ""} ${!taskSeen ? "!bg-amber-300 !text-amber-950 hover:!bg-amber-200" : ""}`}>
              <ClipboardList size={16} aria-hidden="true" /> <span className="hidden sm:inline">Assignment</span>
            </button>
          )}
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

      {/* the assignment: a card over the editor, closed with one tap (so the page never needs to scroll) */}
      {project.assignment && showTask && (
        <section className="absolute z-30 left-3 right-3 top-[3.75rem] sm:left-auto sm:right-4 sm:w-[26rem] rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 shadow-xl" aria-label="Your assignment">
          <div className="flex items-start gap-2 mb-1">
            <ClipboardList size={18} className="text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
            <span className="flex-1 text-xs font-black text-amber-700 uppercase tracking-widest">Your assignment{project.lesson_title ? `: ${project.lesson_title}` : ""}</span>
            <button onClick={() => setShowTask(false)} className="w-7 h-7 -mt-1 -mr-1 rounded-lg flex items-center justify-center text-amber-700 hover:bg-amber-100" aria-label="Close the assignment"><X size={16} /></button>
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

      {/* phone: code, costumes or stage */}
      <div className="lg:hidden grid grid-cols-3 bg-white border-b border-slate-200 shrink-0" role="tablist" aria-label="Code, costumes or stage">
        {([["blocks", "Code", Code2], ["costumes", "Costumes", ImageIcon], ["stage", "Stage", Eye]] as const).map(([v, label, Icon]) => (
          <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)}
            className={`h-11 font-bold flex items-center justify-center gap-1.5 text-sm border-b-4 ${view === v ? "text-[#855cd6] border-[#855cd6]" : "text-slate-500 border-transparent"}`}>
            <Icon size={17} aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(18rem,27rem)] lg:flex-1 lg:min-h-0" style={{ background: "#e5f0ff" }}>
        {/* ── code / costumes area ── */}
        <div className={`min-w-0 min-h-0 bg-white flex flex-col ${view === "stage" ? "hidden lg:flex" : ""}`}>
          <div className="hidden lg:flex h-10 items-end bg-[#e5f0ff] px-2 shrink-0 gap-1" role="tablist" aria-label="Code or costumes">
            <button role="tab" aria-selected={!costumesView} onClick={() => setView("blocks")} className={tabClass(!costumesView)} style={!costumesView ? { color: PURPLE, borderColor: PURPLE } : undefined}>
              <Code2 size={16} aria-hidden="true" /> Code
            </button>
            <button role="tab" aria-selected={costumesView} onClick={() => setView("costumes")} className={tabClass(costumesView)} style={costumesView ? { color: PURPLE, borderColor: PURPLE } : undefined}>
              <ImageIcon size={16} aria-hidden="true" /> Costumes
            </button>
            <span className="ml-3 mb-2 text-xs font-bold text-slate-500 flex items-center gap-1.5"><span className="w-4 h-4 inline-flex"><CostumeImage src={startCostume.src} className="w-4 h-4 object-contain" /></span> {active.name}</span>
          </div>
          {/* phones: pick the sprite right above its blocks */}
          <div className="lg:hidden flex items-center gap-2 px-2 py-1.5 bg-[#f4efff] overflow-x-auto shrink-0" aria-label="Sprites">
            {sprites.map((s) => (
              <button key={s.id} onClick={() => pick(s.id)} aria-pressed={s.id === activeId} aria-label={`Sprite ${s.name}`}
                className={`w-11 h-11 shrink-0 rounded-lg p-1 flex items-center justify-center bg-white border-2 ${s.id === activeId ? "border-[#855cd6]" : "border-transparent"}`}><CostumeImage src={(s.costumes[s.start ?? 0] ?? s.costumes[0]).src} /></button>
            ))}
            {canAddSprite && (
              <button onClick={() => setPicker("sprite")} aria-label="Add a sprite" className="w-11 h-11 shrink-0 rounded-lg flex items-center justify-center text-white" style={{ background: PURPLE }}><Plus size={20} aria-hidden="true" /></button>
            )}
          </div>

          {costumesView ? (
            <div className="h-[min(30rem,60vh)] lg:h-auto lg:flex-1 lg:min-h-0 flex">{costumesPanel}</div>
          ) : (
            <div className="relative h-[min(30rem,60vh)] lg:h-auto lg:flex-1 lg:min-h-0">
              <BlockWorkspace
                key={mount.n}
                initialState={mount.blocks}
                readOnly={locked}
                onChange={onChange}
                onReady={(w) => { ws.current = w; }}
                height="100%"
              />
              {showCode && (
                <div className="absolute inset-x-0 bottom-0 z-20 max-h-[45%] flex flex-col bg-ink-900 text-slate-100 shadow-2xl">
                  <p className="px-4 py-2 bg-black/30 text-xs font-black uppercase tracking-widest text-slate-300 shrink-0">All your blocks as JavaScript</p>
                  <pre className="p-3 text-[12px] leading-relaxed overflow-auto font-mono whitespace-pre-wrap break-words">{code || "(no blocks yet)"}</pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── stage and sprites ── */}
        <div className={`min-w-0 min-h-0 p-3 flex flex-col gap-2.5 lg:overflow-y-auto ${view !== "stage" ? "hidden lg:flex" : ""}`}>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={flag} className="w-11 h-11 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xl hover:bg-emerald-50" aria-label="Start: green flag" title="Start (green flag)">
              🏁
            </button>
            <button onClick={stop} className="w-11 h-11 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-red-50" aria-label="Stop" title="Stop">
              <span className="w-5 h-5 bg-[#ec5959] border-2 border-[#d94848]" style={{ clipPath: "polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%)" }} aria-hidden="true" />
            </button>
            <span className="ml-auto text-xs font-bold text-slate-500 hidden xl:block">Press the flag to run</span>
          </div>
          {/* the stage keeps its 4:3 shape and never gets taller than the screen leaves room for */}
          <div className="w-full mx-auto shrink-0 lg:[width:min(100%,calc((100dvh-28rem)*1.3333))] lg:min-w-[14rem]">
            <StagePreview code={code} runId={runId} costumes={stageCostumes} />
          </div>
          {spritePanel}
        </div>
      </div>

      {picker && !painting && (
        <SpritePicker
          mode={picker}
          onClose={() => setPicker(null)}
          onPick={(entry) => {
            if (picker === "costume") return pickCostumeFromLibrary(entry);
            setPicker(null);
            makeSprite(entry.name, costumesOf(entry));
          }}
          onPaint={() => setPainting({ for: picker === "sprite" ? "sprite" : "costume" })}
          onUpload={onUploaded}
        />
      )}
      {painting && <PaintEditor initialSrc={painting.for === "edit" ? painting.src : undefined} onSave={onPainted} onCancel={() => setPainting(null)} />}
    </div>
  );
};

export default ScratchStudio;
