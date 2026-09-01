import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Radar, FileText, DollarSign, Lock } from 'lucide-react';

/* ============================== UTILS ============================== */

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp01 = (v) => Math.min(1, Math.max(0, v));

const COLORS = {
  bg: '#0A0D12',
  bgAlt: '#0D1119',
  panel: '#141A23',
  paper: '#EBE3CE',
  paperDim: '#B7AD93',
  ink: '#1B1712',
  amber: '#CC8F45',
  red: '#B8402E',
  finance: '#3FA78A',
  cipher: '#9088E8',
  cipherAlt: '#4FC7C2',
  text: '#EDEAE1',
  textMuted: '#8C919B',
  textFaint: '#4B505A',
};

const FONT_DISPLAY = "'Bebas Neue', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";
const FONT_BODY = "'Inter', sans-serif";
const EASE_SMOOTH = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_OVERSHOOT = 'cubic-bezier(0.2, 1.4, 0.4, 1)';
const EASE_OUT_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

// A tiled feTurbulence rect, reused as a fixed low-opacity overlay for a
// scanned-document grain rather than a flat digital background.
const GRAIN_DATA_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

const STYLE_BLOCK = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

@keyframes ix-blip { 0%, 100% { opacity: .15; transform: scale(1); } 50% { opacity: 1; transform: scale(1.8); } }
@keyframes ix-scan { 0% { transform: translateY(-120%); } 100% { transform: translateY(700%); } }
@keyframes ix-sweep { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
@keyframes ix-flicker { 0%, 92%, 100% { opacity: 1; } 94% { opacity: .4; } 96% { opacity: .9; } }
@keyframes ix-glow-pulse { 0%, 100% { opacity: 0.25; } 50% { opacity: 0.65; } }
@keyframes ix-radar-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes ix-grain-shift { 0% { transform: translate(0%, 0%); } 50% { transform: translate(-2%, 1.5%); } 100% { transform: translate(1.5%, -2%); } }
@keyframes ix-stamp {
  0% { opacity: 0; transform: scale(2.5) rotate(-17deg); }
  55% { opacity: 1; transform: scale(0.93) rotate(-1deg); }
  75% { transform: scale(1.06) rotate(-3deg); }
  100% { opacity: 1; transform: scale(1) rotate(-2deg); }
}
@keyframes ix-glitch {
  0%, 95%, 100% { text-shadow: none; transform: translate(0, 0); }
  96% { text-shadow: -2px 0 ${COLORS.cipher}, 2px 0 ${COLORS.red}; transform: translate(-1px, 0); }
  97.5% { text-shadow: 2px 0 ${COLORS.cipher}, -2px 0 ${COLORS.red}; transform: translate(1px, 0); }
  99% { text-shadow: none; transform: translate(0, 0); }
}

.ix-root * { box-sizing: border-box; }
.ix-root ::selection { background: ${COLORS.amber}; color: ${COLORS.bg}; }
.ix-flicker { animation: ix-flicker 8.5s ease-in-out infinite; }
.ix-cardglow-layer { animation: ix-glow-pulse 7.2s ease-in-out infinite; }
.ix-shimmer { animation: ix-sweep 6.2s linear infinite; }
.ix-glitch-label { display: inline-block; animation: ix-glitch 6.5s ease-in-out infinite; }
`;

/* ============================== HOOKS ============================== */

function useReducedMotion() {
  const [rm, setRm] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setRm(mq.matches);
    const handler = () => setRm(mq.matches);
    mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler);
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler);
    };
  }, []);
  return rm;
}

/**
 * Fires once a section scrolls into view, then latches permanently — the
 * observer disconnects after the first hit, so the reveal animation runs
 * exactly one time and never resets or flickers on scroll-up. Uses native
 * IntersectionObserver (root: viewport by default) rather than manual
 * getBoundingClientRect polling, so there's no per-frame layout thrashing
 * and no dependency on which ancestor element actually scrolls.
 */
function useLatchedInView(ref, rootMargin = '0px 0px -12% 0px') {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      // Environments without IO support: just show the content.
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.1, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inView;
}

/**
 * Drives the thin top progress bar. Only reads scrollY/scrollHeight (no
 * getBoundingClientRect), so this loop is cheap even running continuously.
 * try/catch + scheduling the next frame in `finally` means one bad frame
 * can never permanently kill the loop.
 */
function useScrollProgress() {
  const [overall, setOverall] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    let raf;

    const tick = () => {
      try {
        const vh = window.innerHeight || 1;
        const doc = document.documentElement;
        const scrollTop = window.scrollY || doc.scrollTop || document.body.scrollTop || 0;
        const value = clamp01(scrollTop / Math.max(1, doc.scrollHeight - vh));

        if (Math.abs(prevRef.current - value) > 0.0008) {
          prevRef.current = value;
          setOverall(value);
        }
      } catch (err) {
        console.error('[useScrollProgress] frame failed, continuing:', err);
      } finally {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return overall;
}

/* ========================== SMALL PIECES ========================== */

function Tag({ color, name }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{ borderColor: color }}>
      <span className="rounded-full" style={{ width: 6, height: 6, background: color }} />
      <span style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: '0.15em', color: COLORS.text }}>
        {name}
      </span>
    </div>
  );
}

function RevealLine({ inView, delay, children, style }) {
  return (
    <div
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0px)' : 'translateY(16px)',
        transition: `opacity 1.3s ${EASE_SMOOTH} ${delay}ms, transform 1.3s ${EASE_SMOOTH} ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Fixed, low-opacity turbulence texture across the whole page so the dark
 * panels read as scanned/printed evidence rather than flat UI. Position
 * jumps in discrete steps (not a smooth drift) so it stays a texture, not
 * a distracting motion. */
function GrainOverlay({ reducedMotion }) {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 30,
        backgroundImage: `url("${GRAIN_DATA_URI}")`,
        opacity: 0.045,
        mixBlendMode: 'overlay',
        animation: reducedMotion ? 'none' : 'ix-grain-shift 1.4s steps(2) infinite',
      }}
    />
  );
}

