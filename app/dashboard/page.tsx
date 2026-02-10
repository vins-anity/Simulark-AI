"use client";

import {
  Box,
  Filter,
  Plus,
  Search,
  ArrowRight,
  Wand2,
  Terminal,
  Cpu,
  Layout,
  Activity,
  ChevronLeft,
  ChevronRight,
  Copy,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getUserProjects,
  createProject,
  createProjectFromTemplate,
} from "@/actions/projects";
import { ProjectCard } from "@/components/projects/ProjectCard";
import type { Project } from "@/lib/schema/graph";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 3;

const PROMPT_EXAMPLES = [
  "High-availability E-commerce platform with Redis caching and Stripe integration",
  "Serverless RAG pipeline using Pinecone, OpenAI, and AWS Lambda",
  "Microservices architecture for a real-time ride-sharing app with Kafka",
  "Secure multi-tenant B2B SaaS with Next.js, Supabase, and RBAC",
  "Global content delivery network with edge functions and multi-region failover",
  "Real-time analytics dashboard with WebSockets and ClickHouse",
  "Event-driven architecture for a fintech platform using EventBridge",
  "Decentralized storage system with IPFS and Ethereum integration",
  "Scalable video streaming backend with transcoding workers",
  "AI-powered supply chain optimizer with forecasting models",
];

