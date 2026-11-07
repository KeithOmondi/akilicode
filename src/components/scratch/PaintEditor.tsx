import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Circle, Eraser, Minus, PaintBucket, Pencil, Square, Trash2, Undo2 } from "lucide-react";
import { drawCostumeOn, encodePicture, trimCanvas } from "../../lib/scratch/spriteAssets";

interface Props {
  /** A costume to start from (editing it), or nothing for a blank canvas. */
  initialSrc?: string;
  onSave: (picture: string) => void;
  onCancel: () => void;
}

type Tool = "pen" | "eraser" | "line" | "rect" | "ellipse" | "fill";
const W = 480, H = 360;
const PURPLE = "#855cd6";
const COLORS = [
  "#000000", "#575e75", "#ffffff", "#ec5959", "#ff8c1a", "#ffbf00", "#ffe97a", "#59c059", "#0f7a3c", "#5cb1d6", "#4c97ff", "#1e3fa8",
  "#9966ff", "#cf63cf", "#ff9ec7", "#8a4b2a", "#5b3216", "#c68642",
];
const SIZES = [3, 6, 12, 22];

const hexToRgba = (hex: string): [number, number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
};

/** Paint bucket: fills the area of similar colour around the clicked point. */
const floodFill = (ctx: CanvasRenderingContext2D, x: number, y: number, hex: string) => {
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  const at = (px: number, py: number) => (py * W + px) * 4;
  const start = at(x, y);
  const target = [d[start], d[start + 1], d[start + 2], d[start + 3]];
  const fill = hexToRgba(hex);
  if (target.every((v, i) => v === fill[i])) return;
  const close = (i: number) => Math.abs(d[i] - target[0]) + Math.abs(d[i + 1] - target[1]) + Math.abs(d[i + 2] - target[2]) + Math.abs(d[i + 3] - target[3]) <= 60;
  const seen = new Uint8Array(W * H);
  const stack = [x, y];
  while (stack.length) {
    const py = stack.pop()!, px = stack.pop()!;
    if (px < 0 || py < 0 || px >= W || py >= H || seen[py * W + px]) continue;
    const i = at(px, py);
    if (!close(i)) continue;
    seen[py * W + px] = 1;
    d[i] = fill[0]; d[i + 1] = fill[1]; d[i + 2] = fill[2]; d[i + 3] = 255;
    stack.push(px + 1, py, px - 1, py, px, py + 1, px, py - 1);
  }
  ctx.putImageData(img, 0, 0);
};

