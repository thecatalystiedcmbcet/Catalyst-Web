import { columns, Member } from "./columns"
import { MembersClient } from "./members-client"
import { Role, Organization } from "./types"
import { adminFetch, CACHE_TAGS } from "@/lib/admin-fetcher"

// ISR: revalidate this page every 60 seconds
export const revalidate = 60

async function getData(): Promise<Member[]> {
    const rawData = await adminFetch<any>("/api/v1/members", {
        tags: [CACHE_TAGS.members],
        revalidate: 60,
    })

    const list = Array.isArray(rawData) ? rawData : rawData.documents || []

    return list.map((item: any): Member => {
        const join_Date_ = new Intl.DateTimeFormat("en-CA").format(new Date(item.join_date))
        const leave_Date_ = new Intl.DateTimeFormat("en-CA").format(new Date(item.leave_date))

        return {
            id: item.$id,
            name: item.name,
            phone: item.phone,
            photo: item.photo,
            email: item.email,
            organization: item.orgs.map((orgs: any) => orgs.name).join(","),
            roles: item.roles.map((roles: any) => roles.name).join(","),
            join_date: join_Date_,
            leave_date: leave_Date_,
        }
    })
}

async function getRoles(): Promise<Role[]> {
    const rawData = await adminFetch<any>("/api/v1/roles", {
        tags: [CACHE_TAGS.roles],
        revalidate: 300, // 5 minutes — roles change infrequently
    })
    const data = Array.isArray(rawData) ? rawData : rawData.documents || []
    return data
}

async function getOrganizations(): Promise<Organization[]> {
    const rawData = await adminFetch<any>("/api/v1/org", {
        tags: [CACHE_TAGS.organizations],
        revalidate: 300, // 5 minutes
    })
    const data = Array.isArray(rawData) ? rawData : rawData.documents || []
    return data
}

export default async function MembersPage() {
    // Fetch all resources in parallel (was sequential before!)
    const [data, roles, organizations] = await Promise.all([
        getData(),
        getRoles(),
        getOrganizations(),
    ])

    return (
        <MembersClient
            initialData={data}
            roles={roles}
            organizations={organizations}
        />
    )
}