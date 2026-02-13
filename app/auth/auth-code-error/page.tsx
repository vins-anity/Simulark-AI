import { Icon } from "@iconify/react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";

export default function AuthCodeError() {
  return (
    <AuthLayout
      title="Authentication Error"
      subtitle="We encountered an issue signing you in."
    >
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center border border-red-100">
          <Icon icon="lucide:alert-circle" className="w-8 h-8 text-red-500" />
        </div>

        <p className="text-center text-sm text-brand-charcoal/70 leading-relaxed font-lora">
          This can happen if the sign-in link has expired, was already used, or
          if you cancelled the process.
        </p>

        <Link href="/auth/signin" className="w-full">
          <Button className="w-full bg-brand-charcoal text-brand-sand-light hover:bg-brand-charcoal/90">
            Try Again
          </Button>
        </Link>

        <Link
          href="/"
          className="text-xs text-brand-charcoal/50 hover:text-brand-charcoal transition-colors"
        >
          Return Home
        </Link>
      </div>
    </AuthLayout>
  );
}
