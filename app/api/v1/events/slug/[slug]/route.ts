import { NextResponse } from "next/server";
import { database } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
import { DB_ID, COLLECTIONS } from "@/lib/constants/collections";
import { handleError, notFound } from "@/lib/utils/api-response";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const events = await database.listDocuments(DB_ID, COLLECTIONS.EVENTS, [
            Query.equal("slug", slug),
            Query.limit(1),
        ]);

        if (events.total === 0) {
            return notFound("Event not found");
        }

        const event = events.documents[0];

        const orgLinks = await database.listDocuments(DB_ID, COLLECTIONS.EVENT_LINK_ORG, [
            Query.equal("event_id", event.$id),
        ]);

        const orgIds = orgLinks.documents
            .map((link) => link.org_id?.$id || link.org_id)
            .filter(Boolean) as string[];

        let orgs: { name: string }[] = [];
        if (orgIds.length > 0) {
            const orgsData = await database.listDocuments(DB_ID, COLLECTIONS.ORGANIZATIONS, [
                Query.equal("$id", orgIds),
            ]);
            orgs = orgsData.documents.map((o) => ({ name: o.name as string }));
        }

        return NextResponse.json({ ...event, organizations: orgs });
    } catch (error) {
        return handleError("Fetch event by slug", error);
    }
}
