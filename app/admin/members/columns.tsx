"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar"

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
//   id: string

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.name)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]