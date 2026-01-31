import { Box, Filter, Plus, Search, ArrowRight, Wand2 } from "lucide-react";
import Link from "next/link";
import { getUserProjects } from "@/actions/projects";
import { ProjectCard } from "@/components/projects/ProjectCard";
import type { Project } from "@/lib/schema/graph";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const { data: projects, error } = await getUserProjects();
  const typedProjects = projects as (Project & { updated_at?: string })[];

  return (
    <div className="flex flex-col min-h-[85vh]">
      {/* Hero / Focus Section */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-20 mb-20 space-y-8">
        <div className="text-center space-y-4 max-w-3xl px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/5 text-brand-orange text-xs font-semibold uppercase tracking-widest mb-4 border border-brand-orange/10">
            <Wand2 className="w-3 h-3" />
            <span>AI Architect Ready</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-poppins font-bold tracking-tight text-brand-charcoal">
            Architect Systems. Export Context.
          </h1>
          <p className="text-xl text-brand-gray-mid font-lora italic max-w-2xl mx-auto leading-relaxed">
            Don't let your AI coding assistant guess your architecture. Generate visual blueprints, validate for anti-patterns, and sync the <strong className="font-bold not-italic text-brand-orange">Context</strong> to your IDE.
          </p>
        </div>

        <div className="w-full max-w-2xl px-6 relative group">
          <div className="absolute inset-0 bg-brand-orange/20 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 rounded-full" />
          <div className="relative flex items-center bg-white shadow-xl shadow-brand-charcoal/5 rounded-2xl border border-brand-gray-light/50 overflow-hidden focus-within:ring-2 focus-within:ring-brand-orange/20 focus-within:border-brand-orange/50 transition-all duration-300">
            <div className="pl-6 text-brand-gray-mid">
              <Search className="w-6 h-6" />
            </div>
            <input
              type="text"
              placeholder='E.g., "Design a Next.js 14 backend with Supabase, generic Queue for emails, and Stripe webhooks..."'
              className="w-full text-lg px-4 py-6 bg-transparent placeholder:text-brand-gray-light text-brand-charcoal focus:outline-none font-poppins"
            />
            <div className="pr-2">
              <button className="bg-brand-charcoal text-brand-sand-light p-3 rounded-xl hover:scale-105 hover:bg-brand-orange transition-all duration-300">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 text-sm text-brand-gray-mid font-medium flex-wrap justify-center">
          <span>Try:</span>
          <button className="hover:text-brand-orange transition-colors">Event-Driven Microservices</button>
          <span>•</span>
          <button className="hover:text-brand-orange transition-colors">Secure Fintech API</button>
          <span>•</span>
          <button className="hover:text-brand-orange transition-colors">RAG Pipeline</button>
        </div>
      </div>

      {/* Projects Section (Secondary) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-poppins font-bold text-brand-charcoal">Recent Projects</h2>
          <div className="flex gap-2">
            {/* Filters could go here if needed, but keeping it clean */}
          </div>
        </div>

        {error ? (
          <div className="p-12 text-center rounded-3xl border border-red-100 bg-red-50/20">
            <p className="text-red-500 font-poppins font-medium">
              Failed to load projects: {error}
            </p>
          </div>
        ) : !typedProjects || typedProjects.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-brand-charcoal/5 rounded-3xl bg-white/30">
            <p className="text-brand-gray-mid font-lora italic">
              No recent projects. Start a new one above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {typedProjects.map((project) => (
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
