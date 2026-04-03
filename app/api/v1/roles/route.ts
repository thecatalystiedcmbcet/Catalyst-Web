import { NextResponse } from "next/server";
import { database } from "@/lib/appwrite/server";
import { ID, Query } from "node-appwrite";
import { DB_ID, COLLECTIONS } from "@/lib/constants/collections";
import { handleError, badRequest } from "@/lib/utils/api-response";
import { parsePagination, paginationQueries } from "@/lib/utils/pagination";

export async function GET(request: Request) {
  try {
    const pagination = parsePagination(request);
    const url = new URL(request.url);

    const queries = [
      ...paginationQueries(pagination),
      Query.orderDesc("$createdAt"),
    ];

    const search = url.searchParams.get("search");
    if (search) {
      queries.push(Query.search("name", search));
    }

    const roles = await database.listDocuments(DB_ID, COLLECTIONS.ROLES, queries);

    return NextResponse.json({
      documents: roles.documents,
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

    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    return handleError("Create role", error);
  }
}
