import { Box, Filter, Plus, Search } from "lucide-react";
import Link from "next/link";
import { getUserProjects } from "@/actions/projects";
import { ProjectCard } from "@/components/projects/ProjectCard";
import type { Project } from "@/lib/schema/graph";

export default async function DashboardPage() {
  const { data: projects, error } = await getUserProjects();
  const typedProjects = projects as (Project & { updated_at?: string })[];

  return (
    <div className="flex flex-col gap-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl md:text-5xl font-poppins font-bold tracking-tight text-foreground">
            Workspace
          </h1>
          <p className="text-lg font-lora italic text-brand-gray-mid leading-relaxed max-w-xl">
            Design, simulate, and evolve your architecture masterpiece.
          </p>
        </div>

        <button className="flex items-center gap-2 px-6 py-3.5 bg-brand-orange text-white rounded-2xl font-poppins font-bold shadow-lg shadow-brand-orange/20 hover:shadow-xl hover:shadow-brand-orange/30 hover:scale-[1.02] transition-all duration-300 group">
          <Plus
            size={20}
            className="transition-transform group-hover:rotate-90"
          />
          Create Project
        </button>
      </div>

      {/* Filters/Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center border-b border-brand-gray-light pb-6">
        <div className="relative flex-1 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-mid transition-colors group-focus-within:text-brand-orange"
            size={18}
          />
          <input
            type="text"
            placeholder="Search your designs..."
            className="w-full pl-12 pr-4 py-3 bg-white/50 border border-brand-gray-light rounded-xl font-poppins text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/10 focus:border-brand-orange transition-all"
          />
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-brand-gray-light rounded-xl font-poppins text-sm font-medium text-brand-gray-mid hover:text-foreground hover:border-foreground transition-all">
            <Filter size={16} />
            Filter
          </button>
          <select className="px-4 py-3 bg-white border border-brand-gray-light rounded-xl font-poppins text-sm font-medium text-brand-gray-mid focus:outline-none focus:border-foreground transition-all">
            <SortOption label="Recent" value="recent" />
            <SortOption label="A-Z" value="az" />
            <SortOption label="Provider" value="provider" />
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {error ? (
        <div className="p-12 text-center glass-card rounded-3xl border-red-100 bg-red-50/20">
          <p className="text-red-500 font-poppins font-medium">
            Failed to load projects: {error}
          </p>
        </div>
      ) : !typedProjects || typedProjects.length === 0 ? (
        <div className="p-20 text-center glass-card rounded-3xl border-dashed border-2 border-brand-gray-light flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-brand-gray-light/30 rounded-2xl flex items-center justify-center text-brand-gray-mid">
            <Box size={32} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-poppins font-bold text-foreground">
              No projects yet
            </h3>
            <p className="text-brand-gray-mid font-lora italic">
              Begin your first architecture draft.
            </p>
          </div>
          <button className="mt-4 px-8 py-3.5 border-2 border-foreground text-foreground rounded-2xl font-poppins font-bold hover:bg-foreground hover:text-white transition-all duration-300">
            Get Started
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
  );
}

function SortOption({ label, value }: { label: string; value: string }) {
  return <option value={value}>{label}</option>;
}
