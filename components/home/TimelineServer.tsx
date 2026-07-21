/**
 * TimelineServer — Server Component
 *
 * Fetches catalyst_timeline data at request time (server-side) and passes it
 * as props to the TimelineDemo client component. This eliminates the
 * client-side useEffect fetch waterfall and the multi-second loading skeleton.
 */
import { createPublicClient } from "@/lib/supabase/public";
import TimelineDemo, { type TimelineItem } from "./TimelineDemo";

export default async function TimelineServer() {
  let items: TimelineItem[] = [];
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("catalyst_timeline")
      .select("*")
      .order("sort_order", { ascending: true });

    if (!error && data) {
      items = data.map((item: TimelineItem & { sort_order?: number }, idx: number) => ({
        ...item,
        id: String(idx + 1).padStart(2, "0"),
      }));
    }
  } catch {
    // fall back to empty items
  }
  return <TimelineDemo items={items} />;
}

/**
 * TimelineSkeleton — used as the Suspense fallback in the home page.
 * Shows alternating card/text placeholders while the server component streams in.
 */
export function TimelineSkeleton() {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, transparent 0%, rgba(8,8,10,0.92) 6%, rgba(8,8,10,0.96) 94%, transparent 100%)",
      }}
    >
      {/* Header skeleton */}
      <div className="text-center pt-28 pb-24 px-6 space-y-4">
        <div className="h-3 w-24 bg-white/5 animate-pulse rounded mx-auto" />
        <div className="h-16 w-80 bg-white/5 animate-pulse rounded mx-auto" />
      </div>

      {/* Item skeletons */}
      <div className="w-full space-y-24 mt-12 pb-32 max-w-5xl mx-auto z-10 relative px-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex w-full gap-8 md:gap-16 items-center ${i % 2 !== 0 ? "flex-row" : "flex-row-reverse"}`}
          >
            <div className="w-1/2 aspect-[4/3] bg-white/5 animate-pulse rounded-xl" />
            <div className="w-1/2 flex flex-col space-y-4">
              <div className={`h-4 w-1/4 bg-white/5 animate-pulse rounded ${i % 2 !== 0 ? "" : "ml-auto"}`} />
              <div className={`h-8 w-3/4 bg-white/5 animate-pulse rounded ${i % 2 !== 0 ? "" : "ml-auto"}`} />
              <div className="h-24 w-full bg-white/5 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
