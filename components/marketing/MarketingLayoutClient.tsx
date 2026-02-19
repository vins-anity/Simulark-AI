"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { MarketingThemeToggle } from "./MarketingThemeToggle";

interface MarketingLayoutClientProps {
  children: React.ReactNode;
}

export function MarketingLayoutClient({
  children,
}: MarketingLayoutClientProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);

    // Check for cached user first to prevent flash
    const cachedUser = sessionStorage.getItem("marketing-user");
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
        setLoading(false);
      } catch {
        // Invalid cache, continue with fetch
      }
    }

    const getUser = async () => {
      const {
        data: { user: fetchedUser },
      } = await supabase.auth.getUser();

      setUser(fetchedUser);
      setLoading(false);

      // Cache user to prevent flash on subsequent renders
      if (fetchedUser) {
        sessionStorage.setItem("marketing-user", JSON.stringify(fetchedUser));
      } else {
        sessionStorage.removeItem("marketing-user");
      }
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);

      // Update cache
      if (newUser) {
        sessionStorage.setItem("marketing-user", JSON.stringify(newUser));
      } else {
        sessionStorage.removeItem("marketing-user");
      }
    });

    // Track scroll for header styling
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [supabase]);

  // Prevent hydration mismatch by not rendering auth state until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-bg-primary selection:bg-brand-orange/20 selection:text-brand-charcoal font-sans text-text-primary flex flex-col">
        {/* Command Bar Header - Skeleton */}
        <header className="fixed top-0 w-full z-50 border-b border-brand-charcoal/10 bg-bg-primary">
          {/* Status Bar */}
          <div className="h-6 border-b border-brand-charcoal/5 bg-bg-overlay flex items-center">
            <div className="container mx-auto px-6 flex justify-between items-center">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-charcoal/40 dark:text-white/40">
                // SYSTEM_READY
              </span>
              <div className="flex items-center gap-4">
                <span className="font-mono text-[9px] text-brand-charcoal/30 dark:text-white/30">
                  v0.9.2
                </span>
                <span className="w-1 h-1 bg-brand-orange rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          {/* Main Bar */}
          <div className="container mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 border border-neutral-900 dark:border-white !bg-neutral-900 dark:!bg-transparent flex items-center justify-center text-white transition-all duration-300 group-hover:bg-brand-orange group-hover:border-brand-orange">
                <Icon icon="lucide:box" className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-poppins font-bold text-lg tracking-tight leading-none group-hover:text-brand-orange transition-colors text-brand-charcoal dark:text-white">
                  SIMULARK
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-brand-charcoal/50 dark:text-white/50 leading-none mt-0.5">
                  Architecture Engine
                </span>
              </div>
            </Link>

            {/* Placeholder to reserve space */}
            <div className="w-[140px] h-10" />
          </div>
        </header>
        <main className="flex-1 pt-[84px]">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary selection:bg-brand-orange/20 selection:text-brand-charcoal font-sans text-text-primary flex flex-col">
      {/* Command Bar Header */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-bg-primary/95 backdrop-blur-sm border-b border-brand-charcoal/10 dark:border-white/10"
            : "bg-bg-primary border-b border-brand-charcoal/5 dark:border-white/5"
        }`}
      >
        {/* Status Bar - HUD Style */}
        <div className="h-6 border-b border-brand-charcoal/5 bg-bg-overlay flex items-center">
          <div className="container mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-charcoal/40 dark:text-white/40">
                // SYSTEM_READY
              </span>
              <div className="hidden md:flex items-center gap-4">
                <span className="font-mono text-[8px] uppercase text-brand-charcoal/30 dark:text-white/30">
                  GRID: 60x60
                </span>
                <span className="font-mono text-[8px] uppercase text-brand-charcoal/30 dark:text-white/30">
                  ORIGIN: 0,0
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-[9px] text-brand-charcoal/30 dark:text-white/30">
                BUILD: v0.9.2
              </span>
              <span className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Main Command Bar */}
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 border border-neutral-900 dark:border-white !bg-neutral-900 dark:!bg-transparent flex items-center justify-center text-white transition-all duration-300 group-hover:bg-brand-orange group-hover:border-brand-orange">
              <Icon icon="lucide:box" className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-poppins font-bold text-lg tracking-tight leading-none group-hover:text-brand-orange transition-colors text-brand-charcoal dark:text-white">
                SIMULARK
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-brand-charcoal/50 dark:text-white/50 leading-none mt-0.5">
                Architecture Engine
              </span>
            </div>
          </Link>

          {/* Center - System Info (previously navigation) */}
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase text-brand-charcoal/30 dark:text-white/30">
                SYS_STATUS:
              </span>
              <span className="font-mono text-[9px] uppercase text-brand-green">
                OPERATIONAL
              </span>
            </div>
            <div className="h-4 w-px bg-brand-charcoal/10 dark:bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase text-brand-charcoal/30 dark:text-white/30">
                LATENCY:
              </span>
              <motion.span
                className="font-mono text-[9px] uppercase text-brand-charcoal/50 dark:text-white/50"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                12ms
              </motion.span>
            </div>
          </div>

          {/* Right - Auth Actions */}
          <div className="flex items-center gap-4">
            {loading ? (
              // Skeleton placeholder during loading
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-charcoal/10 animate-pulse" />
              </div>
            ) : user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="hidden md:flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-brand-charcoal/60 hover:text-brand-orange transition-colors"
                >
                  <span className="text-brand-charcoal/30">[</span>
                  <span>DASHBOARD</span>
                  <span className="text-brand-charcoal/30">]</span>
                </Link>
                <div className="w-10 h-10 flex items-center justify-center">
                  <UserMenu />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/signin"
                  className="font-mono text-xs uppercase tracking-widest text-brand-charcoal/70 hover:text-brand-orange transition-colors py-2 px-3"
                >
                  <span className="text-brand-charcoal/30">[</span>
                  <span className="mx-1">LOGIN</span>
                  <span className="text-brand-charcoal/30">]</span>
                </Link>
                <Link href="/auth/signin">
                  <Button
                    size="sm"
                    className="group bg-brand-charcoal text-white dark:bg-transparent dark:text-white dark:border dark:border-white hover:bg-brand-orange hover:text-white rounded-none px-0 h-9 border-0 font-mono uppercase tracking-wider text-[10px] transition-all duration-300"
                  >
                    <span className="px-3 text-white/40 dark:text-white/40 group-hover:text-white/40">
                      [
                    </span>
                    <span className="px-1">INITIALIZE</span>
                    <span className="px-3 text-white/40 dark:text-white/40 group-hover:text-white/40">
                      ]
                    </span>
                  </Button>
                </Link>
              </div>
            )}
            <MarketingThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-[84px]">{children}</main>

      {/* Grid System Footer - Technical Index */}
      <footer className="bg-bg-secondary border-t border-brand-charcoal/10 pt-20 pb-10">
        <div className="container mx-auto px-6">
          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 border-b border-brand-charcoal/5 pb-20">
            {/* System Info */}
            <div className="col-span-1 md:col-span-2 space-y-8 pr-12">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border border-neutral-900 dark:border-white !bg-neutral-900 dark:!bg-transparent flex items-center justify-center text-white transition-all duration-300 group-hover:bg-brand-orange group-hover:border-brand-orange group-hover:text-white">
                  <Icon icon="lucide:box" className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-poppins font-bold text-xl tracking-tight block">
                    SIMULARK
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-brand-charcoal/40">
                    v0.9.2-beta
                  </span>
                </div>
              </div>
              <p className="font-lora text-brand-charcoal/60 max-w-sm leading-relaxed">
                The intelligent layer for cloud architecture. Transforming
                natural language into executable infrastructure.
              </p>

              {/* System Status Indicator */}
              <div className="flex items-center gap-4 p-4 border border-brand-charcoal/10 bg-bg-tertiary">
                <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-brand-charcoal/40 block">
                    SYSTEM STATUS
                  </span>
                  <span className="font-mono text-xs uppercase text-brand-charcoal">
                    ALL SYSTEMS OPERATIONAL
                  </span>
                </div>
              </div>
            </div>

            {/* Index 01 - Resources */}
            <div className="space-y-6">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-charcoal/40 border-b border-brand-charcoal/10 pb-2">
                // INDEX_01
              </h4>
              <ul className="space-y-3 font-mono text-xs text-brand-charcoal/70">
                <li>
                  <Link
                    href="/docs"
                    className="hover:text-brand-orange transition-colors flex items-center gap-2"
                  >
                    <span className="text-brand-charcoal/30">[</span>
                    <span>Documentation</span>
                    <span className="text-brand-charcoal/30">]</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/reference"
                    className="hover:text-brand-orange transition-colors flex items-center gap-2"
                  >
                    <span className="text-brand-charcoal/30">[</span>
                    <span>API Reference</span>
                    <span className="text-brand-charcoal/30">]</span>
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com/simulark"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-orange transition-colors flex items-center gap-2"
                  >
                    <span className="text-brand-charcoal/30">[</span>
                    <span>GitHub</span>
                    <Icon icon="lucide:arrow-up-right" className="w-3 h-3" />
                    <span className="text-brand-charcoal/30">]</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-brand-orange transition-colors flex items-center gap-2"
                  >
                    <span className="text-brand-charcoal/30">[</span>
                    <span>Changelog</span>
                    <span className="text-brand-charcoal/30">]</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Index 02 - Connect */}
            <div className="space-y-6">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-charcoal/40 border-b border-brand-charcoal/10 pb-2">
                // INDEX_02
              </h4>
              <ul className="space-y-3 font-mono text-xs text-brand-charcoal/70">
                <li>
                  <a
                    href="https://twitter.com/simulark"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-orange transition-colors flex items-center gap-2"
                  >
                    <span className="text-brand-charcoal/30">[</span>
                    <span>Twitter</span>
                    <Icon icon="lucide:arrow-up-right" className="w-3 h-3" />
                    <span className="text-brand-charcoal/30">]</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://discord.gg/simulark"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-orange transition-colors flex items-center gap-2"
                  >
                    <span className="text-brand-charcoal/30">[</span>
                    <span>Discord</span>
                    <Icon icon="lucide:arrow-up-right" className="w-3 h-3" />
                    <span className="text-brand-charcoal/30">]</span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:hello@simulark.io"
                    className="hover:text-brand-orange transition-colors flex items-center gap-2"
                  >
                    <span className="text-brand-charcoal/30">[</span>
                    <span>Contact</span>
                    <span className="text-brand-charcoal/30">]</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <p className="font-mono text-[10px] text-brand-charcoal/40 uppercase tracking-widest">
              © {new Date().getFullYear()} SIMULARK SYSTEMS [ALL RIGHTS
              RESERVED]
            </p>

            {/* Legal Links */}
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/40 hover:text-brand-charcoal transition-colors"
              >
                <span className="text-brand-charcoal/20">[</span>
                <span className="mx-1">PRIVACY</span>
                <span className="text-brand-charcoal/20">]</span>
              </Link>
              <Link
                href="/terms"
                className="font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/40 hover:text-brand-charcoal transition-colors"
              >
                <span className="text-brand-charcoal/20">[</span>
                <span className="mx-1">TERMS</span>
                <span className="text-brand-charcoal/20">]</span>
              </Link>
            </div>

            {/* Build Info */}
            <div className="hidden md:flex items-center gap-4">
              <span className="font-mono text-[9px] text-brand-charcoal/30">
                BUILD: 2026.02.12
              </span>
              <span className="font-mono text-[9px] text-brand-charcoal/30">
                ENV: PRODUCTION
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
