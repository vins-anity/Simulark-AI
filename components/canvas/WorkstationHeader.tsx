"use client";

import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  Circle,
  CircleHelp,
  Download,
  FileCode,
  GitBranch,
  Grid3X3,
  Image as ImageIcon,
  List,
  Move,
  ShieldAlert,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { updateProjectName } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LayoutAlgorithm } from "@/lib/layout";
import type { Project } from "@/lib/schema/graph";
import { useSimulationStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface WorkstationHeaderProps {
  project: Project | null;
  saving: boolean;
  onExport: (format: "mermaid" | "png" | "pdf" | "svg") => void;
  onExportSkill: () => void;
  onAutolayout: (direction: "DOWN" | "RIGHT") => void;
  onLayoutAlgorithm: (algorithm: LayoutAlgorithm) => void;
}

const LAYOUT_ALGORITHMS: {
  id: LayoutAlgorithm;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "arch-pattern", label: "Architecture", icon: GitBranch },
  { id: "dagre-hierarchy", label: "Hierarchical", icon: List },
  { id: "radial", label: "Radial", icon: Circle },
  { id: "force", label: "Force", icon: Move },
  { id: "grid", label: "Grid", icon: Grid3X3 },
];

export function WorkstationHeader({
  project,
  saving,
  onExport,
  onExportSkill,
  onAutolayout,
  onLayoutAlgorithm,
}: WorkstationHeaderProps) {
  const {
    chaosMode,
    setChaosMode,
    stressMode,
    setStressMode,
    runStatus,
    runProgress,
  } = useSimulationStore();
  const [currentLayoutIndex, setCurrentLayoutIndex] = useState(0);
  const [isLayoutAnimating, setIsLayoutAnimating] = useState(false);

  // Editable Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [projectName, setProjectName] = useState(project?.name || "");

  const handleNameSave = async () => {
    if (!project || !projectName.trim() || projectName === project.name) {
      setIsEditingName(false);
      setProjectName(project?.name || "");
      return;
    }

    const result = await updateProjectName(project.id, projectName.trim());
    if (result.success) {
      setIsEditingName(false);
    } else {
      // Revert on error (could also show toast)
      setProjectName(project.name);
      setIsEditingName(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSave();
    } else if (e.key === "Escape") {
      setProjectName(project?.name || "");
      setIsEditingName(false);
    }
  };

  const handleLayoutRotate = useCallback(() => {
    if (isLayoutAnimating) return;

    setIsLayoutAnimating(true);
    const nextIndex = (currentLayoutIndex + 1) % LAYOUT_ALGORITHMS.length;
    const nextAlgorithm = LAYOUT_ALGORITHMS[nextIndex];

    onLayoutAlgorithm(nextAlgorithm.id);
    setCurrentLayoutIndex(nextIndex);

    setTimeout(() => setIsLayoutAnimating(false), 300);
  }, [currentLayoutIndex, isLayoutAnimating, onLayoutAlgorithm]);

  const currentLayout = LAYOUT_ALGORITHMS[currentLayoutIndex];
  const LayoutIcon = currentLayout.icon;
  const stressLabel =
    runStatus === "running" || runStatus === "planning"
      ? `STRESS:${Math.round(runProgress)}%`
      : runStatus === "paused"
        ? "STRESS:PAUSED"
        : runStatus === "completed"
          ? "STRESS:DONE"
          : runStatus === "error"
            ? "STRESS:ERROR"
            : "STRESS_TEST";

  if (!project) {
    return (
      <header className="h-14 border-b border-border-primary bg-bg-primary" />
    );
  }

  return (
    <header className="h-14 border-b border-border-primary bg-bg-elevated flex items-center justify-between px-6 shrink-0 z-20 relative">
      {/* Left Section - Navigation & Identity */}
      <div className="flex items-center gap-4">
        {/* Back Navigation */}
        <Link
          href="/dashboard"
          className="flex items-center justify-center w-8 h-8 border border-brand-charcoal/20 text-brand-charcoal dark:text-text-primary hover:bg-brand-charcoal hover:text-white dark:hover:bg-white dark:hover:text-brand-charcoal transition-all active:translate-x-0.5 active:translate-y-0.5"
          title="[ ESC ] Return to Dashboard"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>

        {/* Project Identity */}
        <div className="flex flex-col ml-2">
          <span className="hidden md:block font-mono text-[8px] text-brand-charcoal/20 uppercase tracking-[0.3em] mb-0.5">
            PROJECT_STATION // ARCH_DRAFT
          </span>
          <div className="flex items-center gap-3">
            {isEditingName ? (
              <input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={handleKeyDown}
                autoFocus
                className="h-6 w-[200px] text-base font-poppins font-bold uppercase text-brand-charcoal dark:text-text-primary bg-bg-elevated border-b border-brand-orange focus:outline-none"
              />
            ) : (
              <h2
                onClick={() => setIsEditingName(true)}
                className="font-poppins font-bold text-base text-brand-charcoal dark:text-text-primary uppercase tracking-tight cursor-text hover:text-brand-orange transition-colors"
              >
                {project.name}
              </h2>
            )}
            <div className="px-1.5 py-0.5 border border-brand-charcoal/10 bg-brand-charcoal/5 text-brand-charcoal/40 font-mono text-[8px] uppercase tracking-widest font-bold">
              v1.0.D
            </div>
          </div>
        </div>

        <div className="h-10 w-px bg-brand-charcoal/10 mx-4" />

        <div className="h-10 w-px bg-brand-charcoal/10 mx-4" />
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Layout Algorithm Controls moved here */}
        <div className="flex items-center gap-1 mr-2 scale-[0.9] origin-right">
          <div className="flex items-center border border-brand-charcoal/10">
            <Button
              variant="ghost"
              onClick={() => onAutolayout("DOWN")}
              className="h-8 w-8 rounded-none p-0 text-brand-charcoal/50 hover:text-white hover:bg-brand-charcoal"
              title="[ AUTO_LAYOUT ] Top to Bottom"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => onAutolayout("RIGHT")}
              className="h-8 w-8 rounded-none p-0 text-brand-charcoal/50 hover:text-white hover:bg-brand-charcoal border-l border-brand-charcoal/10"
              title="[ AUTO_LAYOUT ] Left to Right"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={handleLayoutRotate}
            disabled={isLayoutAnimating}
            className="h-8 px-3 border border-brand-charcoal/10 rounded-none text-[10px] font-mono font-bold uppercase tracking-widest text-brand-charcoal/60 dark:text-text-secondary hover:bg-brand-charcoal hover:text-white dark:hover:bg-white dark:hover:text-zinc-950 transition-all gap-2"
          >
            <motion.div
              animate={{ rotate: isLayoutAnimating ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <LayoutIcon className="w-3.5 h-3.5 opacity-40" />
            </motion.div>
            <span>{currentLayout.label}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-6 border border-brand-charcoal/10 rounded-none p-0 flex items-center justify-center text-brand-charcoal/40"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 font-mono text-[11px] rounded-none border-2 border-brand-charcoal shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] p-0 bg-bg-elevated"
            >
              <div className="px-3 py-2 bg-brand-charcoal text-white/40 uppercase tracking-widest border-b-2 border-brand-charcoal">
                LAYOUT_ALGOS
              </div>

              {LAYOUT_ALGORITHMS.map((algo, index) => {
                const AlgoIcon = algo.icon;
                return (
                  <DropdownMenuItem
                    key={algo.id}
                    onClick={() => {
                      onLayoutAlgorithm(algo.id);
                      setCurrentLayoutIndex(index);
                    }}
                    className={cn(
                      "cursor-pointer rounded-none hover:bg-neutral-100 focus:bg-neutral-100 py-3 px-4 flex justify-between",
                      currentLayoutIndex === index &&
                        "bg-neutral-50 border-l-4 border-brand-orange",
                    )}
                  >
                    <span className="flex items-center">
                      <AlgoIcon className="w-4 h-4 mr-3" />
                      {algo.label.toUpperCase()}
                    </span>
                    {currentLayoutIndex === index && (
                      <div className="w-2 h-2 bg-brand-orange" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="px-2 py-1 border border-brand-charcoal/10 font-mono text-[9px] uppercase tracking-wider text-brand-charcoal/50">
          {saving ? "SYNC:SAVING" : "SYNC:READY"}
        </div>

        {/* Chaos Toggle moved here */}
        <Button
          variant="ghost"
          onClick={() => setChaosMode(!chaosMode)}
          className={cn(
            "h-8 px-3 border rounded-none text-[10px] font-mono font-bold uppercase tracking-widest transition-all gap-2",
            chaosMode
              ? "bg-red-600 border-red-600 text-white hover:bg-red-700"
              : "bg-bg-elevated border-brand-charcoal/10 text-brand-charcoal/40 dark:text-text-secondary hover:bg-brand-charcoal hover:text-white dark:hover:bg-white dark:hover:text-zinc-950",
          )}
        >
          <Zap
            className={cn(
              "w-3.5 h-3.5",
              chaosMode && "fill-current animate-pulse",
            )}
          />
          <span>{chaosMode ? "CHAOS_MODE:ON" : "SYSTEM_SIM"}</span>
        </Button>

        <Button
          variant="ghost"
          onClick={() => setStressMode(!stressMode)}
          title="Stress Test: AI planner + deterministic simulation for resilience risk"
          className={cn(
            "h-8 px-3 border rounded-none text-[10px] font-mono font-bold uppercase tracking-widest transition-all gap-2",
            stressMode
              ? "bg-amber-500 border-amber-500 text-black hover:bg-amber-400"
              : "bg-bg-elevated border-brand-charcoal/10 text-brand-charcoal/40 dark:text-text-secondary hover:bg-brand-charcoal hover:text-white dark:hover:bg-white dark:hover:text-zinc-950",
          )}
        >
          <ShieldAlert
            className={cn("w-3.5 h-3.5", stressMode && "animate-pulse")}
          />
          <span>{stressLabel}</span>
        </Button>

        {/* Workspace Guide */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 px-3 border border-brand-charcoal/10 rounded-none text-[10px] font-mono font-bold uppercase tracking-widest text-brand-charcoal/40 dark:text-text-secondary hover:bg-brand-charcoal hover:text-white dark:hover:bg-white dark:hover:text-zinc-950 transition-all gap-2"
            >
              <CircleHelp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline-block">[ GUIDE ]</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64 font-mono text-[11px] rounded-none border-2 border-brand-charcoal shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] p-0 bg-bg-elevated whitespace-normal z-50"
          >
            <div className="px-3 py-2 bg-brand-charcoal text-white/40 uppercase tracking-widest border-b-2 border-brand-charcoal">
              WORKSPACE_CONTROLS
            </div>
            <div className="p-4 text-brand-charcoal dark:text-text-primary flex flex-col gap-3 leading-relaxed">
              <p>
                <strong>Interact:</strong> Click nodes to open properties, drag
                to move, and double-click the title to rename.
              </p>
              <p>
                <strong>Tech Stacks:</strong> Modify node tech stacks and
                services manually inside the properties panel.
              </p>
              <p>
                <strong>Layout:</strong> Use the Autolayout controls in the
                header to organize the architecture automatically.
              </p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* File Operations moved here */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 px-3 border border-brand-charcoal/10 rounded-none text-[10px] font-mono font-bold uppercase tracking-widest text-brand-charcoal/40 dark:text-text-secondary hover:bg-brand-charcoal hover:text-white dark:hover:bg-white dark:hover:text-zinc-950 transition-all"
            >
              [ ARCHIVE ]
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 font-mono text-[11px] rounded-none border-2 border-brand-charcoal shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] p-0 bg-bg-elevated"
          >
            <div className="px-3 py-2 bg-brand-charcoal text-white/40 uppercase tracking-widest border-b-2 border-brand-charcoal">
              OPERATIONS_LOG
            </div>

            <DropdownMenuItem
              onClick={onExportSkill}
              className="cursor-pointer rounded-none hover:bg-neutral-100 focus:bg-neutral-100 py-3 px-4 border-b border-neutral-100"
            >
              <FileCode className="w-4 h-4 mr-3 text-brand-orange" />
              <span>EXPORT_SKILL_ZIP</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="m-0 h-px bg-brand-charcoal/10" />

            <DropdownMenuItem
              onClick={() => onExport("mermaid")}
              className="cursor-pointer rounded-none hover:bg-neutral-100 focus:bg-neutral-100 py-3 px-4"
            >
              <Download className="w-4 h-4 mr-3" />
              <span>MERMAID_SCHEMATIC</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onExport("png")}
              className="cursor-pointer rounded-none hover:bg-neutral-100 focus:bg-neutral-100 py-3 px-4"
            >
              <ImageIcon className="w-4 h-4 mr-3" />
              <span>RASTER_IMAGE_PNG</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
