"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react"
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

import { Role } from "./types"

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
                    onCheckedChange={(value) =>
                        table.toggleAllPageRowsSelected(!!value)
                    }
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => {
                const isSelected = row.getIsSelected()

                return (
                    <div className="relative flex items-center justify-center group">

                        {/* Row number */}
                        {!isSelected && (
                            <span className="transition-opacity group-hover:opacity-0">
                                {row.index + 1}
                            </span>
                        )}

                        {/* Checkbox */}
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={(value) => row.toggleSelected(!!value)}
                            aria-label="Select row"
                            className={`
            absolute transition-opacity
            ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
          `}
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
            cell: ({ row }) => {
                const role = row.original
                return (
                    <div className="font-medium">
                        {role.name}
                    </div>
                )
            },
        },
        {
            accessorKey: "id",
            header: "Role ID",
            cell: ({ row }) => {
                const role = row.original
                return (
                    <div className="font-mono text-sm text-muted-foreground">
                        {role.id}
                    </div>
                )
            },
        },
        {
            accessorKey: "member_count",
            header: "Member Count",
            cell: ({ row }) => {
                const role = row.original
                return (
                    <Badge variant="secondary">
                        {role.member_count} {role.member_count === 1 ? 'member' : 'members'}
                    </Badge>
                )
            },
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => {
                const role = row.original
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
                        setAlert({
                            type: "success",
                            message: "Role deleted successfully"
                        })
                        setTimeout(() => {
                            window.location.reload()
                        }, 1500)
                    } else {
                        setAlert({
                            type: "error",
                            message: `Failed to delete role: ${result.error || result.message}`
                        })
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
                                    className={`shadow-lg ${alert.type === "success"
                                        ? "border-l-4 border-l-green-500"
                                        : "border-l-4"
                                        }`}
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
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onEditClick?.(role)}
                            >
                                <Pencil />
                            </Button>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={isDeleting}
                                    >
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
                        </div>
                    </>
                )
            },
        },
    ]
}

// Export for backwards compatibility
export const columns = getColumns()