/** A small paint program: pencil, eraser, line, rectangle, circle, paint bucket, colours, undo. Saves a trimmed picture. */
const PaintEditor = ({ initialSrc, onSave, onCancel }: Props) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const undo = useRef<ImageData[]>([]);
  const gesture = useRef<{ x: number; y: number; base: ImageData | null; moved: boolean } | null>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#ec5959");
  const [size, setSize] = useState(6);
  const [filled, setFilled] = useState(true);
  const [error, setError] = useState("");
  const [canUndo, setCanUndo] = useState(false);

  const ctx = () => canvas.current!.getContext("2d", { willReadFrequently: true })!;

  useEffect(() => {
    if (initialSrc && canvas.current) drawCostumeOn(initialSrc, canvas.current).catch(() => setError("That picture could not be opened for editing."));
  }, [initialSrc]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = before; };
  }, [onCancel]);

  const remember = () => {
    undo.current.push(ctx().getImageData(0, 0, W, H));
    if (undo.current.length > 25) undo.current.shift();
    setCanUndo(true);
  };
  const doUndo = () => {
    const last = undo.current.pop();
    if (last) ctx().putImageData(last, 0, 0);
    setCanUndo(undo.current.length > 0);
  };
  const clear = () => {
    remember();
    ctx().clearRect(0, 0, W, H);
  };

  const pos = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: Math.max(0, Math.min(W - 1, Math.round(((e.clientX - r.left) * W) / r.width))), y: Math.max(0, Math.min(H - 1, Math.round(((e.clientY - r.top) * H) / r.height))) };
  };

  const style = (c: CanvasRenderingContext2D) => {
    c.lineCap = "round";
    c.lineJoin = "round";
    c.lineWidth = size;
    c.strokeStyle = color;
    c.fillStyle = color;
    c.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
  };

  const down = (e: React.PointerEvent) => {
    setError("");
    const c = ctx();
    const p = pos(e);
    remember();
    if (tool === "fill") {
      floodFill(c, p.x, p.y, color);
      return;
    }
    (e.target as Element).setPointerCapture(e.pointerId);
    style(c);
    gesture.current = { x: p.x, y: p.y, base: tool === "pen" || tool === "eraser" ? null : c.getImageData(0, 0, W, H), moved: false };
    if (tool === "pen" || tool === "eraser") {
      c.beginPath();
      c.moveTo(p.x, p.y);
      c.lineTo(p.x + 0.01, p.y + 0.01); // a tap makes a dot
      c.stroke();
    }
  };

  const move = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g) return;
    const c = ctx();
    const p = pos(e);
    g.moved = true;
    style(c);
    if (tool === "pen" || tool === "eraser") {
      c.lineTo(p.x, p.y);
      c.stroke();
      return;
    }
    c.putImageData(g.base!, 0, 0);
    if (tool === "line") {
      c.beginPath(); c.moveTo(g.x, g.y); c.lineTo(p.x, p.y); c.stroke();
    } else if (tool === "rect") {
      if (filled) c.fillRect(g.x, g.y, p.x - g.x, p.y - g.y); else c.strokeRect(g.x, g.y, p.x - g.x, p.y - g.y);
    } else if (tool === "ellipse") {
      c.beginPath();
      c.ellipse((g.x + p.x) / 2, (g.y + p.y) / 2, Math.abs(p.x - g.x) / 2, Math.abs(p.y - g.y) / 2, 0, 0, Math.PI * 2);
      if (filled) c.fill(); else c.stroke();
    }
  };

  const up = () => {
    gesture.current = null;
    ctx().globalCompositeOperation = "source-over";
  };

  const save = () => {
    const trimmed = trimCanvas(canvas.current!);
    if (!trimmed) return setError("Draw something first!");
    try {
      onSave(encodePicture(trimmed));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the picture.");
    }
  };

  const tools: { id: Tool; label: string; Icon: typeof Pencil }[] = [
    { id: "pen", label: "Pencil", Icon: Pencil },
    { id: "eraser", label: "Eraser", Icon: Eraser },
    { id: "line", label: "Line", Icon: Minus },
    { id: "rect", label: "Rectangle", Icon: Square },
    { id: "ellipse", label: "Circle", Icon: Circle },
    { id: "fill", label: "Paint bucket", Icon: PaintBucket },
  ];
  const shapeTool = tool === "rect" || tool === "ellipse";

  return (
    <div className="fixed inset-0 z-[90] bg-[#e5f0ff] flex flex-col" role="dialog" aria-modal="true" aria-label="Paint a picture">
      <div className="h-14 shrink-0 text-white flex items-center px-3 gap-2" style={{ background: PURPLE }}>
        <button onClick={onCancel} className="h-10 px-3 rounded-lg flex items-center gap-2 font-bold hover:bg-white/15"><ArrowLeft size={18} aria-hidden="true" /> Back</button>
        <h2 className="flex-1 text-center font-black text-lg">Paint</h2>
        <button onClick={save} className="h-10 px-4 rounded-lg bg-white font-black flex items-center gap-2" style={{ color: PURPLE }}><Check size={18} aria-hidden="true" /> Done</button>
      </div>

      <div className="flex-1 min-h-0 overflow-auto p-3 flex flex-col lg:flex-row gap-3 items-center lg:items-start justify-center">
        <div className="flex lg:flex-col gap-2 flex-wrap justify-center" role="toolbar" aria-label="Tools">
          {tools.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTool(id)} aria-pressed={tool === id} aria-label={label} title={label}
              className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${tool === id ? "text-white border-transparent" : "bg-white text-slate-600 border-slate-200"}`} style={tool === id ? { background: PURPLE } : undefined}>
              <Icon size={22} aria-hidden="true" />
            </button>
          ))}
          <button onClick={doUndo} disabled={!canUndo} aria-label="Undo" title="Undo" className="w-12 h-12 rounded-xl flex items-center justify-center bg-white border-2 border-slate-200 text-slate-600 disabled:opacity-40"><Undo2 size={22} aria-hidden="true" /></button>
          <button onClick={clear} aria-label="Clear everything" title="Clear everything" className="w-12 h-12 rounded-xl flex items-center justify-center bg-white border-2 border-slate-200 text-red-500"><Trash2 size={22} aria-hidden="true" /></button>
        </div>

        <div className="w-full max-w-[34rem] flex flex-col gap-3">
          <div className="rounded-xl overflow-hidden border-2 shadow-sm" style={{ borderColor: PURPLE, backgroundImage: "conic-gradient(#e8e8e8 25%, #fff 0 50%, #e8e8e8 0 75%, #fff 0)", backgroundSize: "20px 20px" }}>
            <canvas ref={canvas} width={W} height={H} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
              className="w-full h-auto block touch-none cursor-crosshair" aria-label="Drawing area" />
          </div>
          {error && <p role="alert" className="rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold px-3 py-2">{error}</p>}

          <div className="rounded-xl bg-white border border-slate-200 p-3 flex flex-col gap-3">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Colours">
              {COLORS.map((c) => (
                <button key={c} onClick={() => { setColor(c); if (tool === "eraser") setTool("pen"); }} aria-label={`Colour ${c}`} aria-pressed={color === c}
                  className={`w-8 h-8 rounded-full border-2 ${color === c ? "ring-2 ring-offset-1 ring-[#855cd6] border-white" : "border-slate-300"}`} style={{ background: c }} />
              ))}
              <label className="w-8 h-8 rounded-full border-2 border-dashed border-slate-400 overflow-hidden relative cursor-pointer" title="Pick any colour">
                <span className="sr-only">Pick any colour</span>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="absolute -inset-2 w-12 h-12 cursor-pointer" />
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-500">Size</span>
              <div className="flex gap-2" role="group" aria-label="Brush size">
                {SIZES.map((s) => (
                  <button key={s} onClick={() => setSize(s)} aria-pressed={size === s} aria-label={`Size ${s}`}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 ${size === s ? "border-[#855cd6] bg-[#f4efff]" : "border-slate-200 bg-white"}`}>
                    <span className="rounded-full bg-slate-700" style={{ width: Math.min(s, 22), height: Math.min(s, 22) }} />
                  </button>
                ))}
              </div>
              {shapeTool && (
                <label className="ml-auto flex items-center gap-2 text-sm font-bold text-slate-600">
                  <input type="checkbox" checked={filled} onChange={(e) => setFilled(e.target.checked)} className="w-5 h-5 accent-[#855cd6]" /> Filled
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaintEditor;
