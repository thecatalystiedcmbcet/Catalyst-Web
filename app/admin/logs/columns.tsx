"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CheckCircle2, XCircle, ChevronDown, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"

export type ActionLog = {
    id: string
    action: string
    entity_type: string
    entity_id?: string
    entity_name?: string
    performed_by?: string
    details?: string
    status: "success" | "error"
    createdAt: string
}

export function StatusBadge({ status }: { status: "success" | "error" }) {
    if (status === "success") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Success
            </span>
        )
    }
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="h-3.5 w-3.5" />
            Error
        </span>
    )
}

export function formatDate(dateStr: string) {
    try {
        return format(parseISO(dateStr), "dd MMM yyyy, HH:mm")
    } catch {
        return dateStr
    }
}

/** No row-level status styling */
export function getRowClass(_row: ActionLog): string {
    return ""
}

export function getColumns(
    expandedRows: Set<string>,
    toggleRow: (id: string) => void,
): ColumnDef<ActionLog>[] {
    return [
        {
            accessorKey: "action",
            header: "Action",
            cell: ({ row }) => (
                <span className="text-sm font-medium">{row.original.action}</span>
            ),
        },
        {
            accessorKey: "entity_type",
            header: "Entity",
            cell: ({ row }) => (
                <Badge variant="outline" className="capitalize">
                    {row.original.entity_type}
                </Badge>
            ),
        },
        {
            accessorKey: "entity_name",
            header: "",
            cell: () => null,
            enableHiding: true,
        },
        {
            accessorKey: "performed_by",
            header: "Performed By",
            cell: ({ row }) => (
                <span className="text-sm">
                    {row.original.performed_by ?? <span className="text-muted-foreground">—</span>}
                </span>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        {
            accessorKey: "createdAt",
            header: "Time",
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(row.original.createdAt)}
                </span>
            ),
        },
        {
            id: "expand",
            header: "",
            cell: ({ row }) => {
                const hasDetails = !!row.original.details
                const isExpanded = expandedRows.has(row.original.id)
                if (!hasDetails) return <span className="w-7 inline-block" />
                return (
                    <button
                        onClick={() => toggleRow(row.original.id)}
                        className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={isExpanded ? "Collapse details" : "Expand details"}
                    >
                        {isExpanded
                            ? <ChevronDown className="h-4 w-4" />
                            : <ChevronRight className="h-4 w-4" />
                        }
                    </button>
                )
            },
            enableSorting: false,
            enableHiding: false,
        },
    ]
}

// Backwards-compat default (no expansion)
export const columns = getColumns(new Set(), () => { })
