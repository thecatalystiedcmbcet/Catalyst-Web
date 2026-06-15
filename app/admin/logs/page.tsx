import { LogsClient } from "./logs-client"
import { ActionLog } from "./columns"
import { adminFetch, CACHE_TAGS } from "@/lib/admin-fetcher"

// Logs are written constantly — always serve fresh


async function getLogs(): Promise<{ data: ActionLog[]; total: number }> {
    try {
        const json = await adminFetch<any>("/api/v1/action-logs?limit=25&page=1", {
            tags: [CACHE_TAGS.logs],
            revalidate: false, // no-store
        })

        const list: ActionLog[] = (json.documents ?? []).map((doc: any) => ({
            id: doc.$id,
            action: doc.action,
            entity_type: doc.entity_type,
            entity_id: doc.entity_id,
            entity_name: doc.entity_name,
            performed_by: doc.performed_by,
            details: doc.details,
            status: doc.status,
            createdAt: doc.$createdAt,
        }))

        return { data: list, total: json.total ?? list.length }
    } catch {
        return { data: [], total: 0 }
    }
}

import { FeatureGuard } from "@/components/admin/feature-guard"

export default async function LogsPage() {
    const { data, total } = await getLogs()

    return (
        <FeatureGuard featureKey="logs" featureName="System Logs">
            <div className="py-10 px-4">
                <LogsClient initialData={data} total={total} />
            </div>
        </FeatureGuard>
    )
}
