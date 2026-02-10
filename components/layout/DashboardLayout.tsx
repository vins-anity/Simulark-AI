"use client";

import { Sidebar } from "./Sidebar";
import { useSidebar } from "./SidebarProvider";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

function MainContent({ children, fullWidth }: { children: React.ReactNode; fullWidth?: boolean }) {
  const { isCollapsed } = useSidebar();

  return (
    <main
      className={cn(
        "flex-1 flex flex-col h-screen overflow-hidden",
        fullWidth ? "" : ""
      )}
    >
      <div className={cn(
        "flex-1 min-h-0 flex flex-col",
        fullWidth ? "w-full" : "max-w-7xl mx-auto p-4 lg:p-6 w-full overflow-y-auto"
      )}>
        {children}
      </div>
    </main>
  );
}

export function DashboardLayout({ children, fullWidth = false }: DashboardLayoutProps) {
  return (
    <div className="flex bg-[#faf9f5] h-screen overflow-hidden w-screen">
      <Sidebar />
      <MainContent fullWidth={fullWidth}>{children}</MainContent>
    </div>
  );
}
