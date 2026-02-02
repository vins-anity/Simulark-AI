"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface MarketingLayoutClientProps {
    children: React.ReactNode;
}

export function MarketingLayoutClient({ children }: MarketingLayoutClientProps) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        getUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    return (
        <div className="min-h-screen bg-brand-sand-light selection:bg-brand-orange/20 selection:text-brand-charcoal font-sans text-brand-charcoal">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 border-b border-brand-charcoal/5 bg-brand-sand-light/80 backdrop-blur-md transition-all duration-300">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-brand-charcoal rounded-full flex items-center justify-center text-brand-sand-light transform group-hover:scale-110 transition-transform duration-300">
                            <span className="font-serif font-bold italic">S</span>
                        </div>
                        <span className="font-poppins font-bold text-xl tracking-tight">Simulark</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-charcoal/80">
                        <Link href="/features" className="hover:text-brand-orange transition-colors">Features</Link>
                        <Link href="/pricing" className="hover:text-brand-orange transition-colors">Pricing</Link>
                        <Link href="/about" className="hover:text-brand-orange transition-colors">About</Link>
                        <Link href="/contact" className="hover:text-brand-orange transition-colors">Contact</Link>
                        {!loading && (
                            <>
                                {user ? (
                                    <UserMenu />
                                ) : (
                                    <>
                                        <div className="w-px h-4 bg-brand-charcoal/20 mx-2" />
                                        <Link href="/auth/signin" className="hover:text-brand-charcoal transition-colors">Sign In</Link>
                                        <Link href="/auth/signin">
                                            <Button size="sm" className="bg-brand-charcoal text-brand-sand-light hover:bg-brand-charcoal/90 rounded-full px-6 shadow-lg shadow-brand-charcoal/20 transition-all hover:scale-105 active:scale-95">
                                                Start Building
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </>
                        )}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-20">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-[#1a1a19] text-brand-sand-light/80 py-24 border-t border-white/5 mt-20">
                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-brand-sand-light rounded-full flex items-center justify-center text-[#1a1a19]">
                                <span className="font-serif font-bold italic text-xs">S</span>
                            </div>
                            <span className="font-poppins font-bold text-lg text-brand-sand-light tracking-tight">Simulark</span>
                        </div>
                        <p className="text-sm leading-relaxed max-w-sm font-light opacity-80">
                            Intelligent backend architecture design for the modern era.
                            Transforming natural language into deployable infrastructure with scholarly precision.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-poppins font-semibold text-brand-sand-light text-sm">Product</h4>
                        <ul className="space-y-2 text-sm font-light">
                            <li><Link href="/features" className="hover:text-brand-orange transition-colors">Features</Link></li>
                            <li><Link href="/pricing" className="hover:text-brand-orange transition-colors">Pricing</Link></li>
                            <li><Link href="/api" className="hover:text-brand-orange transition-colors">API</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-poppins font-semibold text-brand-sand-light text-sm">Company</h4>
                        <ul className="space-y-2 text-sm font-light">
                            <li><Link href="/about" className="hover:text-brand-orange transition-colors">About</Link></li>
                            <li><Link href="/blog" className="hover:text-brand-orange transition-colors">Blog</Link></li>
                            <li><Link href="/careers" className="hover:text-brand-orange transition-colors">Careers</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="container mx-auto px-6 mt-12 pt-8 border-t border-white/10 text-xs font-light opacity-50 flex justify-between items-center">
                    <p>&copy; {new Date().getFullYear()} Simulark Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-brand-sand-light transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-brand-sand-light transition-colors">Terms</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
