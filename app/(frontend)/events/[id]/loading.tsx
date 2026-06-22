import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-transparent p-10 flex flex-col gap-10 mb-20">
      <Skeleton className="w-full h-[55vh] md:h-[65vh] rounded-2xl bg-white/5" />
      <div className="max-w-5xl mx-auto w-full space-y-4 px-6 md:px-12 mt-12 md:mt-20">
        <Skeleton className="w-1/2 h-10 bg-white/5" />
        <Skeleton className="w-full h-4 bg-white/5" />
        <Skeleton className="w-full h-4 bg-white/5" />
        <Skeleton className="w-3/4 h-4 bg-white/5" />
      </div>
      <div className="max-w-6xl mx-auto px-6 md:px-12 mt-20 w-full flex flex-col items-center">
        <Skeleton className="w-full h-[50vh] md:h-[70vh] rounded-xl bg-white/5" />
      </div>
    </div>
  );
}
