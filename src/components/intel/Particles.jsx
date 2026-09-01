import "./Particles.css";

const SEEDS = Array.from({ length: 26 }, (_, i) => {
  const x = (i * 37) % 100;
  const y = (i * 53) % 100;
  return { x, y, delay: (i % 9) * 1.7, dur: 14 + (i % 7) * 3, size: i % 4 === 0 ? 2 : 1 };
});

export function Particles() {
  return (
    <div
      aria-hidden
      className="particles-container pointer-events-none absolute inset-0 overflow-hidden"
    >
      {SEEDS.map((p, i) => (
        <span
          key={i}
          className="animate-float-slow absolute rounded-full bg-soft-cyan"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </div>
  );
}
