import { EventsClient } from "./events-client"
import { Event } from "./columns"
import { adminFetch, CACHE_TAGS } from "@/lib/admin-fetcher"

// ISR: revalidate every 60 seconds

async function getData(): Promise<Event[]> {
  try {
    const rawData = await adminFetch<any>("/api/v1/events", {
      tags: [CACHE_TAGS.events],
      revalidate: 60,
    })

    const list: any[] = Array.isArray(rawData) ? rawData : rawData.documents ?? []

    return list.map((item: any): Event => ({
      id: item.$id,
      title: item.title,
      subtitle: item.subtitle ?? null,
      cover_image: item.cover_image ?? null,
      start_date: item.start_date ?? null,
      end_date: item.end_date ?? null,
      status: item.status ?? null,
      register_link: item.register_link ?? null,
      is_featured: item.is_featured ?? item.Is_featured ?? false,
    }))
  } catch (err) {
    console.error("[EventsPage] getData failed:", err)
    return []
  }
}

export default async function EventsPage() {
  const data = await getData()
  return <EventsClient initialData={data} />
}