/** A rubber-stamp entrance: slams in oversized and slightly rotated, then
 * settles — used once, for the one badge that should feel "decided". */
function StampBadge({ inView, delay = 0, children }) {
  return (
    <span
      className="inline-block px-4 py-2"
      style={{
        fontFamily: FONT_MONO,
        fontSize: 13,
        letterSpacing: '0.15em',
        color: COLORS.red,
        border: `1px solid ${COLORS.red}`,
        opacity: inView ? 1 : 0,
        animation: inView ? `ix-stamp 1.1s ${EASE_OVERSHOOT} ${delay}ms both` : 'none',
      }}
    >
      {children}
    </span>
  );
}

/* ========================= CASE FILE HEADER ========================= */

function CaseFileHeader() {
  return (
    <section className="relative w-full overflow-hidden px-6 py-7" style={{ background: COLORS.bg }}>
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.12,
          backgroundImage: `linear-gradient(${COLORS.textFaint} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.textFaint} 1px, transparent 1px)`,
          backgroundSize: '46px 46px',
        }}
      />

      <div
        className="relative"
        style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: '0.25em', color: COLORS.textMuted, lineHeight: 1.8 }}
      >
        CASE FILE — IX-2214
        <br />
        <span style={{ color: COLORS.red }}>CLASSIFICATION: RESTRICTED</span>
      </div>
    </section>
  );
}

/* ======================== SPONSORS — ALL AT ONCE ======================== */

const SPONSORS = [
  {
    name: 'MERIDIAN FREIGHT',
    label: 'ENTITY 01 — CUSTOMS TRAIL',
    accent: COLORS.amber,
    icon: FileText,
    flavor: 'MANIFEST IX-77042 · 3 UNLISTED PORT CALLS',
  },
  {
    name: 'VANTAGE HOLDINGS',
    label: 'ENTITY 02 — FINANCIAL TRAIL',
    accent: COLORS.finance,
    icon: DollarSign,
    flavor: '$ 92,400.00 ROUTED THROUGH AC-4471',
  },
  {
    name: 'NOCTURNE SYSTEMS',
    label: 'ENTITY 03 — ENCRYPTED CHANNEL',
    accent: COLORS.cipher,
    icon: Lock,
    flavor: '9-BLOCK CIPHER · KEY FRAGMENT RECOVERED',
  },
];

