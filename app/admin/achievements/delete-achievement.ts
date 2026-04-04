"use server"

import { headers } from "next/headers"
import { getBaseUrlFromRequestHeaders } from "@/lib/get-base-url"
import { getLoopbackRequestHeaders } from "@/lib/admin-fetcher"

export async function deleteAchievement(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const BASE = getBaseUrlFromRequestHeaders(await headers())
        const res = await fetch(`${BASE}/api/v1/achievements/${id}`, {
            method: "DELETE",
            cache: "no-store",
            headers: await getLoopbackRequestHeaders(),
        })

        if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            return { success: false, error: data.error ?? data.message ?? "Failed to delete achievement" }
        }

        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message ?? "Unknown error" }
    }
}
