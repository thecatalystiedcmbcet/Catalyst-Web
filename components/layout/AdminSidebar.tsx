"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Award,
  UsersRound,
  ArrowLeft,
  Settings,
  Shield,
  BarChart,
  Rocket,
  BadgeCheck,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

const navItems = [
  {
    title: "Members",
    url: "/admin/members",
    icon: Users,
  },
  {
    title: "Events",
    url: "/admin/events",
    icon: Calendar,
  },
  {
    title: "Achievements",
    url: "/admin/achievements",
    icon: Award,
  },
  {
    title: "Catalyst Execom",
    url: "/admin/catalyst-execom",
    icon: UsersRound,
  },
  {
    title: "µLearn Execom",
    url: "/admin/mulearn-execom",
    icon: UsersRound,
  },
  {
    title: "Web Team",
    url: "/admin/dev-team",
    icon: UsersRound,
  },
  {
    title: "Catalyst Matrix",
    url: "/admin/matrix",
    icon: LayoutDashboard,
  },
  {
    title: "Timeline",
    url: "/admin/timeline",
    icon: Calendar,
  },
  {
    title: "Campus Statistics",
    url: "/admin/campus-statistics",
    icon: BarChart,
  },
  {
    title: "Global Settings",
    url: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Our Pioneers",
    url: "/admin/pioneers",
    icon: Rocket,
  },
  {
    title: "Certificates",
    url: "/admin/certificates",
    icon: BadgeCheck,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      className="border-r border-white/10 bg-black text-white"
      collapsible="icon"
      style={{
        "--sidebar": "#000000",
        "--sidebar-border": "rgba(255,255,255,0.08)",
        "--sidebar-accent": "rgba(255,255,255,0.08)",
        "--sidebar-accent-foreground": "#ffffff",
        "--sidebar-foreground": "rgba(255,255,255,0.6)",
      } as React.CSSProperties}
    >
      {/* Header / Brand */}
      <SidebarHeader className="border-b border-white/5 p-4 flex items-center justify-between bg-black">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black font-primary font-bold text-lg">
            C
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-primary text-sm font-bold tracking-wider text-white">CATALYST</span>
            <span className="text-[10px] text-white/50 tracking-wider">IEDC ADMIN</span>
          </div>
        </div>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/40 font-secondary text-[11px] font-semibold tracking-wider uppercase px-2 mb-2 group-data-[collapsible=icon]:hidden">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-white text-black hover:bg-white hover:text-black font-semibold"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Link href={item.url}>
                        <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-black" : "text-white/60"}`} />
                        <span className="font-secondary group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer / Utilities */}
      <SidebarFooter className="border-t border-white/5 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="View Portfolio Site"
              className="text-white/60 hover:text-white hover:bg-white/5 px-3 py-2"
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4 text-white/60" />
                <span className="font-secondary group-data-[collapsible=icon]:hidden">Back to Website</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
