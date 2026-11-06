import { useState } from "react";

/**
 * Living style guide. Available only in development at /design-system.
 * Everything here uses the tokens in src/styles/tokens.css — change them there to re-brand.
 */
const Swatch = ({ name, cls }: { name: string; cls: string }) => (
  <div className="text-center text-sm">
    <div className={`h-14 rounded-lg border border-ink-200 ${cls}`} />
    <div className="mt-1 text-ink-700">{name}</div>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="text-xl font-bold mb-3">{title}</h2>
    {children}
  </section>
);

const DesignSystem = () => {
  const [mood, setMood] = useState<"parent" | "kid">("parent");
  const [readable, setReadable] = useState(false);
  const [large, setLarge] = useState(false);

  return (
    <div
      className="min-h-screen py-8"
      data-mood={mood === "kid" ? "kid" : undefined}
      data-font={readable ? "readable" : undefined}
      data-text={large ? "large" : undefined}
    >
      <a href="#ds-main" className="skip-link">Skip to main content</a>
      <main id="ds-main" className="ds-page">
        <h1 className="text-3xl font-extrabold mb-1">AKILI design system</h1>
        <p className="text-ink-700 mb-6">Placeholder branding — neutral until the owner picks colours.</p>

        <div className="flex flex-wrap gap-3 mb-8" role="group" aria-label="Preview settings">
          <button className="ds-btn ds-btn-secondary" aria-pressed={mood === "kid"} onClick={() => setMood(mood === "kid" ? "parent" : "kid")}>
            Mood: {mood}
          </button>
          <button className="ds-btn ds-btn-secondary" aria-pressed={readable} onClick={() => setReadable(!readable)}>
            Readable font: {readable ? "on" : "off"}
          </button>
          <button className="ds-btn ds-btn-secondary" aria-pressed={large} onClick={() => setLarge(!large)}>
            Large text: {large ? "on" : "off"}
          </button>
        </div>

        <Section title="Colour">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            <Swatch name="brand-600" cls="bg-brand-600" />
            <Swatch name="brand-100" cls="bg-brand-100" />
            <Swatch name="ink-900" cls="bg-ink-900" />
            <Swatch name="ink-500" cls="bg-ink-500" />
            <Swatch name="ok" cls="bg-ok" />
            <Swatch name="danger" cls="bg-danger" />
            <Swatch name="kid-sun" cls="bg-kid-sun" />
            <Swatch name="kid-grass" cls="bg-kid-grass" />
            <Swatch name="kid-berry" cls="bg-kid-berry" />
            <Swatch name="kid-sky" cls="bg-kid-sky" />
            <Swatch name="kid-grape" cls="bg-kid-grape" />
            <Swatch name="canvas" cls="bg-canvas" />
          </div>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap gap-3 items-center">
            <button className="ds-btn ds-btn-primary">Primary</button>
            <button className="ds-btn ds-btn-secondary">Secondary</button>
            <button className="ds-btn ds-btn-ghost">Ghost</button>
            <button className="ds-btn ds-btn-danger">Delete</button>
            <button className="ds-btn ds-btn-primary" disabled>Disabled</button>
            <button className="ds-btn ds-btn-next">Next ▶</button>
          </div>
        </Section>

        <Section title="Form">
          <form className="ds-card max-w-md" onSubmit={(e) => e.preventDefault()}>
            <label className="ds-label" htmlFor="ds-phone">M-Pesa phone number</label>
            <input id="ds-phone" className="ds-input" inputMode="tel" placeholder="0712 345 678" aria-describedby="ds-phone-help" />
            <p id="ds-phone-help" className="ds-help">We will send a prompt to this phone.</p>
            <label className="ds-label mt-4" htmlFor="ds-bad">With an error</label>
            <input id="ds-bad" className="ds-input" aria-invalid="true" aria-describedby="ds-bad-err" defaultValue="12" />
            <p id="ds-bad-err" className="ds-error" role="alert">Enter a valid Kenyan phone number.</p>
          </form>
        </Section>

        <Section title="Badges & cards">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="ds-badge ds-badge-ok">Paid</span>
            <span className="ds-badge ds-badge-warn">Pending</span>
            <span className="ds-badge ds-badge-danger">Failed</span>
            <span className="ds-badge ds-badge-info">Trial</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="ds-card"><h3 className="font-bold">Card title</h3><p className="text-ink-700">Cards hold one idea each.</p></div>
            <div className="ds-card"><h3 className="font-bold">Another card</h3><p className="text-ink-700">Same radius, same shadow.</p></div>
          </div>
        </Section>
      </main>
    </div>
  );
};

export default DesignSystem;
