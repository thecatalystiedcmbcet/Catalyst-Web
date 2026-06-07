import { NextResponse } from "next/server";
import { database } from "@/lib/appwrite/server";
import { ID, Query } from "node-appwrite";
import { DB_ID, COLLECTIONS } from "@/lib/constants/collections";
import { handleError, badRequest, successResponse } from "@/lib/utils/api-response";
import { validateFields, formatValidationErrors } from "@/lib/utils/validation";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ member_id: string }> }
) {
    try {
        const { member_id } = await params;

        const socials = await database.listDocuments(DB_ID, COLLECTIONS.USER_LINK_SOCIAL, [
            Query.equal("user_id", member_id),
        ]);

        if (socials.total === 0) {
            return NextResponse.json(null);
        }

        const data = socials.documents[0];
        return NextResponse.json({
            instagram: data.instagram ?? null,
            github: data.github ?? null,
        });
    } catch (error) {
        return handleError("Fetch member socials", error);
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ member_id: string }> }
) {
    try {
        const { member_id } = await params;
        const body = await request.json();

        const { instagram, github } = body;

        if (!instagram && !github) {
            return badRequest("At least one social link (instagram or github) is required");
        }

        const errors = validateFields([
            { field: "instagram", value: instagram, type: "url" },
            { field: "github", value: github, type: "url" },
        ]);
        if (errors.length > 0) {
            return badRequest(formatValidationErrors(errors));
        }

        const socialData: Record<string, string | null> = {};
        if (instagram !== undefined) socialData.instagram = instagram;
        if (github !== undefined) socialData.github = github;

        const existingSocials = await database.listDocuments(
            DB_ID,
            COLLECTIONS.USER_LINK_SOCIAL,
            [Query.equal("user_id", member_id)]
        );

        if (existingSocials.total > 0) {
            await database.updateDocument(
                DB_ID,
                COLLECTIONS.USER_LINK_SOCIAL,
                existingSocials.documents[0].$id,
                socialData
            );
        } else {
            await database.createDocument(
                DB_ID,
                COLLECTIONS.USER_LINK_SOCIAL,
                ID.unique(),
                { user_id: member_id, ...socialData } as Record<string, unknown>
            );
        }

        return successResponse({
            message: "Socials updated",
            ...socialData,
        });
    } catch (error) {
        return handleError("Update member socials", error);
    }
}
