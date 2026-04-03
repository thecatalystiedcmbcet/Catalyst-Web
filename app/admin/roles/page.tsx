import { RolesClient } from "./roles-client"
import { Role } from "./types"
import { adminFetch, CACHE_TAGS } from "@/lib/admin-fetcher"

// ISR: roles are static-ish, revalidate every 5 minutes
export const revalidate = 300

async function getRoles(): Promise<Role[]> {
    const rawData = await adminFetch<any>("/api/v1/roles", {
        tags: [CACHE_TAGS.roles],
        revalidate: 300,
    })

    const data = Array.isArray(rawData) ? rawData : rawData.documents || []

    const roles: Role[] = data.map((role: any) => ({
        id: role.$id,
        name: role.name,
        member_count: 0,
    }))

    return roles
}

export default async function RolesPage() {
    const roles = await getRoles()
    return <RolesClient initialData={roles} />
}
