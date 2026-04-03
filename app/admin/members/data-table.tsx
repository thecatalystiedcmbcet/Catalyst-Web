"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Trash2, ChevronLeft, ChevronRight, Building2, Calendar, Activity, Pencil } from "lucide-react"
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
import { Payment } from "./columns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface DataTableProps<TData extends Payment, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData extends Payment, TValue>({
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
    const { deleteMember } = await import("@/app/admin/members/delete-member")

    // Snapshot member data before deletion
    const memberSnapshots = selectedRows.map((row) => {
      const rowData = row.original as any
      return { id: rowData.id || rowData.$id, name: rowData.name, email: rowData.email, roles: rowData.roles }
    })

    // Delete all selected members
    const deletePromises = memberSnapshots.map((m) => deleteMember(m.id))

    try {
      const results = await Promise.all(deletePromises)
      const failedIndices = results.map((r, i) => (!r.success ? i : -1)).filter(i => i !== -1)
      const succeededSnapshots = memberSnapshots.filter((_, i) => results[i].success)
      const failedSnapshots = memberSnapshots.filter((_, i) => !results[i].success)

      // Single consolidated log entry
      const allSucceeded = failedIndices.length === 0
      const details = memberSnapshots
        .map((m, i) => `${results[i].success ? "✓" : "✗"} ${m.name} (${m.email})${m.roles ? ` — ${m.roles}` : ""}`)
        .join(" | ")

      postActionLog({
        action: "Deleted Members (Bulk)",
        entity_type: "member",
        entity_name: allSucceeded
          ? `Bulk deleted ${succeededSnapshots.length} member(s): ${succeededSnapshots.map(m => m.name).join(", ")}`
          : `Bulk delete: ${succeededSnapshots.length} succeeded, ${failedSnapshots.length} failed`,
        status: allSucceeded ? "success" : failedSnapshots.length === memberSnapshots.length ? "error" : "error",
        details,
      })

      if (failedSnapshots.length > 0) {
        setAlert({
          type: "error",
          message: `Failed to delete ${failedSnapshots.length} of ${selectedCount} member(s). Deleted: ${succeededSnapshots.map(m => m.name).join(", ")}`
        })
        setTimeout(() => { window.location.reload() }, 2000)
      } else {
        setAlert({
          type: "success",
          message: `Successfully deleted ${selectedCount} member(s): ${memberSnapshots.map(m => m.name).join(", ")}`
        })
        setTimeout(() => { window.location.reload() }, 1500)
      }

      setIsDeleteDialogOpen(false)
    } catch (error: any) {
      console.error("Delete error:", error)
      postActionLog({
        action: "Deleted Members (Bulk)",
        entity_type: "member",
        entity_name: `Bulk delete failed for ${memberSnapshots.length} member(s)`,
        status: "error",
        details: `Members: ${memberSnapshots.map(m => m.name).join(", ")} | Error: ${error?.message ?? "Unexpected error"}`,
      })
      setAlert({
        type: "error",
        message: "An error occurred while deleting members"
      })
      setIsDeleting(false)
      setTimeout(() => setAlert(null), 5000)
    }
  }

  return (
    <div className="flex flex-col w-full">
      {alert && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md">
          <Alert
            variant={alert.type === "error" ? "destructive" : "default"}
            className={`shadow-lg bg-zinc-950 border-zinc-800 text-white ${alert.type === "success"
              ? "border-l-4 border-l-green-500"
              : "border-l-4 border-l-red-500"
              }`}
          >
            {alert.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <AlertTitle>{alert.type === "success" ? "Success" : "Error"}</AlertTitle>
            <AlertDescription className="text-zinc-400">{alert.message}</AlertDescription>
          </Alert>
        </div>
      )}

      {selectedCount > 0 && (
        <div className="flex items-center justify-between bg-blue-500/10 border-b border-blue-500/20 px-6 py-3">
          <span className="text-sm font-medium text-blue-400">
            {selectedCount} row(s) selected
          </span>
          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-destructive/10 text-destructive hover:bg-destructive/20 px-4 py-1.5"
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
                  No members found.
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
            const payment = row.original as Payment;
            const orgArray = payment.organization ? payment.organization.split(",").map(org => org.trim()).filter(Boolean) : [];
            const primaryOrg = orgArray[0] || "Unknown";
            
            const rolesArray = payment.roles ? payment.roles.split(",").map(role => role.trim()).filter(Boolean) : [];
            const primaryRole = rolesArray[0] || "None";
            const roleColor = primaryRole.toLowerCase() === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground';

            return (
              <div key={row.id} className="flex flex-col rounded-xl border bg-card shadow-sm p-4 pt-5 relative">
                {/* Header: Avatar, Name, Email, Role */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={payment.photo} />
                      <AvatarFallback className="bg-muted text-xs font-medium text-foreground">{payment.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground">{payment.name}</span>
                      <span className="text-xs text-muted-foreground">{payment.email}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className={`text-[10px] font-bold uppercase px-2 py-0.5 ${roleColor}`}>
                    {primaryRole}
                  </Badge>
                </div>

                {/* Gray info block */}
                <div className="rounded-lg bg-muted/30 p-3 mb-4 grid grid-cols-2 gap-y-3">
                  <div className="col-span-2 flex items-center gap-2 text-xs text-foreground">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-medium">{primaryOrg}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{payment.join_date ? new Date(payment.join_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-foreground font-medium justify-self-end">
                    <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Active</span>
                  </div>
                </div>

                <div className="h-px bg-border w-[calc(100%+2rem)] -ml-4 mb-3"></div>

                {/* Action footer */}
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
            No members found.
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
            <AlertDialogTitle>Delete {selectedCount} member(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} selected member(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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