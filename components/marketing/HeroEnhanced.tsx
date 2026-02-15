"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { type MouseEvent, useRef } from "react";
import { HeroCanvas } from "@/components/marketing/HeroCanvas";
import { Button } from "@/components/ui/button";

export function HeroEnhanced() {
  const containerRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const xDisplay = useTransform(mouseX, (v) => `X:${Math.round(v)}`);
  const yDisplay = useTransform(mouseY, (v) => `Y:${Math.round(v)}`);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-bg-primary"
      onMouseMove={handleMouseMove}
    >
      {/* Schematic Grid Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary Grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--canvas-grid) 1px, transparent 1px),
              linear-gradient(to bottom, var(--canvas-grid) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Secondary Grid (finer) */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--canvas-grid) 1px, transparent 1px),
              linear-gradient(to bottom, var(--canvas-grid) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      {/* Mouse Tracking Crosshair */}
      <motion.div
        className="absolute pointer-events-none z-0 hidden lg:block"
        style={{
          left: mouseX,
          top: mouseY,
        }}
      >
        <div className="relative -translate-x-1/2 -translate-y-1/2">
          {/* Horizontal line */}
          <div className="absolute w-[100vw] h-px bg-brand-orange/10 -translate-x-1/2" />
          {/* Vertical line */}
          <div className="absolute h-[100vh] w-px bg-brand-orange/10 -translate-y-1/2" />
          {/* Center dot */}
          <div className="w-1 h-1 bg-brand-orange rounded-full" />
        </div>
      </motion.div>

      {/* Mouse Spotlight */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(255, 77, 0, 0.04),
              transparent 80%
            )
          `,
        }}
      />

      {/* Coordinate Display - Top Left */}
      <motion.div
        className="absolute top-6 left-6 font-mono text-[10px] text-brand-charcoal/40 hidden lg:flex flex-col gap-0.5 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span>// SYSTEM_ORIGIN</span>
        <span>GRID: 60x60</span>
        <motion.span className="text-brand-orange">{xDisplay}</motion.span>
        <motion.span className="text-brand-orange">{yDisplay}</motion.span>
      </motion.div>

      {/* Revision Info - Top Right */}
      <motion.div
        className="absolute top-6 right-6 font-mono text-[10px] text-brand-charcoal/40 text-right hidden lg:flex flex-col gap-0.5 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span>// BUILD_INFO</span>
        <span>REV: 2026.02.12</span>
        <span>STATUS: OPERATIONAL</span>
      </motion.div>

      <motion.div
        className="container mx-auto px-6 z-10 text-center max-w-6xl pt-24"
        style={{ y, opacity }}
      >
        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-3 mb-12"
        >
          <span className="w-2 h-2 bg-brand-orange animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-charcoal/60">
            [ BETA_SYSTEM_v0.9.2 ]
          </span>
        </motion.div>

        {/* Main Headline */}
        <div className="space-y-2 mb-8">
          <div className="overflow-hidden">
            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-poppins font-bold tracking-tight text-brand-charcoal leading-[0.95]"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              DESIGN SYSTEMS.
            </motion.h1>
          </div>
          <div className="overflow-hidden">
            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-poppins font-bold tracking-tight leading-[0.95]"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.35,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <span className="text-brand-charcoal/30">NOT</span>{" "}
              <span className="font-serif italic font-light text-brand-charcoal/60">
                diagrams.
              </span>
            </motion.h1>
          </div>
        </div>

        {/* Subhead with technical formatting */}
        <motion.div
          className="max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <p className="text-lg md:text-xl font-lora text-brand-charcoal/60 leading-relaxed">
            From architectural intent to executable infrastructure. Visual
            design that compiles to production-ready systems.
          </p>
        </motion.div>

        {/* Technical Specs Bar */}
        <motion.div
          className="hidden md:flex justify-center gap-12 mb-12 border-y border-brand-charcoal/10 py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {["MODERN_SOLUTIONS", "PROVEN_ARCHITECTURES", "AI_IDE_CONTEXT"].map(
            (spec, i) => (
              <span
                key={spec}
                className="font-mono text-[10px] uppercase tracking-[0.15em] text-brand-charcoal/40"
              >
                {spec}
              </span>
            ),
          )}
        </motion.div>

        {/* CTA Actions - Bracket Style */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Link href="/auth/signin">
            <Button
              size="lg"
              className="group h-14 px-0 text-sm font-mono uppercase tracking-[0.15em] rounded-none bg-brand-charcoal hover:bg-brand-orange text-brand-sand-light transition-all duration-300 border-0"
            >
              <span className="px-4 text-brand-charcoal/40 group-hover:text-white/40 transition-colors">
                [
              </span>
              <span className="px-2">INITIALIZE</span>
              <ArrowRight className="w-4 h-4 mx-2 group-hover:translate-x-1 transition-transform" />
              <span className="px-4 text-brand-charcoal/40 group-hover:text-white/40 transition-colors">
                ]
              </span>
            </Button>
          </Link>
          <Link href="/features">
            <Button
              variant="ghost"
              size="lg"
              className="group h-14 px-0 text-sm font-mono uppercase tracking-[0.15em] rounded-none text-brand-charcoal hover:text-brand-orange hover:bg-transparent transition-all duration-300"
            >
              <span className="px-4 text-brand-charcoal/30 group-hover:text-brand-orange/50">
                [
              </span>
              <span className="px-2">DOCUMENTATION</span>
              <span className="px-4 text-brand-charcoal/30 group-hover:text-brand-orange/50">
                ]
              </span>
            </Button>
          </Link>
        </motion.div>

        {/* Interactive Preview - Technical Interface */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 w-full max-w-5xl mx-auto aspect-[16/9] bg-bg-secondary border border-brand-charcoal/20 relative overflow-hidden"
        >
          {/* Interface Header - Technical */}
          <div className="h-8 border-b border-brand-charcoal/10 bg-brand-sand-light flex items-center px-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 border border-brand-charcoal/30" />
              <div className="w-2.5 h-2.5 border border-brand-charcoal/30" />
              <div className="w-2.5 h-2.5 border border-brand-charcoal/30" />
            </div>
            <div className="mx-auto font-mono text-[9px] uppercase tracking-widest text-brand-charcoal/40">
              simulark_architect — live_preview
            </div>
            <div className="font-mono text-[9px] text-brand-orange">● LIVE</div>
          </div>

          {/* Canvas Area */}
          <div className="absolute inset-0 top-8 flex items-center justify-center bg-bg-primary">
            <HeroCanvas />
          </div>

          {/* Technical Overlays */}
          <div className="absolute top-10 left-3 font-mono text-[8px] text-brand-charcoal/30 uppercase z-20">
            <div>SCALE: 1:1</div>
            <div>GRID: ON</div>
          </div>

          <div className="absolute bottom-3 right-3 font-mono text-[8px] text-brand-charcoal/30 uppercase text-right z-20">
            <div>COORD: WGS84</div>
            <div>LAYER: INFRA_v2</div>
          </div>

          {/* Corner Brackets */}
          <div className="absolute top-8 left-0 w-3 h-3 border-t border-l border-brand-charcoal/20" />
          <div className="absolute top-8 right-0 w-3 h-3 border-t border-r border-brand-charcoal/20" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-brand-charcoal/20" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-brand-charcoal/20" />
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-charcoal/30">
          [ SCROLL ]
        </span>
        <motion.div
          className="w-px h-8 bg-brand-charcoal/20"
          animate={{ scaleY: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ originY: 0 }}
        />
      </motion.div>
    </section>
  );
}