/**
 * A length-normalized SVG "string" connecting three pins, like a corkboard
 * thread linking evidence. pathLength="1" means stroke-dasharray/dashoffset
 * of 1/0 always maps to fully-hidden/fully-drawn regardless of true path
 * length, so the draw-in works without measuring anything. Once drawn, a
 * small dot rides each segment on loop (SMIL animateMotion) as a signal
 * pulse, so the thread keeps reading as "live" instead of going inert.
 * Desktop only — on a single stacked column a horizontal thread has
 * nothing to connect.
 */
function ConnectorThread({ inView, reducedMotion }) {
  const pins = [
    { x: 155, color: COLORS.amber },
    { x: 490, color: COLORS.finance },
    { x: 825, color: COLORS.cipher },
  ];
  const segs = [
    [pins[0], pins[1], 0.3],
    [pins[1], pins[2], 1.0],
  ];

  return (
    <svg
      viewBox="0 0 980 56"
      preserveAspectRatio="none"
      className="hidden md:block w-full"
      style={{ maxWidth: 980, height: 44, overflow: 'visible', marginBottom: 4 }}
    >
      {segs.map(([a, b, segDelay], i) => {
        const d = `M ${a.x} 38 Q ${(a.x + b.x) / 2} 6 ${b.x} 38`;
        return (
          <g key={i}>
            <path
              d={d}
              fill="none"
              stroke={COLORS.textFaint}
              strokeWidth={1.4}
              pathLength="1"
              style={{
                strokeDasharray: 1,
                strokeDashoffset: inView ? 0 : 1,
                transition: reducedMotion ? 'none' : `stroke-dashoffset 2.4s ${EASE_SMOOTH} ${segDelay}s`,
              }}
            />
            {inView && !reducedMotion && (
              <circle r="2.6" fill={COLORS.amber} opacity="0.85">
                <animateMotion dur="3.6s" begin={`${segDelay + 2.5}s`} repeatCount="indefinite" path={d} />
              </circle>
            )}
          </g>
        );
      })}
      {pins.map((p, i) => (
        <circle
          key={p.x}
          cx={p.x}
          cy={inView ? 38 : 30}
          r={5}
          fill={p.color}
          style={{
            opacity: inView ? 1 : 0,
            transition: reducedMotion
              ? 'none'
              : `opacity 1.1s ${EASE_SMOOTH} ${i * 0.35 + 0.9}s, cy 1.1s ${EASE_SMOOTH} ${i * 0.35 + 0.9}s`,
          }}
        />
      ))}
    </svg>
  );
}

function SponsorCard({ sponsor, inView, delay, reducedMotion, tilt }) {
  const Icon = sponsor.icon;
  const nameDelay = delay + 520;
  const redactDelay = delay + 80;

  return (
    <div
      className="relative flex flex-col items-center text-center gap-4 px-6 py-9 rounded-sm overflow-hidden"
      style={{
        background: COLORS.panel,
        border: `1px solid ${sponsor.accent}55`,
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0px) rotate(0deg) scale(1)' : `translateY(34px) rotate(${tilt}deg) scale(0.97)`,
        transition: `opacity 1.9s ${EASE_SMOOTH} ${delay}ms, transform 1.9s ${EASE_SMOOTH} ${delay}ms`,
      }}
    >
      {/* Pin, as if this card were tacked to a corkboard */}
      <span
        aria-hidden="true"
        className="absolute rounded-full"
        style={{
          top: -6,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 10,
          height: 10,
          background: sponsor.accent,
          boxShadow: `0 0 7px 1px ${sponsor.accent}AA`,
          opacity: inView ? 1 : 0,
          transition: `opacity 0.6s ease ${delay + 700}ms`,
        }}
      />

      {/* Redaction wipe: an ink bar covers the card, then peels back from
          the left, revealing it like a declassified document. */}
      {!reducedMotion && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background: '#060606',
            transformOrigin: 'right center',
            transform: inView ? 'scaleX(0)' : 'scaleX(1)',
            transition: `transform 0.95s cubic-bezier(0.65, 0, 0.35, 1) ${redactDelay}ms`,
          }}
        />
      )}

      {!reducedMotion && (
        <div
          className="ix-cardglow-layer"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: -1,
            borderRadius: 2,
            boxShadow: `0 0 26px 2px ${sponsor.accent}66`,
            pointerEvents: 'none',
          }}
        />
      )}

      <div
        className={reducedMotion ? 'relative' : 'relative ix-flicker'}
        style={{ color: sponsor.accent, display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <Icon size={16} />
        <span style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.25em' }}>{sponsor.label}</span>
      </div>

      <div
        className="relative"
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
          color: COLORS.text,
          lineHeight: 1,
          letterSpacing: inView ? '0.03em' : '0.4em',
          filter: inView ? 'blur(0px)' : 'blur(5px)',
          opacity: inView ? 1 : 0,
          transition: reducedMotion
            ? 'none'
            : `letter-spacing 1.4s ${EASE_SMOOTH} ${nameDelay}ms, filter 1.4s ${EASE_SMOOTH} ${nameDelay}ms, opacity 1.2s ${EASE_SMOOTH} ${nameDelay}ms`,
        }}
      >
        {sponsor.name}
      </div>

      <div className="relative" style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: '0.03em', color: COLORS.textMuted }}>
        {sponsor.flavor}
      </div>

      <span
        className={reducedMotion ? 'relative' : 'relative ix-shimmer'}
        style={{
          display: 'block',
          width: 28,
          height: 2,
          marginTop: 2,
          background: `linear-gradient(90deg, ${sponsor.accent}, #ffffffaa, ${sponsor.accent})`,
          backgroundSize: '200% 100%',
          transform: inView ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left center',
          transition: `transform 1.3s ${EASE_SMOOTH} ${delay + 780}ms`,
        }}
      />
    </div>
  );
}

