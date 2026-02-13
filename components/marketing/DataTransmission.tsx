"use client";

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, AlertCircle } from "lucide-react";

export function DataTransmission() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [signalStrength, setSignalStrength] = useState(0);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    // Simulate signal strength based on email validity
    const strength =
      value.includes("@") && value.includes(".") ? 100 : value.length * 5;
    setSignalStrength(Math.min(strength, 100));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signalStrength === 100) {
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        setEmail("");
        setSignalStrength(0);
      }, 3000);
    } else {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  return (
    <section className="py-32 bg-bg-elevated relative overflow-hidden">
      {/* Schematic Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--text-primary) 1px, transparent 1px),
            linear-gradient(to bottom, var(--text-primary) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Corner Frames */}
      <div className="absolute top-12 left-12 w-24 h-24 border-t border-l border-text-primary/10" />
      <div className="absolute top-12 right-12 w-24 h-24 border-t border-r border-text-primary/10" />
      <div className="absolute bottom-12 left-12 w-24 h-24 border-b border-l border-text-primary/10" />
      <div className="absolute bottom-12 right-12 w-24 h-24 border-b border-r border-text-primary/10" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-orange block mb-2">
              // DATA_TRANSMISSION
            </span>
            <h2 className="text-4xl md:text-5xl font-poppins font-bold text-text-primary mb-4">
              UPLINK{" "}
              <span className="font-serif italic font-light text-text-primary/50">
                CHANNEL
              </span>
            </h2>
            <p className="font-lora text-text-primary/50 text-lg">
              Subscribe to architecture patterns, system updates, and technical
              deep dives.
            </p>
          </motion.div>

          {/* Form Container */}
          <motion.div
            className="border border-text-primary/10 bg-bg-primary/50 backdrop-blur-sm p-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="border border-text-primary/5 p-8">
              {/* Form Header */}
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-text-primary/10">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-brand-orange animate-pulse" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-primary/60">
                    TRANSMISSION_READY
                  </span>
                </div>
                <span className="font-mono text-[9px] uppercase text-text-primary/30">
                  SECURE_CHANNEL
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Identifier Field */}
                <div>
                  <label className="font-mono text-[9px] uppercase tracking-[0.15em] text-text-primary/40 block mb-2">
                    IDENTIFIER (EMAIL)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="operator@organization.com"
                      className="w-full bg-transparent border border-text-primary/20 px-4 py-4 font-mono text-sm text-text-primary placeholder:text-text-primary/20 focus:outline-none focus:border-brand-orange transition-colors"
                      disabled={status === "success"}
                    />
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-text-primary/30" />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-text-primary/30" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-text-primary/30" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-text-primary/30" />
                  </div>
                </div>

                {/* Signal Strength Indicator */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-text-primary/40">
                      SIGNAL_STRENGTH
                    </span>
                    <span className="font-mono text-xs text-text-primary/60">
                      {signalStrength}%
                    </span>
                  </div>
                  <div className="h-1 bg-text-primary/10 relative overflow-hidden">
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-brand-orange"
                      initial={{ width: 0 }}
                      animate={{ width: `${signalStrength}%` }}
                      transition={{ duration: 0.3 }}
                    />
                    {/* Grid markers */}
                    <div className="absolute inset-0 flex">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 border-r border-text-primary/10"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status Display */}
                {status !== "idle" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className={`p-4 border ${status === "success"
                        ? "border-brand-green/30 bg-brand-green/10"
                        : "border-red-500/30 bg-red-500/10"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {status === "success" ? (
                        <Check className="w-4 h-4 text-brand-green" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span
                        className={`font-mono text-xs uppercase ${status === "success"
                            ? "text-brand-green"
                            : "text-red-400"
                          }`}
                      >
                        {status === "success"
                          ? "TRANSMISSION_SUCCESSFUL"
                          : "SIGNAL_WEAK_CHECK_IDENTIFIER"}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={status === "success"}
                  className="w-full h-14 font-mono text-sm uppercase tracking-[0.15em] rounded-none bg-brand-orange hover:bg-bg-secondary hover:text-text-primary text-text-inverse transition-all duration-300 border-0 disabled:opacity-50"
                >
                  <span className="text-text-inverse/40 hover:text-text-primary/40">
                    [
                  </span>
                  <span className="mx-2 flex items-center gap-2">
                    {status === "success" ? "SUBSCRIBED" : "INITIATE_UPLINK"}
                    {status !== "success" && <ArrowRight className="w-4 h-4" />}
                  </span>
                  <span className="text-text-inverse/40 hover:text-text-primary/40">
                    ]
                  </span>
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t border-text-primary/10 flex flex-wrap justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="lucide:shield-check"
                    className="w-4 h-4 text-text-primary/30"
                  />
                  <span className="font-mono text-[9px] uppercase text-text-primary/30">
                    ENCRYPTED_TRANSMISSION
                  </span>
                </div>
                <span className="font-mono text-[9px] uppercase text-text-primary/30">
                  NO_SPAM_GUARANTEE
                </span>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-12 grid grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {[
              { value: "12K+", label: "SUBSCRIBERS" },
              { value: "WEEKLY", label: "FREQUENCY" },
              { value: "0%", label: "SPAM" },
            ].map((stat, index) => (
              <div key={stat.label} className="text-center">
                <span className="font-poppins text-2xl font-bold text-text-primary block">
                  {stat.value}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-text-primary/30">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
