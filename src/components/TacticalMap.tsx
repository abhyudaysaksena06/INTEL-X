import { useMemo } from "react";
import { WORLD_PATHS, MAP_W, MAP_H } from "@/lib/world-map";

const project = (lon: number, lat: number): [number, number] => [
  ((lon + 180) / 360) * MAP_W,
  ((90 - lat) / 180) * MAP_H,
];

export function TacticalMap({ className }: { className?: string }) {
  const grid = useMemo(() => {
    const lines: string[] = [];
    // Longitude lines every 20 degrees.
    for (let lon = -160; lon < 180; lon += 20) {
      const [x] = project(lon, 0);
      lines.push(`M${x},0 L${x},${MAP_H}`);
    }
    // Latitude lines every 20 degrees.
    for (let lat = -60; lat <= 80; lat += 20) {
      const [, y] = project(0, lat);
      lines.push(`M0,${y} L${MAP_W},${y}`);
    }
    return lines;
  }, []);

  const sparkles = useMemo(() => {
    let seed = 7;
    const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
    return Array.from({ length: 110 }, () => ({
      x: rand() * MAP_W,
      y: rand() * MAP_H,
      r: 0.4 + rand() * 0.8,
      d: rand() * 4,
      t: 2 + rand() * 3,
    }));
  }, []);

  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        {/* Subtle glow applied ONLY to the flight arcs, never the base map. */}
        <filter id="arc-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Lat/long tactical grid — thin, low-opacity blue. */}
      <path
        d={grid.join(" ")}
        fill="none"
        stroke="var(--map-grid)"
        strokeWidth="0.5"
        opacity="0.5"
      />

      {/* Crisp continent outlines — no fill, no blur, no glow. */}
      <g
        fill="none"
        stroke="var(--map-line)"
        strokeWidth="0.9"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {WORLD_PATHS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      {/* Sparkle layer — tiny crisp twinkling points, no bloom. */}
      <g fill="var(--map-pin)">
        {sparkles.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            className="map-sparkle"
            style={{ animationDelay: `${s.d}s`, animationDuration: `${s.t}s` }}
          />
        ))}
      </g>
    </svg>
  );
}
