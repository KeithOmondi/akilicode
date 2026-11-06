import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { BookOpen, KeyRound, MoreVertical, SlidersHorizontal } from "lucide-react";

/**
 * The "⋮" menu on each child's row.
 * The menu is drawn on top of the whole page (a portal), so a table or card with `overflow: hidden`
 * can never cut it off. It flips upwards near the bottom of the screen, closes on Escape,
 * outside click, scroll or resize, and can be used with the keyboard (arrow keys, Tab, Enter).
 */
interface Props {
  childName: string;
  hasLogin: boolean;
  onSettings: () => void;
  onLogin: () => void;
}

const MENU_W = 272;
const GAP = 8;

const Item = ({
  icon, tone, title, hint, onClick, to,
}: { icon: React.ReactNode; tone: "purple" | "orange" | "blue"; title: string; hint: string; onClick?: () => void; to?: string }) => {
  const bubble = { purple: "bg-purple-100 text-purple-600", orange: "bg-orange-100 text-orange-600", blue: "bg-sky-100 text-sky-600" }[tone];
  const cls = "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-purple-50 focus:bg-purple-50 focus:outline-none transition-colors";
  const body = (
    <>
      <span className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${bubble}`} aria-hidden="true">{icon}</span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-slate-800">{title}</span>
        <span className="block text-xs text-slate-500 truncate">{hint}</span>
      </span>
    </>
  );
  return to ? (
    <Link role="menuitem" to={to} className={cls} onClick={onClick}>{body}</Link>
  ) : (
    <button role="menuitem" type="button" className={cls} onClick={onClick}>{body}</button>
  );
};

const KidActionsMenu = ({ childName, hasLogin, onSettings, onLogin }: Props) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    btn.current?.focus();
  }, []);

  // position next to the button, flipping up when there is no room below
  useLayoutEffect(() => {
    if (!open || !btn.current) return;
    const r = btn.current.getBoundingClientRect();
    const h = menu.current?.offsetHeight ?? 220;
    const below = r.bottom + GAP + h <= window.innerHeight;
    setPos({
      top: below ? r.bottom + GAP : Math.max(GAP, r.top - GAP - h),
      left: Math.min(Math.max(GAP, r.right - MENU_W), window.innerWidth - MENU_W - GAP),
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menu.current?.contains(t) && !btn.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const items = Array.from(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
        const i = items.indexOf(document.activeElement as HTMLElement);
        items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
      }
    };
    const away = () => setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", away);
    window.addEventListener("scroll", away, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", away);
      window.removeEventListener("scroll", away, true);
    };
  }, [open, close]);

  // move focus into the menu when it opens
  useEffect(() => {
    if (open && pos) menu.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [open, pos]);

  return (
    <>
      <button
        ref={btn}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Options for ${childName}`}
        onClick={() => { setPos(null); setOpen((o) => !o); }}
        className={`p-2.5 rounded-xl transition-all ${open ? "bg-purple-100 text-purple-700" : "text-gray-400 hover:bg-purple-50 hover:text-purple-600"}`}
      >
        <MoreVertical size={18} />
      </button>

      {open &&
        createPortal(
          <div
            ref={menu}
            role="menu"
            aria-label={`Options for ${childName}`}
            style={{ position: "fixed", top: pos?.top ?? -9999, left: pos?.left ?? -9999, width: MENU_W, visibility: pos ? "visible" : "hidden" }}
            className="z-[60] bg-white rounded-2xl shadow-2xl shadow-purple-900/15 border border-purple-100 p-2 animate-in fade-in zoom-in-95 duration-100"
          >
            <p className="px-3 pt-1 pb-2 text-[11px] font-black uppercase tracking-widest text-purple-900/40 truncate">{childName}</p>
            <Item
              to="/parent/programs"
              tone="blue"
              icon={<BookOpen size={18} />}
              title="View programs"
              hint="Courses and payments"
              onClick={() => setOpen(false)}
            />
            <Item
              tone="purple"
              icon={<SlidersHorizontal size={18} />}
              title="Child settings"
              hint="PIN, screen time, privacy"
              onClick={() => { setOpen(false); onSettings(); }}
            />
            <Item
              tone="orange"
              icon={<KeyRound size={18} />}
              title={hasLogin ? "Update login" : "Set up login"}
              hint="Username and PIN"
              onClick={() => { setOpen(false); onLogin(); }}
            />
          </div>,
          document.body,
        )}
    </>
  );
};

export default KidActionsMenu;
