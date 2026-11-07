import { Link } from "react-router-dom";
import { Flame, Star, ShieldCheck, Smartphone, Ban } from "lucide-react";

/** Answers in five seconds: what it is, who it is for, how to start. */
const Hero = () => (
  <section className="bg-gradient-to-b from-brand-50 to-white overflow-hidden" aria-labelledby="hero-title">
    <div className="ds-page py-14 sm:py-20 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
      <div>
        <p className="inline-block rounded-full bg-white border border-brand-200 text-brand-700 font-bold text-sm px-4 py-1.5">
          For children aged 4 to 18
        </p>
        <h1 id="hero-title" className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink-900 leading-[1.05]">
          Coding adventures your child will <span className="text-brand-600">love</span>.
        </h1>
        <p className="mt-5 text-lg sm:text-xl text-ink-700 max-w-xl">
          Short, fun lessons that fit your child's age. You stay in control, and you pay safely with M-Pesa.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link to="/register" className="ds-btn ds-btn-primary !min-h-[3.5rem] !text-lg sm:px-8">Start free</Link>
          <a href="#how" className="ds-btn ds-btn-secondary !min-h-[3.5rem] !text-lg sm:px-8">See how it works</a>
        </div>
        <p className="mt-3 text-sm text-ink-500">Create your account in 2 minutes. No payment needed to sign up.</p>

        <ul className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm font-semibold text-ink-700">
          <li className="flex items-center gap-2"><Ban size={18} className="text-brand-600" aria-hidden="true" /> No ads, no chatting with strangers</li>
          <li className="flex items-center gap-2"><ShieldCheck size={18} className="text-brand-600" aria-hidden="true" /> You set the screen time</li>
          <li className="flex items-center gap-2"><Smartphone size={18} className="text-brand-600" aria-hidden="true" /> Pay with M-Pesa</li>
        </ul>
      </div>

      {/* A picture of what the child sees: not a screenshot, just the idea */}
      <div className="relative mx-auto w-full max-w-sm" aria-hidden="true">
        <div className="absolute -inset-6 bg-brand-200/40 rounded-[3rem] blur-2xl" />
        <div className="relative rounded-[2rem] bg-brand-600 text-white p-6 shadow-[0_8px_0_var(--color-brand-900)]">
          <p className="text-xs font-extrabold uppercase tracking-widest text-brand-100">Your next mission</p>
          <p className="mt-1 text-2xl font-extrabold leading-tight">Loops: do it again!</p>
          <p className="text-brand-100 font-semibold mt-1">lesson 3 of 5</p>
          <div className="mt-6 rounded-2xl bg-emerald-500 py-4 text-center text-xl font-extrabold shadow-[0_5px_0_#047857]">Let’s go! ▶</div>
        </div>
        <div className="absolute -left-4 -bottom-6 flex items-center gap-2 bg-white rounded-2xl shadow-lg border border-ink-200 px-4 py-3 rotate-[-4deg]">
          <Flame className="text-orange-500" size={22} /> <span className="font-extrabold text-ink-900">4 day streak</span>
        </div>
        <div className="absolute -right-3 -top-5 flex items-center gap-2 bg-white rounded-2xl shadow-lg border border-ink-200 px-4 py-3 rotate-[3deg]">
          <Star className="text-yellow-500 fill-yellow-400" size={22} /> <span className="font-extrabold text-ink-900">240 stars</span>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
