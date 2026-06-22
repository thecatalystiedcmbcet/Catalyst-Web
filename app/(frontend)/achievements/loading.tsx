import { Skeleton } from "@/components/ui/skeleton";
import WatermarkHeader from "@/components/home/WatermarkHeader";

export default function Loading() {
  return (
    <div className="w-full overflow-hidden pb-10">
      <div className="w-full px-5 sm:px-10 lg:px-20 pt-40">
        <Skeleton className="w-full h-32 bg-white/5 mb-10" />

        <Skeleton className="h-[400px] w-full rounded-2xl bg-white/5 mb-20" />

        <p className="text-lg tracking-wide text-white/50 font-primary text-center mt-20 mb-8 md:text-left md:text-3xl">
          LOADING ACHIEVEMENTS...
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 mb-20">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[300px] w-full rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
