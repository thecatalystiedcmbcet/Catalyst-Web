"use client"

import * as React from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
    RowSelectionState,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Trash2, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Calendar, Pencil, Trophy } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
} from "@/components/ui/alert-dialog"
import { postActionLog } from "@/lib/utils/action-log"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DataTable<TData extends {
    id: string; title?: string; subtitle?: string | null; cover_image?: string | null; is_featured?: boolean; date?: string | null
}, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [alert, setAlert] = React.useState<{
        type: "success" | "error"
        message: string
    } | null>(null)

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onRowSelectionChange: setRowSelection,
        state: { rowSelection },
    })

    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedCount = selectedRows.length

    const handleDeleteSelected = async () => {
        setIsDeleting(true)

        const results = await Promise.allSettled(
            selectedRows.map((row) =>
                fetch(`/api/v1/achievements/${row.original.id}`, {
                    method: "DELETE",
                    credentials: "include",
                })
            )
        )

        const succeeded = results.filter((r) => r.status === "fulfilled" && (r.value as Response).ok)
        const failed = results.filter((r) => r.status === "rejected" || !(r as PromiseFulfilledResult<Response>).value?.ok)

        // Single consolidated log entry
        const details = selectedRows
            .map((row, i) => {
                const ok = results[i].status === "fulfilled" && (results[i] as PromiseFulfilledResult<Response>).value.ok
                return `${ok ? "✓" : "✗"} ${row.original.title}`
            })
            .join(" | ")

        postActionLog({
            action: "Deleted Achievements (Bulk)",
            entity_type: "achievement",
            entity_name: failed.length === 0
                ? `Bulk deleted ${succeeded.length} achievement(s)`
                : `Bulk delete: ${succeeded.length} succeeded, ${failed.length} failed`,
            status: failed.length === 0 ? "success" : "error",
            details,
        })

        setIsDeleteDialogOpen(false)

        if (failed.length === 0) {
            setAlert({ type: "success", message: `Successfully deleted ${succeeded.length} achievement(s).` })
            setTimeout(() => window.location.reload(), 1500)
        } else if (succeeded.length === 0) {
            setAlert({ type: "error", message: `Failed to delete all ${failed.length} achievement(s). Please try again.` })
            setIsDeleting(false)
            setTimeout(() => setAlert(null), 5000)
        } else {
            setAlert({ type: "error", message: `Deleted ${succeeded.length} achievement(s), but ${failed.length} failed.` })
            setTimeout(() => window.location.reload(), 2000)
        }
    }

    return (
        <div className="space-y-4">
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

            {selectedCount > 0 && (
                <div className="flex items-center justify-between bg-destructive/10 border-b border-destructive/20 px-6 py-3 rounded-t-lg">
                    <span className="text-sm font-medium text-destructive">
                        {selectedCount} row(s) selected
                    </span>
                    <button
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="inline-flex items-center gap-2 justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-4 py-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete Selected
                    </button>
                </div>
            )}

            {/* Desktop Table */}
            <div className="hidden md:block w-full overflow-x-auto rounded-lg border bg-card">
                <Table className="w-full">
                    <TableHeader className="bg-muted/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-muted/50 data-[state=selected]:bg-muted/50 border-b">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="h-10 px-4 text-left align-middle text-xs font-semibold text-muted-foreground">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="[&_tr:last-child]:border-0">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="border-b transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="p-3 px-4 align-middle text-sm text-foreground">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                                    No achievements found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden flex flex-col gap-4">
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => {
                        const achievement = row.original;

                        return (
                            <div key={row.id} className="flex flex-col rounded-xl border bg-card shadow-sm p-4 pt-5 relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-3">
                                        {achievement.cover_image ? (
                                            <Avatar className="h-10 w-10 border border-border rounded-md">
                                                <AvatarImage src={achievement.cover_image} />
                                                <AvatarFallback className="bg-muted text-xs font-medium text-foreground rounded-md">{achievement.title?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        ) : (
                                            <div className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-md">
                                                <Trophy className="w-5 h-5" />
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-foreground">{achievement.title}</span>
                                            <span className="text-xs text-muted-foreground">{achievement.subtitle || "No subtitle"}</span>
                                        </div>
                                    </div>
                                    <Badge variant={achievement.is_featured ? "default" : "secondary"} className={`text-[10px] font-bold uppercase px-2 py-0.5`}>
                                        {achievement.is_featured ? "Featured" : "Standard"}
                                    </Badge>
                                </div>

                                <div className="rounded-lg bg-muted/30 p-3 mb-4 grid grid-cols-2 gap-y-3">
                                    <div className="col-span-2 flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{achievement.date ? new Date(achievement.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="h-px bg-border w-[calc(100%+2rem)] -ml-4 mb-3"></div>

                                <div className="flex items-center justify-between text-muted-foreground">
                                    <button className="flex items-center gap-2 text-xs font-medium hover:text-foreground transition-colors group">
                                        <Pencil className="w-3.5 h-3.5 transition-colors group-hover:text-foreground" /> Edit Details
                                    </button>
                                    <button onClick={() => {
                                        row.toggleSelected(true);
                                        setIsDeleteDialogOpen(true);
                                    }} className="text-muted-foreground hover:text-destructive transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="p-8 text-center text-muted-foreground border rounded-xl bg-card">
                        No achievements found.
                    </div>
                )}
            </div>

            {/* Table Footer / Pagination Area */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
                <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Rows per page</span>
                    <select
                        className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={table.getState().pagination.pageSize}
                        onChange={e => {
                            table.setPageSize(Number(e.target.value))
                        }}
                    >
                        {[10, 20, 30, 40, 50].map(pageSize => (
                            <option key={pageSize} value={pageSize}>
                                {pageSize}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="text-sm text-muted-foreground sm:text-left text-center w-full sm:w-auto">
                    Showing <span className="font-semibold text-foreground">{table.getFilteredRowModel().rows.length === 0 ? 0 : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to <span className="font-semibold text-foreground">{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}</span> of <span className="font-semibold text-foreground">{table.getFilteredRowModel().rows.length}</span> results
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0">
                    <div className="flex items-center gap-2 justify-between w-full sm:w-auto">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 md:px-3" 
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <div className="flex flex-wrap items-center justify-center gap-1">
                            {Array.from({ length: table.getPageCount() }, (_, i) => i)
                                .filter(i => {
                                    const currentIndex = table.getState().pagination.pageIndex;
                                    return i >= currentIndex - 2 && i <= currentIndex + 2;
                                })
                                .map(i => (
                                <Button 
                                    key={i}
                                    variant={table.getState().pagination.pageIndex === i ? "outline" : "ghost"}
                                    size="sm" 
                                    className={`h-8 w-8 p-0 font-medium ${table.getState().pagination.pageIndex === i ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
                                    onClick={() => table.setPageIndex(i)}
                                >
                                    {i + 1}
                                </Button>
                            ))}
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 md:px-3"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedCount} achievement(s)?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedCount} selected achievement(s)? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSelected} disabled={isDeleting}>
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
