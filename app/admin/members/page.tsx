import { columns, Member } from "./columns"
import { MembersClient } from "./members-client"
import { Role, Organization } from "./types"
import { adminFetch, CACHE_TAGS } from "@/lib/admin-fetcher"

// ISR: revalidate this page every 60 seconds

async function getData(): Promise<Member[]> {
  try {
    const rawData = await adminFetch<any>("/api/v1/members?limit=500&page=1", {
      tags: [CACHE_TAGS.members],
      revalidate: 60,
    })

    const list = Array.isArray(rawData) ? rawData : rawData.documents || []

    return list.map((item: any): Member => {
      const join_Date_ = item.join_date
        ? new Intl.DateTimeFormat("en-CA").format(new Date(item.join_date))
        : ""
      const leave_Date_ = item.leave_date
        ? new Intl.DateTimeFormat("en-CA").format(new Date(item.leave_date))
        : ""

      return {
        id: item.$id,
        name: item.name,
        phone: item.phone,
        photo: item.photo,
        email: item.email,
        organization: (item.orgs ?? []).map((orgs: any) => orgs.name).join(","),
        roles: (item.roles ?? []).map((roles: any) => roles.name).join(","),
        join_date: join_Date_,
        leave_date: leave_Date_,
      }
    })
  } catch (err) {
    console.error("[MembersPage] getData failed:", err)
    return []
  }
}

async function getRoles(): Promise<Role[]> {
  try {
    const rawData = await adminFetch<any>("/api/v1/roles?limit=500&page=1", {
      tags: [CACHE_TAGS.roles],
      revalidate: 300,
    })
    const data = Array.isArray(rawData) ? rawData : rawData.documents || []
    return data
  } catch (err) {
    console.error("[MembersPage] getRoles failed:", err)
    return []
  }
}

async function getOrganizations(): Promise<Organization[]> {
  try {
    const rawData = await adminFetch<any>("/api/v1/org?limit=500&page=1", {
      tags: [CACHE_TAGS.organizations],
      revalidate: 300,
    })
    const data = Array.isArray(rawData) ? rawData : rawData.documents || []
    return data
  } catch (err) {
    console.error("[MembersPage] getOrganizations failed:", err)
    return []
  }
}

export default async function MembersPage() {
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