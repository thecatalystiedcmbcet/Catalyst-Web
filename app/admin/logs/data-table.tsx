"use client"

import * as React from "react"
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ActionLog, getColumns, formatDate } from "./columns"
import { ChevronDown, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DataTableProps {
    data: ActionLog[]
}

export function DataTable({ data }: DataTableProps) {
    const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set())

    const toggleRow = React.useCallback((id: string) => {
        setExpandedRows(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }, [])

    const columns = React.useMemo(
        () => getColumns(expandedRows, toggleRow),
        [expandedRows, toggleRow]
    )

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    return (
        <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden md:block rounded-md border overflow-hidden bg-card">
                <Table>
                    <TableHeader className="bg-muted/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-muted/50 border-b">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="h-10 px-4 text-left align-middle text-xs font-semibold text-muted-foreground">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="[&_tr:last-child]:border-0">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => {
                                const isExpanded = expandedRows.has(row.original.id)
                                const hasDetails = !!row.original.details
                                return (
                                    <React.Fragment key={row.id}>
                                        <TableRow
                                            data-state={row.getIsSelected() && "selected"}
                                            className={`border-b transition-colors hover:bg-muted/30 ${isExpanded ? "bg-muted/20 border-b-0" : ""}`}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} className="p-3 px-4 align-middle text-sm text-foreground">
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>

                                        {/* Collapsible detail row */}
                                        {hasDetails && isExpanded && (
                                            <TableRow className="bg-muted/40 hover:bg-muted/40 border-b">
                                                <TableCell
                                                    colSpan={columns.length}
                                                    className="py-3 px-6"
                                                >
                                                    <div className="flex flex-col gap-1.5">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                            Details
                                                        </p>
                                                        <div className="text-sm text-foreground whitespace-pre-wrap break-words">
                                                            {row.original.details!
                                                                .split(" | ")
                                                                .map((part, i) => (
                                                                    <span key={i} className="inline-block">
                                                                        {i > 0 && (
                                                                            <span className="mx-2 text-muted-foreground select-none">·</span>
                                                                        )}
                                                                        {part}
                                                                    </span>
                                                                ))}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                )
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-32 text-center text-muted-foreground"
                                >
                                    No logs found.
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
                        const log = row.original;
                        const isExpanded = expandedRows.has(log.id);
                        const hasDetails = !!log.details;

                        return (
                            <div key={row.id} className="flex flex-col rounded-xl border bg-card shadow-sm p-4 relative">
                                <div className="flex justify-between items-center mb-3 overflow-hidden">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${log.status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            {log.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                        </div>
                                        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                                            <span className="text-sm font-bold text-foreground shrink-0">{log.action}</span>
                                            <span className="text-xs text-muted-foreground truncate">{log.entity_type} {log.entity_name ? `· ${log.entity_name}` : ''}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2 whitespace-nowrap">{formatDate(log.createdAt)}</span>
                                </div>

                                {log.performed_by && (
                                    <div className="text-xs text-muted-foreground mb-3 pl-9">
                                        By: <span className="font-medium text-foreground">{log.performed_by}</span>
                                    </div>
                                )}

                                {hasDetails && (
                                    <>
                                        {isExpanded && (
                                            <div className="mt-2 mb-3 pl-9">
                                                <div className="rounded-lg bg-muted/40 p-3 text-xs text-foreground whitespace-pre-wrap break-words border border-border">
                                                    {log.details!
                                                        .split(" | ")
                                                        .map((part, i) => (
                                                            <span key={i} className="inline-block">
                                                                {i > 0 && <span className="mx-1.5 text-muted-foreground select-none">·</span>}
                                                                {part}
                                                            </span>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                        <div className="pl-9">
                                            <button
                                                onClick={() => toggleRow(log.id)}
                                                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                                            >
                                                {isExpanded ? (
                                                    <><ChevronDown className="w-3.5 h-3.5" /> Hide Details</>
                                                ) : (
                                                    <><ChevronRight className="w-3.5 h-3.5" /> Show Details</>
                                                )}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="p-8 text-center text-muted-foreground border rounded-xl bg-card">
                        No logs found.
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
        </div>
    )
}
