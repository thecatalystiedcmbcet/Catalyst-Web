"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
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

export type Achievement = {
    id: string
    title: string
    subtitle: string | null
    cover_image: string | null
    related_image: string | string[] | null
    is_featured: boolean
    date: string | null
    last_updated: string
}

export function getColumns(
    onEditClick?: (achievement: Achievement) => void,
    onDeleteSuccess?: (id: string) => void,
): ColumnDef<Achievement>[] {
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
            accessorKey: "cover_image",
            header: "",
            cell: ({ row }) => {
                const achievement = row.original
                return (
                    <Avatar size="sm">
                        <AvatarImage src={achievement.cover_image ?? ""} />
                        <AvatarFallback>{achievement.title.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                )
            },
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => {
                const { title, subtitle } = row.original
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">{title}</span>
                        {subtitle && (
                            <span className="text-xs text-muted-foreground">{subtitle}</span>
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: "is_featured",
            header: "Featured",
            cell: ({ row }) => {
                const featured = row.getValue("is_featured") as boolean
                return (
                    <Badge variant={featured ? "default" : "secondary"}>
                        {featured ? "Featured" : "Not Featured"}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => {
                const date = row.getValue("date") as string | null
                if (!date) return <span className="text-muted-foreground text-sm">—</span>
                return (
                    <span className="text-sm">
                        {new Intl.DateTimeFormat("en-CA").format(new Date(date))}
                    </span>
                )
            },
        },
        {
            accessorKey: "last_updated",
            header: "Last Updated",
            cell: ({ row }) => (
                <span className="text-muted-foreground text-sm">{row.getValue("last_updated")}</span>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => {
                const achievement = row.original
                const { uiElements } = useAdminSettings()
                const [isDeleting, setIsDeleting] = useState(false)
                const [alert, setAlert] = useState<{
                    type: "success" | "error"
                    message: string
                } | null>(null)

                const handleDelete = async () => {
                    setIsDeleting(true)
                    const { deleteAchievement } = await import("@/app/admin/achievements/delete-achievement")
                    const result = await deleteAchievement(achievement.id)

                    if (result.success) {
                        postActionLog({
                            action: "Deleted Achievement",
                            entity_type: "achievement",
                            entity_id: achievement.id,
                            entity_name: `Deleted achievement "${achievement.title}"`,
                            status: "success",
                            details: `Title: ${achievement.title}${achievement.subtitle ? ` | Subtitle: ${achievement.subtitle}` : ""}`,
                        })
                        setAlert({ type: "success", message: "Achievement deleted successfully" })
                        onDeleteSuccess?.(achievement.id)
                        setTimeout(() => window.location.reload(), 1500)
                    } else {
                        postActionLog({
                            action: "Deleted Achievement",
                            entity_type: "achievement",
                            entity_id: achievement.id,
                            entity_name: `Failed to delete achievement "${achievement.title}"`,
                            status: "error",
                            details: result.error ?? "Delete failed",
                        })
                        setAlert({ type: "error", message: `Failed to delete: ${result.error}` })
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
                                    onClick={() => onEditClick?.(achievement)}
                                >
                                    <Pencil className="h-4 w-4" />
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
                                            <AlertDialogTitle>Delete Achievement</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to delete &quot;{achievement.title}&quot;? This action cannot be undone.
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
            },
        },
    ]
}

export const columns = getColumns()
