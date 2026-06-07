import { NextResponse } from "next/server";
import { database } from "@/lib/appwrite/server";
import { Query, ID } from "node-appwrite";
import { DB_ID, COLLECTIONS } from "@/lib/constants/collections";
import { handleError, badRequest, notFound, successResponse } from "@/lib/utils/api-response";
import { uploadFile, deleteFileByUrl } from "@/lib/utils/storage";
import { validateFields, formatValidationErrors } from "@/lib/utils/validation";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ event_id: string }> }
) {
    try {
        const { event_id } = await params;

        const event = await database.getDocument(DB_ID, COLLECTIONS.EVENTS, event_id);

        const orgLinks = await database.listDocuments(DB_ID, COLLECTIONS.EVENT_LINK_ORG, [
            Query.equal("event_id", event_id),
        ]);

        const orgIds = orgLinks.documents
            .map((link) => link.org_id?.$id || link.org_id)
            .filter(Boolean) as string[];

        let orgs: { name: string }[] = [];
        if (orgIds.length > 0) {
            const orgsData = await database.listDocuments(DB_ID, COLLECTIONS.ORGANIZATIONS, [
                Query.equal("$id", orgIds),
            ]);
            orgs = orgsData.documents.map((o) => ({
                name: o.name as string,
            }));
        }

        return NextResponse.json({ ...event, organizations: orgs });
    } catch (error) {
        return notFound("Event not found");
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ event_id: string }> }
) {
    try {
        const { event_id } = await params;
        const formData = await request.formData();

        const allowedFields = [
            "title", "slug", "subtitle", "description",
            "start_date", "end_date", "status", "register_link",
        ];
        const updateData: Record<string, unknown> = {};

        for (const field of allowedFields) {
            const value = formData.get(field);
            if (value !== null) {
                updateData[field] = value;
            }
        }

        const isFeatured = formData.get("is_featured");
        if (isFeatured !== null) {
            updateData.is_featured = isFeatured === "true";
        }

        const errors = validateFields([
            { field: "title", value: updateData.title, maxLength: 255 },
            { field: "slug", value: updateData.slug, type: "slug", maxLength: 255 },
            { field: "subtitle", value: updateData.subtitle, maxLength: 255 },
            { field: "description", value: updateData.description, maxLength: 1000 },
            { field: "start_date", value: updateData.start_date, type: "date" },
            { field: "end_date", value: updateData.end_date, type: "date" },
            { field: "register_link", value: updateData.register_link, type: "url" },
        ]);
        if (errors.length > 0) {
            return badRequest(formatValidationErrors(errors));
        }

        const coverFile = formData.get("cover_image");
        if (coverFile && coverFile instanceof File && coverFile.size > 0) {
            const currentEvent = await database.getDocument(DB_ID, COLLECTIONS.EVENTS, event_id);
            if (currentEvent.cover_image) {
                await deleteFileByUrl(currentEvent.cover_image as string);
            }
            updateData.cover_image = await uploadFile(coverFile);
        }

        const logFile = formData.get("log");
        if (logFile && logFile instanceof File && logFile.size > 0) {
            const currentEvent = await database.getDocument(DB_ID, COLLECTIONS.EVENTS, event_id);
            if (currentEvent.log) {
                await deleteFileByUrl(currentEvent.log as string);
            }
            updateData.log = await uploadFile(logFile);
        }

        if (Object.keys(updateData).length === 0) {
            return badRequest("No valid update data provided");
        }

        const updatedEvent = await database.updateDocument(
            DB_ID,
            COLLECTIONS.EVENTS,
            event_id,
            updateData
        );

        const orgsRaw = formData.get("orgs") as string;
        if (orgsRaw) {
            const orgs: string[] = JSON.parse(orgsRaw);

            const currentOrgLinks = await database.listDocuments(
                DB_ID,
                COLLECTIONS.EVENT_LINK_ORG,
                [Query.equal("event_id", event_id)]
            );

            const linksToDelete = currentOrgLinks.documents.filter(
                (doc) => !orgs.includes(doc.org_id?.$id || doc.org_id)
            );
            const currentOrgIds = currentOrgLinks.documents.map(
                (doc) => doc.org_id?.$id || doc.org_id
            );
            const orgsToAdd = orgs.filter((id) => !currentOrgIds.includes(id));

            await Promise.all([
                ...linksToDelete.map((doc) =>
                    database.deleteDocument(DB_ID, COLLECTIONS.EVENT_LINK_ORG, doc.$id)
                ),
                ...orgsToAdd.map((org_id) =>
                    database.createDocument(DB_ID, COLLECTIONS.EVENT_LINK_ORG, ID.unique(), {
                        event_id,
                        org_id,
                    })
                ),
            ]);
        }

        return NextResponse.json({
            message: "Event updated successfully",
            event: updatedEvent,
        });
    } catch (error) {
        return handleError("Update event", error);
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ event_id: string }> }
) {
    try {
        const { event_id } = await params;

        const currentEvent = await database.getDocument(DB_ID, COLLECTIONS.EVENTS, event_id);

        if (currentEvent.cover_image) {
            await deleteFileByUrl(currentEvent.cover_image as string);
        }
        if (currentEvent.log) {
            await deleteFileByUrl(currentEvent.log as string);
        }
        if (Array.isArray(currentEvent.related_images)) {
            for (const url of currentEvent.related_images) {
                await deleteFileByUrl(url as string);
            }
        }

        const orgLinks = await database.listDocuments(DB_ID, COLLECTIONS.EVENT_LINK_ORG, [
            Query.equal("event_id", event_id),
        ]);
        await Promise.all(
            orgLinks.documents.map((doc) =>
                database.deleteDocument(DB_ID, COLLECTIONS.EVENT_LINK_ORG, doc.$id)
            )
        );

        await database.deleteDocument(DB_ID, COLLECTIONS.EVENTS, event_id);

        return successResponse({
            message: "Event deleted successfully",
            id: event_id,
        });
    } catch (error) {
        return handleError("Delete event", error);
    }
}