export default function DashboardPage() {
  const [projects, setProjects] = useState<
    (Project & { updated_at?: string })[] | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);

  const router = useRouter();

  const loadProjects = async (page: number) => {
    setLoading(true);
    try {
      const result = await getUserProjects(page, ITEMS_PER_PAGE);
      if (result.error) {
        setError(result.error);
      } else {
        setProjects(result.data as any);
        setTotalProjects(result.total || 0);
      }
    } catch (e) {
      setError("System malfunction");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= Math.ceil(totalProjects / ITEMS_PER_PAGE)) {
      setCurrentPage(newPage);
    }
  };

  const handleRandomPrompt = () => {
    const randomPrompt =
      PROMPT_EXAMPLES[Math.floor(Math.random() * PROMPT_EXAMPLES.length)];
    setPrompt(randomPrompt);
  };

  // Handle command execution (Create from Prompt)
  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isExecuting) return;

    setIsExecuting(true);
    try {
      const result = await createProject(prompt.trim());
      if (result.success && result.data) {
        sessionStorage.setItem(
          `initial-prompt-${result.data.id}`,
          prompt.trim(),
        );
        router.push(`/projects/${result.data.id}`);
      } else {
        toast.error(result.error || "Failed to create project");
      }
    } catch (err) {
      toast.error("Failed to execute command");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCreateNew = async () => {
    setIsExecuting(true);
    try {
      const timestamp = new Date().toLocaleTimeString();
      const result = await createProject(`Untitled Operations ${timestamp}`);
      if (result.success && result.data) {
        router.push(`/projects/${result.data.id}`);
      } else {
        toast.error("Failed to initialize project");
      }
    } catch (e) {
      toast.error("System error during initialization");
    } finally {
      setIsExecuting(false);
    }
  };

  const totalPages = Math.ceil(totalProjects / ITEMS_PER_PAGE);

  return (
    <div className="flex-1 w-full h-full relative overflow-hidden font-sans bg-[#faf9f5]">
      {/* Mission Control - Centered & Independent */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-0 pb-32 pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-center space-y-8 w-full max-w-4xl px-4">
          {/* Header Text */}
          <div className="text-center space-y-4 w-full">
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-8 bg-brand-charcoal/20" />
              <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-white border border-brand-charcoal/10 text-[10px] font-mono font-bold uppercase tracking-widest text-brand-charcoal/60 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                System Ready
              </div>
              <div className="h-px w-8 bg-brand-charcoal/20" />
            </div>

            <h1 className="text-5xl md:text-7xl font-poppins font-bold tracking-tighter text-brand-charcoal leading-none">
              Mission Control
            </h1>
            <p className="text-lg text-brand-gray-mid font-lora max-w-2xl mx-auto">
              Design, simulate, and deploy architecture.
            </p>
          </div>

          {/* Command Input & Create Button */}
          <div className="w-full max-w-3xl px-2 relative group">
            {/* Corner Markers */}
            <div className="absolute top-0 left-2 w-2 h-2 border-t-2 border-l-2 border-brand-charcoal" />
            <div className="absolute top-0 right-2 w-2 h-2 border-t-2 border-r-2 border-brand-charcoal" />
            <div className="absolute bottom-0 left-2 w-2 h-2 border-b-2 border-l-2 border-brand-charcoal" />
            <div className="absolute bottom-0 right-2 w-2 h-2 border-b-2 border-r-2 border-brand-charcoal" />

            <div className="relative flex items-center bg-white p-2.5 border border-brand-charcoal/10 shadow-lg transition-all duration-300 focus-within:ring-1 focus-within:ring-brand-orange/50">
              <div className="pl-4 text-brand-charcoal/30 font-mono">
                <Terminal className="w-5 h-5" />
              </div>
              <form
                onSubmit={handleExecute}
                className="w-full flex items-center"
              >
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe architecture..."
                  className="w-full text-lg px-4 py-3 bg-transparent placeholder:text-brand-gray-light/50 text-brand-charcoal focus:outline-none font-mono tracking-tight"
                  disabled={isExecuting}
                />
                <div className="pr-1 flex items-center gap-2">
                  {/* Spark / Random prompt button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isExecuting}
                    onClick={handleRandomPrompt}
                    className="h-9 w-9 p-0 text-brand-charcoal/30 hover:text-brand-orange hover:bg-transparent"
                    title="Random Spark"
                  >
                    <Sparkles className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-4 bg-brand-charcoal/10" />
                  {/* Create New Blank Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isExecuting}
                    onClick={handleCreateNew}
                    className="h-9 px-3 font-mono text-[10px] uppercase text-brand-charcoal/50 hover:text-brand-orange hover:bg-transparent"
                    title="Start Blank Project"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Blank
                  </Button>
                  <div className="w-px h-4 bg-brand-charcoal/10" />
                  <button
                    type="submit"
                    disabled={!prompt.trim() || isExecuting}
                    className="bg-brand-charcoal text-white hover:bg-brand-orange px-6 py-2 transition-colors duration-200 font-mono text-[10px] uppercase tracking-widest border border-brand-charcoal disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExecuting ? "..." : "Run"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Active Operations (Projects) - Docked Bottom */}
      <div className="absolute bottom-0 inset-x-0 z-10 bg-gradient-to-t from-[#faf9f5] via-[#faf9f5] to-transparent pt-12 pb-6 px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between px-2 border-b border-brand-charcoal/5 pb-2">
            <div className="flex items-center gap-2">
              <Layout className="w-3.5 h-3.5 text-brand-orange" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-charcoal">
                Active Operations
              </h2>
              <span className="px-1.5 py-0.5 bg-brand-charcoal/5 rounded-full text-[9px] font-mono text-brand-charcoal/60">
                {totalProjects}
              </span>
            </div>

            {/* Pagination Controls - Inline Right */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-brand-charcoal/40 mr-2">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="h-6 w-6 p-0 rounded-sm border-brand-charcoal/10"
                >
                  <ChevronLeft className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="h-6 w-6 p-0 rounded-sm border-brand-charcoal/10"
                >
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          {error ? (
            <div className="p-4 text-center border border-red-200 bg-red-50/50 rounded-md">
              <p className="text-red-500 font-mono text-xs">[ERROR]: {error}</p>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 border border-brand-charcoal/5 bg-white animate-pulse rounded-md"
                />
              ))}
            </div>
          ) : !projects || projects.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center border border-dashed border-brand-charcoal/10 bg-[#faf9f5] rounded-md">
              <Activity className="w-6 h-6 text-brand-charcoal/20 mb-2" />
              <p className="font-mono text-xs text-brand-charcoal/40 uppercase tracking-widest">
                No operations
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  name={project.name}
                  provider={project.provider || "Generic"}
                  updatedAt={project.updated_at || new Date().toISOString()}
                  className="h-32"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
