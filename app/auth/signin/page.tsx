"use client";

import { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { OAuthButton } from "@/components/auth/OAuthButton";
import { createBrowserClient } from "@supabase/ssr";

export default function SignInPage() {
    const [loading, setLoading] = useState<"github" | "google" | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (provider: "github" | "google") => {
        try {
            setLoading(provider);
            setError(null);

            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
            setError("Failed to initiate login. Please try again.");
            setLoading(null);
        }
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Sign in to continue to your dashboard"
        >
            {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <OAuthButton
                    provider="github"
                    onClick={() => handleLogin("github")}
                    loading={loading === "github"}
                />
                <OAuthButton
                    provider="google"
                    onClick={() => handleLogin("google")}
                    loading={loading === "google"}
                />
            </div>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-brand-gray-light" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white/50 backdrop-blur-sm px-2 text-brand-gray-mid">
                        Secure Access
                    </span>
                </div>
            </div>
        </AuthLayout>
    );
}
