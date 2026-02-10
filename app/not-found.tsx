import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Icon } from "@iconify/react";

export default function NotFound() {
  return (
    <MarketingLayout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <div className="w-24 h-24 bg-brand-sand-light rounded-full flex items-center justify-center mb-8 border border-brand-charcoal/5 shadow-lg shadow-brand-charcoal/5">
          <Icon
            icon="lucide:file-question"
            className="w-10 h-10 text-brand-orange"
          />
        </div>

        <h1 className="text-4xl md:text-5xl font-poppins font-bold text-brand-charcoal mb-6 tracking-tight">
          Page not found.
        </h1>

        <p className="text-xl font-lora text-brand-charcoal/70 max-w-lg mb-10 leading-relaxed">
          The page you are looking for has been moved, deleted, or possibly
          never existed.
        </p>

        <Link href="/">
          <Button
            size="lg"
            className="bg-brand-charcoal text-brand-sand-light hover:bg-brand-charcoal/90 rounded-full px-8 shadow-xl shadow-brand-charcoal/20 transition-all hover:scale-105 active:scale-95"
          >
            Return Home
          </Button>
        </Link>
      </div>
    </MarketingLayout>
  );
}
