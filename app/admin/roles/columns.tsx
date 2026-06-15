"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { postActionLog } from "@/lib/utils/action-log"
import { useAdminSettings } from "@/hooks/use-admin-settings"
import { Role } from "./types"

// ─── Proper component so useState is valid ────────────────────────────────────
function RowActions({ role, onEditClick }: { role: Role; onEditClick?: (role: Role) => void }) {
    const { uiElements } = useAdminSettings()
    const [isDeleting, setIsDeleting] = useState(false)
    const [alert, setAlert] = useState<{
        type: "success" | "error"
        message: string
    } | null>(null)

    const handleDelete = async () => {
        setIsDeleting(true)
        const { deleteRole } = await import("@/app/admin/roles/delete-role")
        const result = await deleteRole(role.id)

        if (result.success) {
            postActionLog({ action: "Deleted Role", entity_type: "role", entity_id: role.id, entity_name: role.name, status: "success" })
            setAlert({ type: "success", message: "Role deleted successfully" })
            setTimeout(() => { window.location.reload() }, 1500)
        } else {
            postActionLog({ action: "Deleted Role", entity_type: "role", entity_id: role.id, entity_name: role.name, status: "error", details: result.error || result.message })
            setAlert({ type: "error", message: `Failed to delete role: ${result.error || result.message}` })
            setIsDeleting(false)
            setTimeout(() => setAlert(null), 5000)
        }
    }

    return (
        <>
            {alert && (
                <div className="fixed bottom-4 right-4 z-50 max-w-md">
                    <Alert
                        variant={alert.type === "error" ? "destructive" : "default"}
                        className={`shadow-lg ${alert.type === "success" ? "border-l-4 border-l-green-500" : "border-l-4"}`}
                    >
                        {alert.type === "success" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                            <XCircle className="h-4 w-4" />
                        )}
                        <AlertTitle>{alert.type === "success" ? "Success" : "Error"}</AlertTitle>
                        <AlertDescription>{alert.message}</AlertDescription>
                    </Alert>
                </div>
            )}

            <div className="flex items-center gap-2">
                {uiElements.showEditButtons && (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEditClick?.(role)}
                    >
                        <Pencil />
                    </Button>
                )}

                {uiElements.showDeleteButtons && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon" disabled={isDeleting}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Role</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete this role? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </>
    )
}

// ─────────────────────────────────────────────────────────────────────────────

export function getColumns(onEditClick?: (role: Role) => void): ColumnDef<Role>[] {
    return [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => {
                const isSelected = row.getIsSelected()
                return (
                    <div className="relative flex items-center justify-center group">
                        {!isSelected && (
                            <span className="transition-opacity group-hover:opacity-0">
                                {row.index + 1}
                            </span>
                        )}
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={(value) => row.toggleSelected(!!value)}
                            aria-label="Select row"
                            className={`absolute transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                        />
                    </div>
                )
            },
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: "Role Name",
            cell: ({ row }) => (
                <div className="font-medium">{row.original.name}</div>
            ),
        },

        {
            accessorKey: "member_count",
            header: "Member Count",
            cell: ({ row }) => (
                <Badge variant="secondary">
                    {row.original.member_count} {row.original.member_count === 1 ? "member" : "members"}
                </Badge>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <RowActions role={row.original} onEditClick={onEditClick} />
            ),
        },
    ]
}

// Export for backwards compatibility
export const columns = getColumns()
