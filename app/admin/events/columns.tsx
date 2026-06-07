"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { postActionLog } from "@/lib/utils/action-log"
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

export type Event = {
    id: string
    title: string
    subtitle: string | null
    cover_image: string | null
    start_date: string | null
    end_date: string | null
    status: string | null
    register_link: string | null
    is_featured: boolean
}

function StatusBadge({ status }: { status: string | null }) {
    if (!status) return <span className="text-muted-foreground text-sm">—</span>

    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        upcoming: "secondary",
        ongoing: "default",
        completed: "outline",
        cancelled: "destructive",
    }

    const labels: Record<string, string> = {
        upcoming: "Upcoming",
        ongoing: "Ongoing",
        completed: "Completed",
        cancelled: "Cancelled",
    }

    const key = status.toLowerCase()
    return (
        <Badge variant={variants[key] ?? "secondary"}>
            {labels[key] ?? status}
        </Badge>
    )
}

function formatDate(date: string | null) {
    if (!date) return <span className="text-muted-foreground text-sm">—</span>
    return (
        <span className="text-sm">
            {new Intl.DateTimeFormat("en-CA").format(new Date(date))}
        </span>
    )
}

export function getColumns(
    onEditClick?: (event: Event) => void,
    onDeleteSuccess?: (id: string) => void,
): ColumnDef<Event>[] {
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
                const event = row.original
                return (
                    <Avatar size="sm">
                        <AvatarImage src={event.cover_image ?? ""} />
                        <AvatarFallback>{event.title.charAt(0).toUpperCase()}</AvatarFallback>
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
            accessorKey: "start_date",
            header: "Start Date",
            cell: ({ row }) => formatDate(row.getValue("start_date")),
        },
        {
            accessorKey: "end_date",
            header: "End Date",
            cell: ({ row }) => formatDate(row.getValue("end_date")),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => {
                const event = row.original
                const [isDeleting, setIsDeleting] = useState(false)
                const [alert, setAlert] = useState<{
                    type: "success" | "error"
                    message: string
                } | null>(null)

                const handleDelete = async () => {
                    setIsDeleting(true)
                    try {
                        const res = await fetch(`/api/v1/events/${event.id}`, { method: "DELETE", credentials: "include" })
                        if (!res.ok) throw new Error("Delete failed")
                        postActionLog({
                            action: "Deleted Event",
                            entity_type: "event",
                            entity_id: event.id,
                            entity_name: `Deleted event "${event.title}"`,
                            status: "success",
                            details: `Title: ${event.title}${event.subtitle ? ` | Subtitle: ${event.subtitle}` : ""}${event.status ? ` | Status: ${event.status}` : ""}`,
                        })
                        setAlert({ type: "success", message: "Event deleted successfully" })
                        onDeleteSuccess?.(event.id)
                        setTimeout(() => window.location.reload(), 1500)
                    } catch (err: any) {
                        postActionLog({
                            action: "Deleted Event",
                            entity_type: "event",
                            entity_id: event.id,
                            entity_name: `Failed to delete event "${event.title}"`,
                            status: "error",
                            details: err.message ?? "Delete failed",
                        })
                        setAlert({ type: "error", message: "Failed to delete event" })
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
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onEditClick?.(event)}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="icon" disabled={isDeleting}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Event</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete &quot;{event.title}&quot;? This action cannot be undone.
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

export const columns = getColumns()
