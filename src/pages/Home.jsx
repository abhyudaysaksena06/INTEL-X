import { Hero } from "@/components/intel/Hero";
import { Countdown } from "@/components/intel/Countdown";

export default function Home() {
  return (
    <div className="relative w-full overflow-hidden bg-black">
      <Hero />
      <Countdown />
    </div>
  );
}
