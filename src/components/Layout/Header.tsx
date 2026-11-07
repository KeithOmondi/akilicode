import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../../assets/akili.jpeg";
import { SITE } from "../../config/site";

/** Public site header: logo, five links, "Log in", and the one button that matters, "Start free". */
const LINKS = [
  { label: "How it works", href: "/#how" },
  { label: "Ages", href: "/#ages" },
  { label: "Safety", href: "/#safety" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
] as const;

const Header = () => {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: MouseEvent) => {
      if (!panel.current?.contains(e.target as Node) && !(e.target as Element).closest("[data-menu-button]")) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-ink-200">
      <div className="ds-page h-16 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label={`${SITE.name} home`}>
          <img src={logo} alt="" className="h-10 w-10 rounded-xl object-cover" width={40} height={40} />
          <span className="font-extrabold text-xl text-brand-900 tracking-tight">{SITE.name}</span>
        </Link>

        <nav aria-label="Main" className="hidden lg:flex items-center gap-1 ml-4">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="px-3 py-2 rounded-lg text-[15px] font-semibold text-ink-700 hover:bg-brand-50 hover:text-brand-700">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden lg:flex items-center gap-2">
          <Link to="/kid/login" className="px-3 py-2 rounded-lg text-[15px] font-semibold text-ink-700 hover:bg-brand-50">I'm a kid</Link>
          <Link to="/login" className="px-3 py-2 rounded-lg text-[15px] font-semibold text-ink-700 hover:bg-brand-50">Log in</Link>
          <Link to="/register" className="ds-btn ds-btn-primary !min-h-[2.75rem]">Start free</Link>
        </div>

        <button
          data-menu-button
          type="button"
          className="lg:hidden ml-auto w-11 h-11 rounded-xl flex items-center justify-center text-ink-700 hover:bg-brand-50"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" ref={panel} className="lg:hidden border-t border-ink-200 bg-white shadow-lg">
          <nav aria-label="Mobile" className="ds-page py-3 flex flex-col">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-3 text-lg font-semibold text-ink-900 border-b border-ink-100">
                {l.label}
              </a>
            ))}
            <Link to="/kid/login" onClick={() => setOpen(false)} className="py-3 text-lg font-semibold text-ink-900 border-b border-ink-100">I'm a kid</Link>
            <Link to="/login" onClick={() => setOpen(false)} className="py-3 text-lg font-semibold text-ink-900">Log in</Link>
            <Link to="/register" onClick={() => setOpen(false)} className="ds-btn ds-btn-primary w-full mt-2 mb-1">Start free</Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
