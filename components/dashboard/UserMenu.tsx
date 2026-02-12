"use client";

import { Icon } from "@iconify/react";
import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAvatarUrl } from "@/lib/utils/avatar";

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

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

      // Clear any local state
      setUser(null);

      // Force a hard navigation to clear all state
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-none hover:bg-transparent p-0 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 active:scale-100 transition-none"
        >
          <Avatar className="h-10 w-10 rounded-none border border-brand-charcoal will-change-transform">
            <AvatarImage
              src={
                user.user_metadata?.avatar_url ||
                getAvatarUrl(user.email || "User")
              }
              alt={user.user_metadata?.full_name || "User"}
              className="rounded-none"
            />
            <AvatarFallback className="rounded-none bg-brand-charcoal text-brand-sand-light font-mono">
              {user.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 bg-[#faf9f5] border border-brand-charcoal rounded-none shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] p-0"
        align="end"
      >
        <DropdownMenuLabel className="font-normal p-4 border-b border-brand-charcoal/10 bg-brand-charcoal/5">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold font-poppins text-brand-charcoal uppercase tracking-tight">
              {user.user_metadata?.full_name || "User"}
            </p>
            <p className="text-[10px] leading-none text-brand-charcoal/60 font-mono">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <div className="p-2 space-y-1">
          <DropdownMenuItem
            asChild
            className="rounded-none focus:bg-brand-orange/10 focus:text-brand-charcoal data-[highlighted]:bg-brand-orange/10 cursor-pointer"
          >
            <Link href="/dashboard" className="flex items-center py-2 px-2">
              <Icon icon="lucide:layout-grid" className="mr-3 h-4 w-4" />
              <span className="font-mono text-xs uppercase tracking-wider">
                Dashboard
              </span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="rounded-none focus:bg-brand-orange/10 focus:text-brand-charcoal data-[highlighted]:bg-brand-orange/10 cursor-pointer"
          >
            <Link
              href="/dashboard/settings"
              className="flex items-center py-2 px-2"
            >
              <Icon icon="lucide:settings" className="mr-3 h-4 w-4" />
              <span className="font-mono text-xs uppercase tracking-wider">
                Settings
              </span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="rounded-none focus:bg-brand-orange/10 focus:text-brand-charcoal data-[highlighted]:bg-brand-orange/10 cursor-pointer"
          >
            <Link
              href="/dashboard/templates"
              className="flex items-center py-2 px-2"
            >
              <Icon icon="lucide:library" className="mr-3 h-4 w-4" />
              <span className="font-mono text-xs uppercase tracking-wider">
                Templates
              </span>
            </Link>
          </DropdownMenuItem>
        </div>

        <div className="bg-brand-charcoal h-px w-full" />

        <div className="p-2">
          <DropdownMenuItem
            onClick={(e) => handleSignOut(e as unknown as React.MouseEvent)}
            className="rounded-none focus:bg-red-500/10 focus:text-red-700 text-red-600 cursor-pointer data-[highlighted]:bg-red-500/10"
          >
            <div className="flex items-center py-1 px-2">
              <Icon icon="lucide:log-out" className="mr-3 h-4 w-4" />
              <span className="font-mono text-xs uppercase tracking-wider">
                Log out
              </span>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
