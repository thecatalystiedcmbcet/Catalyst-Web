"use client"
import AddMemberForm from "@/app/admin/members/add-member-form"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
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

export function getColumns(onEditClick?: (member: Payment) => void): ColumnDef<Payment>[] {
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
      accessorKey: "avatar",
      header: "",
      cell: ({ row }) => {
        const payment = row.original

        return (
          <Avatar size="sm">
            <AvatarImage src={payment.photo} />
            <AvatarFallback>{payment.name.charAt(0)}</AvatarFallback>
          </Avatar>
        )
      },
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "organization",
      header: "Organization",
      cell: ({ row }) => {
        const organizations = row.getValue("organization") as string
        const orgArray = organizations.split(",").map(org => org.trim()).filter(Boolean)

        return (
          <div className="max-w-xs">
            <div className="flex flex-wrap gap-1">
              {orgArray.slice(0, 3).map((org, index) => (
                <Badge key={index} variant="secondary">
                  {org}
                </Badge>
              ))}
            </div>
            {orgArray.length > 3 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {orgArray.slice(3).map((org, index) => (
                  <Badge key={index + 3} variant="secondary">
                    {org}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "roles",
      header: "Roles",
      cell: ({ row }) => {
        const roles = row.getValue("roles") as string
        const rolesArray = roles.split(",").map(role => role.trim()).filter(Boolean)

        return (
          <div className="max-w-xs">
            <div className="flex flex-wrap gap-1">
              {rolesArray.slice(0, 3).map((role, index) => (
                <Badge key={index} variant="outline">
                  {role}
                </Badge>
              ))}
            </div>
            {rolesArray.length > 3 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {rolesArray.slice(3).map((role, index) => (
                  <Badge key={index + 3} variant="outline">
                    {role}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "join_date",
      header: "Join Date",
    },
    {
      accessorKey: "leave_date",
      header: "Leave Date",
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
            setAlert({
              type: "success",
              message: "Member deleted successfully"
            })
            setTimeout(() => {
              window.location.reload()
            }, 1500)
          } else {
            setAlert({
              type: "error",
              message: `Failed to delete member: ${result.error || result.message}`
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

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEditClick?.(payment)}
              >
                <Pencil />
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Member</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this member? This action cannot be undone.
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

// Export for backwards compatibility
export const columns = getColumns()