"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

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
    if (!confirm(`Are you sure you want to delete ${selectedCount} member(s)?`)) {
      return
    }

    const { deleteMember } = await import("@/app/admin/members/delete-member")

    // Delete all selected members
    const deletePromises = selectedRows.map((row) => {
      const rowData = row.original as any
      return deleteMember(rowData.id || rowData.$id)
    })

    try {
      const results = await Promise.all(deletePromises)
      const failed = results.filter(r => !r.success)

      if (failed.length > 0) {
        alert(`Failed to delete ${failed.length} member(s)`)
      } else {
        alert(`Successfully deleted ${selectedCount} member(s)`)
      }

      // Refresh the page to update the table
      window.location.reload()
    } catch (error) {
      console.error("Delete error:", error)
      alert("An error occurred while deleting members")
    }
  }

  return (
    <div className="space-y-4">
      {selectedCount > 0 && (
        <div className="flex items-center justify-between rounded-md border bg-muted/50 p-3">
          <span className="text-sm text-muted-foreground">
            {selectedCount} row(s) selected
          </span>
          <button
            onClick={handleDeleteSelected}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-4 py-2"
          >
            Delete Selected
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}