import { useState, useEffect } from "react";
import { Menu, X, Code2, Mail, Phone } from "lucide-react";
import { FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";

const NAV_LINKS = [
  { label: "What We Offer", href: "#offer" },
  { label: "How It Works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [menuOpen]);

  return (
    <>
      {/* ── Top Header (Contact & Socials) ── */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-purple-900 text-white/90 text-[10px] sm:text-xs transition-transform duration-300 ${scrolled ? "-translate-y-full" : "translate-y-0"}`}>
        <div className="max-w-6xl mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3 sm:gap-4">
            <a href="mailto:info@akilicode.com" className="flex items-center gap-1 hover:text-orange-400">
              <Mail size={12} /> <span className="hidden xs:inline">info@akilicode.com</span>
            </a>
            <a href="tel:+254705806889" className="flex items-center gap-1">
              <Phone size={12} /> <span>+ (254) 705806889</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <FaFacebook size={14} className="hover:text-orange-400 cursor-pointer" />
            <FaTwitter size={14} className="hover:text-orange-400 cursor-pointer" />
            <FaLinkedin size={14} className="hover:text-orange-400 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* ── Main Header ── */}
      <header
        className={`fixed left-0 right-0 z-40 transition-all duration-300
          ${scrolled ? "bg-white/95 backdrop-blur-md shadow-md py-3 top-0" : "bg-transparent py-5 top-8 sm:top-10"}`}
      >
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group relative z-50">
            <div className="w-9 h-9 bg-purple-700 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
              <Code2 size={18} className="text-white" />
            </div>
            <span className={`text-xl font-black tracking-tight transition-colors ${menuOpen ? "text-purple-900" : "text-purple-900"}`}>
              Akili<span className="text-orange-500">&lt;&gt;</span>Code
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-semibold text-gray-600 hover:text-purple-800 relative group">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 rounded-full group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a href="/login" className="text-sm font-bold text-purple-800 px-4">Log in</a>
            <a href="/register" className="text-sm font-black text-white bg-orange-500 hover:bg-orange-600 px-6 py-2.5 rounded-full shadow-lg transition-all hover:scale-105">
              Get Started
            </a>
          </div>

          {/* Mobile Burger (Ensured z-index is higher than drawer) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden relative z-50 p-2 text-purple-900"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* ── Mobile Drawer (Slide from Left) ── */}
        <div 
          className={`fixed inset-0 bg-purple-900/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setMenuOpen(false)}
        />

        <div
          className={`fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 md:hidden shadow-2xl transform transition-transform duration-300 ease-in-out ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full p-6 pt-24">
            <div className="space-y-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block text-lg font-bold text-gray-800 hover:text-purple-700 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="mt-auto space-y-3 pb-8">
              <a href="/login" className="block w-full text-center py-3 font-bold text-purple-800 border-2 border-purple-100 rounded-xl">
                Log in
              </a>
              <a href="/register" className="block w-full text-center py-3 font-bold text-white bg-orange-500 rounded-xl shadow-lg">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;