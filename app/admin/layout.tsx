/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, prefer-const, @next/next/no-img-element */
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Bell, Search, User } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = async () => {
      const { supabase } = await import("@/lib/supabaseClient");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session && pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      } else {
        setIsLoading(false);
      }
    };
    checkAuth();

    let subscription: any;
    const setupListener = async () => {
      const { supabase } = await import("@/lib/supabaseClient");
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (!session && pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
      });
      subscription = data.subscription;
    };
    setupListener();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [pathname]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  // Determine current active section for breadcrumb indicator
  let sectionLabel = "Members";
  if (pathname.includes("/admin/events")) {
    sectionLabel = "Events";
  } else if (pathname.includes("/admin/achievements")) {
    sectionLabel = "Achievements";
  } else if (pathname.includes("/admin/catalyst-execom")) {
    sectionLabel = "Catalyst Execom";
  } else if (pathname.includes("/admin/mulearn-execom")) {
    sectionLabel = "µLearn Execom";
  } else if (pathname.includes("/admin/dev-team")) {
    sectionLabel = "Web Team";
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#0A0A0A] text-white overflow-hidden">
        {/* The admin sidebar drawer/collapsible menu */}
        <AdminSidebar />

        {/* Main Content Area */}
        <SidebarInset className="flex flex-col bg-[#0A0A0A] border-l border-white/5 min-h-screen w-full">
          {/* Top Header Row */}
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-white/5 bg-[#0B0B0B]/80 backdrop-blur-md px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all" />
              <div className="h-4 w-[1px] bg-white/10" />
              {/* Breadcrumb Info */}
              <div className="flex items-center gap-2 text-sm font-secondary">
                <span className="text-white/40">Admin</span>
                <span className="text-white/20">/</span>
                <span className="font-medium text-white/80">{sectionLabel}</span>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-4">
              {/* Admin Profile Details */}
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/80">
                  <User className="h-4 w-4" />
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-secondary font-medium text-white/80">Admin User</span>
                  <button 
                    onClick={async () => {
                      const { supabase } = await import("@/lib/supabaseClient");
                      await supabase.auth.signOut();
                      window.location.href = "/admin/login";
                    }}
                    className="text-[10px] text-white/40 font-secondary hover:text-white transition-colors text-left"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Actual Page Body container */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
