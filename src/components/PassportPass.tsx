import { Plane, ShieldCheck, Stamp } from "lucide-react";
import type { OpsPin } from "@/lib/ops-pins";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

function Barcode() {
  const bars = Array.from({ length: 48 }, (_, i) => ((i * 37) % 5) + 1);
  return (
    <div className="flex h-10 items-end gap-[2px]" aria-hidden="true">
      {bars.map((w, i) => (
        <span
          key={i}
          className="block h-full bg-foreground/85"
          style={{ width: `${w}px`, opacity: w % 2 ? 0.9 : 0.5 }}
        />
      ))}
    </div>
  );
}

/** Single passport / boarding-pass interface reused by every pin. */
export function PassportPass({
  pin,
  onClose,
}: {
  pin: OpsPin | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!pin} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl overflow-hidden border-primary/40 bg-card/95 p-0 backdrop-blur-xl">
        {pin && (
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(120%_80%_at_100%_0%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_60%)]" />

            <div className="relative flex items-center justify-between border-b border-primary/25 px-6 py-4">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.35em] text-primary">
                <Plane className="size-3.5" />
                Boarding Pass
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                INTEL X
              </span>
            </div>

            <div className="relative grid gap-6 px-6 py-6 sm:grid-cols-[1fr_auto]">
              <div>
                <DialogTitle className="font-display text-3xl uppercase tracking-tight text-foreground">
                  {pin.label}
                </DialogTitle>
                <div className="mt-4 grid grid-cols-3 gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <div>
                    <div>Flight</div>
                    <div className="mt-1 text-sm tracking-normal text-primary">
                      {pin.code}
                    </div>
                  </div>
                  <div>
                    <div>Route</div>
                    <div className="mt-1 text-sm tracking-normal text-foreground">
                      {pin.route}
                    </div>
                  </div>
                  <div>
                    <div>Gate</div>
                    <div className="mt-1 text-sm tracking-normal text-foreground">
                      {pin.gate}
                    </div>
                  </div>
                </div>
                <div className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
                  {pin.body.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-3 border-primary/25 sm:border-l sm:pl-6">
                <div className="flex size-20 rotate-[-8deg] items-center justify-center rounded-full border-2 border-dashed border-primary/70 text-center font-mono text-[9px] uppercase leading-tight tracking-widest text-primary">
                  <span>
                    Cleared
                    <br />
                    2026
                  </span>
                </div>
                <Stamp className="size-4 text-primary/70" />
              </div>
            </div>

            <div className="relative flex items-center justify-between gap-4 border-t border-dashed border-primary/30 px-6 py-4">
              <Barcode />
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                <ShieldCheck className="size-3.5 text-primary" />
                Verified
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
