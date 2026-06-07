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

        const result = await database.listDocuments(DB_ID, COLLECTIONS.ACHIEVEMENTS, [
            Query.equal("slug", slug),
            Query.limit(1),
        ]);

        if (result.total === 0) {
            return notFound("Achievement not found");
        }

        return NextResponse.json(result.documents[0]);
    } catch (error) {
        return handleError("Fetch achievement by slug", error);
    }
}
