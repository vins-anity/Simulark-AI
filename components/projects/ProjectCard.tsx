"use client";

import { Box, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  id: string;
  name: string;
  provider: string;
  updatedAt: string;
  className?: string;
  index?: number;
}

export function ProjectCard({
  id,
  name,
  provider,
  updatedAt,
  className,
  index = 0,
}: ProjectCardProps) {
  // Simplified Schematic Symbol
  const SchematicSymbol = () => (
    <div className="w-full h-full flex items-center justify-center bg-brand-charcoal/[0.02] group-hover:bg-brand-orange/5 transition-colors relative overflow-hidden">
      <div className="flex gap-1 relative z-10 opacity-40 group-hover:opacity-100 transition-all duration-300">
        <div className="w-4 h-4 border border-brand-charcoal/20 bg-white" />
        <div className="w-4 h-4 border border-brand-charcoal/20 bg-white" />
        <div className="w-4 h-4 border border-brand-charcoal/20 bg-brand-orange/20" />
      </div>
      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-1/2 w-full h-px bg-brand-charcoal" />
        <div className="absolute left-1/2 h-full w-px bg-brand-charcoal" />
      </div>
    </div>
  );

  const moduleId = `MOD-${(index + 1).toString().padStart(3, "0")}`;

  return (
    <Link href={`/projects/${id}`} className={cn("block group", className)}>
      <div className="relative bg-brand-sand-light border border-brand-charcoal rounded-none overflow-hidden hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all duration-150 flex flex-col h-full">
        {/* Module Header / Badge */}
        <div className="absolute top-0 right-0 z-20 bg-brand-charcoal text-white text-[8px] font-mono px-2 py-0.5 tracking-tighter">
          {moduleId}
        </div>

        <div className="h-16 w-full border-b border-brand-charcoal shrink-0">
          <SchematicSymbol />
        </div>

        <div className="p-3 flex flex-col gap-2 flex-1">
          <div className="flex flex-col">
            <h3 className="font-poppins font-bold text-xs text-brand-charcoal uppercase tracking-tighter line-clamp-1 group-hover:text-brand-orange transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[8px] font-mono text-brand-charcoal/40 uppercase tracking-widest flex items-center gap-1">
                <Box size={8} />
                {provider}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto pt-2 border-t border-brand-charcoal/5">
            <span className="text-[8px] font-mono text-brand-charcoal/30 uppercase tracking-widest">
              LST_MOD: {new Date(updatedAt).toLocaleDateString()}
            </span>
            <div className="text-brand-charcoal opacity-20 group-hover:opacity-100 transition-opacity">
              <ExternalLink size={10} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
