/**
 * StatsServer — Server Component
 *
 * Fetches catalyst_matrix data at request time (server-side) and passes it
 * as props to the Stats client component. This eliminates the client-side
 * useEffect fetch waterfall and the placeholder "20+ Startups" flash.
 */
import { createPublicClient } from "@/lib/supabase/public";
import Stats from "./Stats";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_ITEMS = [
  { id: "1", value: 0, suffix: "+", label: "Loading...", sort_order: 1 },
];

export default async function StatsServer() {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("catalyst_matrix")
      .select("*")
      .order("sort_order", { ascending: true });

    const items = (!error && data && data.length > 0) ? data : DEFAULT_ITEMS;
    return <Stats items={items} />;
  } catch {
    return <Stats items={DEFAULT_ITEMS} />;
  }
}

/**
 * StatsSkeleton — used as the Suspense fallback in the home page.
 * Shows a grid of pulsing placeholders while the server component streams in.
 */
export function StatsSkeleton() {
  return (
    <div className="sm:px-15 lg:mt-60 overflow-hidden">
      <Skeleton className="h-10 w-64 mx-auto mt-27 mb-10 bg-white/5" />
      <div className="mx-8 flex flex-wrap justify-center gap-5 md:gap-7 md:p-9">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="w-full sm:w-[calc(50%-10px)] md:w-[calc(50%-14px)] lg:w-[calc(33.333%-19px)] flex-shrink-0"
          >
            <Skeleton className="h-40 rounded-xl bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
