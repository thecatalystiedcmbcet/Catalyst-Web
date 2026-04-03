import { NextResponse } from "next/server";
import { database } from "@/lib/appwrite/server";
import { ID, Query } from "node-appwrite";
import { DB_ID, COLLECTIONS } from "@/lib/constants/collections";
import { handleError, badRequest } from "@/lib/utils/api-response";
import { parsePagination, paginationQueries } from "@/lib/utils/pagination";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  try {
    const pagination = parsePagination(request);
    const url = new URL(request.url);

    const queries = [
      ...paginationQueries(pagination),
      Query.orderAsc("priority"),
    ];

    const search = url.searchParams.get("search");
    if (search) {
      queries.push(Query.search("name", search));
    }

    const roles = await database.listDocuments(DB_ID, COLLECTIONS.ROLES, queries);

    // Fetch total member count for each role
    const enrichedRoles = await Promise.all(
      roles.documents.map(async (role) => {
        const linkDocs = await database.listDocuments(DB_ID, COLLECTIONS.USER_LINK_ROLES, [
          Query.equal("role_id", role.$id),
          Query.limit(1), // limit 1 since we only need the .total property
        ]);
        return {
          ...role,
          member_count: linkDocs.total,
        };
      })
    );

    return NextResponse.json({
      documents: enrichedRoles,
      total: roles.total,
      page: Math.floor(pagination.offset / pagination.limit) + 1,
      limit: pagination.limit,
    });
  } catch (error) {
    return handleError("Fetch roles", error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return badRequest("Role name is required");
    }

    if (name.trim().length > 255) {
      return badRequest("Role name must be at most 255 characters");
    }

    const newRole = await database.createDocument(
      DB_ID,
      COLLECTIONS.ROLES,
      ID.unique(),
      { name: name.trim() } as Record<string, unknown>
    );

    revalidatePath("/admin", "layout");

    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    return handleError("Create role", error);
  }
}
