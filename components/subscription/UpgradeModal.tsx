"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface UpgradeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
    const [currentPlan, setCurrentPlan] = useState("free");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open) {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            async function fetchPlan() {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data } = await supabase
                        .from("users")
                        .select("subscription_tier")
                        .eq("user_id", user.id)
                        .single();
                    if (data?.subscription_tier) {
                        setCurrentPlan(data.subscription_tier);
                    }
                }
                setLoading(false);
            }
            fetchPlan();
        }
    }, [open]);

    const handleUpgrade = (planId: string) => {
        // Placeholder for future Stripe integration
        toast.info(`Selected ${planId.toUpperCase()} plan`, {
            description: "Redirecting to payment provider... (Coming Soon)"
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl bg-[#faf9f5] border-brand-charcoal p-0 gap-0 overflow-hidden">
                <div className="p-6 border-b border-brand-charcoal/10 bg-white">
                    <DialogHeader>
                        <DialogTitle className="font-poppins font-bold text-2xl text-brand-charcoal">
                            Upgrade Your Workspace
                        </DialogTitle>
                        <DialogDescription className="font-lora italic text-brand-gray-mid">
                            Unlock advanced architectural capabilities and higher generation limits.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.values(SUBSCRIPTION_PLANS).map((plan) => {
                        const isCurrent = plan.id === currentPlan;
                        const isPro = plan.id === 'pro';

                        return (
                            <div
                                key={plan.id}
                                className={cn(
                                    "border p-5 flex flex-col relative bg-white transition-all duration-200",
                                    isPro ? "border-brand-orange shadow-md" : "border-brand-charcoal/10 hover:border-brand-charcoal/30",
                                    isCurrent ? "bg-brand-charcoal/5" : ""
                                )}
                            >
                                {isPro && (
                                    <div className="absolute top-0 right-0 bg-brand-orange text-white text-[9px] font-mono font-bold uppercase px-2 py-0.5">
                                        Best Value
                                    </div>
                                )}
                                <div className="mb-4">
                                    <h3 className="font-poppins font-bold text-lg text-brand-charcoal">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <span className="text-2xl font-mono font-bold text-brand-charcoal">${plan.price}</span>
                                        <span className="text-xs text-brand-charcoal/60 font-mono">/mo</span>
                                    </div>
                                    <p className="text-[11px] text-brand-gray-mid mt-2 font-lora italic leading-tight">{plan.description}</p>
                                </div>

                                <ul className="space-y-2 mb-6 flex-1">
                                    {plan.features.slice(0, 6).map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-[10px] text-brand-charcoal/80">
                                            <Check className="w-3 h-3 text-brand-orange shrink-0 mt-0.5" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    variant={isCurrent ? "outline" : "default"}
                                    disabled={isCurrent}
                                    className={cn(
                                        "w-full font-mono text-[10px] uppercase tracking-widest h-9",
                                        isCurrent
                                            ? "border-brand-charcoal/20 text-brand-charcoal cursor-default"
                                            : "bg-brand-charcoal text-white hover:bg-brand-orange border border-transparent"
                                    )}
                                    onClick={() => handleUpgrade(plan.id)}
                                >
                                    {isCurrent ? "Current Plan" : "Upgrade"}
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}
