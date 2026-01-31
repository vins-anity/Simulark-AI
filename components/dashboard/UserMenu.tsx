"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getAvatarUrl } from "@/lib/utils/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@iconify/react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export function UserMenu() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });
    }, []);

    const handleSignOut = async () => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        await supabase.auth.signOut();
        router.refresh();
        router.push("/");
    };

    if (!user) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border border-brand-charcoal/10">
                        <AvatarImage src={user.user_metadata?.avatar_url || getAvatarUrl(user.email || "User")} alt={user.user_metadata?.full_name || "User"} />
                        <AvatarFallback className="bg-brand-charcoal text-brand-sand-light font-serif italic">
                            {user.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-brand-sand-light/95 backdrop-blur-md border border-brand-charcoal/10 shadow-xl rounded-xl" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none font-poppins text-brand-charcoal">
                            {user.user_metadata?.full_name || "User"}
                        </p>
                        <p className="text-xs leading-none text-brand-charcoal/60 font-mono">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-brand-charcoal/5" />
                <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer focus:bg-brand-charcoal/5 focus:text-brand-charcoal">
                        <Icon icon="lucide:layout-grid" className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="cursor-pointer focus:bg-brand-charcoal/5 focus:text-brand-charcoal">
                        <Icon icon="lucide:settings" className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/dashboard/templates" className="cursor-pointer focus:bg-brand-charcoal/5 focus:text-brand-charcoal">
                        <Icon icon="lucide:library" className="mr-2 h-4 w-4" />
                        <span>Templates</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-brand-charcoal/5" />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer focus:bg-red-50 focus:text-red-900 text-red-700">
                    <Icon icon="lucide:log-out" className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