function SponsorsReveal({ inView, reducedMotion }) {
  // Deterministic small tilts so each card pins in at a slightly different
  // angle, without relying on Math.random() during render.
  const tilts = useMemo(() => {
    const rand = mulberry32(41);
    return SPONSORS.map(() => (rand() - 0.5) * 6.5);
  }, []);

  return (
    <section
      className="relative w-full flex flex-col items-center justify-center px-6 py-24 overflow-hidden"
      style={{ background: COLORS.bgAlt }}
    >
      {!reducedMotion && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.07,
            backgroundImage: `linear-gradient(${COLORS.textFaint} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.textFaint} 1px, transparent 1px)`,
            backgroundSize: '46px 46px',
          }}
        />
      )}
      {!reducedMotion && (
        <div
          className="absolute inset-x-0 pointer-events-none"
          style={{
            height: '22%',
            background: `linear-gradient(180deg, transparent, ${COLORS.amber}14, transparent)`,
            animation: 'ix-scan 15.5s linear infinite',
          }}
        />
      )}

      <div className="relative flex items-center gap-2 mb-10" style={{ color: COLORS.amber }}>
        <Radar size={13} />
        <span style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: '0.3em' }}>
          STAGE 01 — ENTITIES IDENTIFIED
        </span>
      </div>

      <div className="relative w-full flex flex-col items-center" style={{ maxWidth: 980 }}>
        <ConnectorThread inView={inView} reducedMotion={reducedMotion} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {SPONSORS.map((s, i) => (
            <SponsorCard
              key={s.name}
              sponsor={s}
              inView={inView}
              delay={i * 320}
              reducedMotion={reducedMotion}
              tilt={tilts[i]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ STAGE RAIL ============================ */

const STAGES = ['ENTITIES IDENTIFIED', 'CONCLUSION'];

function StageRail({ stage }) {
  return (
    <div className="hidden md:flex fixed right-6 top-1/2 z-40 flex-col gap-3 items-end" style={{ transform: 'translateY(-50%)' }}>
      {STAGES.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              letterSpacing: '0.2em',
              color: i === stage ? COLORS.text : COLORS.textFaint,
              opacity: i === stage ? 1 : 0.55,
              transition: 'opacity 0.4s, color 0.4s',
            }}
          >
            {s}
          </span>
          <span
            className="rounded-full"
            style={{
              width: i === stage ? 8 : 5,
              height: i === stage ? 8 : 5,
              background: i === stage ? COLORS.amber : COLORS.textFaint,
              transition: 'all 0.4s',
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* ============================ FINAL STATE ============================ */

function FinalState({ inView }) {
  return (
    <section className="relative w-full flex flex-col items-center justify-center px-6 py-20" style={{ background: COLORS.bg }}>
      <div className="flex flex-col items-center text-center gap-6" style={{ maxWidth: 560 }}>
        <RevealLine inView={inView} delay={0} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Tag color={COLORS.amber} name="MERIDIAN FREIGHT" />
          <Tag color={COLORS.finance} name="VANTAGE HOLDINGS" />
          <Tag color={COLORS.cipher} name="NOCTURNE SYSTEMS" />
        </RevealLine>

        <RevealLine inView={inView} delay={160}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 12, letterSpacing: '0.3em', color: COLORS.textMuted }}>
            03 ENTITIES IDENTIFIED
          </span>
        </RevealLine>

        <div style={{ opacity: inView ? 1 : 0, transition: `opacity 0.3s ease 320ms` }}>
          <StampBadge inView={inView} delay={360}>CASE STATUS: INCOMPLETE</StampBadge>
        </div>

        <RevealLine inView={inView} delay={520}>
          <p style={{ fontFamily: FONT_BODY, fontSize: 18, color: COLORS.text, margin: 0 }}>YOU FOUND THE PARTNERS.</p>
        </RevealLine>

        <RevealLine inView={inView} delay={700}>
          <p
            style={{
              fontFamily: FONT_BODY,
              fontWeight: 600,
              fontSize: 22,
              color: COLORS.red,
              margin: 0,
              textShadow: `1px 0 ${COLORS.cipherAlt}55, -1px 0 ${COLORS.amber}55`,
            }}
          >
            BUT YOU HAVEN'T FOUND THE TARGET.
          </p>
        </RevealLine>

        <RevealLine inView={inView} delay={950}>
          <h2
            className="text-5xl sm:text-6xl md:text-7xl"
            style={{ fontFamily: FONT_DISPLAY, color: COLORS.text, letterSpacing: '0.04em', lineHeight: 1, margin: 0 }}
          >
            INTEL-X
          </h2>
        </RevealLine>

        <RevealLine inView={inView} delay={1180}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: '0.3em', color: COLORS.textMuted }}>
            THE INVESTIGATION CONTINUES.
          </span>
        </RevealLine>

        <RevealLine inView={inView} delay={1340}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.2em', color: COLORS.textFaint }}>
            A FICTIONAL CASE FILE — INTEL-X 2026
          </span>
        </RevealLine>
      </div>
    </section>
  );
}

/* =============================== APP =============================== */

export default function IntelXSponsorPage() {
  const sponsorsRef = useRef(null);
  const finalRef = useRef(null);

  const sponsorsIn = useLatchedInView(sponsorsRef);
  const finalIn = useLatchedInView(finalRef, '0px 0px -20% 0px');
  const overall = useScrollProgress();
  const reducedMotion = useReducedMotion();
  const stage = finalIn ? 1 : 0;

  return (
    <div className="ix-root w-full relative" style={{ background: COLORS.bg, color: COLORS.text, fontFamily: FONT_BODY }}>
      <style>{STYLE_BLOCK}</style>

      <GrainOverlay reducedMotion={reducedMotion} />

      <a
        href="#ix-final"
        className="fixed left-2 top-2 z-50"
        style={{
          transform: 'translateY(-200%)',
          background: COLORS.panel,
          color: COLORS.text,
          padding: '8px 12px',
          fontFamily: FONT_MONO,
          fontSize: 11,
        }}
        onFocus={(e) => { e.currentTarget.style.transform = 'translateY(0%)'; }}
        onBlur={(e) => { e.currentTarget.style.transform = 'translateY(-200%)'; }}
      >
        Skip to case conclusion
      </a>

      <div
        className="fixed top-0 left-0 h-0.5 z-50"
        style={{ width: `${overall * 100}%`, background: COLORS.amber }}
      />

      <StageRail stage={stage} />

      <CaseFileHeader />

      <div ref={sponsorsRef}>
        <SponsorsReveal inView={sponsorsIn} reducedMotion={reducedMotion} />
      </div>

      <div ref={finalRef} id="ix-final">
        <FinalState inView={finalIn} />
      </div>
    </div>
  );
}