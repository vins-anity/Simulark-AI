"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface MarketingLayoutClientProps {
  children: React.ReactNode;
}

export function MarketingLayoutClient({
  children,
}: MarketingLayoutClientProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
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

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Prevent hydration mismatch by not rendering auth state until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#faf9f5] selection:bg-brand-orange/20 selection:text-brand-charcoal font-sans text-brand-charcoal flex flex-col">
        <header className="fixed top-0 w-full z-50 border-b border-brand-charcoal/10 bg-[#faf9f5]/90 backdrop-blur-md">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 border border-brand-charcoal bg-brand-charcoal flex items-center justify-center text-white transition-all duration-300 group-hover:bg-brand-orange group-hover:border-brand-orange">
                <Icon icon="lucide:box" className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-poppins font-bold text-lg tracking-tight leading-none group-hover:text-brand-orange transition-colors">
                  SIMULARK
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-brand-charcoal/50 leading-none mt-0.5">
                  Architecture Engine
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {["Features", "Pricing", "About", "Contact"].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="font-mono text-xs uppercase tracking-widest text-brand-charcoal/70 hover:text-brand-orange transition-colors relative group"
                >
                  <span className="opacity-0 group-hover:opacity-100 absolute -left-3 text-brand-orange transition-opacity">
                    /
                  </span>
                  {item}
                </Link>
              ))}
            </nav>

            {/* Placeholder to reserve space */}
            <div className="w-[140px] h-10" />
          </div>
        </header>
        <main className="flex-1 pt-[68px]">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] selection:bg-brand-orange/20 selection:text-brand-charcoal font-sans text-brand-charcoal flex flex-col">
      {/* Command Bar Header */}
      <header className="fixed top-0 w-full z-50 border-b border-brand-charcoal/10 bg-[#faf9f5]/90 backdrop-blur-md">
        {/* Top Status Line */}

        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 border border-brand-charcoal bg-brand-charcoal flex items-center justify-center text-white transition-all duration-300 group-hover:bg-brand-orange group-hover:border-brand-orange">
              <Icon icon="lucide:box" className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-poppins font-bold text-lg tracking-tight leading-none group-hover:text-brand-orange transition-colors">
                SIMULARK
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-brand-charcoal/50 leading-none mt-0.5">
                Architecture Engine
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {["Features", "Pricing", "About", "Contact"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="font-mono text-xs uppercase tracking-widest text-brand-charcoal/70 hover:text-brand-orange transition-colors relative group"
              >
                <span className="opacity-0 group-hover:opacity-100 absolute -left-3 text-brand-orange transition-opacity">
                  /
                </span>
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 min-w-[180px] justify-end">
            {loading ? (
              // Skeleton placeholder during loading - matches actual content size
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-charcoal/10 animate-pulse" />
              </div>
            ) : user ? (
              <div className="w-10 h-10 flex items-center justify-center">
                <UserMenu />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/auth/signin"
                  className="font-mono text-xs uppercase tracking-widest text-brand-charcoal hover:text-brand-orange transition-colors py-2"
                >
                  [ Login ]
                </Link>
                <Link href="/auth/signin">
                  <Button
                    size="sm"
                    className="bg-brand-charcoal text-white hover:bg-brand-orange hover:text-white rounded-none px-6 h-9 border border-brand-charcoal font-mono uppercase tracking-wider text-[10px] transition-all"
                  >
                    Initialize
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-[68px]">{children}</main>

      {/* Grid System Footer */}
      <footer className="bg-white border-t border-brand-charcoal/10 pt-20 pb-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 border-b border-brand-charcoal/5 pb-20">
            <div className="col-span-1 md:col-span-2 space-y-8 pr-12">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-brand-charcoal" />
                <span className="font-poppins font-bold text-xl tracking-tight">
                  SIMULARK
                </span>
              </div>
              <p className="font-lora text-brand-gray-mid max-w-sm">
                The intelligent layer for cloud architecture. Transforming
                natural language processing into executable infrastructure code.
              </p>
              <div className="flex gap-4">
                {["twitter", "github", "linkedin"].map((social) => (
                  <button
                    type="button"
                    key={social}
                    onClick={() => {}}
                    className="w-8 h-8 flex items-center justify-center border border-brand-charcoal/10 hover:border-brand-charcoal hover:bg-brand-charcoal hover:text-white transition-all cursor-pointer"
                  >
                    <Icon icon={`lucide:${social}`} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-mono text-xs uppercase tracking-widest text-brand-charcoal/40 border-b border-brand-charcoal/10 pb-2 mb-4 w-fit">
                {"// Index_01"}
              </h4>
              <ul className="space-y-3 font-mono text-xs text-brand-charcoal/70">
                <li>
                  <Link
                    href="/features"
                    className="hover:text-brand-orange transition-colors"
                  >
                    Capabilities
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-brand-orange transition-colors"
                  >
                    Resource Allocation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="hover:text-brand-orange transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/api"
                    className="hover:text-brand-orange transition-colors"
                  >
                    System API
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="font-mono text-xs uppercase tracking-widest text-brand-charcoal/40 border-b border-brand-charcoal/10 pb-2 mb-4 w-fit">
                {"// Index_02"}
              </h4>
              <ul className="space-y-3 font-mono text-xs text-brand-charcoal/70">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-brand-orange transition-colors"
                  >
                    Origin Log
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="hover:text-brand-orange transition-colors"
                  >
                    Join Unit
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-brand-orange transition-colors"
                  >
                    Establish Uplink
                  </Link>
                </li>
                <li>
                  <Link
                    href="/status"
                    className="flex items-center gap-2 hover:text-brand-orange transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    System Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 font-mono text-[10px] text-brand-charcoal/40 uppercase tracking-widest">
            <p>
              © {new Date().getFullYear()} SIMULARK SYSTEMS INC. [ALL RIGHTS
              RESERVED]
            </p>
            <div className="flex gap-8">
              <Link
                href="/privacy"
                className="hover:text-brand-charcoal transition-colors"
              >
                Privacy Protocol
              </Link>
              <Link
                href="/terms"
                className="hover:text-brand-charcoal transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
