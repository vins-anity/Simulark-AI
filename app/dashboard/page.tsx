"use client";

import { motion, type Variants } from "framer-motion";
import {
  Activity,
  Box,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Database,
  Layout,
  Loader2,
  Plus,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createProject, getUserProjects } from "@/actions/projects";

import { ProjectCard } from "@/components/projects/ProjectCard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOnboarding } from "@/lib/hooks/useOnboarding";
import {
  ArchitectureMode,
  MODE_CONSTRAINTS,
} from "@/lib/prompt-engineering";
import type { Project } from "@/lib/schema/graph";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { getUserPreferences, updateUserPreferences } from "@/actions/users";


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

// Define available models for Mission Control
import { AVAILABLE_MODELS } from "@/lib/ai-models";

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

function DashboardContent() {
  const [projects, setProjects] = useState<
    (Project & { updated_at?: string })[] | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  const [selectedMode, setSelectedMode] =
    useState<ArchitectureMode>("enterprise");
  const [selectedModel, setSelectedModel] = useState<string>(
    AVAILABLE_MODELS[0].id,
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Onboarding integration
  const { showOnboarding, isLoading: onboardingLoading } = useOnboarding();

  // Redirect to onboarding if needed
  useEffect(() => {
    if (!onboardingLoading && showOnboarding) {
      router.push("/onboarding");
    }
  }, [onboardingLoading, showOnboarding, router]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);

  // Load user default preferences
  useEffect(() => {
    async function loadPrefs() {
      const result = await getUserPreferences();
      if (result.success && result.preferences) {
        if (result.preferences.defaultMode) {
          setSelectedMode(result.preferences.defaultMode);
        } else if (result.preferences.defaultArchitectureMode) {
          setSelectedMode(result.preferences.defaultArchitectureMode);
        }
        if (result.preferences.defaultModel) {
          setSelectedModel(result.preferences.defaultModel);
        }
      }
    }
    loadPrefs();
  }, []);

  const handleModeChange = (mode: ArchitectureMode) => {
    setSelectedMode(mode);
    updateUserPreferences({ defaultMode: mode });
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    updateUserPreferences({ defaultModel: modelId });
  };

  const loadProjects = useCallback(async (page: number) => {
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
  }, []);

  useEffect(() => {
    loadProjects(currentPage);
  }, [currentPage, loadProjects]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= Math.ceil(totalProjects / ITEMS_PER_PAGE)) {
      setCurrentPage(newPage);
    }
  };

  const handleRandomPrompt = () => {
    const randomPrompt =
      PROMPT_EXAMPLES[Math.floor(Math.random() * PROMPT_EXAMPLES.length)];
    setPrompt(randomPrompt);
    inputRef.current?.focus();
  };

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isExecuting) return;

    setIsExecuting(true);
    const trimmedPrompt = prompt.trim();

    try {
      // Shorten project name with futuristic prefix
      const projectName = trimmedPrompt.length > 40
        ? `MANIFEST // ${trimmedPrompt.substring(0, 40).toUpperCase()}...`
        : `MANIFEST // ${trimmedPrompt.toUpperCase()}`;

      // Create project with metadata (mode & model)
      const result = await createProject(projectName, "Generic", {
        mode: selectedMode,
        model: selectedModel,
      });

      if (result.success && result.data) {
        // Store prompt and metadata for picking up in project view
        const storageKey = `initial-prompt-${result.data.id}`;
        const timestampKey = `${storageKey}-timestamp`;

        sessionStorage.setItem(storageKey, trimmedPrompt);
        sessionStorage.setItem(timestampKey, Date.now().toString());
        sessionStorage.setItem(`${storageKey}-status`, "pending");

        setPrompt("");
        router.push(`/projects/${result.data.id}`);
      } else {
        toast.error(result.error || "Failed to create project");
        setIsExecuting(false);
      }
    } catch (err) {
      toast.error("Failed to execute command");
      setIsExecuting(false);
    }
  };

  const handleCreateNew = async () => {
    setIsExecuting(true);
    try {
      const timestamp = new Date().toLocaleTimeString();
      // Pass metadata even for blank projects so default settings persist
      const result = await createProject(
        `Untitled Operations ${timestamp}`,
        "Generic",
        {
          mode: selectedMode,
          model: selectedModel,
        },
      );
      if (result.success && result.data) {
        router.push(`/projects/${result.data.id}`);
      } else {
        toast.error("Failed to initialize project");
        setIsExecuting(false);
      }
    } catch (e) {
      toast.error("System error during initialization");
      setIsExecuting(false);
    }
  };

  const totalPages = Math.ceil(totalProjects / ITEMS_PER_PAGE);

  const getModeIcon = (mode: ArchitectureMode) => {
    switch (mode) {
      case "enterprise":
        return <Database size={14} />;
      case "startup":
        return <Zap size={14} />;
      default:
        return <Box size={14} />;
    }
  };

  return (
    <div className="flex-1 w-full min-h-screen bg-brand-sand-light dark:bg-zinc-950 flex flex-col transition-colors duration-300">
      {/* Background grid motif */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.05] z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto w-full px-6 pt-20 pb-12">
        {/* Mission Control Hero */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center mb-16"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-charcoal dark:bg-brand-sand-light text-brand-sand-light dark:text-brand-charcoal border border-brand-charcoal dark:border-brand-sand-light text-[10px] font-mono uppercase tracking-[0.3em]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
              </span>
              SYSTEM_ONLINE
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-7xl md:text-8xl font-poppins font-bold text-brand-charcoal dark:text-gray-100 uppercase tracking-tighter leading-[0.85] mb-6 text-center"
          >
            Mission
            <br />
            Control
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-brand-charcoal/60 dark:text-gray-400 font-lora italic text-center max-w-2xl"
          >
            &quot;Design, simulate, and deploy infrastructure architecture&quot;
          </motion.p>
        </motion.div>

        {/* Command Input (The Uplink) */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-4xl mx-auto mb-20"
        >
          <div className="relative group">
            {/* Corner HUD Markers */}
            <div className="absolute -top-3 -left-3 w-6 h-6 border-t border-l border-brand-charcoal/20 dark:border-white/20" />
            <div className="absolute -top-3 -right-3 w-6 h-6 border-t border-r border-brand-charcoal/20 dark:border-white/20" />
            <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b border-l border-brand-charcoal/20 dark:border-white/20" />
            <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b border-r border-brand-charcoal/20 dark:border-white/20" />

            <div className="bg-white dark:bg-zinc-900 border-2 border-brand-charcoal dark:border-zinc-700 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] transition-all flex flex-col overflow-hidden">
              <div className="bg-brand-charcoal/5 dark:bg-white/5 border-b border-brand-charcoal dark:border-zinc-700 px-4 py-1.5 flex justify-between items-center overflow-x-auto whitespace-nowrap scrollbar-hide">
                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-mono font-bold text-brand-charcoal/40 dark:text-gray-400 uppercase tracking-widest leading-none">
                    {isExecuting
                      ? "UPLINK_STATION:TRANSMITTING"
                      : "UPLINK_STATION:IDLE"}
                  </span>

                  {/* Mode Selector */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-brand-charcoal dark:text-gray-200 uppercase tracking-wider hover:text-brand-orange transition-colors focus:outline-none">
                        <span className="text-brand-charcoal/40 dark:text-gray-500">
                          MODE:
                        </span>
                        <span className="flex items-center gap-1">
                          {getModeIcon(selectedMode)}
                          {selectedMode === "default" ? "Balanced" : selectedMode}
                        </span>
                        <ChevronDown size={10} className="opacity-50" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-48 bg-bg-elevated border-2 border-brand-charcoal dark:border-zinc-700 rounded-none p-0 z-50"
                    >
                      {(
                        [
                          "enterprise",
                          "startup",
                          "default",
                        ] as ArchitectureMode[]
                      ).map((mode) => (
                        <DropdownMenuItem
                          key={mode}
                          onClick={() => handleModeChange(mode)}
                          className={cn(
                            "flex flex-col items-start gap-1 px-3 py-2 cursor-pointer rounded-none focus:bg-brand-charcoal/5 dark:focus:bg-white/5",
                            selectedMode === mode &&
                              "bg-brand-charcoal/5 dark:bg-white/5",
                          )}
                        >
                          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-brand-charcoal dark:text-gray-200">
                            {getModeIcon(mode)} {mode === "default" ? "Balanced" : mode}
                          </div>
                          <span className="text-[9px] text-brand-charcoal/60 dark:text-gray-400 leading-tight">
                            {MODE_CONSTRAINTS[mode].focus}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="h-4 w-px bg-border-primary" />

                  {/* Model Selector */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-brand-charcoal dark:text-gray-200 uppercase tracking-wider hover:text-brand-orange transition-colors focus:outline-none">
                        <span className="text-brand-charcoal/40 dark:text-gray-500">
                          MODEL:
                        </span>
                        <span className="flex items-center gap-1">
                          <Cpu size={14} />
                          {AVAILABLE_MODELS.find((m) => m.id === selectedModel)
                            ?.name || "UNKNOWN"}
                        </span>
                        <ChevronDown size={10} className="opacity-50" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-56 bg-bg-elevated border-2 border-brand-charcoal dark:border-zinc-700 rounded-none p-0 z-50"
                    >
                      {AVAILABLE_MODELS.map((model) => (
                        <DropdownMenuItem
                          key={model.id}
                          onClick={() => handleModelChange(model.id)}
                          className={cn(
                            "flex items-center justify-between px-3 py-2 cursor-pointer rounded-none focus:bg-brand-charcoal/5 dark:focus:bg-white/5",
                            selectedModel === model.id &&
                              "bg-brand-charcoal/5 dark:bg-white/5",
                          )}
                        >
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-charcoal dark:text-gray-200">
                            {model.name}
                          </span>
                          <span className="text-[8px] font-mono text-brand-charcoal/40 dark:text-gray-500 uppercase">
                            {model.provider}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <span className="text-[10px] font-mono font-bold text-brand-charcoal/40 dark:text-gray-400 uppercase tracking-widest leading-none hidden sm:block">
                  COORD_X:40.71/Y:-74.00
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch">
                <div className="flex-1 flex items-center min-w-0">
                  <div className="pl-5 text-brand-charcoal/20 dark:text-gray-600">
                    <Terminal size={18} />
                  </div>
                  <form onSubmit={handleExecute} className="flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="DESCRIBE_ARCHITECTURE..."
                      className="w-full h-16 px-5 bg-transparent text-brand-charcoal dark:text-gray-200 focus:outline-none font-mono text-base uppercase tracking-tight placeholder:text-brand-charcoal/20 dark:placeholder:text-gray-600"
                      disabled={isExecuting}
                    />
                  </form>
                </div>
                <div className="flex border-t sm:border-t-0 sm:border-l border-brand-charcoal dark:border-zinc-700 divide-x divide-brand-charcoal dark:divide-zinc-700">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={isExecuting}
                    onClick={handleRandomPrompt}
                    className="h-16 w-16 rounded-none hover:bg-brand-orange/10 hover:text-brand-orange dark:text-gray-400 transition-colors"
                  >
                    <Sparkles size={18} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isExecuting}
                    onClick={handleCreateNew}
                    className="h-16 px-6 rounded-none font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-brand-charcoal/5 dark:text-gray-400 dark:hover:bg-white/5"
                  >
                    <Plus size={14} className="mr-2" />
                    BLANK
                  </Button>
                  <button
                    onClick={handleExecute}
                    disabled={!prompt.trim() || isExecuting}
                    className="h-16 px-8 bg-brand-charcoal dark:bg-white text-brand-sand-light dark:text-zinc-950 font-mono text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-brand-orange dark:hover:bg-brand-orange dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isExecuting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        BUSY...
                      </>
                    ) : (
                      "INITIALIZE"
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <span
                className={cn(
                  "text-[8px] font-mono uppercase tracking-[0.4em] transition-all",
                  isExecuting
                    ? "opacity-100 animate-pulse text-brand-orange"
                    : "opacity-30",
                )}
              >
                {isExecuting
                  ? "[ ESTABLISHING CONNECTION... ]"
                  : "[ PRESS_ENTER_TO_TRANSMIT ]"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Active Operations Section */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-8 border-b-2 border-brand-charcoal dark:border-zinc-700 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-brand-charcoal dark:bg-white flex items-center justify-center text-brand-sand-light dark:text-brand-charcoal">
                <Box size={16} />
              </div>
              <div className="flex flex-col">
                <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-brand-charcoal dark:text-gray-200 leading-none mb-1">
                  Active Operations
                </h2>
                <span className="text-[9px] font-mono text-brand-charcoal/40 dark:text-gray-500 uppercase tracking-widest leading-none">
                  // PROJECT_REGISTRY_01
                </span>
              </div>
              <div className="bg-brand-orange text-white px-2 py-0.5 text-[10px] font-mono font-bold leading-none ml-2">
                {totalProjects}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono font-bold text-brand-charcoal/30 dark:text-gray-600 tracking-widest uppercase">
                  PAGE: {currentPage.toString().padStart(2, "0")} /{" "}
                  {totalPages.toString().padStart(2, "0")}
                </span>
                <div className="flex border border-brand-charcoal dark:border-zinc-700 divide-x divide-brand-charcoal dark:divide-zinc-700">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="p-1.5 hover:bg-brand-charcoal/5 dark:hover:bg-white/5 disabled:opacity-20 dark:text-gray-400 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className="p-1.5 hover:bg-brand-charcoal/5 dark:hover:bg-white/5 disabled:opacity-20 dark:text-gray-400 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {error ? (
            <div className="p-12 border-2 border-brand-charcoal dark:border-red-500/50 bg-red-50 dark:bg-red-500/10 text-center">
              <p className="font-mono text-xs text-red-600 dark:text-red-400 uppercase tracking-widest leading-none mb-2">
                !! SYSTEM_MALFUNCTION !!
              </p>
              <p className="font-mono text-[10px] text-red-600/60 dark:text-red-400/60 uppercase tracking-widest leading-none">
                ERR: {error}
              </p>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-40 border border-brand-charcoal/10 dark:border-white/10 bg-brand-charcoal/5 dark:bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : !projects || projects.length === 0 ? (
            <div className="p-16 border-2 border-dashed border-brand-charcoal/20 dark:border-white/10 flex flex-col items-center justify-center grayscale opacity-50">
              <Activity
                size={32}
                className="mb-4 text-brand-charcoal dark:text-gray-600"
              />
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-charcoal dark:text-gray-500">
                No Active Operations
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/60 dark:text-gray-600 mt-2">
                Transmit blueprint to initialize
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProjectCard
                    id={project.id}
                    name={project.name}
                    provider={project.provider || "GENERIC"}
                    updatedAt={project.updated_at || new Date().toISOString()}
                    index={(currentPage - 1) * ITEMS_PER_PAGE + index}
                    className="h-44"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Decorative Footer Element */}
      <footer className="relative z-10 p-6 border-t border-brand-charcoal/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center opacity-30 dark:opacity-20 dark:text-white">
          <span className="text-[8px] font-mono uppercase tracking-[0.5em]">
            // SIMULARK_OS_V1.6.2_BUILD_FINAL
          </span>
          <span className="text-[8px] font-mono uppercase tracking-[0.5em]">
            COORD_REF: 42.19.88.0
          </span>
        </div>
      </footer>

      {/* Onboarding Redirect - handled by middleware/layout */}
    </div>
  );
}

// Wrapper with Suspense for useSearchParams
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex-1 w-full min-h-screen bg-brand-sand-light dark:bg-zinc-950 flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-brand-charcoal/20 border-t-brand-charcoal animate-spin" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/40">
            Loading Mission Control...
          </span>
        </div>
      </div>
    </div>
  );
}
