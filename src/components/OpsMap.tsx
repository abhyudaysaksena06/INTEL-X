import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TacticalMap } from "@/components/TacticalMap";
import { PassportPass } from "@/components/PassportPass";
import { OPS_PINS, type OpsPin } from "@/lib/ops-pins";
import "./OpsMap.css";

/* The overlay SVG and the pin buttons share one coordinate space: the SVG uses
 * a 1000x500 viewBox and the container is locked to aspect-[2/1], so a pin
 * placed at the same percentage lands exactly on the SVG point. Each pin's DOT
 * — not the dot-plus-label stack — sits on that point, which is what lets the
 * connectors terminate on the dots themselves. */
const VB_W = 1000;
const VB_H = 500;

const toX = (lon: number) => ((lon + 180) / 360) * VB_W;
const toY = (lat: number) => ((90 - lat) / 180) * VB_H;

const pos = (lon: number, lat: number) => ({
  left: `${(toX(lon) / VB_W) * 100}%`,
  top: `${(toY(lat) / VB_H) * 100}%`,
});

/* Every link is a quadratic arc: the control point sits at the chord's midpoint
 * pushed perpendicular to it, so the bow is proportional to the distance and
 * the lines curve consistently. A pin's `bowDir` mirrors the arc to the other
 * side of the chord. Both ends land on the dot centres — the dots are opaque
 * DOM elements painted over this SVG, so each end is covered by its own pin and
 * reads as attached at any size. */
const curve = (a: OpsPin, b: OpsPin, bow: number) => {
  const [x1, y1] = [toX(a.lon), toY(a.lat)];
  const [x2, y2] = [toX(b.lon), toY(b.lat)];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy) || 1;
  const lift = dist * bow;
  const cx = (x1 + x2) / 2 + (-dy / dist) * lift;
  const cy = (y1 + y2) / 2 + (dx / dist) * lift;
  return `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
};

const byId = (id: string) => OPS_PINS.find((p) => p.id === id)!;

// main pin -> its own children
const CHILD_LINKS = OPS_PINS.filter((p) => p.parent).map((child) => ({
  id: child.id,
  d: curve(byId(child.parent!), child, 0.16 * (child.bowDir ?? 1)),
}));

// the three main pins to each other — the trunk route, drawn solid
const MAIN_LINKS = (
  [
    ["about", "rulebook"],
    ["rulebook", "register"],
    ["about", "register"],
  ] as Array<[string, string]>
).map(([from, to]) => ({
  id: `${from}-${to}`,
  d: curve(byId(from), byId(to), 0.13),
}));

export function OpsMap() {
  const [active, setActive] = useState<OpsPin | null>(null);
  const navigate = useNavigate();

  return (
    <div className="ops-map relative mx-auto aspect-[2/1] w-full">
      <TacticalMap className="absolute inset-0 h-full w-full" />

      {/* Connectors: the solid trunk between the three main pins, then the
          dashed feeds from each main pin down to its own children. */}
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <g
          fill="none"
          stroke="var(--map-arc)"
          strokeLinecap="round"
          filter="url(#arc-glow)"
        >
          {MAIN_LINKS.map((link) => (
            <path key={link.id} d={link.d} strokeWidth="1.5" opacity="0.85" />
          ))}

          {CHILD_LINKS.map((link, i) => (
            <path
              key={link.id}
              d={link.d}
              className="map-arc"
              strokeWidth="1"
              opacity="0.9"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </g>
      </svg>

      {/* Clickable pins. The label hangs above a main pin and below a child —
          flipped when a child sits higher than its parent, so the two labels
          never meet in the gap between them. */}
      {OPS_PINS.map((pin) => {
        const parent = pin.parent ? byId(pin.parent) : null;
        const labelAbove = pin.main || (parent ? pin.lat > parent.lat : false);

        return (
          <button
            key={pin.id}
            type="button"
            onClick={() =>
              pin.link ? navigate(pin.link) : setActive(pin)
            }
            style={pos(pin.lon, pin.lat)}
            className="group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
          >
            <span className="relative flex items-center justify-center">
              <span
                className={
                  pin.main
                    ? "relative flex size-4 items-center justify-center rounded-full bg-primary shadow-[0_0_18px_4px_color-mix(in_oklab,var(--primary)_65%,transparent)] transition-transform group-hover:scale-125"
                    : "relative flex size-2.5 items-center justify-center rounded-full bg-primary/80 shadow-[0_0_10px_2px_color-mix(in_oklab,var(--primary)_45%,transparent)] transition-transform group-hover:scale-125"
                }
              >
                <span className="absolute inset-0 rounded-full border border-primary/70 map-pin-ring" />
              </span>

              <span
                data-pin-label={pin.id}
                className={
                  pin.main
                    ? "ops-label ops-label-main absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-sm border border-primary/60 bg-background/80 px-2.5 py-1 font-display font-semibold uppercase tracking-[0.14em] text-foreground shadow-[0_0_16px_-2px_color-mix(in_oklab,var(--primary)_55%,transparent)] backdrop-blur-sm transition-colors group-hover:border-primary group-hover:text-primary"
                    : `ops-label ops-label-child absolute left-1/2 ${
                        labelAbove ? "bottom-full mb-2" : "top-full mt-2"
                      } hidden md:block -translate-x-1/2 whitespace-nowrap rounded-sm border border-primary/25 bg-background/60 px-1.5 py-0.5 font-display font-medium uppercase tracking-[0.12em] text-muted-foreground backdrop-blur-sm transition-colors group-hover:border-primary/70 group-hover:text-foreground`
                }
              >
                {pin.label}
              </span>
            </span>
          </button>
        );
      })}

      <PassportPass pin={active} onClose={() => setActive(null)} />
    </div>
  );
}
