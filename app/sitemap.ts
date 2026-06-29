import { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://catalyst.mbcet.ac.in";

  // Static routes
  const routes = [
    "",
    "/events",
    "/achievements",
    "/execom",
    "/dev-team",
    "/gallery",
    "/mulearn",
    "/mulearn/execom",
    "/mulearn/achievements",
    "/campus-snapshot",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic routes (events)
  let eventRoutes: any[] = [];
  try {
    const supabase = createPublicClient();
    const { data: events } = await supabase
      .from("events")
      .select("id, start_date")
      .order("start_date", { ascending: false });

    if (events) {
      eventRoutes = events.map((event) => ({
        url: `${baseUrl}/events/${event.id}`,
        lastModified: new Date(event.start_date || new Date()),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error("Sitemap: Failed to fetch events from Supabase:", error);
  }

  return [...routes, ...eventRoutes];
}
