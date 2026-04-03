import { NextResponse } from "next/server";
import { database } from "@/lib/appwrite/server";
import { ID, Query } from "node-appwrite";
import { DB_ID, COLLECTIONS } from "@/lib/constants/collections";
import { handleError, badRequest } from "@/lib/utils/api-response";
import { uploadFile } from "@/lib/utils/storage";
import { parsePagination, paginationQueries } from "@/lib/utils/pagination";
import { validateFields, formatValidationErrors, isStringArray } from "@/lib/utils/validation";
import { FORM_FIELDS } from "@/lib/utils/form-safety";

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
      queries.push(Query.search("title", search));
    }

    const status = url.searchParams.get("status");
    if (status) {
      queries.push(Query.equal("status", status));
    }

    const featured = url.searchParams.get("featured");
    if (featured === "true") {
      queries.push(Query.equal("is_featured", true));
    }

    const from = url.searchParams.get("from");
    if (from) {
      queries.push(Query.greaterThanEqual("start_date", from));
    }

    const to = url.searchParams.get("to");
    if (to) {
      queries.push(Query.lessThanEqual("start_date", to));
    }

    const events = await database.listDocuments(DB_ID, COLLECTIONS.EVENTS, queries);

    return NextResponse.json({
      documents: events.documents,
      total: events.total,
      page: Math.floor(pagination.offset / pagination.limit) + 1,
      limit: pagination.limit,
    });
  } catch (error) {
    return handleError("Fetch events", error);
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const title = formData.get("title") as string;
    if (FORM_FIELDS.event.title.required && (!title || title.trim().length === 0)) {
      return badRequest("Event title is required");
    }

    const payload: Record<string, unknown> = {
      title,
      slug: formData.get("slug"),
      subtitle: formData.get("subtitle"),
      description: formData.get("description"),
      start_date: formData.get("start_date"),
      end_date: formData.get("end_date"),
      status: formData.get("status"),
      register_link: formData.get("register_link"),
      is_featured: formData.get("is_featured") === "true",
    };

    const errors = validateFields([
      { field: "title", value: title, required: FORM_FIELDS.event.title.required, maxLength: 255 },
      { field: "slug", value: payload.slug, type: "slug", maxLength: 255 },
      { field: "subtitle", value: payload.subtitle, maxLength: 255 },
      { field: "description", value: payload.description, maxLength: 1000 },
      { field: "start_date", value: payload.start_date, type: "date" },
      { field: "end_date", value: payload.end_date, type: "date" },
      { field: "register_link", value: payload.register_link, type: "url" },
    ]);
    if (errors.length > 0) {
      return badRequest(formatValidationErrors(errors));
    }

    const orgsRaw = formData.get("orgs") as string;
    let orgs: string[] = [];
    try {
      orgs = orgsRaw ? JSON.parse(orgsRaw) : [];
    } catch {
      return badRequest("Invalid JSON format for orgs");
    }

    const coverFile = formData.get("cover_image");
    const logFile = formData.get("log");
    const relatedFiles = formData.getAll("related_images");

    if (coverFile && coverFile instanceof File && coverFile.size > 0) {
      payload.cover_image = await uploadFile(coverFile);
    }

    if (logFile && logFile instanceof File && logFile.size > 0) {
      payload.log = await uploadFile(logFile);
    }

    if (relatedFiles.length > 0) {
      const relatedUrls = await Promise.all(
        relatedFiles.map(async (file) => {
          if (file instanceof File && file.size > 0) {
            return await uploadFile(file);
          }
          return null;
        })
      );
      payload.related_images = relatedUrls.filter(Boolean);
    }

    const newEvent = await database.createDocument(
      DB_ID,
      COLLECTIONS.EVENTS,
      ID.unique(),
      payload
    );

    if (orgs.length > 0) {
      await Promise.all(
        orgs.map((org_id) =>
          database.createDocument(DB_ID, COLLECTIONS.EVENT_LINK_ORG, ID.unique(), {
            event_id: newEvent.$id,
            org_id,
          })
        )
      );
    }

    return NextResponse.json(
      {
        message: "Event created successfully",
        event: newEvent,
        linked_orgs_count: orgs.length,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError("Create event", error);
  }
}
