import { useEffect, useState } from "react";
import "./Countdown.css";

/*
 * Mission countdown clock for the hero.
 *
 * Counts down to 17:00 on the 5th of September 2026. Edit TARGET to move it.
 */
const TARGET = new Date(2026, 8, 5, 17, 0, 0);

const pad = (n) => String(Math.max(0, n)).padStart(2, "0");

function remaining(target) {
  const ms = target.getTime() - Date.now();
  if (ms <= 0) return { done: true, d: 0, h: 0, m: 0, s: 0 };
  const s = Math.floor(ms / 1000);
  return {
    done: false,
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

export function Countdown() {
  const [t, setT] = useState(() => remaining(TARGET));

  useEffect(() => {
    // Re-read the clock every tick rather than decrementing, so a sleeping or
    // throttled tab resumes on the right number instead of drifting behind.
    const id = setInterval(() => setT(remaining(TARGET)), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { label: "Days", value: pad(t.d) },
    { label: "Hrs", value: pad(t.h) },
    { label: "Min", value: pad(t.m) },
    { label: "Sec", value: pad(t.s) },
  ];

  return (
    <div className="intel-countdown absolute z-30">
      <div className="cd-panel glow-cyan border border-line/60 bg-black/70 px-4 py-3 backdrop-blur-[2px] sm:px-5 sm:py-4 md:px-7 md:py-6">
        <div className="cd-head flex items-center justify-between gap-6">
          <p className="hud text-cyan/80">
            {t.done ? "Operation Live" : "T-Minus"}
          </p>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_8px_var(--cyan)]" />
            <span className="hud animate-hud-blink text-cyan/70">05 / 17:00</span>
          </span>
        </div>

        <div className="cd-rule mt-4 h-px w-full bg-[linear-gradient(to_right,transparent,var(--line),transparent)]" />

        {t.done ? (
          <p className="cd-engaged font-display text-glow mt-4 font-bold tracking-[0.16em] text-cyan">
            ENGAGED
          </p>
        ) : (
          <div className="cd-units mt-3 flex items-end gap-3 sm:mt-4 sm:gap-4 md:gap-6">
            {units.map((u, i) => (
              <div key={u.label} className="flex items-end gap-3 sm:gap-4 md:gap-6">
                <div className="text-center">
                  <p className="countdown-digit font-display font-bold leading-none tracking-[0.04em] text-foreground">
                    {u.value}
                  </p>
                  <p className="cd-unit-label hud mt-1.5 tracking-[0.22em] sm:mt-2">
                    {u.label}
                  </p>
                </div>
                {i < units.length - 1 && (
                  <span className="countdown-sep font-display leading-none text-cyan/50">
                    :
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <span className="pointer-events-none absolute -bottom-1 -right-1 h-4 w-4 border-b border-r border-cyan/70" />
      <span className="pointer-events-none absolute -left-1 -top-1 h-4 w-4 border-l border-t border-cyan/70" />
    </div>
  );
}
