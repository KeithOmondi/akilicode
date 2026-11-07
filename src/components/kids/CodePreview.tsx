import { useEffect, useMemo, useRef, useState } from "react";
import { Maximize2, Minimize2, Terminal } from "lucide-react";
import { buildPreviewDoc, readBridgeMessage, type BridgeMessage } from "../../lib/sandbox";

interface Props {
  html: string;
  css: string;
  js: string;
  /** Changes every time the child presses Run. */
  runId: string;
  /** Tall by default; the admin review uses a shorter one. */
  heightClass?: string;
  showConsole?: boolean;
}

/**
 * Runs the child's page in a locked-down iframe and shows what it prints.
 * The iframe has NO allow-same-origin: the code cannot touch our site, cookies or tokens
 * (see lib/sandbox.ts for the full list of protections).
 * "Full screen" only changes how the same frame is laid out, so the page is not reloaded and keeps its state.
 */
const CodePreview = ({ html, css, js, runId, heightClass = "h-72 lg:h-[26rem]", showConsole = true }: Props) => {
  const [lines, setLines] = useState<BridgeMessage[]>([]);
  const [full, setFull] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const exitButton = useRef<HTMLButtonElement>(null);
  const [seenRun, setSeenRun] = useState(runId);

  // New run: clear the old messages (done while rendering, not in an effect).
  if (seenRun !== runId) {
    setSeenRun(runId);
    setLines([]);
  }

  const doc = useMemo(
    () => (runId ? buildPreviewDoc({ html, css, js, token: runId }) : ""),
    // Only a new run rebuilds the page; typing alone must not.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [runId]
  );

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow) return;
      const m = readBridgeMessage(e.data, runId);
      if (m) setLines((prev) => (prev.length >= 200 ? prev : [...prev, m]));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [runId]);

  // Full screen: Esc leaves it, the page behind does not scroll, and focus moves to the exit button.
  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFull(false);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    exitButton.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [full]);

  return (
    <div className={full ? "fixed inset-0 z-[70] bg-canvas p-3 sm:p-5 flex flex-col gap-3" : "flex flex-col gap-3"} role={full ? "dialog" : undefined} aria-modal={full ? true : undefined} aria-label={full ? "Your page, full screen" : undefined}>
      {full && (
        <div className="flex items-center justify-between gap-3">
          <p className="font-black text-brand-900 text-lg">My page</p>
          <button ref={exitButton} onClick={() => setFull(false)} className="ds-btn ds-btn-secondary !min-h-[2.75rem]">
            <Minimize2 size={18} aria-hidden="true" /> Exit full screen <span className="hidden sm:inline text-xs font-semibold text-slate-500">(Esc)</span>
          </button>
        </div>
      )}

      <div className={`relative rounded-2xl border-2 border-brand-100 bg-white overflow-hidden ${full ? "flex-1 min-h-0" : heightClass}`}>
        {runId ? (
          <iframe
            ref={frame}
            key={runId}
            title="Your page"
            // allow-modals lets alert() work. Nothing else: no same-origin, no forms, no pop-ups, no top navigation.
            sandbox="allow-scripts allow-modals"
            srcDoc={doc}
            className="w-full h-full bg-white"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 font-bold p-6 text-center">
            Press <span className="mx-1.5 px-2 py-0.5 rounded-lg bg-brand-100 text-brand-700">Run</span> to see your page here.
          </div>
        )}
        {!full && (
          <button
            onClick={() => setFull(true)}
            className="absolute top-2 right-5 h-9 px-3 rounded-xl bg-white/95 border-2 border-brand-100 text-brand-700 text-xs font-black flex items-center gap-1.5 shadow-sm hover:bg-brand-50"
            aria-label="Show my page full screen"
          >
            <Maximize2 size={14} aria-hidden="true" /> Full screen
          </button>
        )}
      </div>

      {showConsole && (
        <div className="rounded-2xl bg-ink-900 text-slate-100 overflow-hidden" aria-label="Messages from your code">
          <div className="px-4 py-2 bg-black/30 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-300">
            <Terminal size={14} aria-hidden="true" /> Messages
          </div>
          <ul className={`${full ? "max-h-28" : "max-h-36"} overflow-auto p-3 font-mono text-[13px] space-y-1`} aria-live="polite">
            {lines.length === 0 && <li className="text-slate-400">Nothing yet. Use console.log("hi") in your JavaScript to print here.</li>}
            {lines.map((l, i) => (
              <li key={i} className={l.type === "error" ? "text-red-300" : l.type === "warn" ? "text-amber-300" : ""}>
                {l.type === "error" ? "⚠️ " : ""}
                {l.text}
                {l.line ? <span className="text-slate-400"> (line {l.line} of your JavaScript)</span> : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CodePreview;
