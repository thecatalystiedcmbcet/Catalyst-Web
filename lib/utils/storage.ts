import { storage } from "@/lib/appwrite/server";
import { ID, Permission, Role } from "node-appwrite";

const BUCKET_ID = process.env.NEXT_APPWRITE_BUCKET_ID!;

export function getFileUrl(fileId: string): string {
    const projectId = process.env.NEXT_APPWRITE_PROJECT_ID;
    const endpoint = process.env.NEXT_APPWRITE_ENDPOINT;
    return `${endpoint}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${projectId}`;
}

export async function uploadFile(file: File, publicRead = true): Promise<string> {
    const permissions = publicRead ? [Permission.read(Role.any())] : [];
    const uploaded = await storage.createFile(BUCKET_ID, ID.unique(), file, permissions);
    return getFileUrl(uploaded.$id);
}

export async function deleteFileByUrl(fileUrl: string): Promise<void> {
    const fileIdMatch = fileUrl.match(/files\/([^/]+)\/view/);
    if (fileIdMatch?.[1]) {
        try {
            await storage.deleteFile(BUCKET_ID, fileIdMatch[1]);
        } catch {
            console.warn(`Could not delete file ${fileIdMatch[1]} (may not exist)`);
        }
    }
}
