import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-[oklch(0.3_0.02_70)]/50 bg-[oklch(0.11_0.008_60)] px-4 py-8 sm:px-6 md:px-10">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="font-condensed text-lg tracking-[0.18em] text-[oklch(0.93_0.01_80)]">
            INTEL X
          </div>
          <div className="font-condensed text-[9px] tracking-[0.32em] text-[oklch(0.62_0.02_70)]">
            UNCOVER THE NETWORK · 2026 EDITION
          </div>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 font-condensed text-[11px] tracking-[0.16em] text-[oklch(0.7_0.01_80)]">
          <Link className="transition-colors hover:text-gold" to="/">HOME</Link>
          <Link className="transition-colors hover:text-gold" to="/events">EVENTS</Link>
          <Link className="transition-colors hover:text-gold" to="/sponsors">SPONSORS</Link>
          <Link className="transition-colors hover:text-gold" to="/contact">CONTACT US</Link>
        </nav>
      </div>
    </footer>
  );
}
