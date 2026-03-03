"use client";

import {
  ArrowRight,
  ChevronLeft,
  Circle,
  CircleHelp,
  Download,
  FileCode,
  FileText,
  GitBranch,
  Grid3X3,
  Image as ImageIcon,
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
  { id: "dagre-flow", label: "Flow", icon: ArrowRight },
  { id: "radial", label: "Radial", icon: Circle },
  { id: "force", label: "Force", icon: Move },
  { id: "grid", label: "Grid", icon: Grid3X3 },
  { id: "arch-pattern", label: "Arch", icon: GitBranch },
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

  const [hasInteractedWithLayout, setHasInteractedWithLayout] = useState(false);
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

  const handleLayoutCycle = useCallback(() => {
    if (isLayoutAnimating) return;

    if (!hasInteractedWithLayout) {
      setHasInteractedWithLayout(true);
      const algo = LAYOUT_ALGORITHMS[0];
      onLayoutAlgorithm(algo.id);
      return;
    }

    setIsLayoutAnimating(true);
    const nextIndex = (currentLayoutIndex + 1) % LAYOUT_ALGORITHMS.length;
    const nextAlgorithm = LAYOUT_ALGORITHMS[nextIndex];

    onLayoutAlgorithm(nextAlgorithm.id);
    setCurrentLayoutIndex(nextIndex);

    setTimeout(() => setIsLayoutAnimating(false), 300);
  }, [
    currentLayoutIndex,
    isLayoutAnimating,
    onLayoutAlgorithm,
    hasInteractedWithLayout,
  ]);

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
    <header className="h-14 border-b border-border-primary bg-bg-elevated flex items-center px-4 lg:px-6 shrink-0 z-20 relative gap-2">
      {/* ========== ZONE 1: LEFT — Navigation & Identity ========== */}
      <div className="flex items-center gap-3 min-w-0 flex-shrink">
        <Link
          href="/dashboard"
          className="flex items-center justify-center w-8 h-8 border border-brand-charcoal/20 text-brand-charcoal dark:text-text-primary hover:bg-brand-charcoal hover:text-white dark:hover:bg-white dark:hover:text-brand-charcoal transition-all active:translate-x-0.5 active:translate-y-0.5 shrink-0"
          title="[ ESC ] Return to Dashboard"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            {isEditingName ? (
              <input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={handleKeyDown}
                autoFocus
                className="h-6 w-[120px] sm:w-[180px] text-sm font-poppins font-bold uppercase text-brand-charcoal dark:text-text-primary bg-bg-elevated border-b border-brand-orange focus:outline-none truncate"
              />
            ) : (
              <h2
                onClick={() => setIsEditingName(true)}
                className="font-poppins font-bold text-sm text-brand-charcoal dark:text-text-primary uppercase tracking-tight cursor-text hover:text-brand-orange transition-colors truncate max-w-[100px] sm:max-w-[180px] lg:max-w-[280px]"
                title={project.name}
              >
                {project.name}
              </h2>
            )}
            <div className="hidden md:block px-1.5 py-0.5 border border-brand-charcoal/10 bg-brand-charcoal/5 text-brand-charcoal/40 font-mono text-[8px] uppercase tracking-widest font-bold shrink-0">
              {project.id.substring(0, 6).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-brand-charcoal/10 shrink-0 hidden md:block" />

      {/* ========== ZONE 2: CENTER — Status & Tools ========== */}
      <div className="flex items-center gap-1.5">
        {/* Status Pulse */}
        <div
          className={cn(
            "hidden lg:flex items-center gap-2 px-2.5 py-1 border font-mono text-[9px] uppercase tracking-widest font-bold whitespace-nowrap shrink-0",
            saving
              ? "border-brand-orange text-brand-orange bg-brand-orange/5"
              : "border-brand-charcoal/10 text-brand-charcoal/50 bg-bg-elevated"
          )}
        >
          <div
            className={cn(
              "w-1.5 h-1.5",
              saving ? "bg-brand-orange animate-pulse" : "bg-emerald-500"
            )}
          />
          {saving ? "SAVING" : "READY"}
        </div>

        {/* Auto Layout */}
        <Button
          variant="ghost"
          onClick={handleLayoutCycle}
          disabled={isLayoutAnimating}
          className={cn(
            "h-8 px-3 border border-brand-charcoal/10 rounded-none text-[10px] font-mono font-bold uppercase tracking-widest transition-all gap-1.5 flex items-center justify-center shrink-0",
            !hasInteractedWithLayout
              ? "text-brand-charcoal/60 hover:bg-brand-charcoal hover:text-white"
              : "border-brand-orange/20 bg-brand-orange/5 text-brand-orange hover:bg-brand-orange hover:text-white"
          )}
        >
          {hasInteractedWithLayout ? (
            <>
              <LayoutIcon
                className={cn(
                  "w-3.5 h-3.5 shrink-0",
                  isLayoutAnimating && "animate-spin"
                )}
              />
              <span className="truncate">
                {currentLayout.label.toUpperCase()}
              </span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 shrink-0 opacity-70" />
              <span>LAYOUT</span>
            </>
          )}
        </Button>

        {/* Simulation Toggles */}
        <Button
          variant="ghost"
          onClick={() => setChaosMode(!chaosMode)}
          title={chaosMode ? "CHAOS:ON — click to disable" : "CHAOS_SIM — inject random failures"}
          className={cn(
            "h-8 gap-1.5 px-2 border border-brand-charcoal/10 rounded-none transition-all shrink-0 font-mono text-[9px] uppercase tracking-widest font-bold",
            chaosMode
              ? "bg-red-600 border-red-600 text-white hover:bg-red-700"
              : "bg-bg-elevated text-brand-charcoal/60 dark:text-text-secondary/60 hover:bg-brand-charcoal hover:text-white"
          )}
        >
          <Zap
            className={cn(
              "w-3 h-3 shrink-0",
              chaosMode && "fill-current animate-pulse"
            )}
          />
          <span className="hidden xl:inline">{chaosMode ? "CHAOS" : "CHAOS"}</span>
        </Button>

        <Button
          variant="ghost"
          onClick={() => setStressMode(!stressMode)}
          title={stressLabel}
          className={cn(
            "h-8 gap-1.5 px-2 border border-brand-charcoal/10 rounded-none transition-all shrink-0 font-mono text-[9px] uppercase tracking-widest font-bold",
            stressMode
              ? "bg-amber-500 border-amber-500 text-black hover:bg-amber-400"
              : "bg-bg-elevated text-brand-charcoal/60 dark:text-text-secondary/60 hover:bg-brand-charcoal hover:text-white"
          )}
        >
          <ShieldAlert
            className={cn(
              "w-3 h-3 shrink-0",
              stressMode && "animate-pulse"
            )}
          />
          <span className="hidden xl:inline">STRESS</span>
        </Button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* ========== ZONE 3: RIGHT — Menus ========== */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Export / Archive */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 border border-brand-charcoal/10 rounded-none text-brand-charcoal/60 hover:bg-brand-charcoal hover:text-white transition-all"
              title="[ ARCHIVE ]"
            >
              <Download className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-60 font-mono text-[11px] rounded-none border-2 border-brand-charcoal shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] p-0 bg-bg-elevated"
          >
            <div className="px-3 py-2 bg-brand-charcoal text-white/40 uppercase tracking-widest border-b-2 border-brand-charcoal">
              EXPORT_OPERATIONS
            </div>

            <DropdownMenuItem
              onClick={onExportSkill}
              className="cursor-pointer rounded-none outline-none hover:bg-neutral-100 py-3 px-4 border-b border-neutral-100 flex items-center"
            >
              <FileCode className="w-4 h-4 text-brand-orange mr-3" />
              <span>EXPORT_SKILL_ZIP</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onExport("mermaid")}
              className="cursor-pointer rounded-none outline-none hover:bg-neutral-100 py-3 px-4 border-b border-neutral-100 flex items-center"
            >
              <Download className="w-4 h-4 mr-3" />
              <span>MERMAID_SCHEMATIC</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onExport("png")}
              className="cursor-pointer rounded-none outline-none hover:bg-neutral-100 py-3 px-4 border-b border-neutral-100 flex items-center"
            >
              <ImageIcon className="w-4 h-4 mr-3" />
              <span>RASTER_IMAGE_PNG</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onExport("svg")}
              className="cursor-pointer rounded-none outline-none hover:bg-neutral-100 py-3 px-4 border-b border-neutral-100 flex items-center"
            >
              <ImageIcon className="w-4 h-4 mr-3" />
              <span>VECTOR_IMAGE_SVG</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onExport("pdf")}
              className="cursor-pointer rounded-none outline-none hover:bg-neutral-100 py-3 px-4 flex items-center"
            >
              <FileText className="w-4 h-4 mr-3" />
              <span>DOCUMENT_PDF</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Guide — last item */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 border border-brand-charcoal/10 rounded-none text-brand-charcoal/60 hover:bg-brand-charcoal hover:text-white transition-all"
              title="[ GUIDE ]"
            >
              <CircleHelp className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-72 font-mono text-[11px] rounded-none border-2 border-brand-charcoal shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] p-0 bg-bg-elevated whitespace-normal z-50"
          >
            <div className="px-3 py-2 bg-brand-charcoal text-white/40 uppercase tracking-widest border-b-2 border-brand-charcoal">
              WORKSPACE_CONTROLS
            </div>
            <div className="p-4 text-brand-charcoal dark:text-text-primary flex flex-col gap-3 leading-relaxed rounded-none">
              <p>
                <strong>INTERACT:</strong> Click nodes to open properties, drag
                to move, and double-click titles to rename.
              </p>
              <p>
                <strong>TECH_STACKS:</strong> Modify node tech stacks and
                services manually inside the properties panel.
              </p>
              <p>
                <strong>LAYOUT:</strong> Use the Auto-layout controls in the
                header to organize the architecture automatically.
              </p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
