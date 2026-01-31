import Link from "next/link";
import { Button } from "@/components/ui/button";

interface LegalLayoutProps {
    children: React.ReactNode;
}

export function LegalLayout({ children }: LegalLayoutProps) {
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
                        <Link href="/pricing" className="hover:text-brand-orange transition-colors">Pricing</Link>
                        <Link href="/docs" className="hover:text-brand-orange transition-colors">Documentation</Link>
                        <Link href="/auth/signin" className="hover:text-brand-charcoal transition-colors">Sign In</Link>
                        <Link href="/dashboard">
                            <Button size="sm" className="bg-brand-charcoal text-brand-sand-light hover:bg-brand-charcoal/90 rounded-full px-6 shadow-lg shadow-brand-charcoal/20 transition-all hover:scale-105 active:scale-95">
                                Start Building
                            </Button>
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-32 pb-24">
                <div className="container mx-auto px-6 max-w-3xl">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-[#1a1a19] text-brand-sand-light/80 py-12 border-t border-white/5">
                <div className="container mx-auto px-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="w-6 h-6 bg-brand-sand-light rounded-full flex items-center justify-center text-[#1a1a19]">
                            <span className="font-serif font-bold italic text-xs">S</span>
                        </div>
                        <span className="font-poppins font-bold text-lg text-brand-sand-light tracking-tight">Simulark</span>
                    </div>
                    <div className="flex justify-center gap-6 text-sm font-light mb-8">
                        <Link href="/" className="hover:text-brand-orange transition-colors">Home</Link>
                        <Link href="/pricing" className="hover:text-brand-orange transition-colors">Pricing</Link>
                        <Link href="/privacy" className="hover:text-brand-orange transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-brand-orange transition-colors">Terms</Link>
                    </div>
                    <p className="text-xs font-light opacity-50">&copy; {new Date().getFullYear()} Simulark Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
