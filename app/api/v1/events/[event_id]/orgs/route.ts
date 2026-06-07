import { NextResponse } from "next/server";
import { database } from "@/lib/appwrite/server";
import { ID, Query } from "node-appwrite";
import { DB_ID, COLLECTIONS } from "@/lib/constants/collections";
import { handleError, badRequest, successResponse } from "@/lib/utils/api-response";
import { isStringArray } from "@/lib/utils/validation";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ event_id: string }> }
) {
    try {
        const { event_id } = await params;

        const orgLinks = await database.listDocuments(DB_ID, COLLECTIONS.EVENT_LINK_ORG, [
            Query.equal("event_id", event_id),
        ]);

        const orgIds = orgLinks.documents
            .map((link) => link.org_id?.$id || link.org_id)
            .filter(Boolean) as string[];

        if (orgIds.length === 0) {
            return NextResponse.json([]);
        }

        const orgs = await database.listDocuments(DB_ID, COLLECTIONS.ORGANIZATIONS, [
            Query.equal("$id", orgIds),
        ]);

        return NextResponse.json(orgs.documents);
    } catch (error) {
        return handleError("Fetch event organizations", error);
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ event_id: string }> }
) {
    try {
        const { event_id } = await params;
        const { orgs } = await request.json();

        if (!Array.isArray(orgs) || !isStringArray(orgs)) {
            return badRequest("'orgs' must be an array of organization ID strings");
        }

        const currentLinks = await database.listDocuments(DB_ID, COLLECTIONS.EVENT_LINK_ORG, [
            Query.equal("event_id", event_id),
        ]);

        const linksToDelete = currentLinks.documents.filter(
            (doc) => !orgs.includes(doc.org_id?.$id || doc.org_id)
        );
        const currentOrgIds = currentLinks.documents.map(
            (doc) => doc.org_id?.$id || doc.org_id
        );
        const orgsToAdd = orgs.filter((id: string) => !currentOrgIds.includes(id));

        await Promise.all([
            ...linksToDelete.map((doc) =>
                database.deleteDocument(DB_ID, COLLECTIONS.EVENT_LINK_ORG, doc.$id)
            ),
            ...orgsToAdd.map((org_id: string) =>
                database.createDocument(
                    DB_ID,
                    COLLECTIONS.EVENT_LINK_ORG,
                    ID.unique(),
                    { event_id, org_id } as Record<string, unknown>
                )
            ),
        ]);

        return successResponse({
            message: "Organizations synced",
            added: orgsToAdd.length,
            removed: linksToDelete.length,
            current_total: orgs.length,
        });
    } catch (error) {
        return handleError("Sync event organizations", error);
    }
}
