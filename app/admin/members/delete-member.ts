"use server"

import { database } from "@/lib/appwrite/server"

export async function deleteMember(userId: string) {
    try {
        await database.deleteDocument(
            process.env.NEXT_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_MEMBER_COLLECTION_ID!,
            userId
        )

        return { success: true }
    } catch (error) {
        console.error("Error deleting member:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        }
    }
}
