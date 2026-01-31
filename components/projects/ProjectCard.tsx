"use client";

import { Box, Clock, ExternalLink, MoreVertical } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils"; // Fixed import

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
  // Simplified Diagram Symbol - Clean, minimal
  const DiagramSymbol = () => (
    <div className="w-full h-full flex items-center justify-center bg-brand-charcoal/[0.02] group-hover:bg-brand-charcoal/[0.04] transition-colors relative overflow-hidden">
      <div className="flex gap-2 relative z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-500">
        <div className="w-6 h-6 rounded-md bg-white border border-brand-charcoal/10" />
        <div className="w-6 h-6 rounded-md bg-brand-orange/10 border border-brand-orange/20" />
        <div className="w-6 h-6 rounded-md bg-white border border-brand-charcoal/10" />
      </div>
    </div>
  );

  return (
    <Link href={`/projects/${id}`} className="block">
      <div className="group relative bg-white border border-brand-charcoal/5 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="h-32 w-full border-b border-brand-charcoal/5">
          <DiagramSymbol />
        </div>

        <div className="p-5 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <h3 className="font-poppins font-bold text-base text-brand-charcoal group-hover:text-brand-orange transition-colors">
                {name}
              </h3>
              <span className="text-[10px] font-medium text-brand-gray-mid flex items-center gap-1.5 mt-1 uppercase tracking-wider">
                <Box size={10} />
                {provider}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2">
            <div className="flex items-center gap-2 text-[10px] text-brand-gray-mid">
              <span>Edited {new Date(updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-brand-charcoal/5 flex items-center justify-center text-brand-charcoal opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <ExternalLink size={12} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
