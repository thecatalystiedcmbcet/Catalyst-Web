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
import { Button } from "@/components/ui/button"
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

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
    defaultDropAnimationSideEffects,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    isReordering?: boolean
    onReorder?: (newData: TData[]) => void
}

function RoleListItemVisual({ role, isDragging, dragAttributes, dragListeners }: any) {
    return (
        <div
            className={`flex flex-col md:flex-row md:items-center justify-between p-4 bg-card border rounded-xl shadow-sm transition-all relative ${isDragging ? "ring-2 ring-primary shadow-2xl border-primary" : "hover:border-primary/30"}`}
        >
            {/* Mobile Drag Handle */}
            <div className="absolute top-4 right-4 md:hidden z-10">
                <button className={`cursor-grab active:cursor-grabbing p-1 rounded-md transition-colors ${isDragging ? 'text-primary bg-primary/10' : 'text-muted-foreground bg-muted/50 hover:text-foreground'}`} {...dragAttributes} {...dragListeners}>
                    <GripVertical className="w-5 h-5" />
                </button>
            </div>

            <div className="flex items-center gap-4">
                {/* Desktop Drag Handle */}
                <button className={`hidden md:block cursor-grab active:cursor-grabbing p-1.5 -ml-1.5 rounded-md transition-colors ${isDragging ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`} {...dragAttributes} {...dragListeners}>
                    <GripVertical className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-3 mb-4 md:mb-0 pr-8 md:pr-0">
                    <div className="bg-primary/10 text-primary p-2 flex items-center justify-center rounded-lg h-10 w-10 shrink-0">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">{role.name}</span>
                    </div>
                </div>
            </div>

            <div className="rounded-lg bg-muted/30 p-3 md:bg-transparent md:p-0 flex items-center gap-2 text-sm text-muted-foreground w-full md:w-auto">
                <Users className="w-4 h-4 shrink-0" />
                <span><strong className="text-foreground">{role.member_count}</strong> {role.member_count === 1 ? 'Member' : 'Members'}</span>
            </div>
        </div>
    )
}

function SortableListItem({ role }: { role: any }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: role.id || role.$id })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 50 : 1,
        position: isDragging ? "relative" as "relative" : undefined,
    }

    return (
        <div ref={setNodeRef} style={style}>
            <RoleListItemVisual 
                role={role} 
                isDragging={false} 
                dragAttributes={attributes} 
                dragListeners={listeners} 
            />
        </div>
    )
}

export function DataTable<TData extends { id?: string; $id?: string; name?: string; member_count?: number }, TValue>({
    columns,
    data,
    isReordering = false,
    onReorder,
}: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [alert, setAlert] = React.useState<{
        type: "success" | "error"
        message: string
    } | null>(null)
    const [activeId, setActiveId] = React.useState<string | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
        },
        getRowId: (row: any) => row.id || row.$id,
    })

    const activeRow = React.useMemo(() => data.find((r: any) => (r.id || r.$id) === activeId), [data, activeId])

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
            const failed = results.filter((r: any) => !r.success)

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

            {selectedCount > 0 && !isReordering && (
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

            {isReordering ? (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={(event) => {
                        setActiveId(event.active.id as string)
                    }}
                    onDragEnd={(event: DragEndEvent) => {
                        setActiveId(null)
                        const { active, over } = event
                        if (active.id !== over?.id && onReorder) {
                            const oldIndex = data.findIndex((item: any) => (item.id || item.$id) === active.id)
                            const newIndex = data.findIndex((item: any) => (item.id || item.$id) === over?.id)
                            if (oldIndex !== -1 && newIndex !== -1) {
                                onReorder(arrayMove(data, oldIndex, newIndex))
                            }
                        }
                    }}
                    onDragCancel={() => {
                        setActiveId(null)
                    }}
                >
                    <SortableContext
                        items={data.map((i: any) => i.id || i.$id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="flex flex-col gap-3 py-2">
                            {data.map((role: any) => (
                                <SortableListItem key={role.id || role.$id} role={role} />
                            ))}
                        </div>
                    </SortableContext>
                    
                    <DragOverlay dropAnimation={{
                        sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } })
                    }}>
                        {activeId && activeRow ? (
                            <RoleListItemVisual 
                                role={activeRow} 
                                isDragging={true} 
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block w-full overflow-x-auto rounded-lg border bg-card">
                        <Table className="w-full">
                            <TableHeader className="bg-muted/50">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id} className="hover:bg-muted/50 data-[state=selected]:bg-muted/50 border-b">
                                        {headerGroup.headers.map((header: any) => (
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
                                    table.getRowModel().rows.map((row: any) => (
                                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="border-b transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted">
                                            {row.getVisibleCells().map((cell: any) => (
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
                            table.getRowModel().rows.map((row: any) => {
                                const role = row.original;
                                return (
                                    <div key={row.id} className="flex flex-col rounded-xl border bg-card shadow-sm p-4 pt-5 relative">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-3 items-center">
                                                <div className="bg-primary/10 text-primary p-2 rounded-lg">
                                                    <Shield className="w-5 h-5" />
                                                </div>
                                                <div className="flex flex-col gap-1 justify-center">
                                                    <span className="text-sm font-bold text-foreground leading-none">{role.name}</span>
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
                </>
            )}

            {/* Table Footer / Pagination Area */}
            {!isReordering && (
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
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <div className="flex items-center gap-1 sm:hidden text-sm font-medium text-muted-foreground mx-auto mb-2">
                        Page <span className="text-foreground">{table.getState().pagination.pageIndex + 1}</span> of {table.getPageCount() || 1}
                    </div>
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
                        <div className="hidden sm:flex items-center gap-1">
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
            )}

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
