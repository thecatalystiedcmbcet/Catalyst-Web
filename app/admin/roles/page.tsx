import { RolesClient } from "./roles-client"
import { Role } from "./types"
import { adminFetch, CACHE_TAGS } from "@/lib/admin-fetcher"

// ISR: roles are static-ish, revalidate every 5 minutes

async function getRoles(): Promise<Role[]> {
  try {
    const rawData = await adminFetch<any>("/api/v1/roles?limit=500&page=1", {
      tags: [CACHE_TAGS.roles],
      revalidate: 300,
    })

    const data = Array.isArray(rawData) ? rawData : rawData.documents || []

    const roles: Role[] = data.map((role: any) => ({
      id: role.$id,
      name: role.name,
      member_count: role.member_count || 0,
      priority: role.priority || 0,
    }))

    // Sort: 1+ come first in ascending order, 0 or null fall to the bottom
    roles.sort((a, b) => {
      const pA = a.priority || 0;
      const pB = b.priority || 0;

      if (pA === 0 && pB !== 0) return 1;
      if (pA !== 0 && pB === 0) return -1;
      if (pA !== 0 && pB !== 0) return pA - pB;
      return 0;
    })

    return roles
  } catch (err: any) {
    if (err?.digest === 'HANGING_PROMISE_REJECTION' || err?.message?.includes('prerendering') || err?.digest?.includes('DYNAMIC')) {
      throw err;
    }
    console.error("[RolesPage] getRoles failed:", err)
    return []
  }
}

export default async function RolesPage() {
  const roles = await getRoles()
  return <RolesClient initialData={roles} />
}
