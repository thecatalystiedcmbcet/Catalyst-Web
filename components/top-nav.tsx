"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function TopNav({ user }: { user: any }) {
  return (
    <header data-topnav className="flex h-16 w-full items-center justify-end border-b bg-background px-4 pr-6 shrink-0">

      {/* Right controls */}
      <div className="flex items-center gap-4 md:gap-6">


        {/* User Profile */}
        <button className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left bg-muted/40 rounded-full pl-2 pr-4 py-1.5 border border-border/50">
          <Avatar className="h-8 w-8 border border-background">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {user?.name?.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-semibold leading-none text-foreground mb-1">
              {user?.name || "Admin"}
            </span>
            <span className="text-[11px] text-muted-foreground leading-none">
              {user?.email || "admin@iedc.mbcet"}
            </span>
          </div>
          <ChevronDown className="hidden md:block h-4 w-4 text-muted-foreground ml-2" />
        </button>
      </div>
    </header>
  )
}
