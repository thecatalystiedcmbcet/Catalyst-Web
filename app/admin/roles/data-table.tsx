"use client"

import * as React from "react"
import {
    ColumnDef,
    SortingState,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    ColumnFiltersState,
    getFilteredRowModel,
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Users, Pencil, Shield } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DataTable<TData extends { id?: string; $id?: string; name?: string; member_count?: number }, TValue>({
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
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
        },
    })

    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedCount = selectedRows.length

    const handleDeleteSelected = async () => {
        setIsDeleting(true)
        const { deleteRole } = await import("@/app/admin/roles/delete-role")

        // Delete all selected roles
        const deletePromises = selectedRows.map((row) => {
            const rowData = row.original as any
            return deleteRole(rowData.id || rowData.$id)
        })

        try {
            const results = await Promise.all(deletePromises)
            const failed = results.filter(r => !r.success)

            if (failed.length > 0) {
                setAlert({
                    type: "error",
                    message: `Failed to delete ${failed.length} of ${selectedCount} role(s)`
                })
                setTimeout(() => {
                    window.location.reload()
                }, 2000)
            } else {
                setAlert({
                    type: "success",
                    message: `Successfully deleted ${selectedCount} role(s)`
                })
                setTimeout(() => {
                    window.location.reload()
                }, 1500)
            }

            setIsDeleteDialogOpen(false)
        } catch (error) {
            console.error("Delete error:", error)
            setAlert({
                type: "error",
                message: "An error occurred while deleting roles"
            })
            setIsDeleting(false)
            setTimeout(() => setAlert(null), 5000)
        }
    }

    return (
        <div className="space-y-4">
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

            {selectedCount > 0 && (
                <div className="flex items-center justify-between bg-destructive/10 border-b border-destructive/20 px-6 py-3 rounded-t-lg">
                    <span className="text-sm font-medium text-destructive">
                        {selectedCount} row(s) selected
                    </span>
                    <button
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-4 py-2"
                    >
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
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="h-10 px-4 text-left align-middle text-xs font-semibold text-muted-foreground">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="[&_tr:last-child]:border-0">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="border-b transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted"
                                >
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
                                    No results.
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
                        const role = row.original;

                        return (
                            <div key={row.id} className="flex flex-col rounded-xl border bg-card shadow-sm p-4 pt-5 relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-3 items-center">
                                        <div className="bg-primary/10 text-primary p-2 rounded-lg">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-foreground">{role.name}</span>
                                            <span className="text-xs text-muted-foreground font-mono">ID: {role.id || role.$id}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg bg-muted/30 p-3 mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="w-4 h-4" />
                                    <span><strong className="text-foreground">{role.member_count}</strong> {role.member_count === 1 ? 'Member' : 'Members'}</span>
                                </div>

                                <div className="h-px bg-border w-[calc(100%+2rem)] -ml-4 mb-3"></div>

                                <div className="flex items-center justify-between text-muted-foreground">
                                    <button className="flex items-center gap-2 text-xs font-medium hover:text-foreground transition-colors group">
                                        <Pencil className="w-3.5 h-3.5 transition-colors group-hover:text-foreground" /> Edit Role
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
                        No roles found.
                    </div>
                )}
            </div>

            {/* Table Footer / Pagination Area */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
                <div className="text-sm text-muted-foreground sm:text-left text-center w-full sm:w-auto">
                    Showing <span className="font-semibold text-foreground">1</span> to <span className="font-semibold text-foreground">{table.getRowModel().rows.length}</span> of <span className="font-semibold text-foreground">{data.length}</span> results
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <div className="flex items-center gap-1 sm:hidden text-sm font-medium text-muted-foreground mx-auto mb-2">
                        Page <span className="text-foreground">1</span> of 3
                    </div>
                    <div className="flex items-center gap-2 justify-between w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="h-8 md:px-3" disabled>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <div className="hidden sm:flex items-center gap-1">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-muted font-medium text-foreground">1</Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted/50 hover:text-foreground">2</Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted/50 hover:text-foreground">3</Button>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 md:px-3">
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedCount} role(s)?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedCount} selected role(s)? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={handleDeleteSelected}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
