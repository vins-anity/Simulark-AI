"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    quote:
      "Simulark turned our spaghetti architecture diagrams into actual, deployable Terraform code. It's not just a drawing tool; it's an engineering multiplier.",
    author: "Sarah Jenkins",
    role: "Principal Architect",
    company: "TechFlow",
    id: "LOG-442",
  },
  {
    quote:
      "The ability to visualize and then instantly create the infrastructure is mind-blowing. It bridges the gap between the whiteboard and the IDE perfectly.",
    author: "David Chen",
    role: "DevOps Lead",
    company: "ScaleUp",
    id: "LOG-891",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-[#faf9f5]">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Header Side */}
          <div className="md:w-1/3">
            <h2 className="text-3xl font-poppins font-bold text-brand-charcoal mb-4">
              Field Notes
            </h2>
            <p className="font-lora text-brand-gray-mid italic">
              Observations from engineering teams deploying with Simulark.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="md:w-2/3 grid gap-8">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white p-8 border border-brand-charcoal/5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="font-mono text-[10px] text-brand-orange mb-4 flex justify-between">
                  <span>ENTRY: {t.id}</span>
                  <span>// VERIFIED USER</span>
                </div>
                <blockquote className="font-lora text-lg text-brand-charcoal leading-relaxed mb-6">
                  "{t.quote}"
                </blockquote>
                <div className="flex items-center gap-4 border-t border-brand-charcoal/5 pt-6">
                  <Avatar className="h-10 w-10 border border-brand-charcoal/10">
                    <AvatarFallback className="bg-brand-charcoal text-white text-xs">
                      {t.author[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-poppins font-bold text-sm text-brand-charcoal">
                      {t.author}
                    </div>
                    <div className="font-mono text-[10px] text-brand-gray-mid">
                      {t.role} @ {t.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
