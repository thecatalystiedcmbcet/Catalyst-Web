import { NextResponse } from "next/server";
import { database } from "@/lib/appwrite/server";
import { DB_ID, COLLECTIONS } from "@/lib/constants/collections";
import { handleError, badRequest } from "@/lib/utils/api-response";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates)) {
      return badRequest("Updates array is required");
    }

    // Execute all updates concurrently in a single batch
    // This is the most efficient way to perform bulk updates in Appwrite
    // because it resolves multiple parallel unblocked HTTP requests instantly.
    const promises = updates.map((update: { id: string, priority: number }) => 
      database.updateDocument(
        DB_ID,
        COLLECTIONS.ROLES,
        update.id,
        { priority: update.priority }
      )
    );

    // Wait for all concurrency updates to finish
    await Promise.all(promises);

    return NextResponse.json({ success: true, message: "Roles reordered successfully" }, { status: 200 });
  } catch (error) {
    return handleError("Reorder roles", error);
  }
}
