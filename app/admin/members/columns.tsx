"use client"
import AddMemberForm from "@/app/admin/members/add-member-form"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal,Pencil } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
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

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string

  name: string
  phone: string
  photo: string
  email: string
  organization: string
  roles:string
  join_date:string
  leave_date:string
}

export const columns: ColumnDef<Payment>[] = [
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
  },
  {
    accessorKey: "roles",
    header: "Roles",
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
    header: "Actions",
    cell: ({ row }) => {
      const payment = row.original

      return (

              <Drawer direction="right" >
                <DrawerTrigger asChild>
                  <Button variant="outline" size="icon"><Pencil/></Button>
                </DrawerTrigger>
                <DrawerContent className="no-scrollbar overflow-y-auto">
                  <AddMemberForm />
                </DrawerContent>
              </Drawer>

      )
    },
  },
]