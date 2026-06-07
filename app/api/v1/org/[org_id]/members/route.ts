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

        const links = await database.listDocuments(DB_ID, COLLECTIONS.USER_LINK_ORG, [
            Query.equal("org_id", org_id),
            Query.limit(500),
        ]);

        const memberIds = links.documents
            .map((link) => link.user_id?.$id || link.user_id)
            .filter(Boolean) as string[];

        if (memberIds.length === 0) {
            return NextResponse.json({ documents: [], total: 0, page: 1, limit: pagination.limit });
        }

        const members = await database.listDocuments(DB_ID, COLLECTIONS.MEMBERS, [
            Query.equal("$id", memberIds),
            ...paginationQueries(pagination),
        ]);

        return NextResponse.json({
            documents: members.documents,
            total: members.total,
            page: Math.floor(pagination.offset / pagination.limit) + 1,
            limit: pagination.limit,
        });
    } catch (error) {
        return handleError("Fetch organization members", error);
    }
}
