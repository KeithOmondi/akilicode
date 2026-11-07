import { Link } from "react-router-dom";
import { Ban, Clock, Lock, Smartphone, Trash2, UserPlus, Users, Rocket } from "lucide-react";

/** Small helper so every section has the same rhythm: label, headline, optional lead. */
export const SectionHead = ({ id, label, title, lead }: { id: string; label: string; title: string; lead?: string }) => (
  <div className="max-w-2xl mx-auto text-center mb-12">
    <p className="text-sm font-extrabold uppercase tracking-widest text-brand-600">{label}</p>
    <h2 id={id} className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-ink-900">{title}</h2>
    {lead && <p className="mt-4 text-lg text-ink-700">{lead}</p>}
  </div>
);

/* ── 1. How it works ─────────────────────────────────────────────────────── */
export const HowItWorks = () => (
  <section id="how" aria-labelledby="how-title" className="bg-white py-16 sm:py-24 scroll-mt-16">
    <div className="ds-page">
      <SectionHead id="how-title" label="How it works" title="From sign-up to first lesson in minutes" />
      <ol className="grid md:grid-cols-3 gap-6">
        {[
          { icon: <UserPlus size={26} />, title: "Create your account", text: "Use your email or just your phone number. It is free to sign up." },
          { icon: <Users size={26} />, title: "Add your child", text: "A nickname and an age is all we need. You agree to how we look after their information." },
          { icon: <Rocket size={26} />, title: "They learn, you watch", text: "Every day your child sees one clear next step. You see their progress and set their screen time." },
        ].map((s, i) => (
          <li key={s.title} className="rounded-3xl border border-ink-200 bg-canvas p-7">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center" aria-hidden="true">{s.icon}</span>
              <span className="text-sm font-extrabold text-brand-600">Step {i + 1}</span>
            </div>
            <h3 className="mt-4 text-xl font-extrabold text-ink-900">{s.title}</h3>
            <p className="mt-2 text-ink-700">{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

/* ── 2. Ages ─────────────────────────────────────────────────────────────── */
const AGES = [
  { range: "4–6", name: "Tots", emoji: "🤖", text: "Pictures, patterns and puzzles like “help the robot get home”. No reading needed." },
  { range: "7–9", name: "Explorers", emoji: "🧩", text: "Drag-and-drop blocks. Make characters move, jump and play." },
  { range: "10–12", name: "Builders", emoji: "🎮", text: "From blocks to the first typed code. Build simple games." },
  { range: "13–15", name: "Coders", emoji: "💻", text: "Python, HTML, CSS and JavaScript. Make a first web page." },
  { range: "16–18", name: "Creators", emoji: "🚀", text: "Projects and challenges: web apps, data and the basics of AI." },
] as const;

export const Ages = () => (
  <section id="ages" aria-labelledby="ages-title" className="bg-brand-50/60 py-16 sm:py-24 scroll-mt-16">
    <div className="ds-page">
      <SectionHead id="ages-title" label="Learning paths" title="Lessons that grow with your child" lead="We suggest a starting point by age, and you can always change it." />
      <ul className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {AGES.map((a) => (
          <li key={a.name} className="rounded-3xl bg-white border border-brand-100 p-6 shadow-sm">
            <div className="text-4xl" aria-hidden="true">{a.emoji}</div>
            <p className="mt-3 text-sm font-extrabold text-brand-600">Ages {a.range}</p>
            <h3 className="text-xl font-extrabold text-ink-900">{a.name}</h3>
            <p className="mt-2 text-ink-700 text-[15px]">{a.text}</p>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

/* ── 3. Safety ───────────────────────────────────────────────────────────── */
export const Safety = () => (
  <section id="safety" aria-labelledby="safety-title" className="bg-white py-16 sm:py-24 scroll-mt-16">
    <div className="ds-page">
      <SectionHead id="safety-title" label="For parents" title="Built so you can relax" lead="We collect as little as possible about your child, and you are always in charge." />
      <ul className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {[
          { icon: <Ban size={24} />, title: "No ads. No chat with strangers.", text: "Children cannot message anyone. There is nothing to click that leads away from the lessons." },
          { icon: <Clock size={24} />, title: "You set the screen time", text: "Choose a daily limit and break reminders. Lessons pause by themselves when time is up." },
          { icon: <Lock size={24} />, title: "Only what we need", text: "A nickname, an age and learning progress. No photos, no location, no full names." },
          { icon: <Trash2 size={24} />, title: "Download or delete, any time", text: "You can take a copy of everything we hold about your child, or delete it for good." },
          { icon: <Smartphone size={24} />, title: "Pay with M-Pesa", text: "Approve a prompt on your own phone. You always see what you are paying for." },
          { icon: <Users size={24} />, title: "Parent-only settings", text: "Settings and payments ask for your password first, so a child sharing your phone cannot change them." },
        ].map((f) => (
          <li key={f.title} className="flex gap-4 rounded-3xl border border-ink-200 p-6">
            <span className="w-12 h-12 shrink-0 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center" aria-hidden="true">{f.icon}</span>
            <div>
              <h3 className="font-extrabold text-ink-900 text-lg">{f.title}</h3>
              <p className="mt-1 text-ink-700 text-[15px]">{f.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

/* ── 4. Final call to action ─────────────────────────────────────────────── */
export const FinalCta = () => (
  <section aria-labelledby="cta-title" className="bg-brand-600 text-white py-16 sm:py-20">
    <div className="ds-page text-center max-w-2xl mx-auto">
      <h2 id="cta-title" className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to start your child's first adventure?</h2>
      <p className="mt-3 text-brand-100 text-lg">Sign up free in two minutes.</p>
      <Link to="/register" className="mt-8 inline-flex items-center justify-center rounded-2xl bg-white text-brand-700 font-extrabold text-lg h-14 px-10 hover:bg-brand-50 shadow-[0_5px_0_var(--color-brand-900)]">
        Start free
      </Link>
    </div>
  </section>
);
