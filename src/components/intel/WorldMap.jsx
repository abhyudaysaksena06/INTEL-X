import worldMap from "@/assets/worldmap.jpg";
import { FlightRoutes } from "./FlightRoutes";
import "./WorldMap.css";

export function WorldMap({ offsetX = 0, offsetY = 0 }) {
  return (
    <div
      aria-hidden
      className="worldmap-wrapper pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        transform: `translate3d(${offsetX}px, ${offsetY}px, 0)`,
        transition: "transform 900ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* atmospheric base */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_10%,color-mix(in_oklab,var(--blue)_26%,transparent),transparent_65%)]" />

      {/* dotted continents */}
      <div className="absolute inset-x-[-6%] top-[-6%] h-[86%] md:inset-x-[-2%] md:top-[-4%] md:h-[92%]">
        <img
          src={worldMap}
          alt=""
          width={1920}
          height={1088}
          className="h-full w-full object-cover opacity-[0.5] mix-blend-screen md:opacity-[0.62]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(75%_65%_at_50%_45%,transparent,#000_86%)]" />
      </div>

      {/* flight network */}
      <div className="absolute inset-x-[-4%] top-[2%] h-[70%] opacity-70 md:opacity-90">
        <FlightRoutes />
      </div>

      {/* faint interface grid */}
      <div className="grid-lines absolute inset-0" />

      {/* readability + fade to black */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_0%,color-mix(in_oklab,#000_72%,transparent)_38%,transparent_60%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,#000,transparent)]" />
      <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(to_bottom,#000,transparent)]" />
    </div>
  );
}
