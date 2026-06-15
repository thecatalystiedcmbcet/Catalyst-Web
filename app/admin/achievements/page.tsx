import { Achievement } from "./columns"
import { AchievementsClient } from "./achievements-client"
import { Organization } from "@/app/admin/members/types"
import { adminFetch, CACHE_TAGS } from "@/lib/admin-fetcher"

// ISR: revalidate every 60 seconds

async function getData(): Promise<Achievement[]> {
  try {
    const rawData = await adminFetch<any>("/api/v1/achievements?limit=500&page=1", {
      tags: [CACHE_TAGS.achievements],
      revalidate: 60,
    })

    const list: any[] = Array.isArray(rawData) ? rawData : rawData.documents ?? []

    return list.map((item: any): Achievement => ({
      id: item.$id,
      title: item.title,
      subtitle: item.subtitle ?? null,
      cover_image: item.cover_image ?? null,
      related_image: item.related_image ?? null,
      is_featured: item.Is_featured ?? item.is_featured ?? false,
      date: item.date ?? null,
      last_updated: item.$updatedAt
        ? new Intl.DateTimeFormat("en-CA").format(new Date(item.$updatedAt))
        : "",
    }))
  } catch (err) {
    console.error("[AchievementsPage] getData failed:", err)
    return []
  }
}

async function getOrganizations(): Promise<Organization[]> {
  try {
    const rawData = await adminFetch<any>("/api/v1/org?limit=500&page=1", {
      tags: [CACHE_TAGS.organizations],
      revalidate: 300,
    })
    return Array.isArray(rawData) ? rawData : rawData.documents ?? []
  } catch (err) {
    console.error("[AchievementsPage] getOrganizations failed:", err)
    return []
  }
}

import { FeatureGuard } from "@/components/admin/feature-guard"

export default async function AchievementsPage() {
  const [data, organizations] = await Promise.all([getData(), getOrganizations()])
  return (
    <FeatureGuard featureKey="achievements" featureName="Achievements & Karma">
      <AchievementsClient initialData={data} organizations={organizations} />
    </FeatureGuard>
  )
}
