
import { NextResponse } from "next/server";
import { database } from "@/lib/appwrite/server";
import { DB_ID, COLLECTIONS, BUCKET_ID } from "@/lib/constants/collections";
import { handleError, successResponse } from "@/lib/utils/api-response";
import { storage } from "@/lib/appwrite/server";
import { uploadFile } from "@/lib/utils/storage";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ stat_id: string }> }
) {
    try {
        const { stat_id } = await params;
        const item = await database.getDocument(
            DB_ID,
            COLLECTIONS.CAMPUS_STATS,
            stat_id
        );

        return NextResponse.json(item);
    } catch (error) {
        return handleError("Fetch campus stat", error);
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ stat_id: string }> }
) {
    try {
        const { stat_id } = await params;

        // Check for icon to delete
        const item = await database.getDocument(
            DB_ID,
            COLLECTIONS.CAMPUS_STATS,
            stat_id
        );

        await database.deleteDocument(DB_ID, COLLECTIONS.CAMPUS_STATS, stat_id);

        if (item.icon) {
            try {
                const url = new URL(item.icon);
                const pathParts = url.pathname.split('/');
                const filesIndex = pathParts.indexOf('files');
                if (filesIndex !== -1 && pathParts[filesIndex + 1]) {
                    const fileId = pathParts[filesIndex + 1];
                    await storage.deleteFile(BUCKET_ID, fileId);
                }
            } catch (e) {
                console.error("Failed to delete icon from storage:", e);
            }
        }

        return successResponse({ message: "Stat deleted successfully" });
    } catch (error) {
        return handleError("Delete campus stat", error);
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ stat_id: string }> }
) {
    try {
        const { stat_id } = await params;
        const oldItem = await database.getDocument(DB_ID, COLLECTIONS.CAMPUS_STATS, stat_id);

        const formData = await request.formData();
        const payload: Record<string, unknown> = {};

        const label = formData.get("label");
        if (label !== null) payload.label = label;

        const value = formData.get("value");
        if (value !== null) payload.value = value;

        const description = formData.get("description");
        if (description !== null) payload.description = description;

        const category = formData.get("category");
        if (category !== null) payload.category = category;

        const iconFile = formData.get("icon");
        if (iconFile && iconFile instanceof File && iconFile.size > 0) {
            const newIconUrl = await uploadFile(iconFile);
            payload.icon = newIconUrl;

            // Cleanup old icon
            if (oldItem.icon) {
                try {
                    const url = new URL(oldItem.icon);
                    const pathParts = url.pathname.split('/');
                    const filesIndex = pathParts.indexOf('files');
                    if (filesIndex !== -1 && pathParts[filesIndex + 1]) {
                        const fileId = pathParts[filesIndex + 1];
                        await storage.deleteFile(BUCKET_ID, fileId);
                    }
                } catch (e) {
                    console.warn("Failed to cleanup old icon:", e);
                }
            }
        }

        const updatedItem = await database.updateDocument(
            DB_ID,
            COLLECTIONS.CAMPUS_STATS,
            stat_id,
            payload
        );

        return NextResponse.json(updatedItem);
    } catch (error) {
        return handleError("Update campus stat", error);
    }
}
