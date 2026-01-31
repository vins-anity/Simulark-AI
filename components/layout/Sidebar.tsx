"use client";

import {
  BookOpen,
  LayoutDashboard,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr"; // Keep original supabase client
import { getPlanDetails } from "@/lib/subscription"; // Keep original getPlanDetails
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

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Templates", href: "/dashboard/templates", icon: BookOpen },
  // Settings removed from here, will be a dropdown at the bottom
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

  const planDetails = getPlanDetails(plan); // Use original getPlanDetails

  return (
    <aside className={cn(
      "h-screen sticky top-0 z-30 bg-[#faf9f5] border-r border-[#e5e5e5] transition-all duration-300 ease-in-out flex flex-col shrink-0 relative",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Toggle Button - Outside Overflow Area */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "absolute -right-3 top-8 z-50 bg-white border border-[#e5e5e5] rounded-full p-1 shadow-sm hover:bg-gray-50 transition-transform duration-300 flex items-center justify-center h-6 w-6 text-brand-gray-mid hover:text-brand-charcoal",
          isCollapsed ? "rotate-180" : ""
        )}
      >
        <ChevronLeft className="w-3 h-3" />
      </button>

      {/* Content Wrapper - Clips Overflow */}
      <div className={cn(
        "flex flex-col h-full w-full overflow-hidden",
        isCollapsed ? "px-4" : "px-6 py-8"
      )}>
        {/* Header (Logo) */}
        <div className={cn("flex items-center mb-8 h-10 shrink-0", isCollapsed ? "justify-center mt-8" : "")}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-charcoal rounded-lg flex items-center justify-center text-brand-sand-light shadow-md shrink-0">
              <span className="font-serif font-bold italic text-lg">S</span>
            </div>
            <span className={cn(
              "font-poppins font-bold text-xl tracking-tight text-brand-charcoal whitespace-nowrap transition-all duration-300 overflow-hidden",
              isCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"
            )}>
              Simulark
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {!isCollapsed && (
            <p className="px-3 text-xs font-bold text-brand-gray-mid uppercase tracking-wider mb-2 transition-opacity duration-300">
              Main Menu
            </p>
          )}

          <TooltipProvider delayDuration={300}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center rounded-xl transition-all duration-200 group relative overflow-hidden",
                        isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5",
                        isActive
                          ? "bg-brand-charcoal text-brand-sand-light shadow-sm"
                          : "text-brand-gray-mid hover:bg-brand-charcoal/5 hover:text-brand-charcoal"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "transition-transform duration-200 group-hover:scale-110 shrink-0",
                          isCollapsed ? "w-6 h-6" : "w-5 h-5",
                          isActive ? "text-brand-orange" : "text-brand-gray-light"
                        )}
                      />
                      <span className={cn(
                        "font-medium whitespace-nowrap transition-all duration-300 overflow-hidden",
                        isCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"
                      )}>
                        {item.name}
                      </span>
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      <p>{item.name}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </nav>

        {/* Quick Action: New Project */}
        <div className="mt-auto">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className={cn(
                  "w-full flex items-center rounded-xl text-brand-gray-mid hover:bg-brand-charcoal/5 hover:text-brand-charcoal transition-all duration-200 group overflow-hidden",
                  isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5"
                )}>
                  <div className={cn(
                    "rounded-full border border-current flex items-center justify-center group-hover:bg-brand-charcoal group-hover:border-transparent group-hover:text-brand-sand-light transition-colors",
                    isCollapsed ? "w-8 h-8" : "w-5 h-5"
                  )}>
                    <Plus className={cn("font-bold", isCollapsed ? "w-5 h-5" : "w-3 h-3")} />
                  </div>
                  <span className={cn(
                    "font-medium whitespace-nowrap transition-all duration-300 overflow-hidden",
                    isCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"
                  )}>
                    New Project
                  </span>
                </button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">
                  <p>New Project</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Settings & Plan Dropdown */}
        <div className={cn("mt-4 mb-6", isCollapsed ? "flex justify-center" : "px-3")}>
          <DropdownMenu>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <DropdownMenuTrigger asChild>
                  <TooltipTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center rounded-xl transition-all duration-200 group w-full outline-none overflow-hidden",
                        isCollapsed
                          ? "justify-center p-3"
                          : "gap-3 px-3 py-2.5",
                        pathname === "/dashboard/settings"
                          ? "bg-white shadow-sm text-brand-charcoal font-semibold"
                          : "text-brand-gray-mid hover:bg-black/5 hover:text-brand-charcoal",
                      )}
                    >
                      <Settings
                        size={isCollapsed ? 24 : 20}
                        className="group-hover:text-brand-charcoal transition-colors text-brand-gray-mid"
                      />
                      <span
                        className={cn(
                          "whitespace-nowrap transition-all duration-300 overflow-hidden",
                          isCollapsed
                            ? "max-w-0 opacity-0"
                            : "max-w-[200px] opacity-100",
                        )}
                      >
                        Settings
                      </span>
                    </button>
                  </TooltipTrigger>
                </DropdownMenuTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    <p>Settings & Plan</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            <DropdownMenuContent
              side={isCollapsed ? "right" : "top"}
              align={isCollapsed ? "end" : "center"}
              className="w-64 p-2 rounded-2xl glass-card border-white/40 shadow-xl mb-2"
            >
              <div className="p-3 mb-2 rounded-xl bg-gradient-to-br from-brand-orange/5 to-brand-orange/10 border border-brand-orange/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-brand-orange uppercase tracking-wider">
                    Current Plan
                  </span>
                  <Badge className="bg-brand-orange text-white hover:bg-brand-orange border-none text-[10px] px-2 h-5">
                    {planDetails.name}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[11px] text-brand-charcoal/70">
                  <span>Generations</span>
                  <span className="font-mono font-medium">
                    {plan === 'pro' || plan === 'business' ? 'Unlimited' : plan === 'starter' ? '50/day' : '10/day'}
                  </span>
                </div>
              </div>

              <DropdownMenuSeparator className="bg-black/5" />
              <DropdownMenuItem className="rounded-xl focus:bg-black/5 cursor-pointer">
                <Link href="/dashboard/settings" className="flex w-full">
                  General Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl focus:bg-black/5 cursor-pointer">
                Billing & Usage
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-black/5" />
              <DropdownMenuItem className="rounded-xl focus:bg-red-50 focus:text-red-600 text-red-500 cursor-pointer">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside >
  );
}
