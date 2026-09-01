import "./FlightRoutes.css";

const ROUTES = [
  { id: "r1", d: "M215 205 C 380 90, 560 100, 690 175", dur: 15 },
  { id: "r2", d: "M700 180 C 820 130, 950 165, 1040 235", dur: 19 },
  { id: "r3", d: "M1035 240 C 960 300, 880 300, 800 268", dur: 0 },
  { id: "r4", d: "M330 400 C 300 330, 250 275, 215 215", dur: 22 },
  { id: "r5", d: "M690 190 C 660 260, 640 320, 620 372", dur: 0 },
  { id: "r6", d: "M1055 250 C 1120 300, 1180 350, 1215 410", dur: 26 },
  { id: "r7", d: "M215 210 C 420 250, 620 250, 800 268", dur: 0 },
];

const NODES = [
  [215, 207],
  [690, 180],
  [1040, 238],
  [800, 268],
  [330, 402],
  [620, 374],
  [1215, 412],
  [480, 170],
  [905, 205],
  [1130, 320],
  [560, 300],
  [270, 300],
];

export function FlightRoutes() {
  return (
    <svg
      viewBox="0 0 1440 520"
      preserveAspectRatio="xMidYMid slice"
      className="flight-routes-svg h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="routeStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--soft-cyan)" stopOpacity="0.1" />
          <stop offset="50%" stopColor="var(--cyan)" stopOpacity="0.75" />
          <stop offset="100%" stopColor="var(--soft-cyan)" stopOpacity="0.1" />
        </linearGradient>
        <filter id="routeGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <path id="plane" d="M0 0 L-9 3.4 L-6.4 0 L-9 -3.4 Z" />
      </defs>

      <g filter="url(#routeGlow)">
        {ROUTES.map((r) => (
          <g key={r.id}>
            <path
              id={r.id}
              d={r.d}
              fill="none"
              stroke="url(#routeStroke)"
              strokeWidth="1"
              strokeDasharray="5 9"
              className="animate-dash"
              style={{ animationDuration: `${8 + Number(r.id.slice(1)) * 1.6}s` }}
            />
            {r.dur > 0 && (
              <g>
                <use href={`#plane`} fill="var(--soft-cyan)" opacity="0.9">
                  <animateMotion dur={`${r.dur}s`} repeatCount="indefinite" rotate="auto">
                    <mpath href={`#${r.id}`} />
                  </animateMotion>
                </use>
              </g>
            )}
            <circle r="1.8" fill="var(--soft-cyan)" opacity="0.85">
              <animateMotion dur={`${6 + r.dur / 3}s`} repeatCount="indefinite">
                <mpath href={`#${r.id}`} />
              </animateMotion>
            </circle>
          </g>
        ))}
      </g>

      {NODES.map(([cx, cy], i) => (
        <g key={`${cx}-${cy}`}>
          <circle
            cx={cx}
            cy={cy}
            r="2"
            fill="var(--cyan)"
            className="animate-pulse-node"
            style={{ animationDelay: `${i * 0.32}s` }}
          />
          <circle
            cx={cx}
            cy={cy}
            r="9"
            fill="none"
            stroke="var(--cyan)"
            strokeOpacity="0.22"
            strokeWidth="0.7"
          />
        </g>
      ))}
    </svg>
  );
}
