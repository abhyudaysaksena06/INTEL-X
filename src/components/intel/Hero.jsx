import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import operative from "@/assets/operative.png";
import operativeMasked from "@/assets/operative_face_masked.png";
import { WorldMap } from "./WorldMap";
import { IntelligenceHUD } from "./IntelligenceHUD";
import { Particles } from "./Particles";
import "./Hero.css";

export function Hero() {
  const [p, setP] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [maskPos, setMaskPos] = useState({ x: 37, y: 22 }); // Aligned face with visible eyes
  const operativeRef = useRef(null);
  const targetPos = useRef({ x: 37, y: 22 });

  // Global mouse parallax
  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    const onMove = (e) => {
      setP({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      });

      // Check proximity to operative
      if (operativeRef.current) {
        const rect = operativeRef.current.getBoundingClientRect();
        const inBounds =
          e.clientX >= rect.left - 40 &&
          e.clientX <= rect.right + 40 &&
          e.clientY >= rect.top - 40 &&
          e.clientY <= rect.bottom + 40;

        if (inBounds) {
          const xPct = ((e.clientX - rect.left) / rect.width) * 100;
          const yPct = ((e.clientY - rect.top) / rect.height) * 100;
          targetPos.current = {
            x: Math.max(0, Math.min(100, xPct)),
            y: Math.max(0, Math.min(100, yPct)),
          };
          setIsHovered(true);
        } else {
          setIsHovered(false);
        }
      }
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Liquid spring interpolation loop for fluid cursor following
  useEffect(() => {
    let rafId;
    const update = () => {
      setMaskPos((prev) => ({
        x: prev.x + (targetPos.current.x - prev.x) * 0.16,
        y: prev.y + (targetPos.current.y - prev.y) * 0.16,
      }));
      rafId = requestAnimationFrame(update);
    };
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <section id="hero" className="intel-hero relative min-h-screen w-screen overflow-hidden bg-black">
      <WorldMap offsetX={p.x * 26} offsetY={p.y * 16} />
      <Particles />

      {/* operative with sidewise mouth-mask hover reveal + scanning effect */}
      <div
        ref={operativeRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="operative-wrapper pointer-events-auto absolute bottom-0 right-[-14%] z-10 h-[62%] w-[62%] opacity-45 sm:right-[-6%] sm:h-[72%] md:right-0 md:h-[92%] md:w-[36%] md:opacity-100 cursor-crosshair"
        style={{
          transform: `translate3d(${p.x * -18}px, 0, 0)`,
          transition: "transform 900ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Dynamic atmospheric back-glow (intensifies on hover) */}
        <div
          className={`absolute inset-x-0 bottom-0 top-[8%] blur-3xl pointer-events-none transition-all duration-700 ${
            isHovered
              ? "bg-[radial-gradient(60%_50%_at_50%_30%,rgba(0,240,255,0.35),transparent_75%)]"
              : "bg-[radial-gradient(55%_45%_at_55%_35%,color-mix(in_oklab,var(--blue)_45%,transparent),transparent_70%)]"
          }`}
        />

        {/* Synchronized Operative Container (Single shared animation wrapper for 100% lock) */}
        <div className="animate-breathe relative h-full w-full pointer-events-none [mask-image:linear-gradient(to_bottom,transparent,#000_16%,#000_78%,transparent)]">
          {/* 1. Base Operative (Original Unmasked Man in Sidewise Pose) */}
          <img
            src={operative}
            alt="Anonymous INTEL-X intelligence operative in dark suit and fedora"
            width={912}
            height={1408}
            className="h-full w-full object-contain object-bottom pointer-events-none"
          />

          {/* 2. Revealed Sidewise Masked Layer (Mouth & Nose Mask + Visible Human Eyes) */}
          <div
            className="absolute inset-0 h-full w-full pointer-events-none z-10 transition-all duration-700 ease-out"
            style={{
              opacity: isHovered ? 1 : 0,
              WebkitMaskImage: isHovered
                ? `radial-gradient(ellipse 340px 320px at ${maskPos.x}% ${maskPos.y}%, black 30%, rgba(0,0,0,0.85) 60%, transparent 95%)`
                : "none",
              maskImage: isHovered
                ? `radial-gradient(ellipse 340px 320px at ${maskPos.x}% ${maskPos.y}%, black 30%, rgba(0,0,0,0.85) 60%, transparent 95%)`
                : "none",
            }}
          >
            <img
              src={operativeMasked}
              alt="Operative with contoured black face mask covering mouth and nose in sidewise perspective"
              width={912}
              height={1408}
              className="h-full w-full object-contain object-bottom pointer-events-none"
            />
          </div>
        </div>

        {/* 4. Liquid Cyan Cursor Ripple Aura */}
        <div
          className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full z-15 transition-opacity duration-300 ${
            isHovered ? "opacity-60" : "opacity-0"
          }`}
          style={{
            left: `${maskPos.x}%`,
            top: `${maskPos.y}%`,
            width: "280px",
            height: "280px",
            background:
              "radial-gradient(circle, rgba(0,240,255,0.22) 0%, rgba(0,240,255,0.05) 50%, transparent 70%)",
          }}
        />

        {/* 5. HUD Status Badge on Hover */}
        <div
          className={`absolute top-[18%] left-[-20%] md:left-[-15%] pointer-events-none z-20 transition-all duration-500 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
          }`}
        >
          <div className="border border-cyan/60 bg-black/80 px-3 py-1.5 backdrop-blur-sm shadow-[0_0_15px_rgba(0,240,255,0.25)]">
            <p className="hud text-cyan flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-ping" />
              <span>COVERT // MASK ACTIVE</span>
            </p>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-[linear-gradient(to_top,#000,transparent)] pointer-events-none" />
      </div>

      <IntelligenceHUD offsetX={p.x * -6} offsetY={p.y * -4} />

      {/* content */}
      <div className="relative z-20 mx-auto flex min-h-screen max-w-[1600px] flex-col justify-start px-5 pb-24 pt-24 md:px-10 md:pt-28 pointer-events-none">
        <div className="max-w-2xl pointer-events-auto">
          <div className="animate-rise flex items-center gap-3">
            <span className="h-px w-8 bg-cyan" />
            <p className="eyebrow">Enter the unknown</p>
          </div>

          <h1
            className="animate-rise font-display mt-6 font-bold leading-[0.86] tracking-[-0.02em]"
            style={{ fontSize: "clamp(52px, 13vw, 168px)", animationDelay: "80ms" }}
          >
            INTEL<span className="text-glow text-cyan">-X</span>
          </h1>

          <p
            className="animate-rise mt-7 max-w-md text-2xl leading-tight text-muted-foreground sm:text-3xl md:text-4xl"
            style={{ animationDelay: "160ms" }}
          >
            Where intelligence meets
            <br />
            exploration.
          </p>

          <div
            className="animate-rise mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "300ms" }}
          >
            <Link
              to="/register"
              className="hud glow-cyan group inline-flex items-center justify-center gap-3 border border-cyan/60 bg-cyan/5 px-8 py-4 !text-soft-cyan transition-all duration-300 hover:border-cyan hover:bg-cyan/15 hover:shadow-[0_0_46px_-6px_var(--cyan)]"
            >
              Enter Intel-X
              <span className="font-sans text-base leading-none tracking-normal transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              to="/events"
              className="hud inline-flex items-center justify-center border border-line px-8 py-4 transition-colors duration-300 hover:border-cyan/50 hover:!text-foreground"
            >
              Explore Event
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
