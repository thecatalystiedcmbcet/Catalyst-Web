"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Home,
  Users,
  Calendar,
  Shield,
  Trophy,
  ScrollText,
  Settings,
  UserCircle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Headphones,
  Zap,
  User,
  LogOut,
} from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

// ─── Nav structure ────────────────────────────────────────────────────────────
type NavChild = { title: string; url: string }
type NavItem = {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  children?: NavChild[]
}

const mainNav: NavItem[] = [
  { title: "Dashboard", url: "/admin", icon: Home },
  { title: "Members", url: "/admin/members", icon: Users },
  { title: "Events", url: "/admin/events", icon: Calendar },
  { title: "Roles", url: "/admin/roles", icon: Shield },
  { title: "Achievements", url: "/admin/achievements", icon: Trophy },
  { title: "Logs", url: "/admin/logs", icon: ScrollText },
]

// ─── Expandable menu item ─────────────────────────────────────────────────────
function NavItemRow({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const isActive =
    item.url === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(item.url)

  const hasChildren = item.children && item.children.length > 0
  const isChildActive = hasChildren
    ? item.children!.some((c) => pathname === c.url)
    : false

  const [open, setOpen] = React.useState(isActive || isChildActive)

  if (hasChildren) {
    return (
      <SidebarMenuItem>
        {/* Parent button */}
        <SidebarMenuButton
          tooltip={item.title}
          isActive={isActive || isChildActive}
          onClick={() => !isCollapsed && setOpen((v) => !v)}
          className="justify-between "
        >
          <span className="flex items-center gap-2">
            {React.createElement(item.icon, { className: "size-4 shrink-0" })}
            <span>{item.title}</span>
          </span>
          {!isCollapsed && (
            <ChevronDown
              className={cn(
                "size-3.5 shrink-0 text-sidebar-foreground/50 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          )}
        </SidebarMenuButton>

        {/* Sub-items — only in expanded desktop mode */}
        {!isCollapsed && open && (
          <SidebarMenuSub>
            {item.children!.map((child) => (
              <SidebarMenuSubItem key={child.title}>
                <SidebarMenuSubButton
                  asChild
                  isActive={pathname === child.url}
                >
                  <Link href={child.url}>{child.title}</Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
        <Link href={item.url} className="flex items-center gap-2">
          {React.createElement(item.icon, { className: "size-4 shrink-0" })}
          <span>{item.title}</span>
          {item.badge && (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-accent-foreground/10 px-1.5 text-[10px] font-semibold text-sidebar-accent-foreground">
              {item.badge}
            </span>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

// ─── Main sidebar ─────────────────────────────────────────────────────────────
export function AppSidebar() {
  const { state, toggleSidebar, isMobile } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon">
      {/* ── Header ─────────────────────────────────────────────── */}
      <SidebarHeader className="w-full border-b h-16 flex items-center">
        <div className={cn("flex items-center w-full h-full", isCollapsed ? "justify-center" : "justify-between gap-3")}>
          {/* Logo mark — clicks open the sidebar when collapsed */}
          <button
            onClick={toggleSidebar}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            title={isCollapsed ? "Open sidebar" : ""}
          >
            {isCollapsed ? (
              <ChevronRight className="size-6 text-foreground" />
            ) : (
              <Image
                src="/favicon.png"
                alt="Catalyst Logo"
                width={28}
                height={28}
                className="shrink-0 rounded-md invert dark:invert-0 transition-all"
              />
            )}
            {(!isCollapsed ) && (
              <span className="text-sm font-bold tracking-tight text-foreground">
                Catalyst Admin Panel
              </span>
            )}
          </button>

          {/* Close button — only visible when sidebar is expanded */}
          {!isCollapsed && (
            <button
              onClick={toggleSidebar}
              title="Close sidebar"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            >
              <ChevronLeft className="size-4" />
            </button>
          )}
        </div>
      </SidebarHeader>



      {/* ── Main content ───────────────────────────────────────── */}
      <SidebarContent className="gap-0">
        {/* Main nav */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <NavItemRow key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      {/* ── Footer ────────────────────────────── */}
      {!isCollapsed && (
        <SidebarFooter className="p-4 border-t mt-auto">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-semibold truncate">Admin</span>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground shrink-0">
              <ThemeToggle />
              <form action="/api/v1/auth/logout" method="POST">
                <button
                  type="submit"
                  title="Sign out"
                  className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted hover:text-foreground transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </SidebarFooter>
      )}

      {/* Drag rail for collapsing on desktop */}
      <SidebarRail />
    </Sidebar>
  )
}