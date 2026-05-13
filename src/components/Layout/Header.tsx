import { useState, useEffect, useRef } from "react";
import { Menu, X, Code2, Mail, Phone, ChevronDown, User, Gamepad2 } from "lucide-react";
import { FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";

const NAV_LINKS = [
  { label: "What We Offer", href: "/#offer" },
  { label: "How It Works", href: "/#how" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
  { label: "Blog", href: "/blog" },
  { label: "Terms & Privacy", href: "/legal" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLoginOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [menuOpen]);

  return (
    <>
      {/* ── Top Header ── */}
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
            <FaFacebook size={14} className="hover:text-orange-400 cursor-pointer transition-colors" />
            <FaTwitter size={14} className="hover:text-orange-400 cursor-pointer transition-colors" />
            <FaLinkedin size={14} className="hover:text-orange-400 cursor-pointer transition-colors" />
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
            <span className="text-xl font-black tracking-tight text-purple-900">
              Akili<span className="text-orange-500">&lt;&gt;</span>Code
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-semibold text-gray-600 hover:text-purple-800 relative group">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 rounded-full group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>

          {/* Desktop CTA & Login Dropdown */}
          <div className="hidden md:flex items-center gap-3" ref={dropdownRef}>
            <div className="relative">
              <button 
                onClick={() => setLoginOpen(!loginOpen)}
                className={`flex items-center gap-1 text-sm font-bold px-4 py-2 rounded-lg transition-colors ${loginOpen ? 'bg-purple-50 text-purple-900' : 'text-purple-800 hover:bg-purple-50'}`}
              >
                Log in <ChevronDown size={14} className={`transition-transform duration-200 ${loginOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Desktop Dropdown Menu */}
              {loginOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-purple-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <a href="/login" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                    <User size={16} className="text-purple-500" /> Parent / Student
                  </a>
                  <a href="/kid/login" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                    <Gamepad2 size={16} className="text-orange-500" /> Kid's Portal
                  </a>
                </div>
              )}
            </div>

            <a href="/register" className="text-sm font-black text-white bg-orange-500 hover:bg-orange-600 px-6 py-2.5 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95">
              Get Started
            </a>
          </div>

          {/* Mobile Burger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden relative z-50 p-2 text-purple-900 hover:bg-purple-50 rounded-xl transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[100] md:hidden transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      <div
        className={`fixed top-0 left-0 bottom-0 w-[300px] bg-white z-[101] md:hidden shadow-2xl transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-6 pt-20">
          <div className="space-y-1 mb-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block text-lg font-bold text-gray-800 hover:text-purple-700 transition-colors py-3 border-b border-gray-50"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="mt-auto space-y-4 pb-8">
            <div className="bg-purple-50 rounded-2xl p-4 space-y-3">
               <p className="text-[10px] uppercase tracking-widest font-black text-purple-400 px-1">Login to your account</p>
               <a href="/login" className="flex items-center justify-between w-full p-3 font-bold text-purple-800 bg-white rounded-xl shadow-sm hover:bg-purple-100 transition-colors">
                Parent Portal <User size={18} />
              </a>
              <a href="/kid/login" className="flex items-center justify-between w-full p-3 font-bold text-orange-600 bg-white rounded-xl shadow-sm hover:bg-orange-50 transition-colors">
                Kid's Game <Gamepad2 size={18} />
              </a>
            </div>
            
            <a 
              href="/register" 
              onClick={() => setMenuOpen(false)}
              className="block w-full text-center py-4 font-black text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-200 active:scale-95 transition-all"
            >
              Get Started Free
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;