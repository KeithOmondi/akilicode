import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Brush, Dices, Loader2, Search, Upload } from "lucide-react";
import { loadLibrary, libraryUrl, type Library, type LibrarySprite } from "../../lib/scratch/spriteAssets";

interface Props {
  /** "sprite": choosing a new sprite. "costume": choosing another picture for the sprite you are editing. */
  mode: "sprite" | "costume";
  onPick: (entry: LibrarySprite) => void;
  onPaint: () => void;
  onUpload: (file: File) => void;
  onClose: () => void;
}

const PURPLE = "#855cd6";

/** Full-screen "Choose a Sprite": search, categories, a surprise button, plus paint and upload. */
const SpritePicker = ({ mode, onPick, onPaint, onUpload, onClose }: Props) => {
  const [library, setLibrary] = useState<Library | null>(null);
  const [failed, setFailed] = useState(false);
  const [cat, setCat] = useState("All");
  const [query, setQuery] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const back = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let live = true;
    loadLibrary().then((l) => live && setLibrary(l)).catch(() => live && setFailed(true));
    return () => { live = false; };
  }, []);

  useEffect(() => {
    back.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = before; };
  }, [onClose]);

  const cats = useMemo(() => ["All", ...Array.from(new Set((library?.sprites ?? []).map((s) => s.cat)))], [library]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (library?.sprites ?? []).filter((s) => (cat === "All" || s.cat === cat) && (!q || s.name.toLowerCase().includes(q) || s.cat.toLowerCase().includes(q)));
  }, [library, cat, query]);

  const surprise = () => {
    const all = library?.sprites ?? [];
    if (all.length) onPick(all[Math.floor(Math.random() * all.length)]);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-[#e5f0ff] flex flex-col" role="dialog" aria-modal="true" aria-label={mode === "sprite" ? "Choose a sprite" : "Choose a costume"}>
      <div className="h-14 shrink-0 text-white flex items-center px-3 gap-3" style={{ background: PURPLE }}>
        <button ref={back} onClick={onClose} className="h-10 px-3 rounded-lg flex items-center gap-2 font-bold hover:bg-white/15">
          <ArrowLeft size={18} aria-hidden="true" /> Back
        </button>
        <h2 className="flex-1 text-center font-black text-lg pr-16">{mode === "sprite" ? "Choose a Sprite" : "Choose a Costume"}</h2>
      </div>

      <div className="shrink-0 px-3 py-2.5 flex flex-wrap items-center gap-2" style={{ background: "#c5b8ec" }}>
        <label className="relative">
          <span className="sr-only">Search</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: PURPLE }} aria-hidden="true" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="h-10 w-40 sm:w-48 rounded-full bg-white pl-9 pr-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#855cd6]" />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Categories">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
              className={`h-10 px-4 rounded-full text-sm font-bold ${cat === c ? "bg-orange-400 text-white" : "text-white"}`} style={cat === c ? undefined : { background: PURPLE }}>
              {c}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={onPaint} className="h-10 px-4 rounded-full bg-white text-sm font-black flex items-center gap-2" style={{ color: PURPLE }}>
            <Brush size={16} aria-hidden="true" /> Paint
          </button>
          <button onClick={() => file.current?.click()} className="h-10 px-4 rounded-full bg-white text-sm font-black flex items-center gap-2" style={{ color: PURPLE }}>
            <Upload size={16} aria-hidden="true" /> Upload
          </button>
          <input ref={file} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) onUpload(f); }} aria-label="Upload a picture" />
          {library && (
            <button onClick={surprise} className="h-10 px-4 rounded-full bg-white text-sm font-black flex items-center gap-2" style={{ color: PURPLE }}>
              <Dices size={16} aria-hidden="true" /> Surprise me
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-3">
        {!library && !failed && <div className="flex justify-center py-20" role="status" aria-label="Loading sprites"><Loader2 className="animate-spin" size={36} style={{ color: PURPLE }} /></div>}
        {failed && <p className="text-center py-20 font-bold text-slate-600">The sprites did not load. Check your internet and try again.</p>}
        {library && shown.length === 0 && <p className="text-center py-20 font-bold text-slate-500">No sprites match “{query}”.</p>}
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-3">
          {shown.map((s) => (
            <li key={s.id}>
              <button onClick={() => onPick(s)} className="w-full aspect-square rounded-xl bg-white border-2 border-transparent hover:border-[#855cd6] shadow-sm flex flex-col items-center justify-between p-2 text-slate-600 hover:text-[#855cd6]">
                <img src={libraryUrl(s.files[0])} alt="" loading="lazy" draggable={false} className="w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] object-contain" />
                <span className="text-sm font-semibold truncate max-w-full">{s.name}</span>
                {s.files.length > 1 && <span className="sr-only">{s.files.length} costumes</span>}
              </button>
            </li>
          ))}
        </ul>
        {library && <p className="text-center text-xs text-slate-500 mt-6 pb-2">{library.credit}</p>}
      </div>
    </div>
  );
};

export default SpritePicker;
