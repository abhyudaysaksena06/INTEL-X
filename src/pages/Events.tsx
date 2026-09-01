import { OpsMap } from "@/components/OpsMap";

/*
 * Events — the tactical ops map from the tactical-map-canvas repo.
 *
 * Ported as-is apart from the TanStack route wiring and the page's own INTEL X
 * masthead, which the site navbar replaces.
 */

export default function EventsPage() {
  return (
    <main
      className="relative min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "var(--map-bg)" }}
    >
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-8 sm:px-8">
        <section id="map" className="flex flex-1 items-center justify-center py-8">
          <div className="w-full">
            <OpsMap />
          </div>
        </section>
      </div>
    </main>
  );
}
