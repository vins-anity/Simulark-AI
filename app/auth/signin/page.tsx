"use client";

export const dynamic = "force-dynamic";

import { Icon } from "@iconify/react";
import { createBrowserClient } from "@supabase/ssr";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

// Technical background grid component
function TechnicalBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(26,26,26,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(26,26,26,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Data flow lines - diagonal */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <defs>
          <pattern
            id="diagonal"
            patternUnits="userSpaceOnUse"
            width="60"
            height="60"
          >
            <path
              d="M0 60 L60 0"
              stroke="#1a1a1a"
              strokeWidth="0.5"
              fill="none"
              strokeDasharray="4 8"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diagonal)" />
      </svg>

      {/* Orbital elements */}
      <div className="absolute top-20 right-20 w-64 h-64 border border-brand-charcoal/10 rounded-full" />
      <div className="absolute top-20 right-20 w-48 h-48 border border-brand-charcoal/5 rounded-full" />

      {/* Signal pulse */}
      <div className="absolute bottom-32 left-32 w-3 h-3 bg-brand-orange rounded-full animate-pulse" />
      <div className="absolute bottom-32 left-32 w-3 h-3 bg-brand-orange rounded-full animate-ping opacity-30" />

      {/* Technical brackets decoration */}
      <div className="absolute top-1/4 left-10 text-brand-charcoal/20 font-mono text-xs">
        [ SYS-01 ]
      </div>
      <div className="absolute bottom-1/4 right-10 text-brand-charcoal/20 font-mono text-xs">
        [ SYS-02 ]
      </div>

      {/* Dashed timeline */}
      <div className="absolute left-1/4 top-0 h-full w-px border-l border-dashed border-brand-charcoal/10" />
      <div className="absolute right-1/4 top-0 h-full w-px border-l border-dashed border-brand-charcoal/10" />
    </div>
  );
}

// Architecture diagram visualization
function ArchitectureDiagram() {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center w-96 h-96 relative">
      {/* Central hub */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-brand-orange rounded-lg bg-brand-sand-light flex items-center justify-center z-10">
        <Icon
          icon="lucide:shield-check"
          className="w-8 h-8 text-brand-orange"
        />
      </div>

      {/* Orbiting nodes */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <motion.div
          key={i}
          className="absolute w-10 h-10 border border-brand-charcoal/30 rounded bg-white/80 flex items-center justify-center"
          style={{
            top: `calc(50% + ${Math.sin((angle * Math.PI) / 180) * 120}px)`,
            left: `calc(50% + ${Math.cos((angle * Math.PI) / 180) * 120}px)`,
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Icon
            icon={
              [
                "lucide:database",
                "lucide:server",
                "lucide:cloud",
                "lucide:cpu",
                "lucide:network",
                "lucide:lock",
              ][i]
            }
            className="w-5 h-5 text-brand-charcoal/50"
          />
        </motion.div>
      ))}

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <line
            key={i}
            x1="50%"
            y1="50%"
            x2={`${50 + Math.cos((angle * Math.PI) / 180) * 40}%`}
            y2={`${50 + Math.sin((angle * Math.PI) / 180) * 40}%`}
            stroke="#ff4d00"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.3"
          />
        ))}
      </svg>

      {/* Status labels */}
      <div className="absolute -bottom-4 left-0 right-0 text-center">
        <span className="font-mono text-xs text-brand-charcoal/40 tracking-widest">
          [ ARCHITECTURE VISUALIZATION ]
        </span>
      </div>
    </div>
  );
}

// System status component
function SystemStatus() {
  const [status, setStatus] = useState("ONLINE");

  return (
    <div className="flex items-center gap-2 text-xs font-mono text-brand-charcoal/60">
      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      <span>SYSTEM STATUS:</span>
      <span className="text-brand-charcoal font-semibold">{status}</span>
      <span className="text-brand-charcoal/30">|</span>
      <span>LATENCY: 12ms</span>
    </div>
  );
}

// Brutalist OAuth button
interface BrutalistButtonProps {
  provider: "github" | "google";
  onClick: () => void;
  loading?: boolean;
}

function BrutalistButton({ provider, onClick, loading }: BrutalistButtonProps) {
  const config = {
    github: {
      icon: "ri:github-fill",
      label: "GITHUB",
      description: "OAUTH-2.0",
    },
    google: {
      icon: "ri:google-fill",
      label: "GOOGLE",
      description: "OAUTH-2.0",
    },
  }[provider];

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="group relative w-full flex items-center justify-between px-6 py-4 bg-white border-2 border-brand-charcoal hover:bg-brand-charcoal hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 border border-current flex items-center justify-center">
          {loading ? (
            <Icon icon="eos-icons:loading" className="w-5 h-5 animate-spin" />
          ) : (
            <Icon icon={config.icon} className="w-5 h-5" />
          )}
        </div>
        <div className="text-left">
          <div className="font-mono font-bold tracking-wider text-sm">
            {config.label}
          </div>
          <div className="font-mono text-xs opacity-60">
            {config.description}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 font-mono text-xs">
        <span className="hidden sm:inline">[ INITIALIZE ]</span>
        <Icon
          icon="lucide:arrow-right"
          className="w-4 h-4 group-hover:translate-x-1 transition-transform"
        />
      </div>
    </button>
  );
}

