import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

/*
 * Site-wide navigation bar.
 *
 * Markup and styling are carried over from the CONTACT US page header so every
 * page of the site wears the same masthead; the plain anchors have been swapped
 * for router links.
 */

const NAV: { label: string; to: string }[] = [
  { label: "HOME", to: "/" },
  { label: "EVENTS", to: "/events" },
  { label: "SPONSORS", to: "/sponsors" },
  { label: "CONTACT US", to: "/contact" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[oklch(0.3_0.02_70)]/50 bg-[oklch(0.11_0.008_60)] px-3 py-2.5 sm:px-6 md:px-10">
        <Link to="/" className="block">
          <div className="font-condensed text-lg font-500 tracking-[0.18em] text-[oklch(0.93_0.01_80)] sm:text-xl md:text-2xl">
            INTEL X
          </div>
          <div className="font-condensed text-[8px] tracking-[0.32em] text-[oklch(0.62_0.02_70)] sm:text-[9px] md:text-[10px]">
            UNCOVER THE NETWORK
          </div>
        </Link>

        <nav className="hidden items-center gap-5 font-condensed text-[11px] tracking-[0.16em] md:flex md:gap-9 md:text-xs">
          {NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  active
                    ? "border-b border-cyan pb-1 text-cyan"
                    : "pb-1 text-[oklch(0.82_0.01_80)] transition-colors hover:text-soft-cyan"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
          className="flex h-9 w-9 items-center justify-center border border-[oklch(0.35_0.02_70)] bg-[oklch(0.15_0.01_60)] text-[oklch(0.85_0.02_85)] md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan touch-manipulation"
        >
          <span className="font-typewriter text-sm font-bold">
            {mobileMenuOpen ? "✕" : "☰"}
          </span>
        </button>
      </header>

      {mobileMenuOpen && (
        <div className="sticky top-[52px] z-50 border-b border-[oklch(0.35_0.02_70)] bg-[oklch(0.12_0.01_60)] px-4 py-3 md:hidden">
          <nav className="flex flex-col space-y-2.5 font-condensed text-xs tracking-[0.2em]">
            {NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={
                    active
                      ? "border-l-2 border-cyan pl-2 text-cyan font-bold"
                      : "pl-2 text-[oklch(0.80_0.01_80)] transition-colors hover:text-soft-cyan"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
