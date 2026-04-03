import { NextResponse } from "next/server";
import { database } from "@/lib/appwrite/server";
import { DB_ID, COLLECTIONS } from "@/lib/constants/collections";
import { handleError, badRequest, notFound, successResponse } from "@/lib/utils/api-response";
import { revalidatePath } from "next/cache";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ role_id: string }> }
) {
  try {
    const { role_id } = await params;

    const role = await database.getDocument(DB_ID, COLLECTIONS.ROLES, role_id);

    return NextResponse.json(role);
  } catch (error) {
    return notFound("Role not found");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ role_id: string }> }
) {
  try {
    const { role_id } = await params;
    const body = await request.json();

    const allowedFields = ["name"];
    const updateData: Record<string, string> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return badRequest("No valid update data provided. Allowed fields: name");
    }

    if (updateData.name !== undefined) {
      if (typeof updateData.name !== "string" || updateData.name.trim().length === 0) {
        return badRequest("Role name must be a non-empty string");
      }
      if (updateData.name.length > 255) {
        return badRequest("Role name must be at most 255 characters");
      }
      updateData.name = updateData.name.trim();
    }

    const updatedRole = await database.updateDocument(
      DB_ID,
      COLLECTIONS.ROLES,
      role_id,
      updateData
    );

    revalidatePath("/admin", "layout");

    return NextResponse.json(updatedRole);
  } catch (error) {
    return handleError("Update role", error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ role_id: string }> }
) {
  try {
    const { role_id } = await params;

    await database.deleteDocument(DB_ID, COLLECTIONS.ROLES, role_id);

    revalidatePath("/admin", "layout");

    return successResponse({ message: "Role deleted successfully", id: role_id });
  } catch (error) {
    return handleError("Delete role", error);
  }
}
