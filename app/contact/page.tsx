"use client";

import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@iconify/react";

export default function ContactPage() {
  return (
    <MarketingLayout>
      <div className="bg-[#faf9f5] min-h-screen">
        <div className="pt-32 pb-24 px-6 container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Info Column */}
            <div className="space-y-12">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-mono text-xs uppercase tracking-widest text-brand-charcoal/60">
                    Signal: Strong
                  </span>
                </div>
                <h1 className="text-5xl font-poppins font-bold text-brand-charcoal mb-6 tracking-tight">
                  Establish Uplink
                </h1>
                <p className="text-xl font-lora text-brand-gray-mid leading-relaxed">
                  Initiate communication with the Simulark core team. We usually
                  respond within 24 operational hours.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 bg-white border border-brand-charcoal/5">
                  <Icon
                    icon="lucide:map-pin"
                    className="w-5 h-5 text-brand-orange mt-1"
                  />
                  <div>
                    <h3 className="font-poppins font-bold text-brand-charcoal">
                      Base of Operations
                    </h3>
                    <p className="font-mono text-sm text-brand-gray-mid mt-1">
                      123 Innovation Drive
                      <br />
                      San Francisco, CA 94103
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white border border-brand-charcoal/5">
                  <Icon
                    icon="lucide:mail"
                    className="w-5 h-5 text-brand-orange mt-1"
                  />
                  <div>
                    <h3 className="font-poppins font-bold text-brand-charcoal">
                      Electronic Mail
                    </h3>
                    <a
                      href="mailto:hello@simulark.com"
                      className="font-mono text-sm text-brand-charcoal hover:text-brand-orange transition-colors mt-1 block"
                    >
                      hello@simulark.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Column */}
            <div className="bg-white border-2 border-brand-charcoal/10 p-8 md:p-12 relative">
              {/* Decorative Corners */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-brand-charcoal" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-brand-charcoal" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-brand-charcoal" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-brand-charcoal" />

              <h2 className="font-mono text-sm uppercase tracking-widest text-brand-charcoal mb-8 border-b border-brand-charcoal/5 pb-4">
                // Transmission Form
              </h2>

              <form className="space-y-6">
                <div className="space-y-2">
                  <label className="font-mono text-xs uppercase text-brand-charcoal/70">
                    Identifier (Name)
                  </label>
                  <Input
                    className="bg-[#faf9f5] border-brand-charcoal/20 focus:border-brand-orange rounded-none h-12 font-mono text-sm"
                    placeholder="J. DOE"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-xs uppercase text-brand-charcoal/70">
                    Contact Frequency (Email)
                  </label>
                  <Input
                    className="bg-[#faf9f5] border-brand-charcoal/20 focus:border-brand-orange rounded-none h-12 font-mono text-sm"
                    placeholder="user@domain.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-xs uppercase text-brand-charcoal/70">
                    Packet Data (Message)
                  </label>
                  <Textarea
                    className="bg-[#faf9f5] border-brand-charcoal/20 focus:border-brand-orange rounded-none min-h-[150px] font-mono text-sm resize-none"
                    placeholder="Enter transmission..."
                  />
                </div>

                <Button className="w-full h-14 bg-brand-charcoal hover:bg-brand-orange text-white rounded-none font-mono uppercase tracking-widest text-xs transition-colors">
                  Transmit Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
