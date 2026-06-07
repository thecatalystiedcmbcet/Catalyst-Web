import { NextResponse } from "next/server";
import { database } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
import { DB_ID, COLLECTIONS } from "@/lib/constants/collections";
import { handleError } from "@/lib/utils/api-response";
import { parsePagination, paginationQueries } from "@/lib/utils/pagination";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ org_id: string }> }
) {
    try {
        const { org_id } = await params;
        const pagination = parsePagination(request);

        const links = await database.listDocuments(DB_ID, COLLECTIONS.EVENT_LINK_ORG, [
            Query.equal("org_id", org_id),
            Query.limit(500),
        ]);

        const eventIds = links.documents
            .map((link) => link.event_id?.$id || link.event_id)
            .filter(Boolean) as string[];

        if (eventIds.length === 0) {
            return NextResponse.json({ documents: [], total: 0, page: 1, limit: pagination.limit });
        }

        const events = await database.listDocuments(DB_ID, COLLECTIONS.EVENTS, [
            Query.equal("$id", eventIds),
            ...paginationQueries(pagination),
            Query.orderDesc("$createdAt"),
        ]);

        return NextResponse.json({
            documents: events.documents,
            total: events.total,
            page: Math.floor(pagination.offset / pagination.limit) + 1,
            limit: pagination.limit,
        });
    } catch (error) {
        return handleError("Fetch organization events", error);
    }
}
