
import { NextResponse } from "next/server";
import { database } from "@/lib/appwrite/server";
import { DB_ID, COLLECTIONS, BUCKET_ID } from "@/lib/constants/collections";
import { handleError, successResponse } from "@/lib/utils/api-response";
import { storage } from "@/lib/appwrite/server";
import { uploadFile } from "@/lib/utils/storage";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ gallery_id: string }> }
) {
    try {
        const { gallery_id } = await params;
        const item = await database.getDocument(
            DB_ID,
            COLLECTIONS.GALLERY,
            gallery_id
        );

        return NextResponse.json(item);
    } catch (error) {
        return handleError("Fetch gallery item", error);
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ gallery_id: string }> }
) {
    try {
        const { gallery_id } = await params;

        // 1. Get the document to find the image file ID
        const item = await database.getDocument(
            DB_ID,
            COLLECTIONS.GALLERY,
            gallery_id
        );

        // 2. Delete the document
        await database.deleteDocument(DB_ID, COLLECTIONS.GALLERY, gallery_id);

        // 3. Try to delete the file from storage if it exists
        // Assuming image_url is the full URL, we need to extract the file ID
        // Pattern: /files/[file_id]/view
        if (item.image_url) {
            try {
                const url = new URL(item.image_url);
                const pathParts = url.pathname.split('/');
                const filesIndex = pathParts.indexOf('files');
                if (filesIndex !== -1 && pathParts[filesIndex + 1]) {
                    const fileId = pathParts[filesIndex + 1];
                    await storage.deleteFile(BUCKET_ID, fileId);
                }
            } catch (e) {
                console.error("Failed to delete file from storage:", e);
                // We don't fail the request if file deletion fails, as the doc is already gone
            }
        }

        return successResponse({ message: "Gallery item deleted successfully" });
    } catch (error) {
        return handleError("Delete gallery item", error);
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ gallery_id: string }> }
) {
    try {
        const { gallery_id } = await params;
        const formData = await request.formData();

        const payload: Record<string, unknown> = {};

        const caption = formData.get("caption");
        if (caption !== null) payload.caption = caption;

        const date = formData.get("date");
        if (date !== null) payload.date = date;

        const is_featured = formData.get("is_featured");
        if (is_featured !== null) payload.is_featured = is_featured === "true";

        const event_id = formData.get("event_id");
        if (event_id !== null) payload.event_id = event_id || null;

        const rawTags = formData.get("tags");
        if (rawTags !== null) {
            try {
                payload.tags = JSON.parse(rawTags as string);
            } catch {
                if (typeof rawTags === 'string') {
                    payload.tags = rawTags.split(',').map(t => t.trim());
                }
            }
        }

        const imageFile = formData.get("image");
        if (imageFile && imageFile instanceof File && imageFile.size > 0) {
            // Upload new file
            const newImageUrl = await uploadFile(imageFile);
            payload.image_url = newImageUrl;

            // Optional: Delete old file. This requires fetching the doc first.
            // For simplicity and speed in this update, we might skip deleting the old one strictly here
            // unless requested, but good practice is to clean up.
            // Let's implement cleanup.
            try {
                const oldItem = await database.getDocument(DB_ID, COLLECTIONS.GALLERY, gallery_id);
                if (oldItem.image_url) {
                    const url = new URL(oldItem.image_url);
                    const pathParts = url.pathname.split('/');
                    const filesIndex = pathParts.indexOf('files');
                    if (filesIndex !== -1 && pathParts[filesIndex + 1]) {
                        const fileId = pathParts[filesIndex + 1];
                        await storage.deleteFile(BUCKET_ID, fileId);
                    }
                }
            } catch (e) {
                console.warn("Failed to cleanup old file:", e);
            }
        }

        const updatedItem = await database.updateDocument(
            DB_ID,
            COLLECTIONS.GALLERY,
            gallery_id,
            payload
        );

        return NextResponse.json(updatedItem);
    } catch (error) {
        return handleError("Update gallery item", error);
    }
}
