"use client";

import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { requestUpgrade } from "@/actions/upgrade";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UpgradeModalProps {
  planName: string;
  description: string;
  features: string[];
  price: string;
  isSpecial?: boolean;
  trigger?: React.ReactNode;
}

export function UpgradeModal({
  planName,
  description,
  features,
  price,
  isSpecial = false,
  trigger,
}: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const emailInput = (
      (e.currentTarget as HTMLFormElement).elements.namedItem(
        "email",
      ) as HTMLInputElement
    )?.value;

    const result = await requestUpgrade(planName, emailInput);

    setIsLoading(false);

    if (!result.success) {
      toast.error("Upgrade Request Failed", {
        description: result.error || "Please try again later.",
      });
      return;
    }

    setOpen(false);

    toast.success("Request Received", {
      description: `We've received your request for the ${planName} plan. Our team will contact you shortly to finalize the upgrade.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Upgrade</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0 border-brand-charcoal/10">
        {/* Header Banner */}
        <div
          className={`p-6 pb-8 text-center relative overflow-hidden ${isSpecial ? "bg-bg-elevated text-text-primary border-b border-brand-charcoal/10" : "bg-bg-tertiary"}`}
        >
          {/* Decorative Pattern */}
          {isSpecial && (
            <div
              className="absolute inset-0 opacity-[0.05] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(#d97757 0.5px, transparent 0.5px)`,
                backgroundSize: "24px 24px",
              }}
            />
          )}

          <div className="relative z-10 space-y-2">
            <div
              className={`text-xs font-mono uppercase tracking-widest opacity-70 ${isSpecial ? "text-brand-orange" : ""}`}
            >
              Unlock Capacity
            </div>
            <h2 className="text-3xl font-bold tracking-tight">{planName}</h2>
            <div className="flex items-baseline justify-center gap-1">
              <span className={`text-lg font-light opacity-70`}>$</span>
              <span
                className={`text-4xl font-black tracking-tighter ${isSpecial ? "text-brand-orange" : ""}`}
              >
                {price}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-mono uppercase tracking-widest opacity-70"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="engineer@company.com"
                required
                className="h-11 font-mono text-sm bg-transparent border-brand-charcoal/20 focus:border-brand-charcoal focus:ring-0 rounded-none"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="text-xs font-mono uppercase tracking-widest opacity-50 mb-2">
                Included Features
              </div>
              <ul className="grid grid-cols-1 gap-2">
                {features.slice(0, 3).map((feat, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-brand-charcoal/80"
                  >
                    <Check
                      className={`w-4 h-4 mt-0.5 shrink-0 ${isSpecial ? "text-brand-orange" : "text-text-primary"}`}
                    />
                    <span>{feat}</span>
                  </li>
                ))}
                {features.length > 3 && (
                  <li className="text-xs text-brand-charcoal/50 italic pl-6">
                    + {features.length - 3} more features...
                  </li>
                )}
              </ul>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className={`w-full h-12 rounded-none font-mono text-xs uppercase tracking-widest transition-all
                                    ${isSpecial ? "bg-brand-orange hover:bg-brand-orange/90 text-white" : "bg-brand-charcoal hover:bg-black text-white dark:bg-white dark:text-brand-charcoal dark:hover:bg-white/90"}
                                `}
              >
                {isLoading ? "Processing..." : "Request Access"}
                {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
              </Button>
            </DialogFooter>
          </form>

          <p className="text-[10px] text-center text-brand-charcoal/40 max-w-xs mx-auto leading-relaxed">
            By submitting, you agree to receive follow-up communication
            regarding your account upgrade. No payment is processed at this
            time.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
