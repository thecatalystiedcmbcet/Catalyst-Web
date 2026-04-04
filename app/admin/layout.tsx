import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentUser } from "@/lib/auth";
import { LogOut } from "lucide-react";
import { TopNav } from "@/components/top-nav";
import "./globals.css";
import "./admin.css";

export const metadata: Metadata = {
  title: "Catalyst Admin",
};

/** Admin uses session + internal API loopback; never prerender with empty fallbacks. */
export const dynamic = "force-dynamic";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Full Appwrite validation happens here in Node.js runtime
  const user = await getCurrentUser();

  if (!user) {
    // Session cookie exists (middleware passed us through) but Appwrite says invalid
    redirect("/login");
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <div className="admin-theme">
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <div className="flex flex-col flex-1 min-h-screen overflow-hidden bg-background text-foreground relative">
            <TopNav user={user} />

            <main className="flex-1 p-6 md:p-8 w-full">{children}</main>
          </div>
        </SidebarProvider>
      </div>
    </ThemeProvider>
  );
}
