import { NextResponse } from "next/server";
import { database } from "@/lib/appwrite/server";
import { ID, Query, Permission, Role } from "node-appwrite";
import { DB_ID, COLLECTIONS } from "@/lib/constants/collections";
import { handleError, badRequest, successResponse } from "@/lib/utils/api-response";
import { uploadFile } from "@/lib/utils/storage";
import { validateFields, formatValidationErrors, isStringArray } from "@/lib/utils/validation";
import { FORM_FIELDS } from "@/lib/utils/form-safety";
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

    const active = url.searchParams.get("active");
    if (active === "true") {
      queries.push(Query.isNull("leave_date"));
    } else if (active === "false") {
      queries.push(Query.isNotNull("leave_date"));
    }

    const roleFilter = url.searchParams.get("role");
    const orgFilter = url.searchParams.get("org");

    let filterMemberIds: string[] | null = null;

    if (roleFilter) {
      const roleLinks = await database.listDocuments(DB_ID, COLLECTIONS.USER_LINK_ROLES, [
        Query.equal("role_id", roleFilter),
        Query.limit(500),
      ]);
      filterMemberIds = roleLinks.documents
        .map((link) => link.user_id?.$id || link.user_id)
        .filter(Boolean) as string[];
    }

    if (orgFilter) {
      const orgLinks = await database.listDocuments(DB_ID, COLLECTIONS.USER_LINK_ORG, [
        Query.equal("org_id", orgFilter),
        Query.limit(500),
      ]);
      const orgMemberIds = orgLinks.documents
        .map((link) => link.user_id?.$id || link.user_id)
        .filter(Boolean) as string[];

      if (filterMemberIds !== null) {
        filterMemberIds = filterMemberIds.filter((id) => orgMemberIds.includes(id));
      } else {
        filterMemberIds = orgMemberIds;
      }
    }

    if (filterMemberIds !== null) {
      if (filterMemberIds.length === 0) {
        return NextResponse.json({ documents: [], total: 0, page: 1, limit: pagination.limit });
      }
      queries.push(Query.equal("$id", filterMemberIds));
    }

    const member_data = await database.listDocuments(
      DB_ID,
      COLLECTIONS.MEMBERS,
      queries
    );

    const memberIds = member_data.documents.map((m) => m.$id);
    if (memberIds.length === 0) {
      return NextResponse.json({ documents: [], total: 0, page: 1, limit: pagination.limit });
    }

    const [allRoleLinks, allOrgLinks] = await Promise.all([
      database.listDocuments(DB_ID, COLLECTIONS.USER_LINK_ROLES, [
        Query.equal("user_id", memberIds),
        Query.limit(500),
      ]),
      database.listDocuments(DB_ID, COLLECTIONS.USER_LINK_ORG, [
        Query.equal("user_id", memberIds),
        Query.limit(500),
      ]),
    ]);

    const uniqueRoleIds = [
      ...new Set(
        allRoleLinks.documents
          .map((link) => link.role_id?.$id || link.role_id)
          .filter(Boolean)
      ),
    ] as string[];

    const uniqueOrgIds = [
      ...new Set(
        allOrgLinks.documents
          .map((link) => link.org_id?.$id || link.org_id)
          .filter(Boolean)
      ),
    ] as string[];

    const [rolesData, orgsData] = await Promise.all([
      uniqueRoleIds.length > 0
        ? database.listDocuments(DB_ID, COLLECTIONS.ROLES, [
          Query.equal("$id", uniqueRoleIds),
        ])
        : { documents: [] },
      uniqueOrgIds.length > 0
        ? database.listDocuments(DB_ID, COLLECTIONS.ORGANIZATIONS, [
          Query.equal("$id", uniqueOrgIds),
        ])
        : { documents: [] },
    ]);

    const rolesMap = new Map(rolesData.documents.map((r) => [r.$id, r]));
    const orgsMap = new Map(orgsData.documents.map((o) => [o.$id, o]));

    const enrichedMembers = member_data.documents.map((member) => {
      const memberRoleLinks = allRoleLinks.documents.filter(
        (link) => link.user_id === member.$id
      );
      const memberOrgLinks = allOrgLinks.documents.filter(
        (link) => link.user_id === member.$id
      );

      return {
        ...member,
        roles: memberRoleLinks
          .map((link) => rolesMap.get(link.role_id?.$id || link.role_id))
          .filter(Boolean),
        orgs: memberOrgLinks
          .map((link) => orgsMap.get(link.org_id?.$id || link.org_id))
          .filter(Boolean),
      };
    });

    return NextResponse.json({
      documents: enrichedMembers,
      total: member_data.total,
      page: Math.floor(pagination.offset / pagination.limit) + 1,
      limit: pagination.limit,
    });
  } catch (error) {
    return handleError("Fetch members", error);
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;

    const errors = validateFields([
      { field: "name", value: name, required: FORM_FIELDS.member.name.required, maxLength: 255 },
      { field: "email", value: email, required: FORM_FIELDS.member.email.required, type: "email" },
      { field: "phone", value: phone, type: "phone" },
    ]);
    if (errors.length > 0) {
      return badRequest(formatValidationErrors(errors));
    }

    const rolesRaw = formData.get("roles") as string;
    const orgsRaw = formData.get("orgs") as string;

    let roles: string[] = [];
    let orgs: string[] = [];

    try {
      if (rolesRaw) roles = JSON.parse(rolesRaw);
      if (orgsRaw) orgs = JSON.parse(orgsRaw);
    } catch {
      return badRequest("Invalid JSON format for roles or orgs");
    }

    let photoUrl: string | null = null;
    const file = formData.get("photo");

    if (file && file instanceof File && file.size > 0) {
      photoUrl = await uploadFile(file);
    } else {
      const rawString = formData.get("photo") as string;
      if (rawString && rawString.startsWith("http")) {
        photoUrl = rawString;
      }
    }

    const new_member = await database.createDocument(
      DB_ID,
      COLLECTIONS.MEMBERS,
      ID.unique(),
      { name, email, phone, photo: photoUrl, join_date: new Date().toISOString() }
    );

    const new_member_id = new_member.$id;
    const promises: Promise<unknown>[] = [];

    for (const role_id of roles) {
      promises.push(
        database.createDocument(DB_ID, COLLECTIONS.USER_LINK_ROLES, ID.unique(), {
          user_id: new_member_id,
          role_id,
        } as Record<string, unknown>)
      );
    }

    for (const org_id of orgs) {
      promises.push(
        database.createDocument(DB_ID, COLLECTIONS.USER_LINK_ORG, ID.unique(), {
          user_id: new_member_id,
          org_id,
        } as Record<string, unknown>)
      );
    }

    await Promise.all(promises);

    return successResponse(
      {
        ...new_member,
        message: "Member created successfully",
        photo_url: photoUrl,
      },
      201
    );
  } catch (error) {
    return handleError("Create member", error);
  }
}