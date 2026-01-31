"use client";

import {
  BookOpen,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { getPlanDetails } from "@/lib/subscription";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Templates", href: "/dashboard/templates", icon: BookOpen },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
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
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#faf9f5] border-r border-[#e5e5e5] px-6 py-8 flex flex-col justify-between z-30">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 bg-brand-charcoal rounded-lg flex items-center justify-center text-brand-sand-light shadow-md">
            <span className="font-serif font-bold italic text-lg">S</span>
          </div>
          <span className="font-poppins font-bold text-xl tracking-tight text-brand-charcoal">
            Simulark
          </span>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          <p className="px-3 text-xs font-semibold text-brand-gray-light uppercase tracking-wider mb-2">
            Main Menu
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-brand-charcoal text-brand-sand-light shadow-sm"
                    : "text-brand-gray-mid hover:bg-brand-charcoal/5 hover:text-brand-charcoal"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-brand-orange" : "text-brand-gray-light"
                  )}
                />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Plan Badge */}
        <div className="mt-8 px-3">
          <div className="p-4 rounded-xl bg-white border border-brand-charcoal/5 shadow-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Current Plan</p>
            <div className="flex items-center justify-between mb-2">
              <span className="font-poppins font-semibold text-brand-charcoal">{planDetails.name}</span>
              <Badge variant="secondary" className="bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20 border-none text-[10px] px-2 py-0.5">
                {plan === 'free' ? 'Free' : 'Premium'}
              </Badge>
            </div>
            <Link href="/pricing" className="text-xs text-brand-charcoal/70 underline hover:text-brand-charcoal">
              Upgrade Plan
            </Link>
          </div>
        </div>
      </div>

      <div>
        <nav className="space-y-1">
          <p className="px-3 text-xs font-semibold text-brand-gray-light uppercase tracking-wider mb-2">
            Quick Actions
          </p>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-brand-gray-mid hover:bg-brand-charcoal/5 hover:text-brand-charcoal transition-all duration-200 group">
            <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center group-hover:bg-brand-charcoal group-hover:border-transparent group-hover:text-brand-sand-light transition-colors">
              <span className="text-xs font-bold leading-none">+</span>
            </div>
            <span className="font-medium">New Project</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}
