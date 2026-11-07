import { Link } from "react-router-dom";
import { Mail, MessageCircle, Phone } from "lucide-react";
import logo from "../../assets/akili.jpeg";
import { SITE } from "../../config/site";

const Footer = () => (
  <footer className="bg-brand-900 text-white">
    <div className="ds-page py-12 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
      <div>
        <div className="flex items-center gap-3">
          <img src={logo} alt="" className="h-11 w-11 rounded-xl object-cover" width={44} height={44} loading="lazy" />
          <span className="font-extrabold text-xl tracking-tight">{SITE.name}</span>
        </div>
        <p className="mt-3 text-brand-100 max-w-sm">Coding adventures for children aged 4 to 18, with parents in control.</p>
      </div>

      <nav aria-label="Footer">
        <h2 className="font-bold text-sm uppercase tracking-widest text-brand-200 mb-3">Explore</h2>
        <ul className="space-y-2 text-brand-50">
          <li><a className="hover:underline" href="/#how">How it works</a></li>
          <li><a className="hover:underline" href="/#pricing">Pricing</a></li>
          <li><Link className="hover:underline" to="/parent-guide">Guide for parents</Link></li>
          <li><Link className="hover:underline" to="/blog">Blog</Link></li>
          <li><Link className="hover:underline" to="/legal">Terms and privacy</Link></li>
        </ul>
      </nav>

      <div>
        <h2 className="font-bold text-sm uppercase tracking-widest text-brand-200 mb-3">Talk to us</h2>
        <ul className="space-y-3 text-brand-50">
          <li><a className="flex items-center gap-2 hover:underline" href={SITE.whatsappHref}><MessageCircle size={18} aria-hidden="true" /> WhatsApp us</a></li>
          <li><a className="flex items-center gap-2 hover:underline" href={SITE.phoneHref}><Phone size={18} aria-hidden="true" /> {SITE.phone}</a></li>
          <li><a className="flex items-center gap-2 hover:underline break-all" href={`mailto:${SITE.email}`}><Mail size={18} aria-hidden="true" /> {SITE.email}</a></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-white/10">
      <p className="ds-page py-5 text-sm text-brand-200">© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
