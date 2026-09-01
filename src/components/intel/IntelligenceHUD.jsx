import "./IntelligenceHUD.css";

export function IntelligenceHUD({ offsetX = 0, offsetY = 0 }) {
  return (
    <div
      aria-hidden
      className="intelligence-hud pointer-events-none absolute inset-0 z-20"
      style={{
        transform: `translate3d(${offsetX}px, ${offsetY}px, 0)`,
        transition: "transform 900ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* top right telemetry */}
      {/* hidden on phones: the hero copy now starts at the top of the section and
          this block sat on top of the eyebrow line */}
      <div className="absolute right-5 top-24 hidden text-right md:right-10 md:top-28 md:block">
        <p className="hud animate-hud-blink text-cyan">Intel-X / 001</p>
        <p className="hud mt-1 text-cyan/70">System Online</p>
        <div className="ml-auto mt-2 h-px w-24 bg-[linear-gradient(to_right,transparent,var(--cyan))] md:w-32" />
      </div>

      {/* bottom left coordinates */}
      <div className="absolute bottom-6 left-5 md:bottom-10 md:left-10">
        <p className="hud text-cyan/80">Lat 28.61° / Long 77.20°</p>
        <p className="hud mt-1">Global Intelligence Network</p>
      </div>

      {/* bottom center system indicator */}
      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center md:flex">
        <p className="hud">Signal Connected</p>
        <div className="relative mt-3 h-14 w-px bg-border">
          <span className="animate-scan-line absolute inset-x-0 top-0 h-full bg-cyan" />
        </div>
      </div>

      {/* corner brackets */}
      <span className="absolute left-4 top-20 h-8 w-8 border-l border-t border-line md:left-8" />
      <span className="absolute bottom-4 right-4 h-8 w-8 border-b border-r border-line md:right-8" />
    </div>
  );
}
