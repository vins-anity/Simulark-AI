"use client";

import { Box, Filter, Plus, Search, ArrowRight, Wand2, Terminal, Cpu, Layout, Activity } from "lucide-react";
import Link from "next/link";
import { getUserProjects } from "@/actions/projects";
import { ProjectCard } from "@/components/projects/ProjectCard";
import type { Project } from "@/lib/schema/graph";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

export default function DashboardPage() {
  const [projects, setProjects] = useState<(Project & { updated_at?: string })[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Client-side fetching to ensure hydration matches and for "live" feel
  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await getUserProjects();
        if (error) setError(error);
        else setProjects(data as any);
      } catch (e) {
        setError("System malfunction");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex flex-col min-h-full font-sans">
      {/* Hero / Focus Section */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-10 mb-20 space-y-12">
        <div className="text-center space-y-6 max-w-3xl px-4">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-brand-charcoal/20" />
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-brand-charcoal/10 text-[10px] font-mono font-bold uppercase tracking-widest text-brand-charcoal/60">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              System Ready
            </div>
            <div className="h-px w-8 bg-brand-charcoal/20" />
          </div>

          <h1 className="text-5xl md:text-7xl font-poppins font-bold tracking-tighter text-brand-charcoal leading-none">
            Welcome to <span className="text-brand-orange">Mission Control</span>.
          </h1>
          <p className="text-xl text-brand-gray-mid font-lora max-w-2xl mx-auto leading-relaxed">
            Initiate a new architectural sequence or resume active operations.
          </p>
        </div>

        {/* Command Input */}
        <div className="w-full max-w-2xl px-6 relative group">
          {/* Corner Markers */}
          <div className="absolute top-0 left-6 w-2 h-2 border-t-2 border-l-2 border-brand-charcoal" />
          <div className="absolute top-0 right-6 w-2 h-2 border-t-2 border-r-2 border-brand-charcoal" />
          <div className="absolute bottom-0 left-6 w-2 h-2 border-b-2 border-l-2 border-brand-charcoal" />
          <div className="absolute bottom-0 right-6 w-2 h-2 border-b-2 border-r-2 border-brand-charcoal" />

          <div className="relative flex items-center bg-white p-2 border border-brand-charcoal/10 shadow-sm transition-all duration-300 focus-within:ring-1 focus-within:ring-brand-orange/50 focus-within:border-brand-orange/50">
            <div className="pl-4 text-brand-charcoal/30 font-mono">
              <Terminal className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Describe architecture to initialize... [e.g. 'Next.js SaaS with Stripe']"
              className="w-full text-base px-4 py-4 bg-transparent placeholder:text-brand-gray-light/50 text-brand-charcoal focus:outline-none font-mono tracking-tight"
            />
            <div className="pr-1">
              <button className="bg-brand-charcoal text-white hover:bg-brand-orange px-6 py-3 transition-colors duration-200 font-mono text-xs uppercase tracking-widest border border-brand-charcoal">
                Execute
              </button>
            </div>
          </div>

          <div className="absolute -bottom-6 left-6 flex gap-4 text-[10px] font-mono text-brand-charcoal/40 uppercase tracking-widest">
            <span>CPU: 12%</span>
            <span>MEM: 4.2GB</span>
          </div>
        </div>

        {/* Quick Actions / Suggestions */}
        <div className="flex gap-4 flex-wrap justify-center">
          {[
            { label: "Microservices", icon: "lucide:layers" },
            { label: "Event-Driven", icon: "lucide:zap" },
            { label: "RAG Pipeline", icon: "lucide:brain-circuit" }
          ].map((action, i) => (
            <button key={i} className="flex items-center gap-2 px-4 py-2 bg-white border border-brand-charcoal/10 hover:border-brand-orange hover:text-brand-orange transition-all font-mono text-xs uppercase tracking-wide text-brand-charcoal/60">
              <Icon icon={action.icon} className="w-3 h-3" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Operations (Projects) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2 border-b border-brand-charcoal/5 pb-4">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-brand-orange" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-brand-charcoal">Active Operations</h2>
            <span className="px-2 py-0.5 bg-brand-charcoal/5 rounded-full text-[10px] font-mono text-brand-charcoal/60">
              {projects?.length || 0}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="font-mono text-xs uppercase tracking-wider text-brand-gray-mid hover:text-brand-charcoal">
              View All
            </Button>
          </div>
        </div>

        {error ? (
          <div className="p-12 text-center border border-red-200 bg-red-50/50">
            <p className="text-red-500 font-mono text-sm">
              [ERROR]: Failed to load project index: {error}
            </p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 border border-brand-charcoal/5 bg-white animate-pulse" />
            ))}
          </div>
        ) : !projects || projects.length === 0 ? (
          <div className="p-16 text-center border border-dashed border-brand-charcoal/10 bg-[#faf9f5]">
            <Activity className="w-8 h-8 text-brand-charcoal/20 mx-auto mb-4" />
            <p className="font-mono text-sm text-brand-charcoal/40 uppercase tracking-widest">
              No active operations found
            </p>
            <Button className="mt-6 bg-brand-charcoal text-white hover:bg-brand-orange rounded-none font-mono text-xs uppercase tracking-widest h-10 px-8">
              Initialize First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                name={project.name}
                provider={project.provider || "Generic"}
                updatedAt={project.updated_at || new Date().toISOString()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
