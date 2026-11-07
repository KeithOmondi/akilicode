import { useEffect, useImperativeHandle, useMemo, useRef, useState, type Ref } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { buildStageDoc, type StageCostume } from "../../lib/scratch/runtime";
import { readBridgeMessage } from "../../lib/sandbox";

interface Props {
  /** JavaScript made from the blocks. */
  code: string;
  /** New value = start again. Empty = the stage is stopped and blank. */
  runId: string;
  /** The pictures of every sprite (set together with runId). */
  costumes?: StageCostume[][];
  /** Start the flag programs when this run opens (default). False: just show the sprites, ready for clicked blocks. */
  autostart?: boolean;
  /** Lets the studio run a clicked stack of blocks on the live stage, or stop everything. */
  handle?: Ref<StageHandle>;
}

export interface StageHandle {
  run: (code: string) => void;
  stopAll: () => void;
}

/**
 * The stage. It runs in a locked-down iframe (no same-origin, no network: see lib/sandbox.ts),
 * keeps a 4:3 shape, and can go full screen without restarting.
 */
const StagePreview = ({ code, runId, costumes, autostart = true, handle }: Props) => {
  const [full, setFull] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seenRun, setSeenRun] = useState(runId);
  const frame = useRef<HTMLIFrameElement>(null);
  const exitButton = useRef<HTMLButtonElement>(null);

  if (seenRun !== runId) {
    setSeenRun(runId);
    setError(null);
  }

  // The page may send the stage a stack of blocks to run, or tell it to stop (only this run's frame listens).
  useImperativeHandle(
    handle,
    () => ({
      run: (js: string) => frame.current?.contentWindow?.postMessage({ __akili: runId, type: "run", code: js }, "*"),
      stopAll: () => frame.current?.contentWindow?.postMessage({ __akili: runId, type: "stop" }, "*"),
    }),
    [runId]
  );

  const doc = useMemo(
    () => (runId ? buildStageDoc({ code, token: runId, costumes, autostart }) : ""),
    // A new run rebuilds the stage; editing blocks alone does not.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [runId]
  );

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow) return;
      const m = readBridgeMessage(e.data, runId);
      if (m?.type === "error") setError(m.text);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [runId]);

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFull(false);
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    exitButton.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [full]);

  // Give the stage the keyboard when a program is started with the flag, so arrow keys work without an extra click.
  // (Not when the stage is only being redrawn: that must never take the keyboard away from a number being typed.)
  useEffect(() => {
    if (runId && autostart) frame.current?.focus();
  }, [runId, autostart]);

  return (
    <div className={full ? "fixed inset-0 z-[70] bg-canvas p-3 sm:p-5 flex flex-col gap-3" : "flex flex-col gap-3"} role={full ? "dialog" : undefined} aria-modal={full ? true : undefined} aria-label={full ? "The stage, full screen" : undefined}>
      {full && (
        <div className="flex items-center justify-between gap-3">
          <p className="font-black text-brand-900 text-lg">The stage</p>
          <button ref={exitButton} onClick={() => setFull(false)} className="ds-btn ds-btn-secondary !min-h-[2.75rem]">
            <Minimize2 size={18} aria-hidden="true" /> Exit full screen <span className="hidden sm:inline text-xs font-semibold text-slate-500">(Esc)</span>
          </button>
        </div>
      )}
      <div className={`relative rounded-2xl border-2 border-brand-100 bg-white overflow-hidden ${full ? "flex-1 min-h-0" : "aspect-[4/3] w-full"}`}>
        {runId ? (
          <iframe ref={frame} key={runId} title="The stage" sandbox="allow-scripts" allow="autoplay" srcDoc={doc} className="w-full h-full bg-white" />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 font-bold p-6 text-center">
            Press the <span className="mx-1.5 px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700">green flag</span> to start.
          </div>
        )}
        {!full && (
          <button onClick={() => setFull(true)} className="absolute top-2 right-2 h-9 px-3 rounded-xl bg-white/95 border-2 border-brand-100 text-brand-700 text-xs font-black flex items-center gap-1.5 shadow-sm hover:bg-brand-50" aria-label="Show the stage full screen">
            <Maximize2 size={14} aria-hidden="true" /> Full screen
          </button>
        )}
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold px-3 py-2">⚠️ {error}</p>}
    </div>
  );
};

export default StagePreview;
