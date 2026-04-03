"use client"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Member = {
  id: string

  name: string
  phone: string
  photo: string
  email: string
  organization: string
  roles: string
  join_date: string
  leave_date: string
}

export function getColumns(onEditClick?: (member: Member) => void): ColumnDef<Member>[] {
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
    }
    ,
    {
      accessorKey: "member",
      header: () => <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Member</span>,
      cell: ({ row }) => {
        const payment = row.original

        return (
          <div className="flex items-center gap-3 py-1">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src={payment.photo} />
              <AvatarFallback className="bg-muted text-xs">{payment.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">{payment.name}</span>
              <span className="text-xs text-muted-foreground mt-1">{payment.email}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "organization",
      header: () => <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Organization</span>,
      cell: ({ row }) => {
        const organizations = row.getValue("organization") as string
        const orgArray = organizations.split(",").map(org => org.trim()).filter(Boolean)
        const primaryOrg = orgArray[0] || "Unknown"

        return (
          <div className="flex flex-col py-1">
             <span className="text-sm">{primaryOrg}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "roles",
      header: () => <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Roles</span>,
      cell: ({ row }) => {
        const roles = row.getValue("roles") as string
        const rolesArray = roles.split(",").map(role => role.trim()).filter(Boolean)

        return (
          <div className="flex flex-wrap gap-1.5 py-1">
              {rolesArray.map((role, index) => (
                <Badge key={index} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-medium px-2 py-0 border-border">
                  {role}
                </Badge>
              ))}
          </div>
        )
      },
    },
    {
      accessorKey: "join_date",
      header: () => <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Join Date</span>,
      cell: ({ row }) => {
        const dateString = row.getValue("join_date") as string;
        let formattedDate = dateString;
        try {
            if (dateString) {
                const date = new Date(dateString);
                formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
            }
        } catch(e) {}
        return <div className="text-sm py-1 font-medium">{formattedDate}</div>
      }
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const payment = row.original
        const [isDeleting, setIsDeleting] = useState(false)
        const [alert, setAlert] = useState<{
          type: "success" | "error"
          message: string
        } | null>(null)

        const handleDelete = async () => {
          setIsDeleting(true)
          const { deleteMember } = await import("@/app/admin/members/delete-member")

          const result = await deleteMember(payment.id)

          if (result.success) {
            postActionLog({
              action: "Deleted Member",
              entity_type: "member",
              entity_id: payment.id,
              entity_name: `Deleted member ${payment.name}`,
              status: "success",
              details: `Name: ${payment.name} | Email: ${payment.email} | Roles: ${payment.roles}`,
            })
            setAlert({
              type: "success",
              message: "Member deleted successfully"
            })
            setTimeout(() => {
              window.location.reload()
            }, 1500)
          } else {
            postActionLog({
              action: "Deleted Member",
              entity_type: "member",
              entity_id: payment.id,
              entity_name: `Failed to delete member ${payment.name}`,
              status: "error",
              details: result.error ?? "Delete failed",
            })
            setAlert({
              type: "error",
              message: `Failed to delete member: ${result.error}`
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

            <div className="flex items-center gap-1">
              <AlertDialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-white">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem onClick={() => onEditClick?.(payment)} className="cursor-pointer">
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Edit User</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete User</span>
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Member</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this member? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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