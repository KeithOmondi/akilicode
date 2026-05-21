import React, { useState } from 'react';

// ── Set this to true when the feature is ready to launch ──
const FEATURE_LIVE = false;

// ── Lazy-import the real page (swap path to match your project) ──
// import KidInteractivePlayground from './KidInteractivePlayground';

/* ------------------------------------------------------------------ */
/*  Tiny star particle                                                  */
/* ------------------------------------------------------------------ */
interface StarProps {
  style: React.CSSProperties;
}
const Star: React.FC<StarProps> = ({ style }) => (
  <span
    style={{
      position: 'absolute',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.85)',
      pointerEvents: 'none',
      ...style,
    }}
  />
);

/* ------------------------------------------------------------------ */
/*  Coming Soon screen                                                  */
/* ------------------------------------------------------------------ */
const ComingSoonScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [stars] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      size: Math.random() * 3 + 2,
      top: Math.random() * 100,
      left: Math.random() * 100,
      opacity: Math.random() * 0.5 + 0.3,
      duration: (Math.random() * 2 + 1.5).toFixed(1),
      delay: (Math.random() * 2).toFixed(1),
    }))
  );

  const handleNotify = () => {
    if (email && email.includes('@')) {
      setSubmitted(true);
      setEmailError(false);
    } else {
      setEmailError(true);
      setTimeout(() => setEmailError(false), 1200);
    }
  };

  return (
    <>
      <style>{`
        @keyframes cs-rocket {
          0%,100% { transform: translateY(0) rotate(-30deg); }
          50%      { transform: translateY(-24px) rotate(-30deg); }
        }
        @keyframes cs-float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-18px); }
        }
        @keyframes cs-twinkle {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.25; transform: scale(0.55); }
        }
        @keyframes cs-bounce {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-9px); }
        }
        @keyframes cs-shimmer {
          0%,100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }
        @keyframes cs-pop {
          0%   { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes cs-orbit1 {
          from { transform: rotate(0deg)   translateX(90px)  rotate(0deg); }
          to   { transform: rotate(360deg) translateX(90px)  rotate(-360deg); }
        }
        @keyframes cs-orbit2 {
          from { transform: rotate(180deg) translateX(130px) rotate(-180deg); }
          to   { transform: rotate(540deg) translateX(130px) rotate(-540deg); }
        }

        .cs-rocket  { animation: cs-rocket  2.4s ease-in-out infinite; }
        .cs-float   { animation: cs-float   3s   ease-in-out infinite; }
        .cs-orbit1  { animation: cs-orbit1  8s   linear     infinite; position: absolute; top: 0; left: 0; }
        .cs-orbit2  { animation: cs-orbit2  13s  linear     infinite; position: absolute; top: 0; left: 0; }
        .cs-pop     { animation: cs-pop     0.55s ease both; }
        .cs-pop-late{ animation: cs-pop     0.55s 0.15s ease both; opacity: 0; }

        .cs-dot-1 { animation: cs-bounce 0.9s 0.0s ease-in-out infinite; }
        .cs-dot-2 { animation: cs-bounce 0.9s 0.2s ease-in-out infinite; }
        .cs-dot-3 { animation: cs-bounce 0.9s 0.4s ease-in-out infinite; }
        .cs-dot-4 { animation: cs-bounce 0.9s 0.6s ease-in-out infinite; }

        .cs-chip-1 { animation: cs-shimmer 2.5s 0.0s ease-in-out infinite; }
        .cs-chip-2 { animation: cs-shimmer 2.5s 0.4s ease-in-out infinite; }
        .cs-chip-3 { animation: cs-shimmer 2.5s 0.8s ease-in-out infinite; }

        .cs-notify-btn {
          padding: 9px 20px;
          border-radius: 8px;
          background: #7F77DD;
          color: #EEEDFE;
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s, background 0.3s;
          white-space: nowrap;
        }
        .cs-notify-btn:hover { opacity: 0.88; }
        .cs-notify-btn.success { background: #1D9E75; }

        .cs-input {
          flex: 1;
          padding: 9px 14px;
          border-radius: 8px;
          border: 1.5px solid rgba(127,119,221,0.35);
          background: rgba(255,255,255,0.12);
          color: #fff;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          min-width: 0;
        }
        .cs-input::placeholder { color: rgba(255,255,255,0.45); }
        .cs-input:focus { border-color: #7F77DD; }
        .cs-input.error { border-color: #E24B4A; }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1a1040 0%, #0f2a4a 50%, #0d1f35 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: "'Nunito', 'Comic Sans MS', cursive, sans-serif",
        }}
      >
        {/* Stars background */}
        {stars.map((s) => (
          <Star
            key={s.id}
            style={{
              width: s.size,
              height: s.size,
              top: `${s.top}%`,
              left: `${s.left}%`,
              opacity: s.opacity,
              animation: `cs-twinkle ${s.duration}s ${s.delay}s ease-in-out infinite`,
            }}
          />
        ))}

        {/* Orbiting planets */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
          <div className="cs-orbit1" style={{ fontSize: 20 }}>🪐</div>
          <div className="cs-orbit2" style={{ fontSize: 18 }}>⭐</div>
        </div>

        {/* Badge */}
        <div
          className="cs-pop"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(127,119,221,0.25)',
            border: '1px solid rgba(127,119,221,0.5)',
            color: '#c5c0f5',
            fontSize: 12,
            fontWeight: 700,
            padding: '4px 14px',
            borderRadius: 999,
            marginBottom: '1rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          ✨ Coming Soon
        </div>

        {/* Rocket */}
        <div className="cs-rocket" style={{ fontSize: 72, lineHeight: 1, marginBottom: '0.5rem' }} aria-hidden="true">
          🚀
        </div>

        {/* Heading */}
        <h1
          className="cs-pop"
          style={{
            fontSize: 'clamp(26px, 5vw, 38px)',
            fontWeight: 800,
            color: '#ffffff',
            textAlign: 'center',
            margin: '0.75rem 0 0.5rem',
            lineHeight: 1.25,
            textShadow: '0 2px 20px rgba(127,119,221,0.4)',
          }}
        >
          Something awesome<br />is blasting off!
        </h1>

        {/* Sub */}
        <p
          className="cs-pop-late"
          style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.65)',
            textAlign: 'center',
            maxWidth: 380,
            lineHeight: 1.65,
            margin: '0 0 1.75rem',
          }}
        >
          We're building something super cool for you. Get ready to code, play, and learn like never before!
        </p>

        {/* Bouncing dots */}
        <div style={{ display: 'flex', gap: 10, marginBottom: '1.75rem' }} aria-label="Loading">
          {[
            { cls: 'cs-dot-1', bg: '#7F77DD' },
            { cls: 'cs-dot-2', bg: '#EF9F27' },
            { cls: 'cs-dot-3', bg: '#1D9E75' },
            { cls: 'cs-dot-4', bg: '#D4537E' },
          ].map((d) => (
            <div
              key={d.cls}
              className={d.cls}
              style={{ width: 14, height: 14, borderRadius: '50%', background: d.bg }}
            />
          ))}
        </div>

        {/* Feature chips */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
          {[
            { cls: 'cs-chip-1', icon: '🎮', label: 'Fun games' },
            { cls: 'cs-chip-2', icon: '🧩', label: 'Cool challenges' },
            { cls: 'cs-chip-3', icon: '🏆', label: 'Epic rewards' },
          ].map((c) => (
            <div
              key={c.cls}
              className={c.cls}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.08)',
                fontSize: 13,
                color: 'rgba(255,255,255,0.75)',
              }}
            >
              <span style={{ fontSize: 16 }}>{c.icon}</span>
              {c.label}
            </div>
          ))}
        </div>

        {/* Email notify */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', maxWidth: 360, width: '100%' }}>
          <input
            type="email"
            className={`cs-input${emailError ? ' error' : ''}`}
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNotify()}
            disabled={submitted}
            aria-label="Email for notification"
          />
          <button
            className={`cs-notify-btn${submitted ? ' success' : ''}`}
            onClick={handleNotify}
            disabled={submitted}
          >
            {submitted ? '✅ You\'re in!' : 'Notify me!'}
          </button>
        </div>
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  Wrapper — swap between Coming Soon and the real page               */
/* ------------------------------------------------------------------ */
const ComingSoonWrapper: React.FC = () => {
  if (FEATURE_LIVE) {
    // When ready, uncomment and return the real page:
    // return <KidInteractivePlayground />;
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>Feature is live — import KidInteractivePlayground here.</div>;
  }
  return <ComingSoonScreen />;
};

export default ComingSoonWrapper;