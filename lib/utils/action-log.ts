/**
 * Fire-and-forget action log poster.
 * Never throws — logs errors to console only so it never blocks the UI.
 */
export interface ActionLogPayload {
    action: string
    entity_type: string
    entity_id?: string
    entity_name?: string
    performed_by?: string
    details?: string
    status: "success" | "error"
}

export function postActionLog(payload: ActionLogPayload): void {
    fetch("/api/v1/action-logs", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    }).catch((err) => console.warn("[action-log] failed to post log:", err))
}
