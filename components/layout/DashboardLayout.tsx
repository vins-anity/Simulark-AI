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
        "flex-1 transition-all duration-300 ease-in-out",
        fullWidth ? "h-screen overflow-hidden" : "min-h-screen overflow-y-auto"
      )}
    >
      <div className={cn(
        "h-full",
        fullWidth ? "w-full" : "max-w-7xl mx-auto p-8 lg:p-12"
      )}>
        {children}
      </div>
    </main>
  );
}

export function DashboardLayout({ children, fullWidth = false }: DashboardLayoutProps) {
  return (
    <div className={cn(
      "flex bg-[#faf9f5]",
      fullWidth ? "h-screen overflow-hidden" : "min-h-screen"
    )}>
      <Sidebar />
      <MainContent fullWidth={fullWidth}>{children}</MainContent>
    </div>
  );
}
