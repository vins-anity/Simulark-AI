"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-32 bg-brand-charcoal text-brand-sand-light relative overflow-hidden">
      {/* Background Grid - Inverted */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff20_1px,transparent_1px),linear-gradient(to_bottom,#ffffff20_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <h2 className="text-5xl md:text-7xl font-poppins font-bold tracking-tighter mb-8 text-white">
          Ready to build?
        </h2>
        <p className="text-xl font-lora text-white/70 max-w-2xl mx-auto mb-12">
          Stop drawing static boxes. Start architecting intelligent, executable
          systems.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link href="/auth/signin">
            <Button
              size="lg"
              className="h-16 px-10 text-lg font-mono uppercase tracking-widest rounded-none bg-brand-orange hover:bg-white hover:text-brand-charcoal transition-all"
            >
              Start Project <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
        <p className="mt-8 font-mono text-xs text-white/30 uppercase tracking-widest">
          No credit card required for beta
        </p>
      </div>
    </section>
  );
}
