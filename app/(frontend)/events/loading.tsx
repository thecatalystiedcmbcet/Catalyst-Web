import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="sm:mb-10 mb-5">
      <div className="w-full px-5 sm:px-10 lg:px-20">
        <Skeleton className="h-[200px] w-full rounded-2xl bg-white/5 mt-10" />

        <p className="text-lg tracking-wide text-white/50 font-primary text-center mt-30 mb-5 md:text-left md:text-3xl md:mb-7 md:mt-25">
          LOADING EVENTS...
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[260px] w-full rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
