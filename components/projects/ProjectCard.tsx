"use client";

import { Box, Clock, ExternalLink, MoreVertical } from "lucide-react";
import Link from "next/link";
import { cn } from "@/components/canvas/nodes/BaseNode";

interface ProjectCardProps {
  id: string;
  name: string;
  provider: string;
  updatedAt: string;
}

export function ProjectCard({
  id,
  name,
  provider,
  updatedAt,
}: ProjectCardProps) {
  // Simple "Diagram Symbol" - A stylized abstract representation
  const DiagramSymbol = () => (
    <div className="w-full h-full flex items-center justify-center bg-brand-gray-light/30 relative overflow-hidden">
      <div className="absolute inset-0 drafting-grid opacity-20" />
      <div className="flex gap-2 relative z-10">
        <div className="w-8 h-8 rounded-md bg-white/80 border border-white/20 shadow-sm animate-pulse" />
        <div className="w-8 h-8 rounded-md bg-brand-orange/20 border border-brand-orange/10 shadow-sm" />
        <div className="w-8 h-8 rounded-md bg-white/80 border border-white/20 shadow-sm" />
      </div>
      <svg className="absolute inset-0 w-full h-full opacity-5">
        <path
          d="M0 50 Q 50 10, 100 50 T 200 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>
    </div>
  );

  return (
    <div className="group relative glass-card rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 hover:scale-[1.01] border-white/40">
      <div className="h-40 w-full">
        <DiagramSymbol />
      </div>

      <div className="p-5 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <h3 className="font-poppins font-bold text-lg text-foreground group-hover:text-brand-orange transition-colors">
              {name}
            </h3>
            <span className="text-xs font-medium text-brand-gray-mid flex items-center gap-1.5 mt-1">
              <Box size={12} />
              {provider}
            </span>
          </div>
          <button className="p-2 hover:bg-black/5 rounded-full transition-colors text-brand-gray-mid">
            <MoreVertical size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-brand-gray-light pt-4 mt-auto">
          <div className="flex items-center gap-2 text-[10px] text-brand-gray-mid font-medium uppercase tracking-wider">
            <Clock size={12} />
            Updated {new Date(updatedAt).toLocaleDateString()}
          </div>

          <Link
            href={`/projects/${id}`}
            className="flex items-center gap-2 px-3 py-1.5 bg-foreground text-background rounded-lg text-xs font-bold font-poppins hover:bg-brand-orange hover:shadow-lg transition-all duration-300"
          >
            Open
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
