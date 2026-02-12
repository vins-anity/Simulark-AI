"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  className?: string;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function AnimatedCounter({
  value,
  className = "",
  duration = 2,
  prefix = "",
  suffix = "",
  decimals = 0,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [hasAnimated, setHasAnimated] = useState(false);

  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const display = useTransform(spring, (current) =>
    decimals > 0
      ? current.toFixed(decimals)
      : Math.floor(current).toLocaleString(),
  );

  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (isInView && !hasAnimated) {
      spring.set(value);
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated, spring, value]);

  useEffect(() => {
    const unsubscribe = display.on("change", (latest) => {
      setDisplayValue(latest.toString());
    });
    return () => unsubscribe();
  }, [display]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}

interface StatsCardProps {
  value: number;
  label: string;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delay?: number;
}

export function StatsCard({
  value,
  label,
  className = "",
  prefix = "",
  suffix = "",
  decimals = 0,
  delay = 0,
}: StatsCardProps) {
  return (
    <motion.div
      className={`text-center ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="text-4xl md:text-5xl font-poppins font-bold text-brand-charcoal mb-2">
        <AnimatedCounter
          value={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
        />
      </div>
      <div className="font-mono text-xs uppercase tracking-widest text-brand-gray-mid">
        {label}
      </div>
    </motion.div>
  );
}
