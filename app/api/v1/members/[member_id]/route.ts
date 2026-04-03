import { NextResponse } from "next/server";
import { Query, ID } from "node-appwrite";
import { database } from "@/lib/appwrite/server";
import { DB_ID, COLLECTIONS } from "@/lib/constants/collections";
import { handleError, badRequest, successResponse } from "@/lib/utils/api-response";
import { uploadFile, deleteFileByUrl } from "@/lib/utils/storage";
import { validateFields, formatValidationErrors } from "@/lib/utils/validation";
import { revalidateTag } from "next/cache";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ member_id: string }> }
) {
  try {
    const { member_id } = await params;

    const [member_data, member_roles_links, member_social_links, member_org_links] =
      await Promise.all([
        database.getDocument(DB_ID, COLLECTIONS.MEMBERS, member_id),
        database.listDocuments(DB_ID, COLLECTIONS.USER_LINK_ROLES, [
          Query.equal("user_id", member_id),
        ]),
        database.listDocuments(DB_ID, COLLECTIONS.USER_LINK_SOCIAL, [
          Query.equal("user_id", member_id),
        ]),
        database.listDocuments(DB_ID, COLLECTIONS.USER_LINK_ORG, [
          Query.equal("user_id", member_id),
        ]),
      ]);

    const roleIds = member_roles_links.documents
      .map((link) => link.role_id?.$id || link.role_id)
      .filter(Boolean) as string[];

    let finalRoleNames: string[] = [];
    if (roleIds.length > 0) {
      const rolesData = await database.listDocuments(DB_ID, COLLECTIONS.ROLES, [
        Query.equal("$id", roleIds),
      ]);
      finalRoleNames = rolesData.documents.map((r) => r.name as string);
    }

    const socialData = member_social_links.documents[0];
    const formattedSocials = socialData
      ? { instagram: socialData.instagram, github: socialData.github }
      : null;

    const orgIds = member_org_links.documents
      .map((link) => link.org_id?.$id || link.org_id)
      .filter(Boolean) as string[];

    let finalOrgs: { name: string; website: string; logo: string }[] = [];
    if (orgIds.length > 0) {
      const orgsData = await database.listDocuments(DB_ID, COLLECTIONS.ORGANIZATIONS, [
        Query.equal("$id", orgIds),
      ]);
      finalOrgs = orgsData.documents.map((o) => ({
        name: o.name as string,
        website: o.website as string,
        logo: o.logo as string,
      }));
    }

    return NextResponse.json({
      ...member_data,
      roles: finalRoleNames,
      socials: formattedSocials,
      organizations: finalOrgs,
    });
  } catch (error) {
    return handleError("Fetch member", error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ member_id: string }> }
) {
  try {
    const { member_id } = await params;

    const [roleLinks, orgLinks, socialLinks] = await Promise.all([
      database.listDocuments(DB_ID, COLLECTIONS.USER_LINK_ROLES, [
        Query.equal("user_id", member_id),
      ]),
      database.listDocuments(DB_ID, COLLECTIONS.USER_LINK_ORG, [
        Query.equal("user_id", member_id),
      ]),
      database.listDocuments(DB_ID, COLLECTIONS.USER_LINK_SOCIAL, [
        Query.equal("user_id", member_id),
      ]),
    ]);

    const deletePromises: Promise<unknown>[] = [];

    for (const doc of roleLinks.documents) {
      deletePromises.push(
        database.deleteDocument(DB_ID, COLLECTIONS.USER_LINK_ROLES, doc.$id)
      );
    }
    for (const doc of orgLinks.documents) {
      deletePromises.push(
        database.deleteDocument(DB_ID, COLLECTIONS.USER_LINK_ORG, doc.$id)
      );
    }
    for (const doc of socialLinks.documents) {
      deletePromises.push(
        database.deleteDocument(DB_ID, COLLECTIONS.USER_LINK_SOCIAL, doc.$id)
      );
    }

    await Promise.all(deletePromises);

    await database.deleteDocument(DB_ID, COLLECTIONS.MEMBERS, member_id);

    revalidateTag("admin-roles");

    return successResponse({ message: "Member deleted successfully", id: member_id });
  } catch (error) {
    return handleError("Delete member", error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ member_id: string }> }
) {
  try {
    const { member_id } = await params;
    const formData = await request.formData();

    const rolesRaw = formData.get("roles") as string;
    const orgsRaw = formData.get("orgs") as string;
    const socialsRaw = formData.get("socials") as string;
    const photoFile = formData.get("photo");

    const roles = rolesRaw ? JSON.parse(rolesRaw) : null;
    const orgs = orgsRaw ? JSON.parse(orgsRaw) : null;
    const socials = socialsRaw ? JSON.parse(socialsRaw) : null;

    const allowedFields = ["name", "email", "phone", "join_date", "leave_date"];
    const specialKeys = ["roles", "orgs", "socials", "photo"];
    const memberDetails: Record<string, string | null> = {};

    formData.forEach((value, key) => {
      if (!specialKeys.includes(key) && allowedFields.includes(key) && typeof value === "string") {
        memberDetails[key] = value;
      }
    });

    const fieldValidation = validateFields([
      { field: "email", value: memberDetails.email, type: "email" },
      { field: "phone", value: memberDetails.phone, type: "phone" },
      { field: "join_date", value: memberDetails.join_date, type: "date" },
      { field: "leave_date", value: memberDetails.leave_date, type: "date" },
      { field: "name", value: memberDetails.name, maxLength: 255 },
    ]);
    if (fieldValidation.length > 0) {
      return badRequest(formatValidationErrors(fieldValidation));
    }

    if (photoFile) {
      if (photoFile instanceof File && photoFile.size > 0) {
        try {
          const currentMember = await database.getDocument(
            DB_ID,
            COLLECTIONS.MEMBERS,
            member_id
          );
          if (currentMember.photo) {
            await deleteFileByUrl(currentMember.photo as string);
          }
        } catch {
          // Old photo cleanup is best-effort
        }

        memberDetails.photo = await uploadFile(photoFile);
      } else if (typeof photoFile === "string") {
        if (photoFile.startsWith("http")) {
          memberDetails.photo = photoFile;
        } else if (photoFile === "null" || photoFile === "") {
          memberDetails.photo = null;
        }
      }
    }

    if (Object.keys(memberDetails).length > 0) {
      await database.updateDocument(DB_ID, COLLECTIONS.MEMBERS, member_id, memberDetails);
    }

    if (roles && Array.isArray(roles)) {
      const currentRoleLinks = await database.listDocuments(
        DB_ID,
        COLLECTIONS.USER_LINK_ROLES,
        [Query.equal("user_id", member_id)]
      );
      const linksToDelete = currentRoleLinks.documents.filter(
        (doc) => !roles.includes(doc.role_id?.$id || doc.role_id)
      );
      const currentRoleIds = currentRoleLinks.documents.map(
        (doc) => doc.role_id?.$id || doc.role_id
      );
      const rolesToAdd = roles.filter((id: string) => !currentRoleIds.includes(id));

      await Promise.all([
        ...linksToDelete.map((doc) =>
          database.deleteDocument(DB_ID, COLLECTIONS.USER_LINK_ROLES, doc.$id)
        ),
        ...rolesToAdd.map((role_id: string) =>
          database.createDocument(DB_ID, COLLECTIONS.USER_LINK_ROLES, ID.unique(), {
            user_id: member_id,
            role_id,
          })
        ),
      ]);
    }

    if (orgs && Array.isArray(orgs)) {
      const currentOrgLinks = await database.listDocuments(
        DB_ID,
        COLLECTIONS.USER_LINK_ORG,
        [Query.equal("user_id", member_id)]
      );
      const linksToDelete = currentOrgLinks.documents.filter(
        (doc) => !orgs.includes(doc.org_id?.$id || doc.org_id)
      );
      const currentOrgIds = currentOrgLinks.documents.map(
        (doc) => doc.org_id?.$id || doc.org_id
      );
      const orgsToAdd = orgs.filter((id: string) => !currentOrgIds.includes(id));

      await Promise.all([
        ...linksToDelete.map((doc) =>
          database.deleteDocument(DB_ID, COLLECTIONS.USER_LINK_ORG, doc.$id)
        ),
        ...orgsToAdd.map((org_id: string) =>
          database.createDocument(DB_ID, COLLECTIONS.USER_LINK_ORG, ID.unique(), {
            user_id: member_id,
            org_id,
          })
        ),
      ]);
    }

    if (socials) {
      const existingSocials = await database.listDocuments(
        DB_ID,
        COLLECTIONS.USER_LINK_SOCIAL,
        [Query.equal("user_id", member_id)]
      );

      const { instagram, github } = socials;
      const sanitizedSocials = { instagram, github };

      if (existingSocials.total > 0) {
        await database.updateDocument(
          DB_ID,
          COLLECTIONS.USER_LINK_SOCIAL,
          existingSocials.documents[0].$id,
          sanitizedSocials
        );
      } else {
        await database.createDocument(DB_ID, COLLECTIONS.USER_LINK_SOCIAL, ID.unique(), {
          user_id: member_id,
          ...sanitizedSocials,
        });
      }
    }

    revalidateTag("admin-roles");

    return successResponse({
      message: "Member updated successfully",
      updated_fields: [
        ...Object.keys(memberDetails),
        ...specialKeys.filter((k) => formData.has(k)),
      ],
    });
  } catch (error) {
    return handleError("Update member", error);
  }
}
