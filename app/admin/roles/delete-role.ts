/**
 * Delete a role by ID
 * @param roleId - The ID of the role to delete
 * @returns Promise with the deletion result
 */
export async function deleteRole(roleId: string): Promise<{
    success: boolean;
    message: string;
    error?: string;
}> {
    try {
        const response = await fetch(`http://localhost:3000/api/v1/roles/${roleId}`, {
            method: "DELETE",
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: "Failed to delete role",
                error: data.error || data.details || "Unknown error",
            };
        }

        return {
            success: true,
            message: data.message || "Role deleted successfully",
        };
    } catch (error: any) {
        console.error("Delete role error:", error);
        return {
            success: false,
            message: "Failed to delete role",
            error: error.message,
        };
    }
}
