
import { NextResponse } from "next/server";
import { database } from "@/lib/appwrite/server";
import { ID, Query } from "node-appwrite";
import { DB_ID, COLLECTIONS } from "@/lib/constants/collections";
import { handleError, badRequest } from "@/lib/utils/api-response";
import { uploadFile } from "@/lib/utils/storage";
import { parsePagination, paginationQueries } from "@/lib/utils/pagination";

export async function GET(request: Request) {
    try {
        const pagination = parsePagination(request);

        const queries = [
            ...paginationQueries(pagination),
            // Stats might not have a strict order field, but often creation order or a specific category order matters.
            // Let's default to creation time descending for now unless 'order' field is added to schema later
            Query.orderDesc("$createdAt"),
        ];

        const stats = await database.listDocuments(DB_ID, COLLECTIONS.CAMPUS_STATS, queries);

        return NextResponse.json({
            documents: stats.documents,
            total: stats.total,
            page: Math.floor(pagination.offset / pagination.limit) + 1,
            limit: pagination.limit,
        });
    } catch (error) {
        return handleError("Fetch campus stats", error);
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const label = formData.get("label") as string;
        const value = formData.get("value") as string;
        const description = formData.get("description") as string;
        const category = formData.get("category") as string;

        if (!label || !value || !category) {
            return badRequest("Label, value, and category are required");
        }

        const payload: Record<string, unknown> = {
            label,
            value,
            description: description || null,
            category,
        };

        const iconFile = formData.get("icon");
        if (iconFile && iconFile instanceof File && iconFile.size > 0) {
            const iconUrl = await uploadFile(iconFile);
            payload.icon = iconUrl;
        }

        const newStat = await database.createDocument(
            DB_ID,
            COLLECTIONS.CAMPUS_STATS,
            ID.unique(),
            payload
        );

        return NextResponse.json(
            {
                message: "Stat created successfully",
                stat: newStat,
            },
            { status: 201 }
        );
    } catch (error) {
        return handleError("Create campus stat", error);
    }
}
