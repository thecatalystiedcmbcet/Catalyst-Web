
import { NextResponse } from "next/server";
import { database } from "@/lib/appwrite/server";
import { ID, Query } from "node-appwrite";
import { DB_ID, COLLECTIONS } from "@/lib/constants/collections";
import { handleError, badRequest } from "@/lib/utils/api-response";
import { uploadFile } from "@/lib/utils/storage";
import { parsePagination, paginationQueries } from "@/lib/utils/pagination";
import { validateFields, formatValidationErrors } from "@/lib/utils/validation";

export async function GET(request: Request) {
    try {
        const pagination = parsePagination(request);

        const queries = [
            ...paginationQueries(pagination),
            Query.orderAsc("order"), // Timeline usually ordered by date/sequence
        ];

        const timelineItems = await database.listDocuments(DB_ID, COLLECTIONS.TIMELINE, queries);

        return NextResponse.json({
            documents: timelineItems.documents,
            total: timelineItems.total,
            page: Math.floor(pagination.offset / pagination.limit) + 1,
            limit: pagination.limit,
        });
    } catch (error) {
        return handleError("Fetch timeline items", error);
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const year = formData.get("year"); // Can be string or number
        const order = formData.get("order");

        if (!title || !description || !year) {
            return badRequest("Title, description, and year are required");
        }

        const payload: Record<string, unknown> = {
            title,
            description,
            year: parseInt(year.toString()),
            order: order ? parseInt(order.toString()) : 0,
        };

        const iconFile = formData.get("icon");
        if (iconFile && iconFile instanceof File && iconFile.size > 0) {
            const iconUrl = await uploadFile(iconFile);
            payload.icon = iconUrl;
        }

        const newItem = await database.createDocument(
            DB_ID,
            COLLECTIONS.TIMELINE,
            ID.unique(),
            payload
        );

        return NextResponse.json(
            {
                message: "Timeline item created successfully",
                item: newItem,
            },
            { status: 201 }
        );
    } catch (error) {
        return handleError("Create timeline item", error);
    }
}
