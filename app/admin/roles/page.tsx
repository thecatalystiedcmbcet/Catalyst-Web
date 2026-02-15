import { RolesClient } from "./roles-client"
import { Role } from "./types"

async function getRoles(): Promise<Role[]> {
    const res = await fetch("http://localhost:3000/api/v1/roles", {
        method: "GET",
        cache: "no-store",
    })

    if (!res.ok) {
        throw new Error("Failed to fetch roles")
    }

    const data = await res.json()

    // Transform the API data to match our Role type
    const roles: Role[] = data.map((role: any) => ({
        id: role.$id,
        name: role.name,
        member_count: 0 // Set to 0 as requested
    }))

    return roles
}

export default async function RolesPage() {
    const roles = await getRoles()

    return <RolesClient initialData={roles} />
}
