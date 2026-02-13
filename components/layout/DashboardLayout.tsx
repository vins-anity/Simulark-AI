"use client";

import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { useSidebar } from "./SidebarProvider";

interface DashboardLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

function MainContent({
  children,
  fullWidth,
}: {
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  const { isCollapsed } = useSidebar();

  return (
    <main
      className={cn(
        "flex-1 flex flex-col h-screen overflow-hidden",
        fullWidth ? "" : "",
      )}
    >
      {/* Scrollable container - Always full width of the main area */}
      <div className="flex-1 w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-brand-charcoal/20 dark:scrollbar-thumb-white/20 hover:scrollbar-thumb-brand-charcoal/40 dark:hover:scrollbar-thumb-white/40">
        <div
          className={cn(
            "flex-1 flex flex-col min-h-full",
            fullWidth ? "w-full" : "max-w-7xl mx-auto p-4 lg:p-6 w-full",
          )}
        >
          {children}
        </div>
      </div>
    </main>
  );
}

export function DashboardLayout({
  children,
  fullWidth = false,
}: DashboardLayoutProps) {
  return (
    <div className="flex bg-[#faf9f5] dark:bg-zinc-950 h-screen overflow-hidden w-screen transition-colors duration-300">
      <Sidebar />
      <MainContent fullWidth={fullWidth}>{children}</MainContent>
    </div>
  );
}
