import { Skeleton } from "@/components/ui/skeleton";
import WatermarkHeader from "@/components/home/WatermarkHeader";

export default function Loading() {
  return (
    <div className="mb-5 w-full pb-10">
      <div className="w-full px-5 sm:px-10 lg:px-20 pt-40">
        <Skeleton className="w-full h-32 bg-white/5" />
      </div>
      <div className="mx-5 md:mx-10 lg:mx-20 mt-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-48 bg-white/5 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