export default function SignInPage() {
  const [loading, setLoading] = useState<"github" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (provider: "github" | "google") => {
    try {
      setLoading(provider);
      setError(null);

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error("Login error:", err);
      setError("AUTHENTICATION_FAILED // RETRY REQUIRED");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-brand-sand-light relative overflow-hidden flex">
      <TechnicalBackground />

      {/* Left side - Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative z-10 border-r border-brand-charcoal/10">
        <div className="relative">
          {/* Technical frame */}
          <div className="absolute -top-8 -left-8 w-8 h-8 border-l-2 border-t-2 border-brand-orange" />
          <div className="absolute -top-8 -right-8 w-8 h-8 border-r-2 border-t-2 border-brand-orange" />
          <div className="absolute -bottom-8 -left-8 w-8 h-8 border-l-2 border-b-2 border-brand-orange" />
          <div className="absolute -bottom-8 -right-8 w-8 h-8 border-r-2 border-b-2 border-brand-orange" />

          <ArchitectureDiagram />
        </div>

        {/* Side labels */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 -rotate-90 origin-center">
          <span className="font-mono text-xs text-brand-charcoal/30 tracking-[0.3em]">
            SIMULARK ENGINE // V1.0
          </span>
        </div>
      </div>

      {/* Right side - Auth */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10">
            {/* ID Badge */}
            <div className="flex items-center gap-3 mb-6">
              <div className="px-2 py-1 bg-brand-charcoal text-white font-mono text-xs">
                MOD-00
              </div>
              <div className="h-px flex-1 bg-brand-charcoal/20" />
              <SystemStatus />
            </div>

            {/* Title */}
            <h1 className="font-poppins text-4xl sm:text-5xl font-bold text-brand-charcoal tracking-tight mb-3">
              Authentication
              <br />
              Gateway
            </h1>

            {/* Subtitle */}
            <p className="font-lora text-lg text-brand-charcoal/70">
              Secure uplink to your architecture workspace
            </p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border-l-4 border-brand-orange font-mono text-sm text-brand-charcoal"
            >
              <div className="flex items-start gap-2">
                <Icon
                  icon="lucide:alert-triangle"
                  className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5"
                />
                <div>
                  <div className="font-bold mb-1">ERROR: {error}</div>
                  <div className="text-xs opacity-70">
                    Check connection and retry authentication sequence.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Auth methods */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-brand-charcoal/50 tracking-wider">
                // SELECT AUTHENTICATION_METHOD
              </span>
            </div>

            <BrutalistButton
              provider="github"
              onClick={() => handleLogin("github")}
              loading={loading === "github"}
            />

            <BrutalistButton
              provider="google"
              onClick={() => handleLogin("google")}
              loading={loading === "google"}
            />
          </div>

          {/* Technical separator */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-brand-charcoal/20" />
            <span className="font-mono text-xs text-brand-charcoal/40">
              [ ENCRYPTED_CHANNEL ]
            </span>
            <div className="h-px flex-1 bg-brand-charcoal/20" />
          </div>

          {/* Security note */}
          <div className="text-center">
            <p className="font-mono text-xs text-brand-charcoal/50 mb-4">
              All connections use TLS 1.3 encryption
            </p>

            <div className="flex items-center justify-center gap-6 text-xs font-mono">
              <Link
                href="/privacy"
                className="text-brand-charcoal/60 hover:text-brand-orange transition-colors border-b border-transparent hover:border-brand-orange"
              >
                / PRIVACY
              </Link>
              <Link
                href="/terms"
                className="text-brand-charcoal/60 hover:text-brand-orange transition-colors border-b border-transparent hover:border-brand-orange"
              >
                / TERMS
              </Link>
              <Link
                href="/"
                className="text-brand-charcoal/60 hover:text-brand-orange transition-colors border-b border-transparent hover:border-brand-orange"
              >
                / RETURN
              </Link>
            </div>
          </div>

          {/* Bottom data */}
          <div className="mt-12 pt-6 border-t border-brand-charcoal/10">
            <div className="flex items-center justify-between font-mono text-[10px] text-brand-charcoal/30">
              <span>SECURE_AUTH_GATEWAY_V2.4</span>
              <span>{new Date().toISOString().split("T")[0]}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
