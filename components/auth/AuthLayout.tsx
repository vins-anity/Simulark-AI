import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-brand-sand-light relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-drafting-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md p-8 relative z-10">
        <div className="glass-card p-8 rounded-3xl shadow-2xl shadow-brand-charcoal/5 border border-white/40 backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6 group">
              <h1 className="text-3xl font-poppins font-bold text-brand-charcoal tracking-tight group-hover:opacity-80 transition-opacity">
                Simulark
              </h1>
            </Link>
            <h2 className="text-xl font-lora font-medium text-brand-charcoal mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-brand-gray-mid font-sans">
                {subtitle}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-6">{children}</div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-x-6 text-xs text-brand-gray-mid font-sans">
          <Link
            href="/privacy"
            className="hover:text-brand-charcoal transition-colors"
          >
            Privacy Policy
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
  );
}
