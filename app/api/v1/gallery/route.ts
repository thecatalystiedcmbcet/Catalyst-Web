
import { NextResponse } from "next/server";
import { database } from "@/lib/appwrite/server";
import { ID, Query } from "node-appwrite";
import { DB_ID, COLLECTIONS } from "@/lib/constants/collections";
import { handleError, badRequest } from "@/lib/utils/api-response";
import { uploadFile } from "@/lib/utils/storage";
import { parsePagination, paginationQueries } from "@/lib/utils/pagination";
import { validateFields, formatValidationErrors, isStringArray } from "@/lib/utils/validation";

export async function GET(request: Request) {
    try {
        const pagination = parsePagination(request);
        const url = new URL(request.url);

        const queries = [
            ...paginationQueries(pagination),
            Query.orderDesc("date"),
        ];

        const tags = url.searchParams.get("tags");
        if (tags) {
            queries.push(Query.search("tags", tags));
        }

        const featured = url.searchParams.get("featured");
        if (featured === "true") {
            queries.push(Query.equal("is_featured", true));
        }

        const galleryItems = await database.listDocuments(DB_ID, COLLECTIONS.GALLERY, queries);

        return NextResponse.json({
            documents: galleryItems.documents,
            total: galleryItems.total,
            page: Math.floor(pagination.offset / pagination.limit) + 1,
            limit: pagination.limit,
        });
    } catch (error) {
        return handleError("Fetch gallery items", error);
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const date = formData.get("date") as string;
        const caption = formData.get("caption") as string;
        const is_featured = formData.get("is_featured") === "true";
        const event_id = formData.get("event_id") as string;
        const rawTags = formData.get("tags") as string;

        let tags: string[] = [];
        try {
            if (rawTags) tags = JSON.parse(rawTags);
        } catch {
            // Tag parsing failed, treat as empty or single tag depending on need
            // For now, let's assume it might be a comma separated string if not JSON
            if (rawTags) tags = rawTags.split(',').map(t => t.trim());
        }


        if (!date) {
            return badRequest("Date is required");
        }

        const imageFile = formData.get("image");
        if (!imageFile || !(imageFile instanceof File) || imageFile.size === 0) {
            return badRequest("Image file is required");
        }

        const imageUrl = await uploadFile(imageFile);

        const payload: Record<string, unknown> = {
            image_url: imageUrl,
            caption: caption || null,
            date,
            is_featured,
            event_id: event_id || null, // Optional link
            tags: tags
        };

        const newItem = await database.createDocument(
            DB_ID,
            COLLECTIONS.GALLERY,
            ID.unique(),
            payload
        );

        return NextResponse.json(
            {
                message: "Gallery item created successfully",
                item: newItem,
            },
            { status: 201 }
        );
    } catch (error) {
        return handleError("Create gallery item", error);
    }
}
