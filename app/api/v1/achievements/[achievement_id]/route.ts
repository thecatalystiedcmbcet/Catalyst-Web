import { NextResponse } from "next/server";
import { database } from "@/lib/appwrite/server";
import { DB_ID, COLLECTIONS } from "@/lib/constants/collections";
import { handleError, badRequest, notFound, successResponse } from "@/lib/utils/api-response";
import { uploadFile, deleteFileByUrl } from "@/lib/utils/storage";
import { validateFields, formatValidationErrors } from "@/lib/utils/validation";
import { FORM_FIELDS } from "@/lib/utils/form-safety";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ achievement_id: string }> }
) {
    try {
        const { achievement_id } = await params;

        const achievement = await database.getDocument(
            DB_ID,
            COLLECTIONS.ACHIEVEMENTS,
            achievement_id
        );

        return NextResponse.json(achievement);
    } catch (error) {
        return notFound("Achievement not found");
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ achievement_id: string }> }
) {
    try {
        const { achievement_id } = await params;
        const formData = await request.formData();

        // Only update fields the form explicitly sends (no slug — generated server-side)
        const stringFields = ["title", "subtitle", "description"];
        const updateData: Record<string, unknown> = {};

        for (const field of stringFields) {
            const value = formData.get(field);
            if (value !== null) {
                const trimmed = (value as string).trim();
                updateData[field] = trimmed === "" ? null : trimmed;
            }
        }

        // Date: send null to clear, or a valid ISO date string
        const dateValue = formData.get("date");
        if (dateValue !== null) {
            const trimmed = (dateValue as string).trim();
            updateData.date = trimmed === "" ? null : trimmed;
        }

        // is_featured — only include if the attribute exists in the collection
        // (add it in Appwrite console as a Boolean attribute named "is_featured" if missing)
        const isFeatured = formData.get("is_featured");
        if (isFeatured !== null) {
            updateData.Is_featured = isFeatured === "true";
        }

        const orgValue = formData.get("org");
        if (orgValue !== null) {
            const trimmed = (orgValue as string).trim();
            updateData.org = trimmed === "" || trimmed === "null" ? null : trimmed;
        }

        const errors = validateFields([
            { field: "title", value: updateData.title, required: FORM_FIELDS.achievement.title.required, maxLength: 255 },
            { field: "subtitle", value: updateData.subtitle, maxLength: 255 },
            { field: "description", value: updateData.description, maxLength: 2000 },
            { field: "date", value: updateData.date, type: "date" },
        ]);
        if (errors.length > 0) {
            return badRequest(formatValidationErrors(errors));
        }

        const coverFile = formData.get("cover_image");
        if (coverFile && coverFile instanceof File && coverFile.size > 0) {
            try {
                const current = await database.getDocument(DB_ID, COLLECTIONS.ACHIEVEMENTS, achievement_id);
                if (current.cover_image) {
                    await deleteFileByUrl(current.cover_image as string);
                }
            } catch {
                // Old file cleanup is best-effort
            }
            updateData.cover_image = await uploadFile(coverFile);
        }

        const relatedFile = formData.get("related_image");
        if (relatedFile && relatedFile instanceof File && relatedFile.size > 0) {
            try {
                const current = await database.getDocument(DB_ID, COLLECTIONS.ACHIEVEMENTS, achievement_id);
                if (current.related_image) {
                    await deleteFileByUrl(current.related_image as string);
                }
            } catch {
                // Old file cleanup is best-effort
            }
            updateData.related_image = await uploadFile(relatedFile);
        }

        if (Object.keys(updateData).length === 0) {
            return badRequest("No valid update data provided");
        }

        let updatedAchievement;
        try {
            updatedAchievement = await database.updateDocument(
                DB_ID,
                COLLECTIONS.ACHIEVEMENTS,
                achievement_id,
                updateData
            );
        } catch (err: any) {
            // If Appwrite rejects Is_featured (attribute not yet created in console),
            // retry without it so the rest of the fields still save.
            if (
                typeof err?.message === "string" &&
                err.message.toLowerCase().includes("is_featured")
            ) {
                delete updateData.Is_featured;
                updatedAchievement = await database.updateDocument(
                    DB_ID,
                    COLLECTIONS.ACHIEVEMENTS,
                    achievement_id,
                    updateData
                );
            } else {
                throw err;
            }
        }

        return NextResponse.json({
            message: "Achievement updated successfully",
            achievement: updatedAchievement,
        });
    } catch (error) {
        return handleError("Update achievement", error);
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ achievement_id: string }> }
) {
    try {
        const { achievement_id } = await params;

        const achievement = await database.getDocument(
            DB_ID,
            COLLECTIONS.ACHIEVEMENTS,
            achievement_id
        );

        if (achievement.cover_image) {
            try {
                await deleteFileByUrl(achievement.cover_image as string);
            } catch {
                // Best-effort cleanup
            }
        }
        if (achievement.related_image) {
            try {
                await deleteFileByUrl(achievement.related_image as string);
            } catch {
                // Best-effort cleanup
            }
        }

        await database.deleteDocument(DB_ID, COLLECTIONS.ACHIEVEMENTS, achievement_id);

        return successResponse({
            message: "Achievement deleted successfully",
            id: achievement_id,
        });
    } catch (error) {
        return handleError("Delete achievement", error);
    }
}
