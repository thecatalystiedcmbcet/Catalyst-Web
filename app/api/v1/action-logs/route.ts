import { NextResponse } from "next/server";
import { database } from "@/lib/appwrite/server";
import { ID, Query } from "node-appwrite";
import { DB_ID, COLLECTIONS } from "@/lib/constants/collections";
import {
    handleError,
    badRequest,
    successResponse,
} from "@/lib/utils/api-response";
import { parsePagination, paginationQueries } from "@/lib/utils/pagination";
import { sendDiscordWebhook } from "@/lib/utils/discord";
import { getCurrentUser } from "@/lib/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

type LogStatus = "success" | "error";

interface ActionLogBody {
    action: string;
    entity_type: string;
    entity_id?: string;
    entity_name?: string;
    performed_by?: string;
    details?: string;
    status: LogStatus;
}

const VALID_STATUSES: LogStatus[] = ["success", "error"];

// ─── GET /api/v1/action-logs ──────────────────────────────────────────────────
// Returns a paginated list of action log entries.
//
// Query params:
//   page, limit        — pagination (handled by parsePagination)
//   entity_type        — filter by entity type (e.g. "member", "event")
//   status             — filter by "success" | "error"
//   performed_by       — filter by performer identifier

export async function GET(request: Request) {
    try {
        const pagination = parsePagination(request);
        const url = new URL(request.url);

        const queries = [
            ...paginationQueries(pagination),
            Query.orderDesc("$createdAt"),
        ];

        const entityType = url.searchParams.get("entity_type");
        if (entityType) {
            queries.push(Query.equal("entity_type", entityType));
        }

        const status = url.searchParams.get("status");
        if (status) {
            if (!VALID_STATUSES.includes(status as LogStatus)) {
                return badRequest(`Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`);
            }
            queries.push(Query.equal("status", status));
        }

        const performedBy = url.searchParams.get("performed_by");
        if (performedBy) {
            queries.push(Query.equal("performed_by", performedBy));
        }

        const result = await database.listDocuments(
            DB_ID,
            COLLECTIONS.ACTION_LOGS,
            queries
        );

        return NextResponse.json({
            documents: result.documents,
            total: result.total,
            page: Math.floor(pagination.offset / pagination.limit) + 1,
            limit: pagination.limit,
        });
    } catch (error) {
        return handleError("Fetch action logs", error);
    }
}

// ─── POST /api/v1/action-logs ─────────────────────────────────────────────────
// Creates a new action log entry and optionally fires a Discord webhook.
//
// Body (JSON):
// {
//   "action":       string  (required) — e.g. "member.created"
//   "entity_type":  string  (required) — e.g. "member"
//   "entity_id":    string  (optional)
//   "entity_name":  string  (optional)
//   "performed_by": string  (optional)
//   "details":      string  (optional)
//   "status":       "success" | "error"  (required)
// }

export async function POST(request: Request) {
    try {
        let body: ActionLogBody;

        try {
            body = await request.json();
        } catch {
            return badRequest("Invalid JSON body");
        }

        const { action, entity_type, entity_id, entity_name, details, status } = body;

        // ── Resolve current user (server-side, never from client body) ──────────
        const currentUser = await getCurrentUser();
        const performed_by = currentUser?.name ?? body.performed_by ?? undefined;

        // ── Validation ─────────────────────────────────────────────────────────
        if (!action || typeof action !== "string" || action.trim().length === 0) {
            return badRequest("Field 'action' is required");
        }
        if (!entity_type || typeof entity_type !== "string" || entity_type.trim().length === 0) {
            return badRequest("Field 'entity_type' is required");
        }
        if (!status || !VALID_STATUSES.includes(status)) {
            return badRequest(`Field 'status' is required and must be one of: ${VALID_STATUSES.join(", ")}`);
        }

        // ── Write to Appwrite ───────────────────────────────────────────────────
        const doc = await database.createDocument(
            DB_ID,
            COLLECTIONS.ACTION_LOGS,
            ID.unique(),
            {
                action: action.trim(),
                entity_type: entity_type.trim(),
                ...(entity_id ? { entity_id } : {}),
                ...(entity_name ? { entity_name } : {}),
                ...(performed_by ? { performed_by } : {}),
                ...(details ? { details } : {}),
                status,
            }
        );

        // ── Discord webhook (fire-and-forget, never blocks response) ────────────
        sendDiscordWebhook({
            action: doc.action,
            entity_type: doc.entity_type,
            entity_id: doc.entity_id,
            entity_name: doc.entity_name,
            performed_by: doc.performed_by,
            details: doc.details,
            status: doc.status,
        }).catch((err) => console.warn("Discord webhook error:", err));

        return successResponse({ ...doc, message: "Action log created" }, 201);
    } catch (error) {
        return handleError("Create action log", error);
    }
}
