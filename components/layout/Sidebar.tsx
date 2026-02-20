"use client";

import { Icon } from "@iconify/react";
import { createBrowserClient } from "@supabase/ssr";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CreateProjectModal } from "@/components/dashboard/CreateProjectModal";
import { UpgradeModal } from "@/components/subscription/UpgradeModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getPlanDetails } from "@/lib/subscription";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarProvider";

const navItems = [
  {
    name: "Mission Control",
    href: "/dashboard",
    icon: "lucide:layout-dashboard",
    shortcut: "⌘1",
    disabled: false,
  },
  {
    name: "Blueprints",
    href: "/dashboard/templates",
    icon: "lucide:book-open",
    shortcut: "⌘2",
    disabled: false,
  },
  {
    name: "Community",
    href: "#",
    icon: "lucide:globe",
    shortcut: null,
    disabled: true,
    badge: "SOON",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [plan, setPlan] = useState("free");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error);
        return;
      }

      window.location.href = "/";
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  useEffect(() => {
    setMounted(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    async function fetchPlan() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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

  if (!mounted) return null;

  return (
    <>
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
      />
      <CreateProjectModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />

      <aside
        className={cn(
          "h-full bg-bg-primary dark:bg-zinc-950 border-r border-border-primary dark:border-white/10 flex flex-col shrink-0 font-sans fixed md:relative z-40 md:z-0 will-change-[width]",
          "transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isCollapsed ? "w-[60px]" : "w-56",
        )}
      >
        <div
          className={cn(
            "flex flex-col h-full w-full overflow-hidden",
            isCollapsed ? "px-2 py-3" : "px-3 py-4",
          )}
        >
          {/* Top Collapse Toggle */}
          <div
            className={cn(
              "flex items-center mb-2 mt-1",
              isCollapsed ? "justify-center" : "justify-start px-1",
            )}
          >
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={toggleSidebar}
                    className="p-1 text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                  >
                    <ChevronLeft
                      className={cn(
                        "w-4 h-4 transition-transform duration-300",
                        isCollapsed ? "rotate-180" : "",
                      )}
                    />
                  </button>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 flex-1">
            <div
              className={cn(
                "px-1 mb-2 flex items-center gap-2 text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest overflow-hidden",
                isCollapsed ? "h-0 opacity-0" : "h-auto opacity-100",
              )}
              style={{
                transition: "height 250ms ease, opacity 200ms ease",
              }}
            >
              <span>{"// NAV"}</span>
              <div className="h-px bg-border-secondary flex-1" />
            </div>

            <TooltipProvider delayDuration={0}>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const isDisabled = item.disabled;

                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        onClick={(e) => isDisabled && e.preventDefault()}
                        className={cn(
                          "flex items-center transition-colors duration-200 group relative overflow-hidden",
                          isCollapsed
                            ? "justify-center p-2 mx-auto w-9 h-9"
                            : "gap-2 px-3 py-2",
                          isActive
                            ? isCollapsed
                              ? "bg-brand-charcoal text-text-inverse"
                              : "bg-bg-tertiary text-text-primary border-l-2 border-brand-orange"
                            : isDisabled
                              ? "text-text-muted cursor-not-allowed opacity-50"
                              : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary",
                          isCollapsed && "rounded-sm",
                        )}
                      >
                        {/* Active indicator line */}
                        {isActive && isCollapsed && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-orange"
                            transition={{ duration: 0.2 }}
                          />
                        )}

                        <Icon
                          icon={item.icon}
                          className={cn(
                            "shrink-0 transition-all duration-200",
                            isCollapsed ? "w-5 h-5" : "w-4 h-4",
                            isActive
                              ? "text-brand-orange"
                              : isDisabled
                                ? "text-text-muted"
                                : "group-hover:text-text-primary",
                          )}
                        />

                        <div
                          className={cn(
                            "flex items-center justify-between overflow-hidden",
                            isCollapsed
                              ? "w-0 opacity-0"
                              : "w-full opacity-100",
                          )}
                          style={{
                            transition:
                              "width 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease",
                          }}
                        >
                          <span
                            className={cn(
                              "font-mono text-xs uppercase tracking-wider font-medium whitespace-nowrap",
                              isDisabled && "line-through",
                            )}
                          >
                            {item.name}
                          </span>
                          <div className="flex items-center gap-2">
                            {item.badge && (
                              <span className="text-[8px] bg-bg-tertiary text-text-muted px-1.5 py-0.5 uppercase tracking-wider font-mono border border-border-secondary">
                                {item.badge}
                              </span>
                            )}
                            {item.shortcut && !isDisabled && (
                              <span className="text-[9px] text-text-muted font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                {item.shortcut}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </TooltipTrigger>
                  </Tooltip>
                );
              })}
            </TooltipProvider>

            {/* New Project */}
            <div className="mt-8">
              <div
                className={cn(
                  "px-1 mb-4 flex items-center gap-2 text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest overflow-hidden",
                  isCollapsed ? "h-0 opacity-0 mb-0" : "h-auto opacity-100",
                )}
                style={{
                  transition:
                    "height 250ms ease, opacity 200ms ease, margin 250ms ease",
                }}
              >
                <span>{"// OPS"}</span>
                <div className="h-px bg-border-secondary flex-1" />
              </div>

              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(true)}
                      className={cn(
                        "w-full flex items-center transition-colors duration-200 group border border-dashed border-border-primary hover:border-brand-orange hover:bg-brand-orange/5",
                        isCollapsed
                          ? "justify-center p-3 h-11 w-11 mx-auto rounded-sm"
                          : "gap-3 p-3",
                      )}
                    >
                      <Plus className="w-4 h-4 text-text-muted group-hover:text-brand-orange transition-colors" />
                      <span
                        className={cn(
                          "font-mono text-xs uppercase tracking-wider font-medium text-text-muted group-hover:text-brand-orange whitespace-nowrap overflow-hidden",
                          isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
                        )}
                        style={{
                          transition:
                            "width 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease",
                        }}
                      >
                        New Architecture
                      </span>
                    </button>
                  </TooltipTrigger>
                </Tooltip>
              </TooltipProvider>
            </div>
          </nav>

          {/* Bottom Actions Utilities */}
          <div className="px-2 space-y-1 pb-4">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/"
                    className={cn(
                      "flex items-center transition-colors duration-200 group relative overflow-hidden text-text-muted hover:text-text-primary hover:bg-bg-tertiary",
                      isCollapsed
                        ? "justify-center p-2 mx-auto w-9 h-9 rounded-sm"
                        : "gap-2 px-3 py-2",
                    )}
                  >
                    <Icon
                      icon="lucide:arrow-left-to-line"
                      className="shrink-0 w-4 h-4"
                    />
                    <span
                      className={cn(
                        "font-mono text-xs uppercase tracking-wider font-medium whitespace-nowrap overflow-hidden",
                        isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
                      )}
                      style={{
                        transition:
                          "width 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease",
                      }}
                    >
                      Exit Area
                    </span>
                  </Link>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* User Section */}
          <div className="mt-auto pt-6 border-t border-border-primary">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex items-center w-full transition-colors duration-200 group outline-none",
                    isCollapsed
                      ? "justify-center"
                      : "gap-3 px-2 py-2 hover:bg-bg-tertiary dark:hover:bg-white/5",
                  )}
                >
                  <div className="w-8 h-8 bg-brand-charcoal dark:bg-zinc-800 flex items-center justify-center border border-brand-charcoal dark:border-zinc-700 shrink-0 group-hover:bg-brand-orange group-hover:border-brand-orange transition-colors">
                    <Icon
                      icon="lucide:box"
                      className="w-4 h-4 text-white stroke-[2.5]"
                    />
                  </div>

                  <div
                    className={cn(
                      "flex flex-col items-start overflow-hidden flex-1",
                      isCollapsed ? "w-0 opacity-0" : "w-full opacity-100",
                    )}
                    style={{
                      transition:
                        "width 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease",
                    }}
                  >
                    <span className="font-mono text-xs font-medium text-text-primary dark:text-gray-200 truncate w-full text-left">
                      User Account
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          plan === "free" ? "bg-text-muted" : "bg-brand-orange",
                        )}
                      />
                      <span className="font-mono text-[9px] uppercase tracking-widest text-text-muted dark:text-gray-500">
                        {planDetails.name} Ticket
                      </span>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "shrink-0",
                      isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
                    )}
                    style={{
                      transition: "width 250ms ease, opacity 200ms ease",
                    }}
                  >
                    <Settings className="w-4 h-4 text-text-muted ml-auto group-hover:text-text-primary dark:text-gray-500 dark:group-hover:text-white transition-colors" />
                  </div>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side={isCollapsed ? "right" : "top"}
                align={isCollapsed ? "end" : "center"}
                className="w-64 p-0 rounded-none border border-border-primary bg-bg-secondary shadow-2xl mb-2"
                sideOffset={10}
              >
                <div className="p-4 bg-bg-tertiary border-b border-border-primary">
                  <div className="font-mono text-xs uppercase tracking-widest text-text-muted mb-2">
                    Current Status
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-poppins font-bold text-text-primary">
                      {planDetails.name} Plan
                    </span>
                    <Badge className="bg-brand-orange text-text-inverse rounded-none font-mono text-[9px] uppercase">
                      Active
                    </Badge>
                  </div>
                  {plan === "free" && (
                    <Button
                      type="button"
                      onClick={() => setShowUpgradeModal(true)}
                      className="w-full h-8 text-[10px] uppercase tracking-widest bg-transparent border border-brand-charcoal text-brand-charcoal hover:bg-brand-orange hover:border-brand-orange hover:text-text-inverse transition-colors"
                    >
                      Upgrade Plan
                    </Button>
                  )}
                </div>

                <div className="p-2 space-y-1">
                  <Link href="/dashboard/settings">
                    <DropdownMenuItem className="rounded-none cursor-pointer font-mono text-xs uppercase tracking-wide hover:bg-bg-tertiary hover:text-text-primary focus:bg-bg-tertiary focus:text-text-primary px-3 py-2">
                      System Configuration
                    </DropdownMenuItem>
                  </Link>

                  <DropdownMenuItem className="rounded-none cursor-pointer font-mono text-xs uppercase tracking-wide hover:bg-bg-tertiary hover:text-text-primary focus:bg-bg-tertiary focus:text-text-primary px-3 py-2">
                    Billing Records
                  </DropdownMenuItem>

                  <div className="h-px bg-border-primary my-1" />

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="rounded-none cursor-pointer font-mono text-xs uppercase tracking-wide hover:bg-red-500 hover:text-white focus:bg-red-500 focus:text-white px-3 py-2 text-red-500"
                  >
                    Terminate Session
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
    </>
  );
}
