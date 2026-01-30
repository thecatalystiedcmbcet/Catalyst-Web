/**
 * Delete a member by ID
 * @param memberId - The ID of the member to delete
 * @returns Promise with the deletion result
 */
export async function deleteMember(memberId: string): Promise<{
    success: boolean;
    message: string;
    error?: string;
}> {
    try {
        const response = await fetch(`http://localhost:3000/api/v1/members/${memberId}`, {
            method: "DELETE",
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: "Failed to delete member",
                error: data.error || data.details || "Unknown error",
            };
        }

        return {
            success: true,
            message: data.message || "Member deleted successfully",
        };
    } catch (error: any) {
        console.error("Delete member error:", error);
        return {
            success: false,
            message: "Failed to delete member",
            error: error.message,
        };
    }
}
