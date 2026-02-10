"use client";

import { Icon } from "@iconify/react";
import { type ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface OAuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  provider: "github" | "google";
  loading?: boolean;
}

const providers = {
  github: {
    icon: "ri:github-fill",
    label: "GitHub",
    className: "bg-[#24292F] text-white hover:bg-[#24292F]/90",
  },
  google: {
    icon: "ri:google-fill",
    label: "Google",
    className:
      "bg-white text-brand-charcoal border border-brand-gray-light hover:bg-gray-50",
  },
};

export function OAuthButton({
  provider,
  loading,
  className,
  ...props
}: OAuthButtonProps) {
  const config = providers[provider];

  return (
    <button
      disabled={loading}
      className={twMerge(
        "relative flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md active:scale-[0.98]",
        config.className,
        className,
      )}
      {...props}
    >
      {loading ? (
        <Icon icon="eos-icons:loading" className="h-5 w-5 animate-spin" />
      ) : (
        <Icon icon={config.icon} className="h-5 w-5" />
      )}
      <span>Continue with {config.label}</span>
    </button>
  );
}
