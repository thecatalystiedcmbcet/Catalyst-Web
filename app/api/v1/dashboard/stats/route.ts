import { NextResponse } from "next/server";
import { database } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
import { DB_ID, COLLECTIONS } from "@/lib/constants/collections";
import { handleError } from "@/lib/utils/api-response";

export async function GET() {
    try {
        const [members, events, roles, orgs] = await Promise.all([
            database.listDocuments(DB_ID, COLLECTIONS.MEMBERS, [Query.limit(1)]),
            database.listDocuments(DB_ID, COLLECTIONS.EVENTS, [Query.limit(1)]),
            database.listDocuments(DB_ID, COLLECTIONS.ROLES, [Query.limit(1)]),
            database.listDocuments(DB_ID, COLLECTIONS.ORGANIZATIONS, [Query.limit(1)]),
        ]);

        const [activeMembers, featuredEvents] = await Promise.all([
            database.listDocuments(DB_ID, COLLECTIONS.MEMBERS, [
                Query.isNull("leave_date"),
                Query.limit(1),
            ]),
            database.listDocuments(DB_ID, COLLECTIONS.EVENTS, [
                Query.equal("is_featured", true),
                Query.limit(1),
            ]),
        ]);

        return NextResponse.json({
            total_members: members.total,
            active_members: activeMembers.total,
            inactive_members: members.total - activeMembers.total,
            total_roles: roles.total,
            total_organizations: orgs.total,
            total_events: events.total,
            featured_events: featuredEvents.total,
        });
    } catch (error) {
        return handleError("Fetch dashboard stats", error);
    }
}
