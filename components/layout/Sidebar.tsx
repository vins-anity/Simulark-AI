"use client";

import {
  BookOpen,
  LayoutDashboard,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  Plus,
  Box,
  Layers,
  FileCode
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { getPlanDetails } from "@/lib/subscription";
import { useSidebar } from "./SidebarProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@iconify/react";

const navItems = [
  { name: "Mission Control", href: "/dashboard", icon: "lucide:layout-dashboard" },
  { name: "Blueprints", href: "/dashboard/templates", icon: "lucide:book-open" },
  // { name: "Archives", href: "/dashboard/projects", icon: "lucide:archive" }, // Future
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function fetchPlan() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("users")
          .select("subscription_tier")
          .eq("user_id", user.id)
          .single();
        if (data?.subscription_tier) {
          setPlan(data.subscription_tier);
        }
      }
    }
    fetchPlan();
  }, []);

  const planDetails = getPlanDetails(plan);

  return (
    <aside className={cn(
      "h-screen sticky top-0 z-30 bg-[#faf9f5] border-r border-brand-charcoal/10 transition-all duration-300 ease-in-out flex flex-col shrink-0 relative font-sans",
      isCollapsed ? "w-20" : "w-72"
    )}>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "absolute -right-3 top-8 z-50 bg-white border border-brand-charcoal/10 rounded-none p-1 shadow-sm hover:bg-brand-charcoal hover:text-white transition-all duration-300 flex items-center justify-center h-6 w-6 text-brand-charcoal",
          isCollapsed ? "rotate-180" : ""
        )}
      >
        <ChevronLeft className="w-3 h-3" />
      </button>

      {/* Header */}
      <div className={cn(
        "flex flex-col h-full w-full overflow-hidden",
        isCollapsed ? "px-3 py-6" : "px-6 py-8"
      )}>
        <div className={cn("flex items-center mb-12 h-10 shrink-0", isCollapsed ? "justify-center" : "")}>
          <Link href="/" className="flex items-center gap-3 group">
            <div className={cn(
              "border border-brand-charcoal bg-brand-charcoal flex items-center justify-center text-white transition-all duration-300 group-hover:bg-brand-orange group-hover:border-brand-orange",
              isCollapsed ? "w-10 h-10" : "w-8 h-8"
            )}>
              <Icon icon="lucide:box" className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-poppins font-bold text-lg tracking-tight leading-none group-hover:text-brand-orange transition-colors">SIMULARK</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-brand-charcoal/50 leading-none mt-0.5">Architecture Engine</span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 flex-1">
          {!isCollapsed && (
            <div className="px-1 mb-4 flex items-center gap-2 text-[10px] font-mono font-bold text-brand-charcoal/40 uppercase tracking-widest">
              <span>// SYSTEM NAVIGATION</span>
              <div className="h-px bg-brand-charcoal/10 flex-1" />
            </div>
          )}

          <TooltipProvider delayDuration={0}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center transition-all duration-200 group relative",
                        isCollapsed ? "justify-center p-3 rounded-lg mx-auto" : "gap-3 px-4 py-3 border-r-2",
                        isActive
                          ? isCollapsed
                            ? "bg-brand-charcoal text-white rounded-none"
                            : "border-brand-orange bg-brand-charcoal/5 text-brand-charcoal"
                          : "border-transparent text-brand-charcoal/60 hover:text-brand-charcoal hover:bg-brand-charcoal/5"
                      )}
                    >
                      <Icon
                        icon={item.icon}
                        className={cn(
                          "shrink-0 transition-colors",
                          isCollapsed ? "w-5 h-5" : "w-4 h-4",
                          isActive ? "text-brand-orange" : "group-hover:text-brand-charcoal"
                        )}
                      />
                      {!isCollapsed && (
                        <span className="font-mono text-xs uppercase tracking-wider font-medium">
                          {item.name}
                        </span>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" className="font-mono text-xs uppercase rounded-none border-brand-charcoal">
                      <p>{item.name}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </TooltipProvider>

          {/* New Project Action */}
          <div className={cn("mt-8", isCollapsed ? "px-0" : "px-0")}>
            {!isCollapsed && (
              <div className="px-1 mb-4 flex items-center gap-2 text-[10px] font-mono font-bold text-brand-charcoal/40 uppercase tracking-widest">
                <span>// OPERATIONS</span>
                <div className="h-px bg-brand-charcoal/10 flex-1" />
              </div>
            )}
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/dashboard/templates">
                    <button className={cn(
                      "w-full flex items-center transition-all duration-200 group border border-dashed border-brand-charcoal/20 hover:border-brand-orange/50 hover:bg-brand-orange/5",
                      isCollapsed ? "justify-center p-3 h-12 w-12 mx-auto" : "gap-3 p-3"
                    )}>
                      <div className={cn(
                        "flex items-center justify-center text-brand-charcoal/60 group-hover:text-brand-orange transition-colors",
                        isCollapsed ? "" : ""
                      )}>
                        <Plus className="w-4 h-4" />
                      </div>
                      {!isCollapsed && (
                        <span className="font-mono text-xs uppercase tracking-wider font-medium text-brand-charcoal/60 group-hover:text-brand-orange">
                          New Architecture
                        </span>
                      )}
                    </button>
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="font-mono text-xs uppercase rounded-none border-brand-charcoal">
                    <p>New Architecture</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </nav>

        {/* Footer / Settings */}
        <div className="mt-auto pt-6 border-t border-brand-charcoal/5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "flex items-center w-full transition-all duration-200 group outline-none",
                isCollapsed ? "justify-center" : "gap-3 px-2 py-2 hover:bg-brand-charcoal/5"
              )}>
                <div className="w-8 h-8 bg-brand-charcoal text-white flex items-center justify-center font-serif italic text-sm border border-brand-charcoal">
                  {/* User Initials Placeholder - Could be from context */}
                  U
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="font-mono text-xs font-medium text-brand-charcoal truncate w-full text-left">User Account</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        plan === 'free' ? "bg-brand-gray-mid" : "bg-brand-orange"
                      )} />
                      <span className="font-mono text-[9px] uppercase tracking-widest text-brand-charcoal/50">
                        {planDetails.name} Ticket
                      </span>
                    </div>
                  </div>
                )}
                {!isCollapsed && (
                  <Settings className="w-4 h-4 text-brand-charcoal/20 ml-auto group-hover:text-brand-charcoal transition-colors" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side={isCollapsed ? "right" : "top"}
              align={isCollapsed ? "end" : "center"} // Align center when expanded to stay above/near
              className="w-64 p-0 rounded-none border border-brand-charcoal bg-white shadow-2xl mb-2"
              sideOffset={10}
            >
              <div className="p-4 bg-[#faf9f5] border-b border-brand-charcoal/10">
                <div className="font-mono text-xs uppercase tracking-widest text-brand-charcoal/50 mb-2">Current Status</div>
                <div className="flex justify-between items-center">
                  <span className="font-poppins font-bold text-brand-charcoal">{planDetails.name} Plan</span>
                  <Badge className="bg-brand-orange text-white rounded-none font-mono text-[9px] uppercase">Active</Badge>
                </div>
              </div>
              <div className="p-2 space-y-1">
                <Link href="/dashboard/settings">
                  <DropdownMenuItem className="rounded-none cursor-pointer font-mono text-xs uppercase tracking-wide hover:bg-brand-charcoal hover:text-white focus:bg-brand-charcoal focus:text-white px-3 py-2">
                    System Configuration
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem className="rounded-none cursor-pointer font-mono text-xs uppercase tracking-wide hover:bg-brand-charcoal hover:text-white focus:bg-brand-charcoal focus:text-white px-3 py-2">
                  Billing Records
                </DropdownMenuItem>
                <div className="h-px bg-brand-charcoal/10 my-1" />
                <DropdownMenuItem className="rounded-none cursor-pointer font-mono text-xs uppercase tracking-wide hover:bg-red-500 hover:text-white focus:bg-red-500 focus:text-white px-3 py-2 text-red-500">
                  Terminate Session
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}
